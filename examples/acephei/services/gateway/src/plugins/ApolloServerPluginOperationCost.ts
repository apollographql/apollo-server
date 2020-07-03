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
}

const AllGraphOperationsQuery = `#graphql
    query GetOperationsForGraph($id: ID!, $durationMsPercentile: Float!) {
        service(id: $id) {
            stats(from:"-86400") {
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

    const logger = loglevel.getLogger(`apollo-server:strict-operations-plugin`);
    if (options.debug === true) logger.enableAll();

    if (maxCost == 0)
        logger.warn("No maxCost set, all operations will be allowed");

    return {
        serverWillStart: async () => {
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
                            durationMsPercentile: durationMsPercentile
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
                logger.error(err);
            }
        },
        requestDidStart: () => {
            if (Object.keys(costMapping).length == 0) return {};
            return {
                async didResolveOperation(requestContext: GraphQLRequestContext) {
                    if (!requestContext.document) return;

                    let totalCost = 0.0;
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
                        visit(
                            requestContext.document,
                            visitWithTypeInfo(typeInfo, {
                                Field(node) {
                                    const fieldDef = typeInfo.getFieldDef();
                                    const parentType = typeInfo.getParentType();

                                    //TODO: question - why wouldn't there be a parent type?
                                    if (!parentType) return node;

                                    let costKey = `${parentType.name}.${fieldDef.name}`;
                                    const nodeCost = costMapping[costKey];

                                    //We don't want any cost estimates from the root since we calculate based on th individual fields
                                    //If it is a standard type, that will be the cost value used
                                    if (parentType.name == `Query` || parentType.name == `Mutation`) {
                                        if (isSpecifiedScalarType(parentType)) {
                                            //It's a standard type, there won't be any other fields to visit and we want to return that cost
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                            totalCost = nodeCost;
                                        }
                                    } else if (nodeCost) {
                                        // logger.debug(`***${costKey}: ${nodeCost}`);

                                        if (lastType == parentType.name && nodeCost > typeFieldMax) {
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                            logger.debug(`${costKey} Type greater cost: ${nodeCost}`);
                                            typeFieldMax = nodeCost;
                                        } else if (typeFieldMax == 0.0 && !lastType) {
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                            lastType = parentType.name;
                                            typeFieldMax = nodeCost;
                                        } else if (lastType != parentType.name) {
                                            //Type has changed, add in to total cost the typeFieldMax
                                            totalCost += typeFieldMax;
                                            logger.debug(`Type changed - ${parentType.name}`);
                                            logger.debug(`Increased cost to ${totalCost} by adding ${typeFieldMax}`);

                                            lastType = parentType.name;
                                            typeFieldMax = nodeCost;
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                        } else {
                                            logger.debug(`${costKey}: ${nodeCost}`);
                                        }
                                    }

                                    return node;
                                }
                            })
                        );

                        //The last visited typeFieldMax was not added in
                        totalCost += typeFieldMax;
                        logger.debug(`End of operation`);
                        logger.debug(`Increased cost to ${totalCost} by adding ${typeFieldMax}`);

                        if (requestContext.queryHash) {
                            logger.debug(`Caching ${requestContext.queryHash}: ${totalCost}`);
                            cache.set(requestContext.queryHash, totalCost.toString());
                        }
                    }

                    logger.debug(`TOTAL COST - ${requestContext.operationName}: ${totalCost}`);
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