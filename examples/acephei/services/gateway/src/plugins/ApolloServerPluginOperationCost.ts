// @ts-check
import loglevel from "loglevel";
import { Headers } from 'apollo-server-env';
import { InMemoryLRUCache } from "apollo-server-caching";
import { GraphQLRequestContext } from "apollo-server-core";
import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { visit, TypeInfo, visitWithTypeInfo, isSpecifiedScalarType } from 'graphql';

interface Options {
    debug?: boolean;
    maxCost?: number;
    durationMsPercentile?: number;
    dataFrom?: string
}

const AllGraphOperationsQuery = `#graphql
    query GetOperationsForGraph($id: ID!, $durationMsPercentile: Float!, $from: Timestamp!) {
        service(id: $id) {
            stats(from:$from) {
                fieldStats {
                    groupBy {
                            field
                    }
                    metrics {
                        fieldHistogram {
                            durationMs(percentile: $durationMsPercentile)
                        }
                    }
                }
            }
        }
    }`;

export default function OperationCostPlugin(options: Options = Object.create(null), cache: InMemoryLRUCache = new InMemoryLRUCache()) {
    let costMapping = {};
    let maxCost = options.maxCost || 0;
    let durationMsPercentile = options.maxCost || 1.0;
    let tracesFrom = options.dataFrom || "-86400";

    const logger = loglevel.getLogger(`apollo-server:strict-operations-plugin`);
    if (options.debug === true) logger.enableAll();

    if (maxCost == 0)
        logger.warn("No maxCost set, all operations will be allowed");

    return {
        serverWillStart: async () => {
            //This currrent example doesn't refresh the costMapping, but it could be updated on a certain interval
            let apiKey = process.env.APOLLO_KEY;
            if (!apiKey) throw new Error("You must set the APOLLO_KEY environment variable");

            let graphId = apiKey?.split(':')[1];

            try {
                let source = new RemoteGraphQLDataSource({ url: 'https://engine-graphql.apollographql.com/api/graphql' });
                let results = await source.process({
                    request: {
                        query: AllGraphOperationsQuery,
                        variables: {
                            id: graphId,
                            durationMsPercentile: durationMsPercentile,
                            from: tracesFrom
                        },
                        http: {
                            method: 'POST',
                            url: 'https://engine-graphql.apollographql.com/api/graphql',
                            headers: new Headers({
                                'x-api-key': process.env.APOLLO_KEY ?? '',
                                'apollographql-client-name': 'plugin-operation-cost',
                                'apollographql-client-version': '0.1'
                            })
                        }
                    },
                    context: {}
                });

                results?.data?.service?.stats?.fieldStats?.map(fieldStat => {
                    let fieldName = fieldStat.groupBy.field.split(':')[0];
                    costMapping[fieldName] = fieldStat.metrics.fieldHistogram.durationMs;
                })
            } catch (err) {
                //We don't want to throw an error if we are unable to fetch a cost mapping due to Apollo API not being up
                logger.error(err);
            }
        },
        requestDidStart: () => {
            if (Object.keys(costMapping).length == 0) return {};
            return {
                async didResolveOperation(requestContext: GraphQLRequestContext) {
                    if (!requestContext.document) return;

                    let totalCost = 0.0;
                    //Check the cache if it has a previous calculation for the given queryHash
                    let cacheHit = await cache.get(requestContext.queryHash ?? '');
                    if (cacheHit) {
                        let cachedDuration = Number.parseFloat(cacheHit);
                        totalCost = cachedDuration;
                        logger.debug(`Cached Cost - ${requestContext.queryHash}: ${cachedDuration}`);
                    } else {
                        //Since GraphQL will send field resolvers in parallel, we need to track fields metrics and take the greatest value
                        let lastType = '';
                        let typeFieldMax = 0.0;
                        const typeInfo = new TypeInfo(requestContext.schema);
                        logger.debug(`Calculating cost for ${requestContext.operationName ?? requestContext.queryHash}`);

                        //We are going to want to visit our document with the typeInfo of our schema
                        visit(
                            requestContext.document,
                            visitWithTypeInfo(typeInfo, {
                                //On each node, we want to calculate the cost
                                Field(node) {
                                    const fieldDef = typeInfo.getFieldDef();
                                    const parentType = typeInfo.getParentType();

                                    //TODO: question - why wouldn't there be a parent type?
                                    if (!parentType) return node;

                                    let costToAdd = 0.0;
                                    //The field costs returned from Apollo are in the form of Type.fieldName
                                    let costKey = `${parentType.name}.${fieldDef.name}`;
                                    const nodeCost = costMapping[costKey];

                                    //We don't want any cost estimates from the root since we calculate based on th individual fields
                                    //If it is a standard type, that will be the cost value used
                                    if (parentType.name == `Query` || parentType.name == `Mutation`) {
                                        if (isSpecifiedScalarType(parentType)) {
                                            //It's a standard type, there won't be any other fields to visit and we want to return that cost
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                            costToAdd = nodeCost;
                                        } else {
                                            //Non-standard GraphQL type costs will be included in the type/field selections
                                            logger.debug(`${costKey}: Non-standard GraphQL type - no change to cost`);
                                        }
                                    } else if (nodeCost) {
                                        logger.debug(`${costKey}: ${nodeCost}`);

                                        if (lastType == parentType.name && nodeCost > typeFieldMax) {
                                            //Since GraphQL executes a given Types fields in parallel, we'll need to always take the maximum cost of the field selection
                                            //First we check if the given node is of the same last Type and if it has a greater cost

                                            logger.debug(`${costKey} Type greater cost: ${nodeCost} than: ${typeFieldMax}`);
                                            costToAdd = nodeCost - typeFieldMax;

                                            typeFieldMax = nodeCost;
                                        } else if (lastType == parentType.name) {
                                            //The given node is of the same last type, but has a lower field cost than the current typeField cost max
                                            //This means we will not add anything to the total cost calculated
                                            logger.debug(`${costKey} Type lower cost: ${nodeCost} than: ${typeFieldMax}`);
                                        } else if (typeFieldMax == 0.0 && !lastType) {
                                            // If there is no lastType and typeFieldMax is 0, this is the first node of the calculation and should be added to the totalCost
                                            costToAdd = nodeCost;

                                            lastType = parentType.name;
                                            typeFieldMax = nodeCost;
                                        } else if (lastType != parentType.name) {
                                            //Last check, the type has changed and we need to add the node cost to our total cost
                                            costToAdd = nodeCost;
                                            logger.debug(`${costKey} New Type increased cost to ${totalCost} by adding ${nodeCost}`);

                                            lastType = parentType.name;
                                            typeFieldMax = nodeCost;
                                        }
                                    } else {
                                        //We might not have a known cost for a given field, what should we do by default?
                                        logger.warn(`${costKey}: No known cost`);
                                    }

                                    //If there is a cost to add, increase total cost calculated
                                    if (costToAdd > 0) {
                                        totalCost += costToAdd;
                                        logger.debug(`${costKey} Increased cost to ${totalCost} by adding ${costToAdd}`);
                                    }

                                    return node;
                                }
                            })
                        );

                        logger.debug(`End of operation cost caclulation`);

                        //If we have a given queryHash, set this in the cache to be used later
                        if (requestContext.queryHash) {
                            logger.debug(`Caching ${requestContext.queryHash}: ${totalCost}`);
                            cache.set(requestContext.queryHash, totalCost.toString());
                        }
                    }

                    logger.debug(`TOTAL COST - ${requestContext.operationName}: ${totalCost}`);

                    //If maxCost is 0, than all queries will be allowed
                    //Check totalCost against the maxCost set to see if an operation is too expensive
                    if (maxCost > 0 && totalCost > maxCost) {
                        logger.error(`Operation is too expensive (hash:${requestContext.queryHash}) - ${requestContext.operationName}: ${totalCost}`);
                        throw new Error(`Operation is too expensive - ${requestContext.operationName}: ${totalCost}`);
                    } else {
                        logger.debug(`Allowing operation - ${requestContext.operationName}: ${totalCost}`);
                    }
                }
            };
        },
    }
}
