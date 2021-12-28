/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("@apollo/protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.Trace = (function() {

    /**
     * Properties of a Trace.
     * @exports ITrace
     * @interface ITrace
     * @property {google.protobuf.ITimestamp|null} [startTime] Trace startTime
     * @property {google.protobuf.ITimestamp|null} [endTime] Trace endTime
     * @property {number|null} [durationNs] Trace durationNs
     * @property {Trace.INode|null} [root] Trace root
     * @property {string|null} [signature] Trace signature
     * @property {string|null} [unexecutedOperationBody] Trace unexecutedOperationBody
     * @property {string|null} [unexecutedOperationName] Trace unexecutedOperationName
     * @property {Trace.IDetails|null} [details] Trace details
     * @property {string|null} [clientName] Trace clientName
     * @property {string|null} [clientVersion] Trace clientVersion
     * @property {Trace.IHTTP|null} [http] Trace http
     * @property {Trace.ICachePolicy|null} [cachePolicy] Trace cachePolicy
     * @property {Trace.IQueryPlanNode|null} [queryPlan] Trace queryPlan
     * @property {boolean|null} [fullQueryCacheHit] Trace fullQueryCacheHit
     * @property {boolean|null} [persistedQueryHit] Trace persistedQueryHit
     * @property {boolean|null} [persistedQueryRegister] Trace persistedQueryRegister
     * @property {boolean|null} [registeredOperation] Trace registeredOperation
     * @property {boolean|null} [forbiddenOperation] Trace forbiddenOperation
     * @property {number|null} [fieldExecutionWeight] Trace fieldExecutionWeight
     */

    /**
     * Constructs a new Trace.
     * @exports Trace
     * @classdesc Represents a Trace.
     * @implements ITrace
     * @constructor
     * @param {ITrace=} [properties] Properties to set
     */
    function Trace(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Trace startTime.
     * @member {google.protobuf.ITimestamp|null|undefined} startTime
     * @memberof Trace
     * @instance
     */
    Trace.prototype.startTime = null;

    /**
     * Trace endTime.
     * @member {google.protobuf.ITimestamp|null|undefined} endTime
     * @memberof Trace
     * @instance
     */
    Trace.prototype.endTime = null;

    /**
     * Trace durationNs.
     * @member {number} durationNs
     * @memberof Trace
     * @instance
     */
    Trace.prototype.durationNs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Trace root.
     * @member {Trace.INode|null|undefined} root
     * @memberof Trace
     * @instance
     */
    Trace.prototype.root = null;

    /**
     * Trace signature.
     * @member {string} signature
     * @memberof Trace
     * @instance
     */
    Trace.prototype.signature = "";

    /**
     * Trace unexecutedOperationBody.
     * @member {string} unexecutedOperationBody
     * @memberof Trace
     * @instance
     */
    Trace.prototype.unexecutedOperationBody = "";

    /**
     * Trace unexecutedOperationName.
     * @member {string} unexecutedOperationName
     * @memberof Trace
     * @instance
     */
    Trace.prototype.unexecutedOperationName = "";

    /**
     * Trace details.
     * @member {Trace.IDetails|null|undefined} details
     * @memberof Trace
     * @instance
     */
    Trace.prototype.details = null;

    /**
     * Trace clientName.
     * @member {string} clientName
     * @memberof Trace
     * @instance
     */
    Trace.prototype.clientName = "";

    /**
     * Trace clientVersion.
     * @member {string} clientVersion
     * @memberof Trace
     * @instance
     */
    Trace.prototype.clientVersion = "";

    /**
     * Trace http.
     * @member {Trace.IHTTP|null|undefined} http
     * @memberof Trace
     * @instance
     */
    Trace.prototype.http = null;

    /**
     * Trace cachePolicy.
     * @member {Trace.ICachePolicy|null|undefined} cachePolicy
     * @memberof Trace
     * @instance
     */
    Trace.prototype.cachePolicy = null;

    /**
     * Trace queryPlan.
     * @member {Trace.IQueryPlanNode|null|undefined} queryPlan
     * @memberof Trace
     * @instance
     */
    Trace.prototype.queryPlan = null;

    /**
     * Trace fullQueryCacheHit.
     * @member {boolean} fullQueryCacheHit
     * @memberof Trace
     * @instance
     */
    Trace.prototype.fullQueryCacheHit = false;

    /**
     * Trace persistedQueryHit.
     * @member {boolean} persistedQueryHit
     * @memberof Trace
     * @instance
     */
    Trace.prototype.persistedQueryHit = false;

    /**
     * Trace persistedQueryRegister.
     * @member {boolean} persistedQueryRegister
     * @memberof Trace
     * @instance
     */
    Trace.prototype.persistedQueryRegister = false;

    /**
     * Trace registeredOperation.
     * @member {boolean} registeredOperation
     * @memberof Trace
     * @instance
     */
    Trace.prototype.registeredOperation = false;

    /**
     * Trace forbiddenOperation.
     * @member {boolean} forbiddenOperation
     * @memberof Trace
     * @instance
     */
    Trace.prototype.forbiddenOperation = false;

    /**
     * Trace fieldExecutionWeight.
     * @member {number} fieldExecutionWeight
     * @memberof Trace
     * @instance
     */
    Trace.prototype.fieldExecutionWeight = 0;

    /**
     * Creates a new Trace instance using the specified properties.
     * @function create
     * @memberof Trace
     * @static
     * @param {ITrace=} [properties] Properties to set
     * @returns {Trace} Trace instance
     */
    Trace.create = function create(properties) {
        return new Trace(properties);
    };

    /**
     * Encodes the specified Trace message. Does not implicitly {@link Trace.verify|verify} messages.
     * @function encode
     * @memberof Trace
     * @static
     * @param {ITrace} message Trace message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Trace.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.endTime != null && Object.hasOwnProperty.call(message, "endTime"))
            $root.google.protobuf.Timestamp.encode(message.endTime, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.startTime != null && Object.hasOwnProperty.call(message, "startTime"))
            $root.google.protobuf.Timestamp.encode(message.startTime, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.details != null && Object.hasOwnProperty.call(message, "details"))
            $root.Trace.Details.encode(message.details, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.clientName != null && Object.hasOwnProperty.call(message, "clientName"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.clientName);
        if (message.clientVersion != null && Object.hasOwnProperty.call(message, "clientVersion"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.clientVersion);
        if (message.http != null && Object.hasOwnProperty.call(message, "http"))
            $root.Trace.HTTP.encode(message.http, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.durationNs != null && Object.hasOwnProperty.call(message, "durationNs"))
            writer.uint32(/* id 11, wireType 0 =*/88).uint64(message.durationNs);
        if (message.root != null && Object.hasOwnProperty.call(message, "root"))
            $root.Trace.Node.encode(message.root, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        if (message.cachePolicy != null && Object.hasOwnProperty.call(message, "cachePolicy"))
            $root.Trace.CachePolicy.encode(message.cachePolicy, writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
        if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
            writer.uint32(/* id 19, wireType 2 =*/154).string(message.signature);
        if (message.fullQueryCacheHit != null && Object.hasOwnProperty.call(message, "fullQueryCacheHit"))
            writer.uint32(/* id 20, wireType 0 =*/160).bool(message.fullQueryCacheHit);
        if (message.persistedQueryHit != null && Object.hasOwnProperty.call(message, "persistedQueryHit"))
            writer.uint32(/* id 21, wireType 0 =*/168).bool(message.persistedQueryHit);
        if (message.persistedQueryRegister != null && Object.hasOwnProperty.call(message, "persistedQueryRegister"))
            writer.uint32(/* id 22, wireType 0 =*/176).bool(message.persistedQueryRegister);
        if (message.registeredOperation != null && Object.hasOwnProperty.call(message, "registeredOperation"))
            writer.uint32(/* id 24, wireType 0 =*/192).bool(message.registeredOperation);
        if (message.forbiddenOperation != null && Object.hasOwnProperty.call(message, "forbiddenOperation"))
            writer.uint32(/* id 25, wireType 0 =*/200).bool(message.forbiddenOperation);
        if (message.queryPlan != null && Object.hasOwnProperty.call(message, "queryPlan"))
            $root.Trace.QueryPlanNode.encode(message.queryPlan, writer.uint32(/* id 26, wireType 2 =*/210).fork()).ldelim();
        if (message.unexecutedOperationBody != null && Object.hasOwnProperty.call(message, "unexecutedOperationBody"))
            writer.uint32(/* id 27, wireType 2 =*/218).string(message.unexecutedOperationBody);
        if (message.unexecutedOperationName != null && Object.hasOwnProperty.call(message, "unexecutedOperationName"))
            writer.uint32(/* id 28, wireType 2 =*/226).string(message.unexecutedOperationName);
        if (message.fieldExecutionWeight != null && Object.hasOwnProperty.call(message, "fieldExecutionWeight"))
            writer.uint32(/* id 31, wireType 1 =*/249).double(message.fieldExecutionWeight);
        return writer;
    };

    /**
     * Encodes the specified Trace message, length delimited. Does not implicitly {@link Trace.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Trace
     * @static
     * @param {ITrace} message Trace message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Trace.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Trace message from the specified reader or buffer.
     * @function decode
     * @memberof Trace
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Trace} Trace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Trace.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 4:
                message.startTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                break;
            case 3:
                message.endTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                break;
            case 11:
                message.durationNs = reader.uint64();
                break;
            case 14:
                message.root = $root.Trace.Node.decode(reader, reader.uint32());
                break;
            case 19:
                message.signature = reader.string();
                break;
            case 27:
                message.unexecutedOperationBody = reader.string();
                break;
            case 28:
                message.unexecutedOperationName = reader.string();
                break;
            case 6:
                message.details = $root.Trace.Details.decode(reader, reader.uint32());
                break;
            case 7:
                message.clientName = reader.string();
                break;
            case 8:
                message.clientVersion = reader.string();
                break;
            case 10:
                message.http = $root.Trace.HTTP.decode(reader, reader.uint32());
                break;
            case 18:
                message.cachePolicy = $root.Trace.CachePolicy.decode(reader, reader.uint32());
                break;
            case 26:
                message.queryPlan = $root.Trace.QueryPlanNode.decode(reader, reader.uint32());
                break;
            case 20:
                message.fullQueryCacheHit = reader.bool();
                break;
            case 21:
                message.persistedQueryHit = reader.bool();
                break;
            case 22:
                message.persistedQueryRegister = reader.bool();
                break;
            case 24:
                message.registeredOperation = reader.bool();
                break;
            case 25:
                message.forbiddenOperation = reader.bool();
                break;
            case 31:
                message.fieldExecutionWeight = reader.double();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Trace message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Trace
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Trace} Trace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Trace.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Trace message.
     * @function verify
     * @memberof Trace
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Trace.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.startTime != null && message.hasOwnProperty("startTime")) {
            var error = $root.google.protobuf.Timestamp.verify(message.startTime);
            if (error)
                return "startTime." + error;
        }
        if (message.endTime != null && message.hasOwnProperty("endTime")) {
            var error = $root.google.protobuf.Timestamp.verify(message.endTime);
            if (error)
                return "endTime." + error;
        }
        if (message.durationNs != null && message.hasOwnProperty("durationNs"))
            if (!$util.isInteger(message.durationNs) && !(message.durationNs && $util.isInteger(message.durationNs.low) && $util.isInteger(message.durationNs.high)))
                return "durationNs: integer|Long expected";
        if (message.root != null && message.hasOwnProperty("root")) {
            var error = $root.Trace.Node.verify(message.root);
            if (error)
                return "root." + error;
        }
        if (message.signature != null && message.hasOwnProperty("signature"))
            if (!$util.isString(message.signature))
                return "signature: string expected";
        if (message.unexecutedOperationBody != null && message.hasOwnProperty("unexecutedOperationBody"))
            if (!$util.isString(message.unexecutedOperationBody))
                return "unexecutedOperationBody: string expected";
        if (message.unexecutedOperationName != null && message.hasOwnProperty("unexecutedOperationName"))
            if (!$util.isString(message.unexecutedOperationName))
                return "unexecutedOperationName: string expected";
        if (message.details != null && message.hasOwnProperty("details")) {
            var error = $root.Trace.Details.verify(message.details);
            if (error)
                return "details." + error;
        }
        if (message.clientName != null && message.hasOwnProperty("clientName"))
            if (!$util.isString(message.clientName))
                return "clientName: string expected";
        if (message.clientVersion != null && message.hasOwnProperty("clientVersion"))
            if (!$util.isString(message.clientVersion))
                return "clientVersion: string expected";
        if (message.http != null && message.hasOwnProperty("http")) {
            var error = $root.Trace.HTTP.verify(message.http);
            if (error)
                return "http." + error;
        }
        if (message.cachePolicy != null && message.hasOwnProperty("cachePolicy")) {
            var error = $root.Trace.CachePolicy.verify(message.cachePolicy);
            if (error)
                return "cachePolicy." + error;
        }
        if (message.queryPlan != null && message.hasOwnProperty("queryPlan")) {
            var error = $root.Trace.QueryPlanNode.verify(message.queryPlan);
            if (error)
                return "queryPlan." + error;
        }
        if (message.fullQueryCacheHit != null && message.hasOwnProperty("fullQueryCacheHit"))
            if (typeof message.fullQueryCacheHit !== "boolean")
                return "fullQueryCacheHit: boolean expected";
        if (message.persistedQueryHit != null && message.hasOwnProperty("persistedQueryHit"))
            if (typeof message.persistedQueryHit !== "boolean")
                return "persistedQueryHit: boolean expected";
        if (message.persistedQueryRegister != null && message.hasOwnProperty("persistedQueryRegister"))
            if (typeof message.persistedQueryRegister !== "boolean")
                return "persistedQueryRegister: boolean expected";
        if (message.registeredOperation != null && message.hasOwnProperty("registeredOperation"))
            if (typeof message.registeredOperation !== "boolean")
                return "registeredOperation: boolean expected";
        if (message.forbiddenOperation != null && message.hasOwnProperty("forbiddenOperation"))
            if (typeof message.forbiddenOperation !== "boolean")
                return "forbiddenOperation: boolean expected";
        if (message.fieldExecutionWeight != null && message.hasOwnProperty("fieldExecutionWeight"))
            if (typeof message.fieldExecutionWeight !== "number")
                return "fieldExecutionWeight: number expected";
        return null;
    };

    /**
     * Creates a plain object from a Trace message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Trace
     * @static
     * @param {Trace} message Trace
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Trace.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.endTime = null;
            object.startTime = null;
            object.details = null;
            object.clientName = "";
            object.clientVersion = "";
            object.http = null;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.durationNs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.durationNs = options.longs === String ? "0" : 0;
            object.root = null;
            object.cachePolicy = null;
            object.signature = "";
            object.fullQueryCacheHit = false;
            object.persistedQueryHit = false;
            object.persistedQueryRegister = false;
            object.registeredOperation = false;
            object.forbiddenOperation = false;
            object.queryPlan = null;
            object.unexecutedOperationBody = "";
            object.unexecutedOperationName = "";
            object.fieldExecutionWeight = 0;
        }
        if (message.endTime != null && message.hasOwnProperty("endTime"))
            object.endTime = $root.google.protobuf.Timestamp.toObject(message.endTime, options);
        if (message.startTime != null && message.hasOwnProperty("startTime"))
            object.startTime = $root.google.protobuf.Timestamp.toObject(message.startTime, options);
        if (message.details != null && message.hasOwnProperty("details"))
            object.details = $root.Trace.Details.toObject(message.details, options);
        if (message.clientName != null && message.hasOwnProperty("clientName"))
            object.clientName = message.clientName;
        if (message.clientVersion != null && message.hasOwnProperty("clientVersion"))
            object.clientVersion = message.clientVersion;
        if (message.http != null && message.hasOwnProperty("http"))
            object.http = $root.Trace.HTTP.toObject(message.http, options);
        if (message.durationNs != null && message.hasOwnProperty("durationNs"))
            if (typeof message.durationNs === "number")
                object.durationNs = options.longs === String ? String(message.durationNs) : message.durationNs;
            else
                object.durationNs = options.longs === String ? $util.Long.prototype.toString.call(message.durationNs) : options.longs === Number ? new $util.LongBits(message.durationNs.low >>> 0, message.durationNs.high >>> 0).toNumber(true) : message.durationNs;
        if (message.root != null && message.hasOwnProperty("root"))
            object.root = $root.Trace.Node.toObject(message.root, options);
        if (message.cachePolicy != null && message.hasOwnProperty("cachePolicy"))
            object.cachePolicy = $root.Trace.CachePolicy.toObject(message.cachePolicy, options);
        if (message.signature != null && message.hasOwnProperty("signature"))
            object.signature = message.signature;
        if (message.fullQueryCacheHit != null && message.hasOwnProperty("fullQueryCacheHit"))
            object.fullQueryCacheHit = message.fullQueryCacheHit;
        if (message.persistedQueryHit != null && message.hasOwnProperty("persistedQueryHit"))
            object.persistedQueryHit = message.persistedQueryHit;
        if (message.persistedQueryRegister != null && message.hasOwnProperty("persistedQueryRegister"))
            object.persistedQueryRegister = message.persistedQueryRegister;
        if (message.registeredOperation != null && message.hasOwnProperty("registeredOperation"))
            object.registeredOperation = message.registeredOperation;
        if (message.forbiddenOperation != null && message.hasOwnProperty("forbiddenOperation"))
            object.forbiddenOperation = message.forbiddenOperation;
        if (message.queryPlan != null && message.hasOwnProperty("queryPlan"))
            object.queryPlan = $root.Trace.QueryPlanNode.toObject(message.queryPlan, options);
        if (message.unexecutedOperationBody != null && message.hasOwnProperty("unexecutedOperationBody"))
            object.unexecutedOperationBody = message.unexecutedOperationBody;
        if (message.unexecutedOperationName != null && message.hasOwnProperty("unexecutedOperationName"))
            object.unexecutedOperationName = message.unexecutedOperationName;
        if (message.fieldExecutionWeight != null && message.hasOwnProperty("fieldExecutionWeight"))
            object.fieldExecutionWeight = options.json && !isFinite(message.fieldExecutionWeight) ? String(message.fieldExecutionWeight) : message.fieldExecutionWeight;
        return object;
    };

    /**
     * Converts this Trace to JSON.
     * @function toJSON
     * @memberof Trace
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Trace.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    Trace.CachePolicy = (function() {

        /**
         * Properties of a CachePolicy.
         * @memberof Trace
         * @interface ICachePolicy
         * @property {Trace.CachePolicy.Scope|null} [scope] CachePolicy scope
         * @property {number|null} [maxAgeNs] CachePolicy maxAgeNs
         */

        /**
         * Constructs a new CachePolicy.
         * @memberof Trace
         * @classdesc Represents a CachePolicy.
         * @implements ICachePolicy
         * @constructor
         * @param {Trace.ICachePolicy=} [properties] Properties to set
         */
        function CachePolicy(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CachePolicy scope.
         * @member {Trace.CachePolicy.Scope} scope
         * @memberof Trace.CachePolicy
         * @instance
         */
        CachePolicy.prototype.scope = 0;

        /**
         * CachePolicy maxAgeNs.
         * @member {number} maxAgeNs
         * @memberof Trace.CachePolicy
         * @instance
         */
        CachePolicy.prototype.maxAgeNs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new CachePolicy instance using the specified properties.
         * @function create
         * @memberof Trace.CachePolicy
         * @static
         * @param {Trace.ICachePolicy=} [properties] Properties to set
         * @returns {Trace.CachePolicy} CachePolicy instance
         */
        CachePolicy.create = function create(properties) {
            return new CachePolicy(properties);
        };

        /**
         * Encodes the specified CachePolicy message. Does not implicitly {@link Trace.CachePolicy.verify|verify} messages.
         * @function encode
         * @memberof Trace.CachePolicy
         * @static
         * @param {Trace.ICachePolicy} message CachePolicy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CachePolicy.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.scope != null && Object.hasOwnProperty.call(message, "scope"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.scope);
            if (message.maxAgeNs != null && Object.hasOwnProperty.call(message, "maxAgeNs"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.maxAgeNs);
            return writer;
        };

        /**
         * Encodes the specified CachePolicy message, length delimited. Does not implicitly {@link Trace.CachePolicy.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.CachePolicy
         * @static
         * @param {Trace.ICachePolicy} message CachePolicy message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CachePolicy.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CachePolicy message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.CachePolicy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.CachePolicy} CachePolicy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CachePolicy.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.CachePolicy();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.scope = reader.int32();
                    break;
                case 2:
                    message.maxAgeNs = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CachePolicy message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.CachePolicy
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.CachePolicy} CachePolicy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CachePolicy.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CachePolicy message.
         * @function verify
         * @memberof Trace.CachePolicy
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CachePolicy.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.scope != null && message.hasOwnProperty("scope"))
                switch (message.scope) {
                default:
                    return "scope: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.maxAgeNs != null && message.hasOwnProperty("maxAgeNs"))
                if (!$util.isInteger(message.maxAgeNs) && !(message.maxAgeNs && $util.isInteger(message.maxAgeNs.low) && $util.isInteger(message.maxAgeNs.high)))
                    return "maxAgeNs: integer|Long expected";
            return null;
        };

        /**
         * Creates a plain object from a CachePolicy message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.CachePolicy
         * @static
         * @param {Trace.CachePolicy} message CachePolicy
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CachePolicy.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.scope = options.enums === String ? "UNKNOWN" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.maxAgeNs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxAgeNs = options.longs === String ? "0" : 0;
            }
            if (message.scope != null && message.hasOwnProperty("scope"))
                object.scope = options.enums === String ? $root.Trace.CachePolicy.Scope[message.scope] : message.scope;
            if (message.maxAgeNs != null && message.hasOwnProperty("maxAgeNs"))
                if (typeof message.maxAgeNs === "number")
                    object.maxAgeNs = options.longs === String ? String(message.maxAgeNs) : message.maxAgeNs;
                else
                    object.maxAgeNs = options.longs === String ? $util.Long.prototype.toString.call(message.maxAgeNs) : options.longs === Number ? new $util.LongBits(message.maxAgeNs.low >>> 0, message.maxAgeNs.high >>> 0).toNumber() : message.maxAgeNs;
            return object;
        };

        /**
         * Converts this CachePolicy to JSON.
         * @function toJSON
         * @memberof Trace.CachePolicy
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CachePolicy.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Scope enum.
         * @name Trace.CachePolicy.Scope
         * @enum {string}
         * @property {number} UNKNOWN=0 UNKNOWN value
         * @property {number} PUBLIC=1 PUBLIC value
         * @property {number} PRIVATE=2 PRIVATE value
         */
        CachePolicy.Scope = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "UNKNOWN"] = 0;
            values[valuesById[1] = "PUBLIC"] = 1;
            values[valuesById[2] = "PRIVATE"] = 2;
            return values;
        })();

        return CachePolicy;
    })();

    Trace.Details = (function() {

        /**
         * Properties of a Details.
         * @memberof Trace
         * @interface IDetails
         * @property {Object.<string,string>|null} [variablesJson] Details variablesJson
         * @property {string|null} [operationName] Details operationName
         */

        /**
         * Constructs a new Details.
         * @memberof Trace
         * @classdesc Represents a Details.
         * @implements IDetails
         * @constructor
         * @param {Trace.IDetails=} [properties] Properties to set
         */
        function Details(properties) {
            this.variablesJson = {};
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Details variablesJson.
         * @member {Object.<string,string>} variablesJson
         * @memberof Trace.Details
         * @instance
         */
        Details.prototype.variablesJson = $util.emptyObject;

        /**
         * Details operationName.
         * @member {string} operationName
         * @memberof Trace.Details
         * @instance
         */
        Details.prototype.operationName = "";

        /**
         * Creates a new Details instance using the specified properties.
         * @function create
         * @memberof Trace.Details
         * @static
         * @param {Trace.IDetails=} [properties] Properties to set
         * @returns {Trace.Details} Details instance
         */
        Details.create = function create(properties) {
            return new Details(properties);
        };

        /**
         * Encodes the specified Details message. Does not implicitly {@link Trace.Details.verify|verify} messages.
         * @function encode
         * @memberof Trace.Details
         * @static
         * @param {Trace.IDetails} message Details message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Details.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.operationName != null && Object.hasOwnProperty.call(message, "operationName"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.operationName);
            if (message.variablesJson != null && Object.hasOwnProperty.call(message, "variablesJson"))
                for (var keys = Object.keys(message.variablesJson), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.variablesJson[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Details message, length delimited. Does not implicitly {@link Trace.Details.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.Details
         * @static
         * @param {Trace.IDetails} message Details message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Details.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Details message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.Details
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.Details} Details
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Details.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.Details(), key;
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 4:
                    reader.skip().pos++;
                    if (message.variablesJson === $util.emptyObject)
                        message.variablesJson = {};
                    key = reader.string();
                    reader.pos++;
                    message.variablesJson[key] = reader.string();
                    break;
                case 3:
                    message.operationName = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Details message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.Details
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.Details} Details
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Details.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Details message.
         * @function verify
         * @memberof Trace.Details
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Details.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.variablesJson != null && message.hasOwnProperty("variablesJson")) {
                if (!$util.isObject(message.variablesJson))
                    return "variablesJson: object expected";
                var key = Object.keys(message.variablesJson);
                for (var i = 0; i < key.length; ++i)
                    if (!$util.isString(message.variablesJson[key[i]]))
                        return "variablesJson: string{k:string} expected";
            }
            if (message.operationName != null && message.hasOwnProperty("operationName"))
                if (!$util.isString(message.operationName))
                    return "operationName: string expected";
            return null;
        };

        /**
         * Creates a plain object from a Details message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.Details
         * @static
         * @param {Trace.Details} message Details
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Details.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.objects || options.defaults)
                object.variablesJson = {};
            if (options.defaults)
                object.operationName = "";
            if (message.operationName != null && message.hasOwnProperty("operationName"))
                object.operationName = message.operationName;
            var keys2;
            if (message.variablesJson && (keys2 = Object.keys(message.variablesJson)).length) {
                object.variablesJson = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.variablesJson[keys2[j]] = message.variablesJson[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this Details to JSON.
         * @function toJSON
         * @memberof Trace.Details
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Details.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Details;
    })();

    Trace.Error = (function() {

        /**
         * Properties of an Error.
         * @memberof Trace
         * @interface IError
         * @property {string|null} [message] Error message
         * @property {Array.<Trace.ILocation>|null} [location] Error location
         * @property {number|null} [timeNs] Error timeNs
         * @property {string|null} [json] Error json
         */

        /**
         * Constructs a new Error.
         * @memberof Trace
         * @classdesc Represents an Error.
         * @implements IError
         * @constructor
         * @param {Trace.IError=} [properties] Properties to set
         */
        function Error(properties) {
            this.location = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Error message.
         * @member {string} message
         * @memberof Trace.Error
         * @instance
         */
        Error.prototype.message = "";

        /**
         * Error location.
         * @member {Array.<Trace.ILocation>} location
         * @memberof Trace.Error
         * @instance
         */
        Error.prototype.location = $util.emptyArray;

        /**
         * Error timeNs.
         * @member {number} timeNs
         * @memberof Trace.Error
         * @instance
         */
        Error.prototype.timeNs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Error json.
         * @member {string} json
         * @memberof Trace.Error
         * @instance
         */
        Error.prototype.json = "";

        /**
         * Creates a new Error instance using the specified properties.
         * @function create
         * @memberof Trace.Error
         * @static
         * @param {Trace.IError=} [properties] Properties to set
         * @returns {Trace.Error} Error instance
         */
        Error.create = function create(properties) {
            return new Error(properties);
        };

        /**
         * Encodes the specified Error message. Does not implicitly {@link Trace.Error.verify|verify} messages.
         * @function encode
         * @memberof Trace.Error
         * @static
         * @param {Trace.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
            if (message.location != null && message.location.length)
                for (var i = 0; i < message.location.length; ++i)
                    $root.Trace.Location.encode(message.location[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.timeNs != null && Object.hasOwnProperty.call(message, "timeNs"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.timeNs);
            if (message.json != null && Object.hasOwnProperty.call(message, "json"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.json);
            return writer;
        };

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link Trace.Error.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.Error
         * @static
         * @param {Trace.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.Error();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.message = reader.string();
                    break;
                case 2:
                    if (!(message.location && message.location.length))
                        message.location = [];
                    message.location.push($root.Trace.Location.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.timeNs = reader.uint64();
                    break;
                case 4:
                    message.json = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Error message.
         * @function verify
         * @memberof Trace.Error
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Error.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.location != null && message.hasOwnProperty("location")) {
                if (!Array.isArray(message.location))
                    return "location: array expected";
                for (var i = 0; i < message.location.length; ++i) {
                    var error = $root.Trace.Location.verify(message.location[i]);
                    if (error)
                        return "location." + error;
                }
            }
            if (message.timeNs != null && message.hasOwnProperty("timeNs"))
                if (!$util.isInteger(message.timeNs) && !(message.timeNs && $util.isInteger(message.timeNs.low) && $util.isInteger(message.timeNs.high)))
                    return "timeNs: integer|Long expected";
            if (message.json != null && message.hasOwnProperty("json"))
                if (!$util.isString(message.json))
                    return "json: string expected";
            return null;
        };

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.Error
         * @static
         * @param {Trace.Error} message Error
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Error.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.location = [];
            if (options.defaults) {
                object.message = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.timeNs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeNs = options.longs === String ? "0" : 0;
                object.json = "";
            }
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.location && message.location.length) {
                object.location = [];
                for (var j = 0; j < message.location.length; ++j)
                    object.location[j] = $root.Trace.Location.toObject(message.location[j], options);
            }
            if (message.timeNs != null && message.hasOwnProperty("timeNs"))
                if (typeof message.timeNs === "number")
                    object.timeNs = options.longs === String ? String(message.timeNs) : message.timeNs;
                else
                    object.timeNs = options.longs === String ? $util.Long.prototype.toString.call(message.timeNs) : options.longs === Number ? new $util.LongBits(message.timeNs.low >>> 0, message.timeNs.high >>> 0).toNumber(true) : message.timeNs;
            if (message.json != null && message.hasOwnProperty("json"))
                object.json = message.json;
            return object;
        };

        /**
         * Converts this Error to JSON.
         * @function toJSON
         * @memberof Trace.Error
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Error.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Error;
    })();

    Trace.HTTP = (function() {

        /**
         * Properties of a HTTP.
         * @memberof Trace
         * @interface IHTTP
         * @property {Trace.HTTP.Method|null} [method] HTTP method
         * @property {string|null} [host] HTTP host
         * @property {string|null} [path] HTTP path
         * @property {Object.<string,Trace.HTTP.IValues>|null} [requestHeaders] HTTP requestHeaders
         * @property {Object.<string,Trace.HTTP.IValues>|null} [responseHeaders] HTTP responseHeaders
         * @property {number|null} [statusCode] HTTP statusCode
         * @property {boolean|null} [secure] HTTP secure
         * @property {string|null} [protocol] HTTP protocol
         */

        /**
         * Constructs a new HTTP.
         * @memberof Trace
         * @classdesc Represents a HTTP.
         * @implements IHTTP
         * @constructor
         * @param {Trace.IHTTP=} [properties] Properties to set
         */
        function HTTP(properties) {
            this.requestHeaders = {};
            this.responseHeaders = {};
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * HTTP method.
         * @member {Trace.HTTP.Method} method
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.method = 0;

        /**
         * HTTP host.
         * @member {string} host
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.host = "";

        /**
         * HTTP path.
         * @member {string} path
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.path = "";

        /**
         * HTTP requestHeaders.
         * @member {Object.<string,Trace.HTTP.IValues>} requestHeaders
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.requestHeaders = $util.emptyObject;

        /**
         * HTTP responseHeaders.
         * @member {Object.<string,Trace.HTTP.IValues>} responseHeaders
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.responseHeaders = $util.emptyObject;

        /**
         * HTTP statusCode.
         * @member {number} statusCode
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.statusCode = 0;

        /**
         * HTTP secure.
         * @member {boolean} secure
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.secure = false;

        /**
         * HTTP protocol.
         * @member {string} protocol
         * @memberof Trace.HTTP
         * @instance
         */
        HTTP.prototype.protocol = "";

        /**
         * Creates a new HTTP instance using the specified properties.
         * @function create
         * @memberof Trace.HTTP
         * @static
         * @param {Trace.IHTTP=} [properties] Properties to set
         * @returns {Trace.HTTP} HTTP instance
         */
        HTTP.create = function create(properties) {
            return new HTTP(properties);
        };

        /**
         * Encodes the specified HTTP message. Does not implicitly {@link Trace.HTTP.verify|verify} messages.
         * @function encode
         * @memberof Trace.HTTP
         * @static
         * @param {Trace.IHTTP} message HTTP message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HTTP.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.method != null && Object.hasOwnProperty.call(message, "method"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.method);
            if (message.host != null && Object.hasOwnProperty.call(message, "host"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.host);
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.path);
            if (message.requestHeaders != null && Object.hasOwnProperty.call(message, "requestHeaders"))
                for (var keys = Object.keys(message.requestHeaders), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.Trace.HTTP.Values.encode(message.requestHeaders[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.responseHeaders != null && Object.hasOwnProperty.call(message, "responseHeaders"))
                for (var keys = Object.keys(message.responseHeaders), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.Trace.HTTP.Values.encode(message.responseHeaders[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.statusCode != null && Object.hasOwnProperty.call(message, "statusCode"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.statusCode);
            if (message.secure != null && Object.hasOwnProperty.call(message, "secure"))
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.secure);
            if (message.protocol != null && Object.hasOwnProperty.call(message, "protocol"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.protocol);
            return writer;
        };

        /**
         * Encodes the specified HTTP message, length delimited. Does not implicitly {@link Trace.HTTP.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.HTTP
         * @static
         * @param {Trace.IHTTP} message HTTP message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HTTP.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a HTTP message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.HTTP
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.HTTP} HTTP
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HTTP.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.HTTP(), key;
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.method = reader.int32();
                    break;
                case 2:
                    message.host = reader.string();
                    break;
                case 3:
                    message.path = reader.string();
                    break;
                case 4:
                    reader.skip().pos++;
                    if (message.requestHeaders === $util.emptyObject)
                        message.requestHeaders = {};
                    key = reader.string();
                    reader.pos++;
                    message.requestHeaders[key] = $root.Trace.HTTP.Values.decode(reader, reader.uint32());
                    break;
                case 5:
                    reader.skip().pos++;
                    if (message.responseHeaders === $util.emptyObject)
                        message.responseHeaders = {};
                    key = reader.string();
                    reader.pos++;
                    message.responseHeaders[key] = $root.Trace.HTTP.Values.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.statusCode = reader.uint32();
                    break;
                case 8:
                    message.secure = reader.bool();
                    break;
                case 9:
                    message.protocol = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a HTTP message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.HTTP
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.HTTP} HTTP
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HTTP.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a HTTP message.
         * @function verify
         * @memberof Trace.HTTP
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HTTP.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.method != null && message.hasOwnProperty("method"))
                switch (message.method) {
                default:
                    return "method: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    break;
                }
            if (message.host != null && message.hasOwnProperty("host"))
                if (!$util.isString(message.host))
                    return "host: string expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.requestHeaders != null && message.hasOwnProperty("requestHeaders")) {
                if (!$util.isObject(message.requestHeaders))
                    return "requestHeaders: object expected";
                var key = Object.keys(message.requestHeaders);
                for (var i = 0; i < key.length; ++i) {
                    var error = $root.Trace.HTTP.Values.verify(message.requestHeaders[key[i]]);
                    if (error)
                        return "requestHeaders." + error;
                }
            }
            if (message.responseHeaders != null && message.hasOwnProperty("responseHeaders")) {
                if (!$util.isObject(message.responseHeaders))
                    return "responseHeaders: object expected";
                var key = Object.keys(message.responseHeaders);
                for (var i = 0; i < key.length; ++i) {
                    var error = $root.Trace.HTTP.Values.verify(message.responseHeaders[key[i]]);
                    if (error)
                        return "responseHeaders." + error;
                }
            }
            if (message.statusCode != null && message.hasOwnProperty("statusCode"))
                if (!$util.isInteger(message.statusCode))
                    return "statusCode: integer expected";
            if (message.secure != null && message.hasOwnProperty("secure"))
                if (typeof message.secure !== "boolean")
                    return "secure: boolean expected";
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                if (!$util.isString(message.protocol))
                    return "protocol: string expected";
            return null;
        };

        /**
         * Creates a plain object from a HTTP message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.HTTP
         * @static
         * @param {Trace.HTTP} message HTTP
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        HTTP.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.objects || options.defaults) {
                object.requestHeaders = {};
                object.responseHeaders = {};
            }
            if (options.defaults) {
                object.method = options.enums === String ? "UNKNOWN" : 0;
                object.host = "";
                object.path = "";
                object.statusCode = 0;
                object.secure = false;
                object.protocol = "";
            }
            if (message.method != null && message.hasOwnProperty("method"))
                object.method = options.enums === String ? $root.Trace.HTTP.Method[message.method] : message.method;
            if (message.host != null && message.hasOwnProperty("host"))
                object.host = message.host;
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            var keys2;
            if (message.requestHeaders && (keys2 = Object.keys(message.requestHeaders)).length) {
                object.requestHeaders = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.requestHeaders[keys2[j]] = $root.Trace.HTTP.Values.toObject(message.requestHeaders[keys2[j]], options);
            }
            if (message.responseHeaders && (keys2 = Object.keys(message.responseHeaders)).length) {
                object.responseHeaders = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.responseHeaders[keys2[j]] = $root.Trace.HTTP.Values.toObject(message.responseHeaders[keys2[j]], options);
            }
            if (message.statusCode != null && message.hasOwnProperty("statusCode"))
                object.statusCode = message.statusCode;
            if (message.secure != null && message.hasOwnProperty("secure"))
                object.secure = message.secure;
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                object.protocol = message.protocol;
            return object;
        };

        /**
         * Converts this HTTP to JSON.
         * @function toJSON
         * @memberof Trace.HTTP
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        HTTP.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        HTTP.Values = (function() {

            /**
             * Properties of a Values.
             * @memberof Trace.HTTP
             * @interface IValues
             * @property {Array.<string>|null} [value] Values value
             */

            /**
             * Constructs a new Values.
             * @memberof Trace.HTTP
             * @classdesc Represents a Values.
             * @implements IValues
             * @constructor
             * @param {Trace.HTTP.IValues=} [properties] Properties to set
             */
            function Values(properties) {
                this.value = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Values value.
             * @member {Array.<string>} value
             * @memberof Trace.HTTP.Values
             * @instance
             */
            Values.prototype.value = $util.emptyArray;

            /**
             * Creates a new Values instance using the specified properties.
             * @function create
             * @memberof Trace.HTTP.Values
             * @static
             * @param {Trace.HTTP.IValues=} [properties] Properties to set
             * @returns {Trace.HTTP.Values} Values instance
             */
            Values.create = function create(properties) {
                return new Values(properties);
            };

            /**
             * Encodes the specified Values message. Does not implicitly {@link Trace.HTTP.Values.verify|verify} messages.
             * @function encode
             * @memberof Trace.HTTP.Values
             * @static
             * @param {Trace.HTTP.IValues} message Values message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Values.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && message.value.length)
                    for (var i = 0; i < message.value.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.value[i]);
                return writer;
            };

            /**
             * Encodes the specified Values message, length delimited. Does not implicitly {@link Trace.HTTP.Values.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.HTTP.Values
             * @static
             * @param {Trace.HTTP.IValues} message Values message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Values.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Values message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.HTTP.Values
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.HTTP.Values} Values
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Values.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.HTTP.Values();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.value && message.value.length))
                            message.value = [];
                        message.value.push(reader.string());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Values message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.HTTP.Values
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.HTTP.Values} Values
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Values.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Values message.
             * @function verify
             * @memberof Trace.HTTP.Values
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Values.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value")) {
                    if (!Array.isArray(message.value))
                        return "value: array expected";
                    for (var i = 0; i < message.value.length; ++i)
                        if (!$util.isString(message.value[i]))
                            return "value: string[] expected";
                }
                return null;
            };

            /**
             * Creates a plain object from a Values message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.HTTP.Values
             * @static
             * @param {Trace.HTTP.Values} message Values
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Values.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.value = [];
                if (message.value && message.value.length) {
                    object.value = [];
                    for (var j = 0; j < message.value.length; ++j)
                        object.value[j] = message.value[j];
                }
                return object;
            };

            /**
             * Converts this Values to JSON.
             * @function toJSON
             * @memberof Trace.HTTP.Values
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Values.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Values;
        })();

        /**
         * Method enum.
         * @name Trace.HTTP.Method
         * @enum {string}
         * @property {number} UNKNOWN=0 UNKNOWN value
         * @property {number} OPTIONS=1 OPTIONS value
         * @property {number} GET=2 GET value
         * @property {number} HEAD=3 HEAD value
         * @property {number} POST=4 POST value
         * @property {number} PUT=5 PUT value
         * @property {number} DELETE=6 DELETE value
         * @property {number} TRACE=7 TRACE value
         * @property {number} CONNECT=8 CONNECT value
         * @property {number} PATCH=9 PATCH value
         */
        HTTP.Method = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "UNKNOWN"] = 0;
            values[valuesById[1] = "OPTIONS"] = 1;
            values[valuesById[2] = "GET"] = 2;
            values[valuesById[3] = "HEAD"] = 3;
            values[valuesById[4] = "POST"] = 4;
            values[valuesById[5] = "PUT"] = 5;
            values[valuesById[6] = "DELETE"] = 6;
            values[valuesById[7] = "TRACE"] = 7;
            values[valuesById[8] = "CONNECT"] = 8;
            values[valuesById[9] = "PATCH"] = 9;
            return values;
        })();

        return HTTP;
    })();

    Trace.Location = (function() {

        /**
         * Properties of a Location.
         * @memberof Trace
         * @interface ILocation
         * @property {number|null} [line] Location line
         * @property {number|null} [column] Location column
         */

        /**
         * Constructs a new Location.
         * @memberof Trace
         * @classdesc Represents a Location.
         * @implements ILocation
         * @constructor
         * @param {Trace.ILocation=} [properties] Properties to set
         */
        function Location(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Location line.
         * @member {number} line
         * @memberof Trace.Location
         * @instance
         */
        Location.prototype.line = 0;

        /**
         * Location column.
         * @member {number} column
         * @memberof Trace.Location
         * @instance
         */
        Location.prototype.column = 0;

        /**
         * Creates a new Location instance using the specified properties.
         * @function create
         * @memberof Trace.Location
         * @static
         * @param {Trace.ILocation=} [properties] Properties to set
         * @returns {Trace.Location} Location instance
         */
        Location.create = function create(properties) {
            return new Location(properties);
        };

        /**
         * Encodes the specified Location message. Does not implicitly {@link Trace.Location.verify|verify} messages.
         * @function encode
         * @memberof Trace.Location
         * @static
         * @param {Trace.ILocation} message Location message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Location.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.line != null && Object.hasOwnProperty.call(message, "line"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.line);
            if (message.column != null && Object.hasOwnProperty.call(message, "column"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.column);
            return writer;
        };

        /**
         * Encodes the specified Location message, length delimited. Does not implicitly {@link Trace.Location.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.Location
         * @static
         * @param {Trace.ILocation} message Location message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Location.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Location message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.Location
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.Location} Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Location.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.Location();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.line = reader.uint32();
                    break;
                case 2:
                    message.column = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Location message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.Location
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.Location} Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Location.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Location message.
         * @function verify
         * @memberof Trace.Location
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Location.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.line != null && message.hasOwnProperty("line"))
                if (!$util.isInteger(message.line))
                    return "line: integer expected";
            if (message.column != null && message.hasOwnProperty("column"))
                if (!$util.isInteger(message.column))
                    return "column: integer expected";
            return null;
        };

        /**
         * Creates a plain object from a Location message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.Location
         * @static
         * @param {Trace.Location} message Location
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Location.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.line = 0;
                object.column = 0;
            }
            if (message.line != null && message.hasOwnProperty("line"))
                object.line = message.line;
            if (message.column != null && message.hasOwnProperty("column"))
                object.column = message.column;
            return object;
        };

        /**
         * Converts this Location to JSON.
         * @function toJSON
         * @memberof Trace.Location
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Location.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Location;
    })();

    Trace.Node = (function() {

        /**
         * Properties of a Node.
         * @memberof Trace
         * @interface INode
         * @property {string|null} [responseName] Node responseName
         * @property {number|null} [index] Node index
         * @property {string|null} [originalFieldName] Node originalFieldName
         * @property {string|null} [type] Node type
         * @property {string|null} [parentType] Node parentType
         * @property {Trace.ICachePolicy|null} [cachePolicy] Node cachePolicy
         * @property {number|null} [startTime] Node startTime
         * @property {number|null} [endTime] Node endTime
         * @property {Array.<Trace.IError>|null} [error] Node error
         * @property {Array.<Trace.INode>|null} [child] Node child
         */

        /**
         * Constructs a new Node.
         * @memberof Trace
         * @classdesc Represents a Node.
         * @implements INode
         * @constructor
         * @param {Trace.INode=} [properties] Properties to set
         */
        function Node(properties) {
            this.error = [];
            this.child = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Node responseName.
         * @member {string} responseName
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.responseName = "";

        /**
         * Node index.
         * @member {number} index
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.index = 0;

        /**
         * Node originalFieldName.
         * @member {string} originalFieldName
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.originalFieldName = "";

        /**
         * Node type.
         * @member {string} type
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.type = "";

        /**
         * Node parentType.
         * @member {string} parentType
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.parentType = "";

        /**
         * Node cachePolicy.
         * @member {Trace.ICachePolicy|null|undefined} cachePolicy
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.cachePolicy = null;

        /**
         * Node startTime.
         * @member {number} startTime
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.startTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Node endTime.
         * @member {number} endTime
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.endTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Node error.
         * @member {Array.<Trace.IError>} error
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.error = $util.emptyArray;

        /**
         * Node child.
         * @member {Array.<Trace.INode>} child
         * @memberof Trace.Node
         * @instance
         */
        Node.prototype.child = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Node id.
         * @member {"responseName"|"index"|undefined} id
         * @memberof Trace.Node
         * @instance
         */
        Object.defineProperty(Node.prototype, "id", {
            get: $util.oneOfGetter($oneOfFields = ["responseName", "index"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Node instance using the specified properties.
         * @function create
         * @memberof Trace.Node
         * @static
         * @param {Trace.INode=} [properties] Properties to set
         * @returns {Trace.Node} Node instance
         */
        Node.create = function create(properties) {
            return new Node(properties);
        };

        /**
         * Encodes the specified Node message. Does not implicitly {@link Trace.Node.verify|verify} messages.
         * @function encode
         * @memberof Trace.Node
         * @static
         * @param {Trace.INode} message Node message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Node.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.responseName != null && Object.hasOwnProperty.call(message, "responseName"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.responseName);
            if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.index);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.cachePolicy != null && Object.hasOwnProperty.call(message, "cachePolicy"))
                $root.Trace.CachePolicy.encode(message.cachePolicy, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.startTime != null && Object.hasOwnProperty.call(message, "startTime"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.startTime);
            if (message.endTime != null && Object.hasOwnProperty.call(message, "endTime"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.endTime);
            if (message.error != null && message.error.length)
                for (var i = 0; i < message.error.length; ++i)
                    $root.Trace.Error.encode(message.error[i], writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.child != null && message.child.length)
                for (var i = 0; i < message.child.length; ++i)
                    $root.Trace.Node.encode(message.child[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.parentType != null && Object.hasOwnProperty.call(message, "parentType"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.parentType);
            if (message.originalFieldName != null && Object.hasOwnProperty.call(message, "originalFieldName"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.originalFieldName);
            return writer;
        };

        /**
         * Encodes the specified Node message, length delimited. Does not implicitly {@link Trace.Node.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.Node
         * @static
         * @param {Trace.INode} message Node message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Node.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.Node
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.Node} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Node.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.Node();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.responseName = reader.string();
                    break;
                case 2:
                    message.index = reader.uint32();
                    break;
                case 14:
                    message.originalFieldName = reader.string();
                    break;
                case 3:
                    message.type = reader.string();
                    break;
                case 13:
                    message.parentType = reader.string();
                    break;
                case 5:
                    message.cachePolicy = $root.Trace.CachePolicy.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.startTime = reader.uint64();
                    break;
                case 9:
                    message.endTime = reader.uint64();
                    break;
                case 11:
                    if (!(message.error && message.error.length))
                        message.error = [];
                    message.error.push($root.Trace.Error.decode(reader, reader.uint32()));
                    break;
                case 12:
                    if (!(message.child && message.child.length))
                        message.child = [];
                    message.child.push($root.Trace.Node.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Node message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.Node
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.Node} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Node.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Node message.
         * @function verify
         * @memberof Trace.Node
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Node.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.responseName != null && message.hasOwnProperty("responseName")) {
                properties.id = 1;
                if (!$util.isString(message.responseName))
                    return "responseName: string expected";
            }
            if (message.index != null && message.hasOwnProperty("index")) {
                if (properties.id === 1)
                    return "id: multiple values";
                properties.id = 1;
                if (!$util.isInteger(message.index))
                    return "index: integer expected";
            }
            if (message.originalFieldName != null && message.hasOwnProperty("originalFieldName"))
                if (!$util.isString(message.originalFieldName))
                    return "originalFieldName: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.parentType != null && message.hasOwnProperty("parentType"))
                if (!$util.isString(message.parentType))
                    return "parentType: string expected";
            if (message.cachePolicy != null && message.hasOwnProperty("cachePolicy")) {
                var error = $root.Trace.CachePolicy.verify(message.cachePolicy);
                if (error)
                    return "cachePolicy." + error;
            }
            if (message.startTime != null && message.hasOwnProperty("startTime"))
                if (!$util.isInteger(message.startTime) && !(message.startTime && $util.isInteger(message.startTime.low) && $util.isInteger(message.startTime.high)))
                    return "startTime: integer|Long expected";
            if (message.endTime != null && message.hasOwnProperty("endTime"))
                if (!$util.isInteger(message.endTime) && !(message.endTime && $util.isInteger(message.endTime.low) && $util.isInteger(message.endTime.high)))
                    return "endTime: integer|Long expected";
            if (message.error != null && message.hasOwnProperty("error")) {
                if (!Array.isArray(message.error))
                    return "error: array expected";
                for (var i = 0; i < message.error.length; ++i) {
                    var error = $root.Trace.Error.verify(message.error[i]);
                    if (error)
                        return "error." + error;
                }
            }
            if (message.child != null && message.hasOwnProperty("child")) {
                if (!Array.isArray(message.child))
                    return "child: array expected";
                for (var i = 0; i < message.child.length; ++i) {
                    var error = $root.Trace.Node.verify(message.child[i]);
                    if (error)
                        return "child." + error;
                }
            }
            return null;
        };

        /**
         * Creates a plain object from a Node message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.Node
         * @static
         * @param {Trace.Node} message Node
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Node.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.error = [];
                object.child = [];
            }
            if (options.defaults) {
                object.type = "";
                object.cachePolicy = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.startTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.startTime = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.endTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.endTime = options.longs === String ? "0" : 0;
                object.parentType = "";
                object.originalFieldName = "";
            }
            if (message.responseName != null && message.hasOwnProperty("responseName")) {
                object.responseName = message.responseName;
                if (options.oneofs)
                    object.id = "responseName";
            }
            if (message.index != null && message.hasOwnProperty("index")) {
                object.index = message.index;
                if (options.oneofs)
                    object.id = "index";
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.cachePolicy != null && message.hasOwnProperty("cachePolicy"))
                object.cachePolicy = $root.Trace.CachePolicy.toObject(message.cachePolicy, options);
            if (message.startTime != null && message.hasOwnProperty("startTime"))
                if (typeof message.startTime === "number")
                    object.startTime = options.longs === String ? String(message.startTime) : message.startTime;
                else
                    object.startTime = options.longs === String ? $util.Long.prototype.toString.call(message.startTime) : options.longs === Number ? new $util.LongBits(message.startTime.low >>> 0, message.startTime.high >>> 0).toNumber(true) : message.startTime;
            if (message.endTime != null && message.hasOwnProperty("endTime"))
                if (typeof message.endTime === "number")
                    object.endTime = options.longs === String ? String(message.endTime) : message.endTime;
                else
                    object.endTime = options.longs === String ? $util.Long.prototype.toString.call(message.endTime) : options.longs === Number ? new $util.LongBits(message.endTime.low >>> 0, message.endTime.high >>> 0).toNumber(true) : message.endTime;
            if (message.error && message.error.length) {
                object.error = [];
                for (var j = 0; j < message.error.length; ++j)
                    object.error[j] = $root.Trace.Error.toObject(message.error[j], options);
            }
            if (message.child && message.child.length) {
                object.child = [];
                for (var j = 0; j < message.child.length; ++j)
                    object.child[j] = $root.Trace.Node.toObject(message.child[j], options);
            }
            if (message.parentType != null && message.hasOwnProperty("parentType"))
                object.parentType = message.parentType;
            if (message.originalFieldName != null && message.hasOwnProperty("originalFieldName"))
                object.originalFieldName = message.originalFieldName;
            return object;
        };

        /**
         * Converts this Node to JSON.
         * @function toJSON
         * @memberof Trace.Node
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Node.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Node;
    })();

    Trace.QueryPlanNode = (function() {

        /**
         * Properties of a QueryPlanNode.
         * @memberof Trace
         * @interface IQueryPlanNode
         * @property {Trace.QueryPlanNode.ISequenceNode|null} [sequence] QueryPlanNode sequence
         * @property {Trace.QueryPlanNode.IParallelNode|null} [parallel] QueryPlanNode parallel
         * @property {Trace.QueryPlanNode.IFetchNode|null} [fetch] QueryPlanNode fetch
         * @property {Trace.QueryPlanNode.IFlattenNode|null} [flatten] QueryPlanNode flatten
         */

        /**
         * Constructs a new QueryPlanNode.
         * @memberof Trace
         * @classdesc Represents a QueryPlanNode.
         * @implements IQueryPlanNode
         * @constructor
         * @param {Trace.IQueryPlanNode=} [properties] Properties to set
         */
        function QueryPlanNode(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QueryPlanNode sequence.
         * @member {Trace.QueryPlanNode.ISequenceNode|null|undefined} sequence
         * @memberof Trace.QueryPlanNode
         * @instance
         */
        QueryPlanNode.prototype.sequence = null;

        /**
         * QueryPlanNode parallel.
         * @member {Trace.QueryPlanNode.IParallelNode|null|undefined} parallel
         * @memberof Trace.QueryPlanNode
         * @instance
         */
        QueryPlanNode.prototype.parallel = null;

        /**
         * QueryPlanNode fetch.
         * @member {Trace.QueryPlanNode.IFetchNode|null|undefined} fetch
         * @memberof Trace.QueryPlanNode
         * @instance
         */
        QueryPlanNode.prototype.fetch = null;

        /**
         * QueryPlanNode flatten.
         * @member {Trace.QueryPlanNode.IFlattenNode|null|undefined} flatten
         * @memberof Trace.QueryPlanNode
         * @instance
         */
        QueryPlanNode.prototype.flatten = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * QueryPlanNode node.
         * @member {"sequence"|"parallel"|"fetch"|"flatten"|undefined} node
         * @memberof Trace.QueryPlanNode
         * @instance
         */
        Object.defineProperty(QueryPlanNode.prototype, "node", {
            get: $util.oneOfGetter($oneOfFields = ["sequence", "parallel", "fetch", "flatten"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new QueryPlanNode instance using the specified properties.
         * @function create
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {Trace.IQueryPlanNode=} [properties] Properties to set
         * @returns {Trace.QueryPlanNode} QueryPlanNode instance
         */
        QueryPlanNode.create = function create(properties) {
            return new QueryPlanNode(properties);
        };

        /**
         * Encodes the specified QueryPlanNode message. Does not implicitly {@link Trace.QueryPlanNode.verify|verify} messages.
         * @function encode
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {Trace.IQueryPlanNode} message QueryPlanNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryPlanNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sequence != null && Object.hasOwnProperty.call(message, "sequence"))
                $root.Trace.QueryPlanNode.SequenceNode.encode(message.sequence, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.parallel != null && Object.hasOwnProperty.call(message, "parallel"))
                $root.Trace.QueryPlanNode.ParallelNode.encode(message.parallel, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.fetch != null && Object.hasOwnProperty.call(message, "fetch"))
                $root.Trace.QueryPlanNode.FetchNode.encode(message.fetch, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.flatten != null && Object.hasOwnProperty.call(message, "flatten"))
                $root.Trace.QueryPlanNode.FlattenNode.encode(message.flatten, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified QueryPlanNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {Trace.IQueryPlanNode} message QueryPlanNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryPlanNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QueryPlanNode message from the specified reader or buffer.
         * @function decode
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Trace.QueryPlanNode} QueryPlanNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryPlanNode.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.sequence = $root.Trace.QueryPlanNode.SequenceNode.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.parallel = $root.Trace.QueryPlanNode.ParallelNode.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.fetch = $root.Trace.QueryPlanNode.FetchNode.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.flatten = $root.Trace.QueryPlanNode.FlattenNode.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QueryPlanNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Trace.QueryPlanNode} QueryPlanNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryPlanNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QueryPlanNode message.
         * @function verify
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QueryPlanNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.sequence != null && message.hasOwnProperty("sequence")) {
                properties.node = 1;
                {
                    var error = $root.Trace.QueryPlanNode.SequenceNode.verify(message.sequence);
                    if (error)
                        return "sequence." + error;
                }
            }
            if (message.parallel != null && message.hasOwnProperty("parallel")) {
                if (properties.node === 1)
                    return "node: multiple values";
                properties.node = 1;
                {
                    var error = $root.Trace.QueryPlanNode.ParallelNode.verify(message.parallel);
                    if (error)
                        return "parallel." + error;
                }
            }
            if (message.fetch != null && message.hasOwnProperty("fetch")) {
                if (properties.node === 1)
                    return "node: multiple values";
                properties.node = 1;
                {
                    var error = $root.Trace.QueryPlanNode.FetchNode.verify(message.fetch);
                    if (error)
                        return "fetch." + error;
                }
            }
            if (message.flatten != null && message.hasOwnProperty("flatten")) {
                if (properties.node === 1)
                    return "node: multiple values";
                properties.node = 1;
                {
                    var error = $root.Trace.QueryPlanNode.FlattenNode.verify(message.flatten);
                    if (error)
                        return "flatten." + error;
                }
            }
            return null;
        };

        /**
         * Creates a plain object from a QueryPlanNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Trace.QueryPlanNode
         * @static
         * @param {Trace.QueryPlanNode} message QueryPlanNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QueryPlanNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.sequence != null && message.hasOwnProperty("sequence")) {
                object.sequence = $root.Trace.QueryPlanNode.SequenceNode.toObject(message.sequence, options);
                if (options.oneofs)
                    object.node = "sequence";
            }
            if (message.parallel != null && message.hasOwnProperty("parallel")) {
                object.parallel = $root.Trace.QueryPlanNode.ParallelNode.toObject(message.parallel, options);
                if (options.oneofs)
                    object.node = "parallel";
            }
            if (message.fetch != null && message.hasOwnProperty("fetch")) {
                object.fetch = $root.Trace.QueryPlanNode.FetchNode.toObject(message.fetch, options);
                if (options.oneofs)
                    object.node = "fetch";
            }
            if (message.flatten != null && message.hasOwnProperty("flatten")) {
                object.flatten = $root.Trace.QueryPlanNode.FlattenNode.toObject(message.flatten, options);
                if (options.oneofs)
                    object.node = "flatten";
            }
            return object;
        };

        /**
         * Converts this QueryPlanNode to JSON.
         * @function toJSON
         * @memberof Trace.QueryPlanNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QueryPlanNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        QueryPlanNode.SequenceNode = (function() {

            /**
             * Properties of a SequenceNode.
             * @memberof Trace.QueryPlanNode
             * @interface ISequenceNode
             * @property {Array.<Trace.IQueryPlanNode>|null} [nodes] SequenceNode nodes
             */

            /**
             * Constructs a new SequenceNode.
             * @memberof Trace.QueryPlanNode
             * @classdesc Represents a SequenceNode.
             * @implements ISequenceNode
             * @constructor
             * @param {Trace.QueryPlanNode.ISequenceNode=} [properties] Properties to set
             */
            function SequenceNode(properties) {
                this.nodes = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SequenceNode nodes.
             * @member {Array.<Trace.IQueryPlanNode>} nodes
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @instance
             */
            SequenceNode.prototype.nodes = $util.emptyArray;

            /**
             * Creates a new SequenceNode instance using the specified properties.
             * @function create
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {Trace.QueryPlanNode.ISequenceNode=} [properties] Properties to set
             * @returns {Trace.QueryPlanNode.SequenceNode} SequenceNode instance
             */
            SequenceNode.create = function create(properties) {
                return new SequenceNode(properties);
            };

            /**
             * Encodes the specified SequenceNode message. Does not implicitly {@link Trace.QueryPlanNode.SequenceNode.verify|verify} messages.
             * @function encode
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {Trace.QueryPlanNode.ISequenceNode} message SequenceNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SequenceNode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.nodes != null && message.nodes.length)
                    for (var i = 0; i < message.nodes.length; ++i)
                        $root.Trace.QueryPlanNode.encode(message.nodes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified SequenceNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.SequenceNode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {Trace.QueryPlanNode.ISequenceNode} message SequenceNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SequenceNode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SequenceNode message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.QueryPlanNode.SequenceNode} SequenceNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SequenceNode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode.SequenceNode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.nodes && message.nodes.length))
                            message.nodes = [];
                        message.nodes.push($root.Trace.QueryPlanNode.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SequenceNode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.QueryPlanNode.SequenceNode} SequenceNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SequenceNode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SequenceNode message.
             * @function verify
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SequenceNode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.nodes != null && message.hasOwnProperty("nodes")) {
                    if (!Array.isArray(message.nodes))
                        return "nodes: array expected";
                    for (var i = 0; i < message.nodes.length; ++i) {
                        var error = $root.Trace.QueryPlanNode.verify(message.nodes[i]);
                        if (error)
                            return "nodes." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a plain object from a SequenceNode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @static
             * @param {Trace.QueryPlanNode.SequenceNode} message SequenceNode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SequenceNode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.nodes = [];
                if (message.nodes && message.nodes.length) {
                    object.nodes = [];
                    for (var j = 0; j < message.nodes.length; ++j)
                        object.nodes[j] = $root.Trace.QueryPlanNode.toObject(message.nodes[j], options);
                }
                return object;
            };

            /**
             * Converts this SequenceNode to JSON.
             * @function toJSON
             * @memberof Trace.QueryPlanNode.SequenceNode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SequenceNode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return SequenceNode;
        })();

        QueryPlanNode.ParallelNode = (function() {

            /**
             * Properties of a ParallelNode.
             * @memberof Trace.QueryPlanNode
             * @interface IParallelNode
             * @property {Array.<Trace.IQueryPlanNode>|null} [nodes] ParallelNode nodes
             */

            /**
             * Constructs a new ParallelNode.
             * @memberof Trace.QueryPlanNode
             * @classdesc Represents a ParallelNode.
             * @implements IParallelNode
             * @constructor
             * @param {Trace.QueryPlanNode.IParallelNode=} [properties] Properties to set
             */
            function ParallelNode(properties) {
                this.nodes = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ParallelNode nodes.
             * @member {Array.<Trace.IQueryPlanNode>} nodes
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @instance
             */
            ParallelNode.prototype.nodes = $util.emptyArray;

            /**
             * Creates a new ParallelNode instance using the specified properties.
             * @function create
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {Trace.QueryPlanNode.IParallelNode=} [properties] Properties to set
             * @returns {Trace.QueryPlanNode.ParallelNode} ParallelNode instance
             */
            ParallelNode.create = function create(properties) {
                return new ParallelNode(properties);
            };

            /**
             * Encodes the specified ParallelNode message. Does not implicitly {@link Trace.QueryPlanNode.ParallelNode.verify|verify} messages.
             * @function encode
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {Trace.QueryPlanNode.IParallelNode} message ParallelNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ParallelNode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.nodes != null && message.nodes.length)
                    for (var i = 0; i < message.nodes.length; ++i)
                        $root.Trace.QueryPlanNode.encode(message.nodes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ParallelNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.ParallelNode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {Trace.QueryPlanNode.IParallelNode} message ParallelNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ParallelNode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ParallelNode message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.QueryPlanNode.ParallelNode} ParallelNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ParallelNode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode.ParallelNode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.nodes && message.nodes.length))
                            message.nodes = [];
                        message.nodes.push($root.Trace.QueryPlanNode.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ParallelNode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.QueryPlanNode.ParallelNode} ParallelNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ParallelNode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ParallelNode message.
             * @function verify
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ParallelNode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.nodes != null && message.hasOwnProperty("nodes")) {
                    if (!Array.isArray(message.nodes))
                        return "nodes: array expected";
                    for (var i = 0; i < message.nodes.length; ++i) {
                        var error = $root.Trace.QueryPlanNode.verify(message.nodes[i]);
                        if (error)
                            return "nodes." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a plain object from a ParallelNode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @static
             * @param {Trace.QueryPlanNode.ParallelNode} message ParallelNode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ParallelNode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.nodes = [];
                if (message.nodes && message.nodes.length) {
                    object.nodes = [];
                    for (var j = 0; j < message.nodes.length; ++j)
                        object.nodes[j] = $root.Trace.QueryPlanNode.toObject(message.nodes[j], options);
                }
                return object;
            };

            /**
             * Converts this ParallelNode to JSON.
             * @function toJSON
             * @memberof Trace.QueryPlanNode.ParallelNode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ParallelNode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ParallelNode;
        })();

        QueryPlanNode.FetchNode = (function() {

            /**
             * Properties of a FetchNode.
             * @memberof Trace.QueryPlanNode
             * @interface IFetchNode
             * @property {string|null} [serviceName] FetchNode serviceName
             * @property {boolean|null} [traceParsingFailed] FetchNode traceParsingFailed
             * @property {ITrace|null} [trace] FetchNode trace
             * @property {number|null} [sentTimeOffset] FetchNode sentTimeOffset
             * @property {google.protobuf.ITimestamp|null} [sentTime] FetchNode sentTime
             * @property {google.protobuf.ITimestamp|null} [receivedTime] FetchNode receivedTime
             */

            /**
             * Constructs a new FetchNode.
             * @memberof Trace.QueryPlanNode
             * @classdesc Represents a FetchNode.
             * @implements IFetchNode
             * @constructor
             * @param {Trace.QueryPlanNode.IFetchNode=} [properties] Properties to set
             */
            function FetchNode(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FetchNode serviceName.
             * @member {string} serviceName
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.serviceName = "";

            /**
             * FetchNode traceParsingFailed.
             * @member {boolean} traceParsingFailed
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.traceParsingFailed = false;

            /**
             * FetchNode trace.
             * @member {ITrace|null|undefined} trace
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.trace = null;

            /**
             * FetchNode sentTimeOffset.
             * @member {number} sentTimeOffset
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.sentTimeOffset = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * FetchNode sentTime.
             * @member {google.protobuf.ITimestamp|null|undefined} sentTime
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.sentTime = null;

            /**
             * FetchNode receivedTime.
             * @member {google.protobuf.ITimestamp|null|undefined} receivedTime
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             */
            FetchNode.prototype.receivedTime = null;

            /**
             * Creates a new FetchNode instance using the specified properties.
             * @function create
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {Trace.QueryPlanNode.IFetchNode=} [properties] Properties to set
             * @returns {Trace.QueryPlanNode.FetchNode} FetchNode instance
             */
            FetchNode.create = function create(properties) {
                return new FetchNode(properties);
            };

            /**
             * Encodes the specified FetchNode message. Does not implicitly {@link Trace.QueryPlanNode.FetchNode.verify|verify} messages.
             * @function encode
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {Trace.QueryPlanNode.IFetchNode} message FetchNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FetchNode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.serviceName != null && Object.hasOwnProperty.call(message, "serviceName"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.serviceName);
                if (message.traceParsingFailed != null && Object.hasOwnProperty.call(message, "traceParsingFailed"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.traceParsingFailed);
                if (message.trace != null && Object.hasOwnProperty.call(message, "trace"))
                    $root.Trace.encode(message.trace, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.sentTimeOffset != null && Object.hasOwnProperty.call(message, "sentTimeOffset"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.sentTimeOffset);
                if (message.sentTime != null && Object.hasOwnProperty.call(message, "sentTime"))
                    $root.google.protobuf.Timestamp.encode(message.sentTime, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.receivedTime != null && Object.hasOwnProperty.call(message, "receivedTime"))
                    $root.google.protobuf.Timestamp.encode(message.receivedTime, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FetchNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.FetchNode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {Trace.QueryPlanNode.IFetchNode} message FetchNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FetchNode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FetchNode message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.QueryPlanNode.FetchNode} FetchNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FetchNode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode.FetchNode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.serviceName = reader.string();
                        break;
                    case 2:
                        message.traceParsingFailed = reader.bool();
                        break;
                    case 3:
                        message.trace = $root.Trace.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.sentTimeOffset = reader.uint64();
                        break;
                    case 5:
                        message.sentTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                        break;
                    case 6:
                        message.receivedTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a FetchNode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.QueryPlanNode.FetchNode} FetchNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FetchNode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FetchNode message.
             * @function verify
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FetchNode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    if (!$util.isString(message.serviceName))
                        return "serviceName: string expected";
                if (message.traceParsingFailed != null && message.hasOwnProperty("traceParsingFailed"))
                    if (typeof message.traceParsingFailed !== "boolean")
                        return "traceParsingFailed: boolean expected";
                if (message.trace != null && message.hasOwnProperty("trace")) {
                    var error = $root.Trace.verify(message.trace);
                    if (error)
                        return "trace." + error;
                }
                if (message.sentTimeOffset != null && message.hasOwnProperty("sentTimeOffset"))
                    if (!$util.isInteger(message.sentTimeOffset) && !(message.sentTimeOffset && $util.isInteger(message.sentTimeOffset.low) && $util.isInteger(message.sentTimeOffset.high)))
                        return "sentTimeOffset: integer|Long expected";
                if (message.sentTime != null && message.hasOwnProperty("sentTime")) {
                    var error = $root.google.protobuf.Timestamp.verify(message.sentTime);
                    if (error)
                        return "sentTime." + error;
                }
                if (message.receivedTime != null && message.hasOwnProperty("receivedTime")) {
                    var error = $root.google.protobuf.Timestamp.verify(message.receivedTime);
                    if (error)
                        return "receivedTime." + error;
                }
                return null;
            };

            /**
             * Creates a plain object from a FetchNode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.QueryPlanNode.FetchNode
             * @static
             * @param {Trace.QueryPlanNode.FetchNode} message FetchNode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FetchNode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.serviceName = "";
                    object.traceParsingFailed = false;
                    object.trace = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.sentTimeOffset = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.sentTimeOffset = options.longs === String ? "0" : 0;
                    object.sentTime = null;
                    object.receivedTime = null;
                }
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    object.serviceName = message.serviceName;
                if (message.traceParsingFailed != null && message.hasOwnProperty("traceParsingFailed"))
                    object.traceParsingFailed = message.traceParsingFailed;
                if (message.trace != null && message.hasOwnProperty("trace"))
                    object.trace = $root.Trace.toObject(message.trace, options);
                if (message.sentTimeOffset != null && message.hasOwnProperty("sentTimeOffset"))
                    if (typeof message.sentTimeOffset === "number")
                        object.sentTimeOffset = options.longs === String ? String(message.sentTimeOffset) : message.sentTimeOffset;
                    else
                        object.sentTimeOffset = options.longs === String ? $util.Long.prototype.toString.call(message.sentTimeOffset) : options.longs === Number ? new $util.LongBits(message.sentTimeOffset.low >>> 0, message.sentTimeOffset.high >>> 0).toNumber(true) : message.sentTimeOffset;
                if (message.sentTime != null && message.hasOwnProperty("sentTime"))
                    object.sentTime = $root.google.protobuf.Timestamp.toObject(message.sentTime, options);
                if (message.receivedTime != null && message.hasOwnProperty("receivedTime"))
                    object.receivedTime = $root.google.protobuf.Timestamp.toObject(message.receivedTime, options);
                return object;
            };

            /**
             * Converts this FetchNode to JSON.
             * @function toJSON
             * @memberof Trace.QueryPlanNode.FetchNode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FetchNode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return FetchNode;
        })();

        QueryPlanNode.FlattenNode = (function() {

            /**
             * Properties of a FlattenNode.
             * @memberof Trace.QueryPlanNode
             * @interface IFlattenNode
             * @property {Array.<Trace.QueryPlanNode.IResponsePathElement>|null} [responsePath] FlattenNode responsePath
             * @property {Trace.IQueryPlanNode|null} [node] FlattenNode node
             */

            /**
             * Constructs a new FlattenNode.
             * @memberof Trace.QueryPlanNode
             * @classdesc Represents a FlattenNode.
             * @implements IFlattenNode
             * @constructor
             * @param {Trace.QueryPlanNode.IFlattenNode=} [properties] Properties to set
             */
            function FlattenNode(properties) {
                this.responsePath = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FlattenNode responsePath.
             * @member {Array.<Trace.QueryPlanNode.IResponsePathElement>} responsePath
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @instance
             */
            FlattenNode.prototype.responsePath = $util.emptyArray;

            /**
             * FlattenNode node.
             * @member {Trace.IQueryPlanNode|null|undefined} node
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @instance
             */
            FlattenNode.prototype.node = null;

            /**
             * Creates a new FlattenNode instance using the specified properties.
             * @function create
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {Trace.QueryPlanNode.IFlattenNode=} [properties] Properties to set
             * @returns {Trace.QueryPlanNode.FlattenNode} FlattenNode instance
             */
            FlattenNode.create = function create(properties) {
                return new FlattenNode(properties);
            };

            /**
             * Encodes the specified FlattenNode message. Does not implicitly {@link Trace.QueryPlanNode.FlattenNode.verify|verify} messages.
             * @function encode
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {Trace.QueryPlanNode.IFlattenNode} message FlattenNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FlattenNode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.responsePath != null && message.responsePath.length)
                    for (var i = 0; i < message.responsePath.length; ++i)
                        $root.Trace.QueryPlanNode.ResponsePathElement.encode(message.responsePath[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.node != null && Object.hasOwnProperty.call(message, "node"))
                    $root.Trace.QueryPlanNode.encode(message.node, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FlattenNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.FlattenNode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {Trace.QueryPlanNode.IFlattenNode} message FlattenNode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FlattenNode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FlattenNode message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.QueryPlanNode.FlattenNode} FlattenNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FlattenNode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode.FlattenNode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.responsePath && message.responsePath.length))
                            message.responsePath = [];
                        message.responsePath.push($root.Trace.QueryPlanNode.ResponsePathElement.decode(reader, reader.uint32()));
                        break;
                    case 2:
                        message.node = $root.Trace.QueryPlanNode.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a FlattenNode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.QueryPlanNode.FlattenNode} FlattenNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FlattenNode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FlattenNode message.
             * @function verify
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FlattenNode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.responsePath != null && message.hasOwnProperty("responsePath")) {
                    if (!Array.isArray(message.responsePath))
                        return "responsePath: array expected";
                    for (var i = 0; i < message.responsePath.length; ++i) {
                        var error = $root.Trace.QueryPlanNode.ResponsePathElement.verify(message.responsePath[i]);
                        if (error)
                            return "responsePath." + error;
                    }
                }
                if (message.node != null && message.hasOwnProperty("node")) {
                    var error = $root.Trace.QueryPlanNode.verify(message.node);
                    if (error)
                        return "node." + error;
                }
                return null;
            };

            /**
             * Creates a plain object from a FlattenNode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @static
             * @param {Trace.QueryPlanNode.FlattenNode} message FlattenNode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FlattenNode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.responsePath = [];
                if (options.defaults)
                    object.node = null;
                if (message.responsePath && message.responsePath.length) {
                    object.responsePath = [];
                    for (var j = 0; j < message.responsePath.length; ++j)
                        object.responsePath[j] = $root.Trace.QueryPlanNode.ResponsePathElement.toObject(message.responsePath[j], options);
                }
                if (message.node != null && message.hasOwnProperty("node"))
                    object.node = $root.Trace.QueryPlanNode.toObject(message.node, options);
                return object;
            };

            /**
             * Converts this FlattenNode to JSON.
             * @function toJSON
             * @memberof Trace.QueryPlanNode.FlattenNode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FlattenNode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return FlattenNode;
        })();

        QueryPlanNode.ResponsePathElement = (function() {

            /**
             * Properties of a ResponsePathElement.
             * @memberof Trace.QueryPlanNode
             * @interface IResponsePathElement
             * @property {string|null} [fieldName] ResponsePathElement fieldName
             * @property {number|null} [index] ResponsePathElement index
             */

            /**
             * Constructs a new ResponsePathElement.
             * @memberof Trace.QueryPlanNode
             * @classdesc Represents a ResponsePathElement.
             * @implements IResponsePathElement
             * @constructor
             * @param {Trace.QueryPlanNode.IResponsePathElement=} [properties] Properties to set
             */
            function ResponsePathElement(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ResponsePathElement fieldName.
             * @member {string} fieldName
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @instance
             */
            ResponsePathElement.prototype.fieldName = "";

            /**
             * ResponsePathElement index.
             * @member {number} index
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @instance
             */
            ResponsePathElement.prototype.index = 0;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * ResponsePathElement id.
             * @member {"fieldName"|"index"|undefined} id
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @instance
             */
            Object.defineProperty(ResponsePathElement.prototype, "id", {
                get: $util.oneOfGetter($oneOfFields = ["fieldName", "index"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ResponsePathElement instance using the specified properties.
             * @function create
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {Trace.QueryPlanNode.IResponsePathElement=} [properties] Properties to set
             * @returns {Trace.QueryPlanNode.ResponsePathElement} ResponsePathElement instance
             */
            ResponsePathElement.create = function create(properties) {
                return new ResponsePathElement(properties);
            };

            /**
             * Encodes the specified ResponsePathElement message. Does not implicitly {@link Trace.QueryPlanNode.ResponsePathElement.verify|verify} messages.
             * @function encode
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {Trace.QueryPlanNode.IResponsePathElement} message ResponsePathElement message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResponsePathElement.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fieldName != null && Object.hasOwnProperty.call(message, "fieldName"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.fieldName);
                if (message.index != null && Object.hasOwnProperty.call(message, "index"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.index);
                return writer;
            };

            /**
             * Encodes the specified ResponsePathElement message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.ResponsePathElement.verify|verify} messages.
             * @function encodeDelimited
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {Trace.QueryPlanNode.IResponsePathElement} message ResponsePathElement message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResponsePathElement.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ResponsePathElement message from the specified reader or buffer.
             * @function decode
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {Trace.QueryPlanNode.ResponsePathElement} ResponsePathElement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResponsePathElement.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Trace.QueryPlanNode.ResponsePathElement();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.fieldName = reader.string();
                        break;
                    case 2:
                        message.index = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ResponsePathElement message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {Trace.QueryPlanNode.ResponsePathElement} ResponsePathElement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResponsePathElement.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ResponsePathElement message.
             * @function verify
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ResponsePathElement.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.fieldName != null && message.hasOwnProperty("fieldName")) {
                    properties.id = 1;
                    if (!$util.isString(message.fieldName))
                        return "fieldName: string expected";
                }
                if (message.index != null && message.hasOwnProperty("index")) {
                    if (properties.id === 1)
                        return "id: multiple values";
                    properties.id = 1;
                    if (!$util.isInteger(message.index))
                        return "index: integer expected";
                }
                return null;
            };

            /**
             * Creates a plain object from a ResponsePathElement message. Also converts values to other types if specified.
             * @function toObject
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @static
             * @param {Trace.QueryPlanNode.ResponsePathElement} message ResponsePathElement
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ResponsePathElement.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (message.fieldName != null && message.hasOwnProperty("fieldName")) {
                    object.fieldName = message.fieldName;
                    if (options.oneofs)
                        object.id = "fieldName";
                }
                if (message.index != null && message.hasOwnProperty("index")) {
                    object.index = message.index;
                    if (options.oneofs)
                        object.id = "index";
                }
                return object;
            };

            /**
             * Converts this ResponsePathElement to JSON.
             * @function toJSON
             * @memberof Trace.QueryPlanNode.ResponsePathElement
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ResponsePathElement.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ResponsePathElement;
        })();

        return QueryPlanNode;
    })();

    return Trace;
})();

$root.ReportHeader = (function() {

    /**
     * Properties of a ReportHeader.
     * @exports IReportHeader
     * @interface IReportHeader
     * @property {string|null} [graphRef] ReportHeader graphRef
     * @property {string|null} [hostname] ReportHeader hostname
     * @property {string|null} [agentVersion] ReportHeader agentVersion
     * @property {string|null} [serviceVersion] ReportHeader serviceVersion
     * @property {string|null} [runtimeVersion] ReportHeader runtimeVersion
     * @property {string|null} [uname] ReportHeader uname
     * @property {string|null} [executableSchemaId] ReportHeader executableSchemaId
     */

    /**
     * Constructs a new ReportHeader.
     * @exports ReportHeader
     * @classdesc Represents a ReportHeader.
     * @implements IReportHeader
     * @constructor
     * @param {IReportHeader=} [properties] Properties to set
     */
    function ReportHeader(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ReportHeader graphRef.
     * @member {string} graphRef
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.graphRef = "";

    /**
     * ReportHeader hostname.
     * @member {string} hostname
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.hostname = "";

    /**
     * ReportHeader agentVersion.
     * @member {string} agentVersion
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.agentVersion = "";

    /**
     * ReportHeader serviceVersion.
     * @member {string} serviceVersion
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.serviceVersion = "";

    /**
     * ReportHeader runtimeVersion.
     * @member {string} runtimeVersion
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.runtimeVersion = "";

    /**
     * ReportHeader uname.
     * @member {string} uname
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.uname = "";

    /**
     * ReportHeader executableSchemaId.
     * @member {string} executableSchemaId
     * @memberof ReportHeader
     * @instance
     */
    ReportHeader.prototype.executableSchemaId = "";

    /**
     * Creates a new ReportHeader instance using the specified properties.
     * @function create
     * @memberof ReportHeader
     * @static
     * @param {IReportHeader=} [properties] Properties to set
     * @returns {ReportHeader} ReportHeader instance
     */
    ReportHeader.create = function create(properties) {
        return new ReportHeader(properties);
    };

    /**
     * Encodes the specified ReportHeader message. Does not implicitly {@link ReportHeader.verify|verify} messages.
     * @function encode
     * @memberof ReportHeader
     * @static
     * @param {IReportHeader} message ReportHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ReportHeader.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.hostname != null && Object.hasOwnProperty.call(message, "hostname"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.hostname);
        if (message.agentVersion != null && Object.hasOwnProperty.call(message, "agentVersion"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.agentVersion);
        if (message.serviceVersion != null && Object.hasOwnProperty.call(message, "serviceVersion"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.serviceVersion);
        if (message.runtimeVersion != null && Object.hasOwnProperty.call(message, "runtimeVersion"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.runtimeVersion);
        if (message.uname != null && Object.hasOwnProperty.call(message, "uname"))
            writer.uint32(/* id 9, wireType 2 =*/74).string(message.uname);
        if (message.executableSchemaId != null && Object.hasOwnProperty.call(message, "executableSchemaId"))
            writer.uint32(/* id 11, wireType 2 =*/90).string(message.executableSchemaId);
        if (message.graphRef != null && Object.hasOwnProperty.call(message, "graphRef"))
            writer.uint32(/* id 12, wireType 2 =*/98).string(message.graphRef);
        return writer;
    };

    /**
     * Encodes the specified ReportHeader message, length delimited. Does not implicitly {@link ReportHeader.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ReportHeader
     * @static
     * @param {IReportHeader} message ReportHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ReportHeader.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ReportHeader message from the specified reader or buffer.
     * @function decode
     * @memberof ReportHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ReportHeader} ReportHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ReportHeader.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ReportHeader();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 12:
                message.graphRef = reader.string();
                break;
            case 5:
                message.hostname = reader.string();
                break;
            case 6:
                message.agentVersion = reader.string();
                break;
            case 7:
                message.serviceVersion = reader.string();
                break;
            case 8:
                message.runtimeVersion = reader.string();
                break;
            case 9:
                message.uname = reader.string();
                break;
            case 11:
                message.executableSchemaId = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ReportHeader message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ReportHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ReportHeader} ReportHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ReportHeader.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ReportHeader message.
     * @function verify
     * @memberof ReportHeader
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ReportHeader.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.graphRef != null && message.hasOwnProperty("graphRef"))
            if (!$util.isString(message.graphRef))
                return "graphRef: string expected";
        if (message.hostname != null && message.hasOwnProperty("hostname"))
            if (!$util.isString(message.hostname))
                return "hostname: string expected";
        if (message.agentVersion != null && message.hasOwnProperty("agentVersion"))
            if (!$util.isString(message.agentVersion))
                return "agentVersion: string expected";
        if (message.serviceVersion != null && message.hasOwnProperty("serviceVersion"))
            if (!$util.isString(message.serviceVersion))
                return "serviceVersion: string expected";
        if (message.runtimeVersion != null && message.hasOwnProperty("runtimeVersion"))
            if (!$util.isString(message.runtimeVersion))
                return "runtimeVersion: string expected";
        if (message.uname != null && message.hasOwnProperty("uname"))
            if (!$util.isString(message.uname))
                return "uname: string expected";
        if (message.executableSchemaId != null && message.hasOwnProperty("executableSchemaId"))
            if (!$util.isString(message.executableSchemaId))
                return "executableSchemaId: string expected";
        return null;
    };

    /**
     * Creates a plain object from a ReportHeader message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ReportHeader
     * @static
     * @param {ReportHeader} message ReportHeader
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ReportHeader.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.hostname = "";
            object.agentVersion = "";
            object.serviceVersion = "";
            object.runtimeVersion = "";
            object.uname = "";
            object.executableSchemaId = "";
            object.graphRef = "";
        }
        if (message.hostname != null && message.hasOwnProperty("hostname"))
            object.hostname = message.hostname;
        if (message.agentVersion != null && message.hasOwnProperty("agentVersion"))
            object.agentVersion = message.agentVersion;
        if (message.serviceVersion != null && message.hasOwnProperty("serviceVersion"))
            object.serviceVersion = message.serviceVersion;
        if (message.runtimeVersion != null && message.hasOwnProperty("runtimeVersion"))
            object.runtimeVersion = message.runtimeVersion;
        if (message.uname != null && message.hasOwnProperty("uname"))
            object.uname = message.uname;
        if (message.executableSchemaId != null && message.hasOwnProperty("executableSchemaId"))
            object.executableSchemaId = message.executableSchemaId;
        if (message.graphRef != null && message.hasOwnProperty("graphRef"))
            object.graphRef = message.graphRef;
        return object;
    };

    /**
     * Converts this ReportHeader to JSON.
     * @function toJSON
     * @memberof ReportHeader
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ReportHeader.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ReportHeader;
})();

$root.PathErrorStats = (function() {

    /**
     * Properties of a PathErrorStats.
     * @exports IPathErrorStats
     * @interface IPathErrorStats
     * @property {Object.<string,IPathErrorStats>|null} [children] PathErrorStats children
     * @property {number|null} [errorsCount] PathErrorStats errorsCount
     * @property {number|null} [requestsWithErrorsCount] PathErrorStats requestsWithErrorsCount
     */

    /**
     * Constructs a new PathErrorStats.
     * @exports PathErrorStats
     * @classdesc Represents a PathErrorStats.
     * @implements IPathErrorStats
     * @constructor
     * @param {IPathErrorStats=} [properties] Properties to set
     */
    function PathErrorStats(properties) {
        this.children = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PathErrorStats children.
     * @member {Object.<string,IPathErrorStats>} children
     * @memberof PathErrorStats
     * @instance
     */
    PathErrorStats.prototype.children = $util.emptyObject;

    /**
     * PathErrorStats errorsCount.
     * @member {number} errorsCount
     * @memberof PathErrorStats
     * @instance
     */
    PathErrorStats.prototype.errorsCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * PathErrorStats requestsWithErrorsCount.
     * @member {number} requestsWithErrorsCount
     * @memberof PathErrorStats
     * @instance
     */
    PathErrorStats.prototype.requestsWithErrorsCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Creates a new PathErrorStats instance using the specified properties.
     * @function create
     * @memberof PathErrorStats
     * @static
     * @param {IPathErrorStats=} [properties] Properties to set
     * @returns {PathErrorStats} PathErrorStats instance
     */
    PathErrorStats.create = function create(properties) {
        return new PathErrorStats(properties);
    };

    /**
     * Encodes the specified PathErrorStats message. Does not implicitly {@link PathErrorStats.verify|verify} messages.
     * @function encode
     * @memberof PathErrorStats
     * @static
     * @param {IPathErrorStats} message PathErrorStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PathErrorStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.children != null && Object.hasOwnProperty.call(message, "children"))
            for (var keys = Object.keys(message.children), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.PathErrorStats.encode(message.children[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        if (message.errorsCount != null && Object.hasOwnProperty.call(message, "errorsCount"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.errorsCount);
        if (message.requestsWithErrorsCount != null && Object.hasOwnProperty.call(message, "requestsWithErrorsCount"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.requestsWithErrorsCount);
        return writer;
    };

    /**
     * Encodes the specified PathErrorStats message, length delimited. Does not implicitly {@link PathErrorStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PathErrorStats
     * @static
     * @param {IPathErrorStats} message PathErrorStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PathErrorStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PathErrorStats message from the specified reader or buffer.
     * @function decode
     * @memberof PathErrorStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PathErrorStats} PathErrorStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PathErrorStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PathErrorStats(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                reader.skip().pos++;
                if (message.children === $util.emptyObject)
                    message.children = {};
                key = reader.string();
                reader.pos++;
                message.children[key] = $root.PathErrorStats.decode(reader, reader.uint32());
                break;
            case 4:
                message.errorsCount = reader.uint64();
                break;
            case 5:
                message.requestsWithErrorsCount = reader.uint64();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PathErrorStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PathErrorStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PathErrorStats} PathErrorStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PathErrorStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PathErrorStats message.
     * @function verify
     * @memberof PathErrorStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PathErrorStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.children != null && message.hasOwnProperty("children")) {
            if (!$util.isObject(message.children))
                return "children: object expected";
            var key = Object.keys(message.children);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.PathErrorStats.verify(message.children[key[i]]);
                if (error)
                    return "children." + error;
            }
        }
        if (message.errorsCount != null && message.hasOwnProperty("errorsCount"))
            if (!$util.isInteger(message.errorsCount) && !(message.errorsCount && $util.isInteger(message.errorsCount.low) && $util.isInteger(message.errorsCount.high)))
                return "errorsCount: integer|Long expected";
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (!$util.isInteger(message.requestsWithErrorsCount) && !(message.requestsWithErrorsCount && $util.isInteger(message.requestsWithErrorsCount.low) && $util.isInteger(message.requestsWithErrorsCount.high)))
                return "requestsWithErrorsCount: integer|Long expected";
        return null;
    };

    /**
     * Creates a plain object from a PathErrorStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PathErrorStats
     * @static
     * @param {PathErrorStats} message PathErrorStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PathErrorStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.children = {};
        if (options.defaults) {
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.errorsCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.errorsCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.requestsWithErrorsCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.requestsWithErrorsCount = options.longs === String ? "0" : 0;
        }
        var keys2;
        if (message.children && (keys2 = Object.keys(message.children)).length) {
            object.children = {};
            for (var j = 0; j < keys2.length; ++j)
                object.children[keys2[j]] = $root.PathErrorStats.toObject(message.children[keys2[j]], options);
        }
        if (message.errorsCount != null && message.hasOwnProperty("errorsCount"))
            if (typeof message.errorsCount === "number")
                object.errorsCount = options.longs === String ? String(message.errorsCount) : message.errorsCount;
            else
                object.errorsCount = options.longs === String ? $util.Long.prototype.toString.call(message.errorsCount) : options.longs === Number ? new $util.LongBits(message.errorsCount.low >>> 0, message.errorsCount.high >>> 0).toNumber(true) : message.errorsCount;
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (typeof message.requestsWithErrorsCount === "number")
                object.requestsWithErrorsCount = options.longs === String ? String(message.requestsWithErrorsCount) : message.requestsWithErrorsCount;
            else
                object.requestsWithErrorsCount = options.longs === String ? $util.Long.prototype.toString.call(message.requestsWithErrorsCount) : options.longs === Number ? new $util.LongBits(message.requestsWithErrorsCount.low >>> 0, message.requestsWithErrorsCount.high >>> 0).toNumber(true) : message.requestsWithErrorsCount;
        return object;
    };

    /**
     * Converts this PathErrorStats to JSON.
     * @function toJSON
     * @memberof PathErrorStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PathErrorStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return PathErrorStats;
})();

$root.QueryLatencyStats = (function() {

    /**
     * Properties of a QueryLatencyStats.
     * @exports IQueryLatencyStats
     * @interface IQueryLatencyStats
     * @property {$protobuf.ToArray.<number>|Array.<number>|null} [latencyCount] QueryLatencyStats latencyCount
     * @property {number|null} [requestCount] QueryLatencyStats requestCount
     * @property {number|null} [cacheHits] QueryLatencyStats cacheHits
     * @property {number|null} [persistedQueryHits] QueryLatencyStats persistedQueryHits
     * @property {number|null} [persistedQueryMisses] QueryLatencyStats persistedQueryMisses
     * @property {$protobuf.ToArray.<number>|Array.<number>|null} [cacheLatencyCount] QueryLatencyStats cacheLatencyCount
     * @property {IPathErrorStats|null} [rootErrorStats] QueryLatencyStats rootErrorStats
     * @property {number|null} [requestsWithErrorsCount] QueryLatencyStats requestsWithErrorsCount
     * @property {$protobuf.ToArray.<number>|Array.<number>|null} [publicCacheTtlCount] QueryLatencyStats publicCacheTtlCount
     * @property {$protobuf.ToArray.<number>|Array.<number>|null} [privateCacheTtlCount] QueryLatencyStats privateCacheTtlCount
     * @property {number|null} [registeredOperationCount] QueryLatencyStats registeredOperationCount
     * @property {number|null} [forbiddenOperationCount] QueryLatencyStats forbiddenOperationCount
     * @property {number|null} [requestsWithoutFieldInstrumentation] QueryLatencyStats requestsWithoutFieldInstrumentation
     */

    /**
     * Constructs a new QueryLatencyStats.
     * @exports QueryLatencyStats
     * @classdesc Represents a QueryLatencyStats.
     * @implements IQueryLatencyStats
     * @constructor
     * @param {IQueryLatencyStats=} [properties] Properties to set
     */
    function QueryLatencyStats(properties) {
        this.latencyCount = [];
        this.cacheLatencyCount = [];
        this.publicCacheTtlCount = [];
        this.privateCacheTtlCount = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * QueryLatencyStats latencyCount.
     * @member {Array.<number>} latencyCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.latencyCount = $util.emptyArray;

    /**
     * QueryLatencyStats requestCount.
     * @member {number} requestCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.requestCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats cacheHits.
     * @member {number} cacheHits
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.cacheHits = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats persistedQueryHits.
     * @member {number} persistedQueryHits
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.persistedQueryHits = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats persistedQueryMisses.
     * @member {number} persistedQueryMisses
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.persistedQueryMisses = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats cacheLatencyCount.
     * @member {Array.<number>} cacheLatencyCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.cacheLatencyCount = $util.emptyArray;

    /**
     * QueryLatencyStats rootErrorStats.
     * @member {IPathErrorStats|null|undefined} rootErrorStats
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.rootErrorStats = null;

    /**
     * QueryLatencyStats requestsWithErrorsCount.
     * @member {number} requestsWithErrorsCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.requestsWithErrorsCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats publicCacheTtlCount.
     * @member {Array.<number>} publicCacheTtlCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.publicCacheTtlCount = $util.emptyArray;

    /**
     * QueryLatencyStats privateCacheTtlCount.
     * @member {Array.<number>} privateCacheTtlCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.privateCacheTtlCount = $util.emptyArray;

    /**
     * QueryLatencyStats registeredOperationCount.
     * @member {number} registeredOperationCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.registeredOperationCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats forbiddenOperationCount.
     * @member {number} forbiddenOperationCount
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.forbiddenOperationCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * QueryLatencyStats requestsWithoutFieldInstrumentation.
     * @member {number} requestsWithoutFieldInstrumentation
     * @memberof QueryLatencyStats
     * @instance
     */
    QueryLatencyStats.prototype.requestsWithoutFieldInstrumentation = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Creates a new QueryLatencyStats instance using the specified properties.
     * @function create
     * @memberof QueryLatencyStats
     * @static
     * @param {IQueryLatencyStats=} [properties] Properties to set
     * @returns {QueryLatencyStats} QueryLatencyStats instance
     */
    QueryLatencyStats.create = function create(properties) {
        return new QueryLatencyStats(properties);
    };

    /**
     * Encodes the specified QueryLatencyStats message. Does not implicitly {@link QueryLatencyStats.verify|verify} messages.
     * @function encode
     * @memberof QueryLatencyStats
     * @static
     * @param {IQueryLatencyStats} message QueryLatencyStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    QueryLatencyStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.requestCount != null && Object.hasOwnProperty.call(message, "requestCount"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.requestCount);
        if (message.cacheHits != null && Object.hasOwnProperty.call(message, "cacheHits"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.cacheHits);
        if (message.persistedQueryHits != null && Object.hasOwnProperty.call(message, "persistedQueryHits"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.persistedQueryHits);
        if (message.persistedQueryMisses != null && Object.hasOwnProperty.call(message, "persistedQueryMisses"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.persistedQueryMisses);
        if (message.rootErrorStats != null && Object.hasOwnProperty.call(message, "rootErrorStats"))
            $root.PathErrorStats.encode(message.rootErrorStats, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.requestsWithErrorsCount != null && Object.hasOwnProperty.call(message, "requestsWithErrorsCount"))
            writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.requestsWithErrorsCount);
        if (message.registeredOperationCount != null && Object.hasOwnProperty.call(message, "registeredOperationCount"))
            writer.uint32(/* id 11, wireType 0 =*/88).uint64(message.registeredOperationCount);
        if (message.forbiddenOperationCount != null && Object.hasOwnProperty.call(message, "forbiddenOperationCount"))
            writer.uint32(/* id 12, wireType 0 =*/96).uint64(message.forbiddenOperationCount);
        var array13;
        if (message.latencyCount != null && message.latencyCount.toArray)
            array13 = message.latencyCount.toArray();
        else
            array13 = message.latencyCount;
        if (array13 != null && array13.length) {
            writer.uint32(/* id 13, wireType 2 =*/106).fork();
            for (var i = 0; i < array13.length; ++i)
                writer.sint64(array13[i]);
            writer.ldelim();
        }
        var array14;
        if (message.cacheLatencyCount != null && message.cacheLatencyCount.toArray)
            array14 = message.cacheLatencyCount.toArray();
        else
            array14 = message.cacheLatencyCount;
        if (array14 != null && array14.length) {
            writer.uint32(/* id 14, wireType 2 =*/114).fork();
            for (var i = 0; i < array14.length; ++i)
                writer.sint64(array14[i]);
            writer.ldelim();
        }
        var array15;
        if (message.publicCacheTtlCount != null && message.publicCacheTtlCount.toArray)
            array15 = message.publicCacheTtlCount.toArray();
        else
            array15 = message.publicCacheTtlCount;
        if (array15 != null && array15.length) {
            writer.uint32(/* id 15, wireType 2 =*/122).fork();
            for (var i = 0; i < array15.length; ++i)
                writer.sint64(array15[i]);
            writer.ldelim();
        }
        var array16;
        if (message.privateCacheTtlCount != null && message.privateCacheTtlCount.toArray)
            array16 = message.privateCacheTtlCount.toArray();
        else
            array16 = message.privateCacheTtlCount;
        if (array16 != null && array16.length) {
            writer.uint32(/* id 16, wireType 2 =*/130).fork();
            for (var i = 0; i < array16.length; ++i)
                writer.sint64(array16[i]);
            writer.ldelim();
        }
        if (message.requestsWithoutFieldInstrumentation != null && Object.hasOwnProperty.call(message, "requestsWithoutFieldInstrumentation"))
            writer.uint32(/* id 17, wireType 0 =*/136).uint64(message.requestsWithoutFieldInstrumentation);
        return writer;
    };

    /**
     * Encodes the specified QueryLatencyStats message, length delimited. Does not implicitly {@link QueryLatencyStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof QueryLatencyStats
     * @static
     * @param {IQueryLatencyStats} message QueryLatencyStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    QueryLatencyStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a QueryLatencyStats message from the specified reader or buffer.
     * @function decode
     * @memberof QueryLatencyStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {QueryLatencyStats} QueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    QueryLatencyStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.QueryLatencyStats();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 13:
                if (!(message.latencyCount && message.latencyCount.length))
                    message.latencyCount = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.latencyCount.push(reader.sint64());
                } else
                    message.latencyCount.push(reader.sint64());
                break;
            case 2:
                message.requestCount = reader.uint64();
                break;
            case 3:
                message.cacheHits = reader.uint64();
                break;
            case 4:
                message.persistedQueryHits = reader.uint64();
                break;
            case 5:
                message.persistedQueryMisses = reader.uint64();
                break;
            case 14:
                if (!(message.cacheLatencyCount && message.cacheLatencyCount.length))
                    message.cacheLatencyCount = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.cacheLatencyCount.push(reader.sint64());
                } else
                    message.cacheLatencyCount.push(reader.sint64());
                break;
            case 7:
                message.rootErrorStats = $root.PathErrorStats.decode(reader, reader.uint32());
                break;
            case 8:
                message.requestsWithErrorsCount = reader.uint64();
                break;
            case 15:
                if (!(message.publicCacheTtlCount && message.publicCacheTtlCount.length))
                    message.publicCacheTtlCount = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.publicCacheTtlCount.push(reader.sint64());
                } else
                    message.publicCacheTtlCount.push(reader.sint64());
                break;
            case 16:
                if (!(message.privateCacheTtlCount && message.privateCacheTtlCount.length))
                    message.privateCacheTtlCount = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.privateCacheTtlCount.push(reader.sint64());
                } else
                    message.privateCacheTtlCount.push(reader.sint64());
                break;
            case 11:
                message.registeredOperationCount = reader.uint64();
                break;
            case 12:
                message.forbiddenOperationCount = reader.uint64();
                break;
            case 17:
                message.requestsWithoutFieldInstrumentation = reader.uint64();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a QueryLatencyStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof QueryLatencyStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {QueryLatencyStats} QueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    QueryLatencyStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a QueryLatencyStats message.
     * @function verify
     * @memberof QueryLatencyStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    QueryLatencyStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.latencyCount != null && message.hasOwnProperty("latencyCount")) {
            var array13;
            if (message.latencyCount != null && message.latencyCount.toArray)
                array13 = message.latencyCount.toArray();
            else
                array13 = message.latencyCount;
            if (!Array.isArray(array13))
                return "latencyCount: array expected";
            for (var i = 0; i < array13.length; ++i)
                if (!$util.isInteger(array13[i]) && !(array13[i] && $util.isInteger(array13[i].low) && $util.isInteger(array13[i].high)))
                    return "latencyCount: integer|Long[] expected";
        }
        if (message.requestCount != null && message.hasOwnProperty("requestCount"))
            if (!$util.isInteger(message.requestCount) && !(message.requestCount && $util.isInteger(message.requestCount.low) && $util.isInteger(message.requestCount.high)))
                return "requestCount: integer|Long expected";
        if (message.cacheHits != null && message.hasOwnProperty("cacheHits"))
            if (!$util.isInteger(message.cacheHits) && !(message.cacheHits && $util.isInteger(message.cacheHits.low) && $util.isInteger(message.cacheHits.high)))
                return "cacheHits: integer|Long expected";
        if (message.persistedQueryHits != null && message.hasOwnProperty("persistedQueryHits"))
            if (!$util.isInteger(message.persistedQueryHits) && !(message.persistedQueryHits && $util.isInteger(message.persistedQueryHits.low) && $util.isInteger(message.persistedQueryHits.high)))
                return "persistedQueryHits: integer|Long expected";
        if (message.persistedQueryMisses != null && message.hasOwnProperty("persistedQueryMisses"))
            if (!$util.isInteger(message.persistedQueryMisses) && !(message.persistedQueryMisses && $util.isInteger(message.persistedQueryMisses.low) && $util.isInteger(message.persistedQueryMisses.high)))
                return "persistedQueryMisses: integer|Long expected";
        if (message.cacheLatencyCount != null && message.hasOwnProperty("cacheLatencyCount")) {
            var array14;
            if (message.cacheLatencyCount != null && message.cacheLatencyCount.toArray)
                array14 = message.cacheLatencyCount.toArray();
            else
                array14 = message.cacheLatencyCount;
            if (!Array.isArray(array14))
                return "cacheLatencyCount: array expected";
            for (var i = 0; i < array14.length; ++i)
                if (!$util.isInteger(array14[i]) && !(array14[i] && $util.isInteger(array14[i].low) && $util.isInteger(array14[i].high)))
                    return "cacheLatencyCount: integer|Long[] expected";
        }
        if (message.rootErrorStats != null && message.hasOwnProperty("rootErrorStats")) {
            var error = $root.PathErrorStats.verify(message.rootErrorStats);
            if (error)
                return "rootErrorStats." + error;
        }
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (!$util.isInteger(message.requestsWithErrorsCount) && !(message.requestsWithErrorsCount && $util.isInteger(message.requestsWithErrorsCount.low) && $util.isInteger(message.requestsWithErrorsCount.high)))
                return "requestsWithErrorsCount: integer|Long expected";
        if (message.publicCacheTtlCount != null && message.hasOwnProperty("publicCacheTtlCount")) {
            var array15;
            if (message.publicCacheTtlCount != null && message.publicCacheTtlCount.toArray)
                array15 = message.publicCacheTtlCount.toArray();
            else
                array15 = message.publicCacheTtlCount;
            if (!Array.isArray(array15))
                return "publicCacheTtlCount: array expected";
            for (var i = 0; i < array15.length; ++i)
                if (!$util.isInteger(array15[i]) && !(array15[i] && $util.isInteger(array15[i].low) && $util.isInteger(array15[i].high)))
                    return "publicCacheTtlCount: integer|Long[] expected";
        }
        if (message.privateCacheTtlCount != null && message.hasOwnProperty("privateCacheTtlCount")) {
            var array16;
            if (message.privateCacheTtlCount != null && message.privateCacheTtlCount.toArray)
                array16 = message.privateCacheTtlCount.toArray();
            else
                array16 = message.privateCacheTtlCount;
            if (!Array.isArray(array16))
                return "privateCacheTtlCount: array expected";
            for (var i = 0; i < array16.length; ++i)
                if (!$util.isInteger(array16[i]) && !(array16[i] && $util.isInteger(array16[i].low) && $util.isInteger(array16[i].high)))
                    return "privateCacheTtlCount: integer|Long[] expected";
        }
        if (message.registeredOperationCount != null && message.hasOwnProperty("registeredOperationCount"))
            if (!$util.isInteger(message.registeredOperationCount) && !(message.registeredOperationCount && $util.isInteger(message.registeredOperationCount.low) && $util.isInteger(message.registeredOperationCount.high)))
                return "registeredOperationCount: integer|Long expected";
        if (message.forbiddenOperationCount != null && message.hasOwnProperty("forbiddenOperationCount"))
            if (!$util.isInteger(message.forbiddenOperationCount) && !(message.forbiddenOperationCount && $util.isInteger(message.forbiddenOperationCount.low) && $util.isInteger(message.forbiddenOperationCount.high)))
                return "forbiddenOperationCount: integer|Long expected";
        if (message.requestsWithoutFieldInstrumentation != null && message.hasOwnProperty("requestsWithoutFieldInstrumentation"))
            if (!$util.isInteger(message.requestsWithoutFieldInstrumentation) && !(message.requestsWithoutFieldInstrumentation && $util.isInteger(message.requestsWithoutFieldInstrumentation.low) && $util.isInteger(message.requestsWithoutFieldInstrumentation.high)))
                return "requestsWithoutFieldInstrumentation: integer|Long expected";
        return null;
    };

    /**
     * Creates a plain object from a QueryLatencyStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof QueryLatencyStats
     * @static
     * @param {QueryLatencyStats} message QueryLatencyStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    QueryLatencyStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.latencyCount = [];
            object.cacheLatencyCount = [];
            object.publicCacheTtlCount = [];
            object.privateCacheTtlCount = [];
        }
        if (options.defaults) {
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.requestCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.requestCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.cacheHits = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.cacheHits = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.persistedQueryHits = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.persistedQueryHits = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.persistedQueryMisses = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.persistedQueryMisses = options.longs === String ? "0" : 0;
            object.rootErrorStats = null;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.requestsWithErrorsCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.requestsWithErrorsCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.registeredOperationCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.registeredOperationCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.forbiddenOperationCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.forbiddenOperationCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.requestsWithoutFieldInstrumentation = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.requestsWithoutFieldInstrumentation = options.longs === String ? "0" : 0;
        }
        if (message.requestCount != null && message.hasOwnProperty("requestCount"))
            if (typeof message.requestCount === "number")
                object.requestCount = options.longs === String ? String(message.requestCount) : message.requestCount;
            else
                object.requestCount = options.longs === String ? $util.Long.prototype.toString.call(message.requestCount) : options.longs === Number ? new $util.LongBits(message.requestCount.low >>> 0, message.requestCount.high >>> 0).toNumber(true) : message.requestCount;
        if (message.cacheHits != null && message.hasOwnProperty("cacheHits"))
            if (typeof message.cacheHits === "number")
                object.cacheHits = options.longs === String ? String(message.cacheHits) : message.cacheHits;
            else
                object.cacheHits = options.longs === String ? $util.Long.prototype.toString.call(message.cacheHits) : options.longs === Number ? new $util.LongBits(message.cacheHits.low >>> 0, message.cacheHits.high >>> 0).toNumber(true) : message.cacheHits;
        if (message.persistedQueryHits != null && message.hasOwnProperty("persistedQueryHits"))
            if (typeof message.persistedQueryHits === "number")
                object.persistedQueryHits = options.longs === String ? String(message.persistedQueryHits) : message.persistedQueryHits;
            else
                object.persistedQueryHits = options.longs === String ? $util.Long.prototype.toString.call(message.persistedQueryHits) : options.longs === Number ? new $util.LongBits(message.persistedQueryHits.low >>> 0, message.persistedQueryHits.high >>> 0).toNumber(true) : message.persistedQueryHits;
        if (message.persistedQueryMisses != null && message.hasOwnProperty("persistedQueryMisses"))
            if (typeof message.persistedQueryMisses === "number")
                object.persistedQueryMisses = options.longs === String ? String(message.persistedQueryMisses) : message.persistedQueryMisses;
            else
                object.persistedQueryMisses = options.longs === String ? $util.Long.prototype.toString.call(message.persistedQueryMisses) : options.longs === Number ? new $util.LongBits(message.persistedQueryMisses.low >>> 0, message.persistedQueryMisses.high >>> 0).toNumber(true) : message.persistedQueryMisses;
        if (message.rootErrorStats != null && message.hasOwnProperty("rootErrorStats"))
            object.rootErrorStats = $root.PathErrorStats.toObject(message.rootErrorStats, options);
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (typeof message.requestsWithErrorsCount === "number")
                object.requestsWithErrorsCount = options.longs === String ? String(message.requestsWithErrorsCount) : message.requestsWithErrorsCount;
            else
                object.requestsWithErrorsCount = options.longs === String ? $util.Long.prototype.toString.call(message.requestsWithErrorsCount) : options.longs === Number ? new $util.LongBits(message.requestsWithErrorsCount.low >>> 0, message.requestsWithErrorsCount.high >>> 0).toNumber(true) : message.requestsWithErrorsCount;
        if (message.registeredOperationCount != null && message.hasOwnProperty("registeredOperationCount"))
            if (typeof message.registeredOperationCount === "number")
                object.registeredOperationCount = options.longs === String ? String(message.registeredOperationCount) : message.registeredOperationCount;
            else
                object.registeredOperationCount = options.longs === String ? $util.Long.prototype.toString.call(message.registeredOperationCount) : options.longs === Number ? new $util.LongBits(message.registeredOperationCount.low >>> 0, message.registeredOperationCount.high >>> 0).toNumber(true) : message.registeredOperationCount;
        if (message.forbiddenOperationCount != null && message.hasOwnProperty("forbiddenOperationCount"))
            if (typeof message.forbiddenOperationCount === "number")
                object.forbiddenOperationCount = options.longs === String ? String(message.forbiddenOperationCount) : message.forbiddenOperationCount;
            else
                object.forbiddenOperationCount = options.longs === String ? $util.Long.prototype.toString.call(message.forbiddenOperationCount) : options.longs === Number ? new $util.LongBits(message.forbiddenOperationCount.low >>> 0, message.forbiddenOperationCount.high >>> 0).toNumber(true) : message.forbiddenOperationCount;
        if (message.latencyCount && message.latencyCount.length) {
            object.latencyCount = [];
            for (var j = 0; j < message.latencyCount.length; ++j)
                if (typeof message.latencyCount[j] === "number")
                    object.latencyCount[j] = options.longs === String ? String(message.latencyCount[j]) : message.latencyCount[j];
                else
                    object.latencyCount[j] = options.longs === String ? $util.Long.prototype.toString.call(message.latencyCount[j]) : options.longs === Number ? new $util.LongBits(message.latencyCount[j].low >>> 0, message.latencyCount[j].high >>> 0).toNumber() : message.latencyCount[j];
        }
        if (message.cacheLatencyCount && message.cacheLatencyCount.length) {
            object.cacheLatencyCount = [];
            for (var j = 0; j < message.cacheLatencyCount.length; ++j)
                if (typeof message.cacheLatencyCount[j] === "number")
                    object.cacheLatencyCount[j] = options.longs === String ? String(message.cacheLatencyCount[j]) : message.cacheLatencyCount[j];
                else
                    object.cacheLatencyCount[j] = options.longs === String ? $util.Long.prototype.toString.call(message.cacheLatencyCount[j]) : options.longs === Number ? new $util.LongBits(message.cacheLatencyCount[j].low >>> 0, message.cacheLatencyCount[j].high >>> 0).toNumber() : message.cacheLatencyCount[j];
        }
        if (message.publicCacheTtlCount && message.publicCacheTtlCount.length) {
            object.publicCacheTtlCount = [];
            for (var j = 0; j < message.publicCacheTtlCount.length; ++j)
                if (typeof message.publicCacheTtlCount[j] === "number")
                    object.publicCacheTtlCount[j] = options.longs === String ? String(message.publicCacheTtlCount[j]) : message.publicCacheTtlCount[j];
                else
                    object.publicCacheTtlCount[j] = options.longs === String ? $util.Long.prototype.toString.call(message.publicCacheTtlCount[j]) : options.longs === Number ? new $util.LongBits(message.publicCacheTtlCount[j].low >>> 0, message.publicCacheTtlCount[j].high >>> 0).toNumber() : message.publicCacheTtlCount[j];
        }
        if (message.privateCacheTtlCount && message.privateCacheTtlCount.length) {
            object.privateCacheTtlCount = [];
            for (var j = 0; j < message.privateCacheTtlCount.length; ++j)
                if (typeof message.privateCacheTtlCount[j] === "number")
                    object.privateCacheTtlCount[j] = options.longs === String ? String(message.privateCacheTtlCount[j]) : message.privateCacheTtlCount[j];
                else
                    object.privateCacheTtlCount[j] = options.longs === String ? $util.Long.prototype.toString.call(message.privateCacheTtlCount[j]) : options.longs === Number ? new $util.LongBits(message.privateCacheTtlCount[j].low >>> 0, message.privateCacheTtlCount[j].high >>> 0).toNumber() : message.privateCacheTtlCount[j];
        }
        if (message.requestsWithoutFieldInstrumentation != null && message.hasOwnProperty("requestsWithoutFieldInstrumentation"))
            if (typeof message.requestsWithoutFieldInstrumentation === "number")
                object.requestsWithoutFieldInstrumentation = options.longs === String ? String(message.requestsWithoutFieldInstrumentation) : message.requestsWithoutFieldInstrumentation;
            else
                object.requestsWithoutFieldInstrumentation = options.longs === String ? $util.Long.prototype.toString.call(message.requestsWithoutFieldInstrumentation) : options.longs === Number ? new $util.LongBits(message.requestsWithoutFieldInstrumentation.low >>> 0, message.requestsWithoutFieldInstrumentation.high >>> 0).toNumber(true) : message.requestsWithoutFieldInstrumentation;
        return object;
    };

    /**
     * Converts this QueryLatencyStats to JSON.
     * @function toJSON
     * @memberof QueryLatencyStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    QueryLatencyStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return QueryLatencyStats;
})();

$root.StatsContext = (function() {

    /**
     * Properties of a StatsContext.
     * @exports IStatsContext
     * @interface IStatsContext
     * @property {string|null} [clientName] StatsContext clientName
     * @property {string|null} [clientVersion] StatsContext clientVersion
     */

    /**
     * Constructs a new StatsContext.
     * @exports StatsContext
     * @classdesc Represents a StatsContext.
     * @implements IStatsContext
     * @constructor
     * @param {IStatsContext=} [properties] Properties to set
     */
    function StatsContext(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * StatsContext clientName.
     * @member {string} clientName
     * @memberof StatsContext
     * @instance
     */
    StatsContext.prototype.clientName = "";

    /**
     * StatsContext clientVersion.
     * @member {string} clientVersion
     * @memberof StatsContext
     * @instance
     */
    StatsContext.prototype.clientVersion = "";

    /**
     * Creates a new StatsContext instance using the specified properties.
     * @function create
     * @memberof StatsContext
     * @static
     * @param {IStatsContext=} [properties] Properties to set
     * @returns {StatsContext} StatsContext instance
     */
    StatsContext.create = function create(properties) {
        return new StatsContext(properties);
    };

    /**
     * Encodes the specified StatsContext message. Does not implicitly {@link StatsContext.verify|verify} messages.
     * @function encode
     * @memberof StatsContext
     * @static
     * @param {IStatsContext} message StatsContext message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StatsContext.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clientName != null && Object.hasOwnProperty.call(message, "clientName"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.clientName);
        if (message.clientVersion != null && Object.hasOwnProperty.call(message, "clientVersion"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.clientVersion);
        return writer;
    };

    /**
     * Encodes the specified StatsContext message, length delimited. Does not implicitly {@link StatsContext.verify|verify} messages.
     * @function encodeDelimited
     * @memberof StatsContext
     * @static
     * @param {IStatsContext} message StatsContext message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StatsContext.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a StatsContext message from the specified reader or buffer.
     * @function decode
     * @memberof StatsContext
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {StatsContext} StatsContext
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StatsContext.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.StatsContext();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 2:
                message.clientName = reader.string();
                break;
            case 3:
                message.clientVersion = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a StatsContext message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof StatsContext
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {StatsContext} StatsContext
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StatsContext.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a StatsContext message.
     * @function verify
     * @memberof StatsContext
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    StatsContext.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clientName != null && message.hasOwnProperty("clientName"))
            if (!$util.isString(message.clientName))
                return "clientName: string expected";
        if (message.clientVersion != null && message.hasOwnProperty("clientVersion"))
            if (!$util.isString(message.clientVersion))
                return "clientVersion: string expected";
        return null;
    };

    /**
     * Creates a plain object from a StatsContext message. Also converts values to other types if specified.
     * @function toObject
     * @memberof StatsContext
     * @static
     * @param {StatsContext} message StatsContext
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    StatsContext.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.clientName = "";
            object.clientVersion = "";
        }
        if (message.clientName != null && message.hasOwnProperty("clientName"))
            object.clientName = message.clientName;
        if (message.clientVersion != null && message.hasOwnProperty("clientVersion"))
            object.clientVersion = message.clientVersion;
        return object;
    };

    /**
     * Converts this StatsContext to JSON.
     * @function toJSON
     * @memberof StatsContext
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    StatsContext.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return StatsContext;
})();

$root.ContextualizedQueryLatencyStats = (function() {

    /**
     * Properties of a ContextualizedQueryLatencyStats.
     * @exports IContextualizedQueryLatencyStats
     * @interface IContextualizedQueryLatencyStats
     * @property {IQueryLatencyStats|null} [queryLatencyStats] ContextualizedQueryLatencyStats queryLatencyStats
     * @property {IStatsContext|null} [context] ContextualizedQueryLatencyStats context
     */

    /**
     * Constructs a new ContextualizedQueryLatencyStats.
     * @exports ContextualizedQueryLatencyStats
     * @classdesc Represents a ContextualizedQueryLatencyStats.
     * @implements IContextualizedQueryLatencyStats
     * @constructor
     * @param {IContextualizedQueryLatencyStats=} [properties] Properties to set
     */
    function ContextualizedQueryLatencyStats(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ContextualizedQueryLatencyStats queryLatencyStats.
     * @member {IQueryLatencyStats|null|undefined} queryLatencyStats
     * @memberof ContextualizedQueryLatencyStats
     * @instance
     */
    ContextualizedQueryLatencyStats.prototype.queryLatencyStats = null;

    /**
     * ContextualizedQueryLatencyStats context.
     * @member {IStatsContext|null|undefined} context
     * @memberof ContextualizedQueryLatencyStats
     * @instance
     */
    ContextualizedQueryLatencyStats.prototype.context = null;

    /**
     * Creates a new ContextualizedQueryLatencyStats instance using the specified properties.
     * @function create
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {IContextualizedQueryLatencyStats=} [properties] Properties to set
     * @returns {ContextualizedQueryLatencyStats} ContextualizedQueryLatencyStats instance
     */
    ContextualizedQueryLatencyStats.create = function create(properties) {
        return new ContextualizedQueryLatencyStats(properties);
    };

    /**
     * Encodes the specified ContextualizedQueryLatencyStats message. Does not implicitly {@link ContextualizedQueryLatencyStats.verify|verify} messages.
     * @function encode
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {IContextualizedQueryLatencyStats} message ContextualizedQueryLatencyStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedQueryLatencyStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.queryLatencyStats != null && Object.hasOwnProperty.call(message, "queryLatencyStats"))
            $root.QueryLatencyStats.encode(message.queryLatencyStats, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.context != null && Object.hasOwnProperty.call(message, "context"))
            $root.StatsContext.encode(message.context, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ContextualizedQueryLatencyStats message, length delimited. Does not implicitly {@link ContextualizedQueryLatencyStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {IContextualizedQueryLatencyStats} message ContextualizedQueryLatencyStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedQueryLatencyStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ContextualizedQueryLatencyStats message from the specified reader or buffer.
     * @function decode
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ContextualizedQueryLatencyStats} ContextualizedQueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedQueryLatencyStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ContextualizedQueryLatencyStats();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.queryLatencyStats = $root.QueryLatencyStats.decode(reader, reader.uint32());
                break;
            case 2:
                message.context = $root.StatsContext.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ContextualizedQueryLatencyStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ContextualizedQueryLatencyStats} ContextualizedQueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedQueryLatencyStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ContextualizedQueryLatencyStats message.
     * @function verify
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ContextualizedQueryLatencyStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.queryLatencyStats != null && message.hasOwnProperty("queryLatencyStats")) {
            var error = $root.QueryLatencyStats.verify(message.queryLatencyStats);
            if (error)
                return "queryLatencyStats." + error;
        }
        if (message.context != null && message.hasOwnProperty("context")) {
            var error = $root.StatsContext.verify(message.context);
            if (error)
                return "context." + error;
        }
        return null;
    };

    /**
     * Creates a plain object from a ContextualizedQueryLatencyStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ContextualizedQueryLatencyStats
     * @static
     * @param {ContextualizedQueryLatencyStats} message ContextualizedQueryLatencyStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ContextualizedQueryLatencyStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.queryLatencyStats = null;
            object.context = null;
        }
        if (message.queryLatencyStats != null && message.hasOwnProperty("queryLatencyStats"))
            object.queryLatencyStats = $root.QueryLatencyStats.toObject(message.queryLatencyStats, options);
        if (message.context != null && message.hasOwnProperty("context"))
            object.context = $root.StatsContext.toObject(message.context, options);
        return object;
    };

    /**
     * Converts this ContextualizedQueryLatencyStats to JSON.
     * @function toJSON
     * @memberof ContextualizedQueryLatencyStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ContextualizedQueryLatencyStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ContextualizedQueryLatencyStats;
})();

$root.ContextualizedTypeStats = (function() {

    /**
     * Properties of a ContextualizedTypeStats.
     * @exports IContextualizedTypeStats
     * @interface IContextualizedTypeStats
     * @property {IStatsContext|null} [context] ContextualizedTypeStats context
     * @property {Object.<string,ITypeStat>|null} [perTypeStat] ContextualizedTypeStats perTypeStat
     */

    /**
     * Constructs a new ContextualizedTypeStats.
     * @exports ContextualizedTypeStats
     * @classdesc Represents a ContextualizedTypeStats.
     * @implements IContextualizedTypeStats
     * @constructor
     * @param {IContextualizedTypeStats=} [properties] Properties to set
     */
    function ContextualizedTypeStats(properties) {
        this.perTypeStat = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ContextualizedTypeStats context.
     * @member {IStatsContext|null|undefined} context
     * @memberof ContextualizedTypeStats
     * @instance
     */
    ContextualizedTypeStats.prototype.context = null;

    /**
     * ContextualizedTypeStats perTypeStat.
     * @member {Object.<string,ITypeStat>} perTypeStat
     * @memberof ContextualizedTypeStats
     * @instance
     */
    ContextualizedTypeStats.prototype.perTypeStat = $util.emptyObject;

    /**
     * Creates a new ContextualizedTypeStats instance using the specified properties.
     * @function create
     * @memberof ContextualizedTypeStats
     * @static
     * @param {IContextualizedTypeStats=} [properties] Properties to set
     * @returns {ContextualizedTypeStats} ContextualizedTypeStats instance
     */
    ContextualizedTypeStats.create = function create(properties) {
        return new ContextualizedTypeStats(properties);
    };

    /**
     * Encodes the specified ContextualizedTypeStats message. Does not implicitly {@link ContextualizedTypeStats.verify|verify} messages.
     * @function encode
     * @memberof ContextualizedTypeStats
     * @static
     * @param {IContextualizedTypeStats} message ContextualizedTypeStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedTypeStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.context != null && Object.hasOwnProperty.call(message, "context"))
            $root.StatsContext.encode(message.context, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.perTypeStat != null && Object.hasOwnProperty.call(message, "perTypeStat"))
            for (var keys = Object.keys(message.perTypeStat), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.TypeStat.encode(message.perTypeStat[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified ContextualizedTypeStats message, length delimited. Does not implicitly {@link ContextualizedTypeStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ContextualizedTypeStats
     * @static
     * @param {IContextualizedTypeStats} message ContextualizedTypeStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedTypeStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ContextualizedTypeStats message from the specified reader or buffer.
     * @function decode
     * @memberof ContextualizedTypeStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ContextualizedTypeStats} ContextualizedTypeStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedTypeStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ContextualizedTypeStats(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.context = $root.StatsContext.decode(reader, reader.uint32());
                break;
            case 2:
                reader.skip().pos++;
                if (message.perTypeStat === $util.emptyObject)
                    message.perTypeStat = {};
                key = reader.string();
                reader.pos++;
                message.perTypeStat[key] = $root.TypeStat.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ContextualizedTypeStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ContextualizedTypeStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ContextualizedTypeStats} ContextualizedTypeStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedTypeStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ContextualizedTypeStats message.
     * @function verify
     * @memberof ContextualizedTypeStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ContextualizedTypeStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.context != null && message.hasOwnProperty("context")) {
            var error = $root.StatsContext.verify(message.context);
            if (error)
                return "context." + error;
        }
        if (message.perTypeStat != null && message.hasOwnProperty("perTypeStat")) {
            if (!$util.isObject(message.perTypeStat))
                return "perTypeStat: object expected";
            var key = Object.keys(message.perTypeStat);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.TypeStat.verify(message.perTypeStat[key[i]]);
                if (error)
                    return "perTypeStat." + error;
            }
        }
        return null;
    };

    /**
     * Creates a plain object from a ContextualizedTypeStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ContextualizedTypeStats
     * @static
     * @param {ContextualizedTypeStats} message ContextualizedTypeStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ContextualizedTypeStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.perTypeStat = {};
        if (options.defaults)
            object.context = null;
        if (message.context != null && message.hasOwnProperty("context"))
            object.context = $root.StatsContext.toObject(message.context, options);
        var keys2;
        if (message.perTypeStat && (keys2 = Object.keys(message.perTypeStat)).length) {
            object.perTypeStat = {};
            for (var j = 0; j < keys2.length; ++j)
                object.perTypeStat[keys2[j]] = $root.TypeStat.toObject(message.perTypeStat[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this ContextualizedTypeStats to JSON.
     * @function toJSON
     * @memberof ContextualizedTypeStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ContextualizedTypeStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ContextualizedTypeStats;
})();

$root.FieldStat = (function() {

    /**
     * Properties of a FieldStat.
     * @exports IFieldStat
     * @interface IFieldStat
     * @property {string|null} [returnType] FieldStat returnType
     * @property {number|null} [errorsCount] FieldStat errorsCount
     * @property {number|null} [observedExecutionCount] FieldStat observedExecutionCount
     * @property {number|null} [estimatedExecutionCount] FieldStat estimatedExecutionCount
     * @property {number|null} [requestsWithErrorsCount] FieldStat requestsWithErrorsCount
     * @property {$protobuf.ToArray.<number>|Array.<number>|null} [latencyCount] FieldStat latencyCount
     */

    /**
     * Constructs a new FieldStat.
     * @exports FieldStat
     * @classdesc Represents a FieldStat.
     * @implements IFieldStat
     * @constructor
     * @param {IFieldStat=} [properties] Properties to set
     */
    function FieldStat(properties) {
        this.latencyCount = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * FieldStat returnType.
     * @member {string} returnType
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.returnType = "";

    /**
     * FieldStat errorsCount.
     * @member {number} errorsCount
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.errorsCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * FieldStat observedExecutionCount.
     * @member {number} observedExecutionCount
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.observedExecutionCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * FieldStat estimatedExecutionCount.
     * @member {number} estimatedExecutionCount
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.estimatedExecutionCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * FieldStat requestsWithErrorsCount.
     * @member {number} requestsWithErrorsCount
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.requestsWithErrorsCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * FieldStat latencyCount.
     * @member {Array.<number>} latencyCount
     * @memberof FieldStat
     * @instance
     */
    FieldStat.prototype.latencyCount = $util.emptyArray;

    /**
     * Creates a new FieldStat instance using the specified properties.
     * @function create
     * @memberof FieldStat
     * @static
     * @param {IFieldStat=} [properties] Properties to set
     * @returns {FieldStat} FieldStat instance
     */
    FieldStat.create = function create(properties) {
        return new FieldStat(properties);
    };

    /**
     * Encodes the specified FieldStat message. Does not implicitly {@link FieldStat.verify|verify} messages.
     * @function encode
     * @memberof FieldStat
     * @static
     * @param {IFieldStat} message FieldStat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FieldStat.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.returnType != null && Object.hasOwnProperty.call(message, "returnType"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.returnType);
        if (message.errorsCount != null && Object.hasOwnProperty.call(message, "errorsCount"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.errorsCount);
        if (message.observedExecutionCount != null && Object.hasOwnProperty.call(message, "observedExecutionCount"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.observedExecutionCount);
        if (message.requestsWithErrorsCount != null && Object.hasOwnProperty.call(message, "requestsWithErrorsCount"))
            writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.requestsWithErrorsCount);
        var array9;
        if (message.latencyCount != null && message.latencyCount.toArray)
            array9 = message.latencyCount.toArray();
        else
            array9 = message.latencyCount;
        if (array9 != null && array9.length) {
            writer.uint32(/* id 9, wireType 2 =*/74).fork();
            for (var i = 0; i < array9.length; ++i)
                writer.sint64(array9[i]);
            writer.ldelim();
        }
        if (message.estimatedExecutionCount != null && Object.hasOwnProperty.call(message, "estimatedExecutionCount"))
            writer.uint32(/* id 10, wireType 0 =*/80).uint64(message.estimatedExecutionCount);
        return writer;
    };

    /**
     * Encodes the specified FieldStat message, length delimited. Does not implicitly {@link FieldStat.verify|verify} messages.
     * @function encodeDelimited
     * @memberof FieldStat
     * @static
     * @param {IFieldStat} message FieldStat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FieldStat.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a FieldStat message from the specified reader or buffer.
     * @function decode
     * @memberof FieldStat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {FieldStat} FieldStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FieldStat.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.FieldStat();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 3:
                message.returnType = reader.string();
                break;
            case 4:
                message.errorsCount = reader.uint64();
                break;
            case 5:
                message.observedExecutionCount = reader.uint64();
                break;
            case 10:
                message.estimatedExecutionCount = reader.uint64();
                break;
            case 6:
                message.requestsWithErrorsCount = reader.uint64();
                break;
            case 9:
                if (!(message.latencyCount && message.latencyCount.length))
                    message.latencyCount = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.latencyCount.push(reader.sint64());
                } else
                    message.latencyCount.push(reader.sint64());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a FieldStat message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof FieldStat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {FieldStat} FieldStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FieldStat.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a FieldStat message.
     * @function verify
     * @memberof FieldStat
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    FieldStat.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.returnType != null && message.hasOwnProperty("returnType"))
            if (!$util.isString(message.returnType))
                return "returnType: string expected";
        if (message.errorsCount != null && message.hasOwnProperty("errorsCount"))
            if (!$util.isInteger(message.errorsCount) && !(message.errorsCount && $util.isInteger(message.errorsCount.low) && $util.isInteger(message.errorsCount.high)))
                return "errorsCount: integer|Long expected";
        if (message.observedExecutionCount != null && message.hasOwnProperty("observedExecutionCount"))
            if (!$util.isInteger(message.observedExecutionCount) && !(message.observedExecutionCount && $util.isInteger(message.observedExecutionCount.low) && $util.isInteger(message.observedExecutionCount.high)))
                return "observedExecutionCount: integer|Long expected";
        if (message.estimatedExecutionCount != null && message.hasOwnProperty("estimatedExecutionCount"))
            if (!$util.isInteger(message.estimatedExecutionCount) && !(message.estimatedExecutionCount && $util.isInteger(message.estimatedExecutionCount.low) && $util.isInteger(message.estimatedExecutionCount.high)))
                return "estimatedExecutionCount: integer|Long expected";
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (!$util.isInteger(message.requestsWithErrorsCount) && !(message.requestsWithErrorsCount && $util.isInteger(message.requestsWithErrorsCount.low) && $util.isInteger(message.requestsWithErrorsCount.high)))
                return "requestsWithErrorsCount: integer|Long expected";
        if (message.latencyCount != null && message.hasOwnProperty("latencyCount")) {
            var array9;
            if (message.latencyCount != null && message.latencyCount.toArray)
                array9 = message.latencyCount.toArray();
            else
                array9 = message.latencyCount;
            if (!Array.isArray(array9))
                return "latencyCount: array expected";
            for (var i = 0; i < array9.length; ++i)
                if (!$util.isInteger(array9[i]) && !(array9[i] && $util.isInteger(array9[i].low) && $util.isInteger(array9[i].high)))
                    return "latencyCount: integer|Long[] expected";
        }
        return null;
    };

    /**
     * Creates a plain object from a FieldStat message. Also converts values to other types if specified.
     * @function toObject
     * @memberof FieldStat
     * @static
     * @param {FieldStat} message FieldStat
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    FieldStat.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.latencyCount = [];
        if (options.defaults) {
            object.returnType = "";
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.errorsCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.errorsCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.observedExecutionCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.observedExecutionCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.requestsWithErrorsCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.requestsWithErrorsCount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.estimatedExecutionCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.estimatedExecutionCount = options.longs === String ? "0" : 0;
        }
        if (message.returnType != null && message.hasOwnProperty("returnType"))
            object.returnType = message.returnType;
        if (message.errorsCount != null && message.hasOwnProperty("errorsCount"))
            if (typeof message.errorsCount === "number")
                object.errorsCount = options.longs === String ? String(message.errorsCount) : message.errorsCount;
            else
                object.errorsCount = options.longs === String ? $util.Long.prototype.toString.call(message.errorsCount) : options.longs === Number ? new $util.LongBits(message.errorsCount.low >>> 0, message.errorsCount.high >>> 0).toNumber(true) : message.errorsCount;
        if (message.observedExecutionCount != null && message.hasOwnProperty("observedExecutionCount"))
            if (typeof message.observedExecutionCount === "number")
                object.observedExecutionCount = options.longs === String ? String(message.observedExecutionCount) : message.observedExecutionCount;
            else
                object.observedExecutionCount = options.longs === String ? $util.Long.prototype.toString.call(message.observedExecutionCount) : options.longs === Number ? new $util.LongBits(message.observedExecutionCount.low >>> 0, message.observedExecutionCount.high >>> 0).toNumber(true) : message.observedExecutionCount;
        if (message.requestsWithErrorsCount != null && message.hasOwnProperty("requestsWithErrorsCount"))
            if (typeof message.requestsWithErrorsCount === "number")
                object.requestsWithErrorsCount = options.longs === String ? String(message.requestsWithErrorsCount) : message.requestsWithErrorsCount;
            else
                object.requestsWithErrorsCount = options.longs === String ? $util.Long.prototype.toString.call(message.requestsWithErrorsCount) : options.longs === Number ? new $util.LongBits(message.requestsWithErrorsCount.low >>> 0, message.requestsWithErrorsCount.high >>> 0).toNumber(true) : message.requestsWithErrorsCount;
        if (message.latencyCount && message.latencyCount.length) {
            object.latencyCount = [];
            for (var j = 0; j < message.latencyCount.length; ++j)
                if (typeof message.latencyCount[j] === "number")
                    object.latencyCount[j] = options.longs === String ? String(message.latencyCount[j]) : message.latencyCount[j];
                else
                    object.latencyCount[j] = options.longs === String ? $util.Long.prototype.toString.call(message.latencyCount[j]) : options.longs === Number ? new $util.LongBits(message.latencyCount[j].low >>> 0, message.latencyCount[j].high >>> 0).toNumber() : message.latencyCount[j];
        }
        if (message.estimatedExecutionCount != null && message.hasOwnProperty("estimatedExecutionCount"))
            if (typeof message.estimatedExecutionCount === "number")
                object.estimatedExecutionCount = options.longs === String ? String(message.estimatedExecutionCount) : message.estimatedExecutionCount;
            else
                object.estimatedExecutionCount = options.longs === String ? $util.Long.prototype.toString.call(message.estimatedExecutionCount) : options.longs === Number ? new $util.LongBits(message.estimatedExecutionCount.low >>> 0, message.estimatedExecutionCount.high >>> 0).toNumber(true) : message.estimatedExecutionCount;
        return object;
    };

    /**
     * Converts this FieldStat to JSON.
     * @function toJSON
     * @memberof FieldStat
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    FieldStat.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return FieldStat;
})();

$root.TypeStat = (function() {

    /**
     * Properties of a TypeStat.
     * @exports ITypeStat
     * @interface ITypeStat
     * @property {Object.<string,IFieldStat>|null} [perFieldStat] TypeStat perFieldStat
     */

    /**
     * Constructs a new TypeStat.
     * @exports TypeStat
     * @classdesc Represents a TypeStat.
     * @implements ITypeStat
     * @constructor
     * @param {ITypeStat=} [properties] Properties to set
     */
    function TypeStat(properties) {
        this.perFieldStat = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TypeStat perFieldStat.
     * @member {Object.<string,IFieldStat>} perFieldStat
     * @memberof TypeStat
     * @instance
     */
    TypeStat.prototype.perFieldStat = $util.emptyObject;

    /**
     * Creates a new TypeStat instance using the specified properties.
     * @function create
     * @memberof TypeStat
     * @static
     * @param {ITypeStat=} [properties] Properties to set
     * @returns {TypeStat} TypeStat instance
     */
    TypeStat.create = function create(properties) {
        return new TypeStat(properties);
    };

    /**
     * Encodes the specified TypeStat message. Does not implicitly {@link TypeStat.verify|verify} messages.
     * @function encode
     * @memberof TypeStat
     * @static
     * @param {ITypeStat} message TypeStat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TypeStat.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.perFieldStat != null && Object.hasOwnProperty.call(message, "perFieldStat"))
            for (var keys = Object.keys(message.perFieldStat), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.FieldStat.encode(message.perFieldStat[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified TypeStat message, length delimited. Does not implicitly {@link TypeStat.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TypeStat
     * @static
     * @param {ITypeStat} message TypeStat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TypeStat.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TypeStat message from the specified reader or buffer.
     * @function decode
     * @memberof TypeStat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TypeStat} TypeStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TypeStat.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.TypeStat(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 3:
                reader.skip().pos++;
                if (message.perFieldStat === $util.emptyObject)
                    message.perFieldStat = {};
                key = reader.string();
                reader.pos++;
                message.perFieldStat[key] = $root.FieldStat.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a TypeStat message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TypeStat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TypeStat} TypeStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TypeStat.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TypeStat message.
     * @function verify
     * @memberof TypeStat
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TypeStat.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.perFieldStat != null && message.hasOwnProperty("perFieldStat")) {
            if (!$util.isObject(message.perFieldStat))
                return "perFieldStat: object expected";
            var key = Object.keys(message.perFieldStat);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.FieldStat.verify(message.perFieldStat[key[i]]);
                if (error)
                    return "perFieldStat." + error;
            }
        }
        return null;
    };

    /**
     * Creates a plain object from a TypeStat message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TypeStat
     * @static
     * @param {TypeStat} message TypeStat
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TypeStat.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.perFieldStat = {};
        var keys2;
        if (message.perFieldStat && (keys2 = Object.keys(message.perFieldStat)).length) {
            object.perFieldStat = {};
            for (var j = 0; j < keys2.length; ++j)
                object.perFieldStat[keys2[j]] = $root.FieldStat.toObject(message.perFieldStat[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this TypeStat to JSON.
     * @function toJSON
     * @memberof TypeStat
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TypeStat.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return TypeStat;
})();

$root.ReferencedFieldsForType = (function() {

    /**
     * Properties of a ReferencedFieldsForType.
     * @exports IReferencedFieldsForType
     * @interface IReferencedFieldsForType
     * @property {Array.<string>|null} [fieldNames] ReferencedFieldsForType fieldNames
     * @property {boolean|null} [isInterface] ReferencedFieldsForType isInterface
     */

    /**
     * Constructs a new ReferencedFieldsForType.
     * @exports ReferencedFieldsForType
     * @classdesc Represents a ReferencedFieldsForType.
     * @implements IReferencedFieldsForType
     * @constructor
     * @param {IReferencedFieldsForType=} [properties] Properties to set
     */
    function ReferencedFieldsForType(properties) {
        this.fieldNames = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ReferencedFieldsForType fieldNames.
     * @member {Array.<string>} fieldNames
     * @memberof ReferencedFieldsForType
     * @instance
     */
    ReferencedFieldsForType.prototype.fieldNames = $util.emptyArray;

    /**
     * ReferencedFieldsForType isInterface.
     * @member {boolean} isInterface
     * @memberof ReferencedFieldsForType
     * @instance
     */
    ReferencedFieldsForType.prototype.isInterface = false;

    /**
     * Creates a new ReferencedFieldsForType instance using the specified properties.
     * @function create
     * @memberof ReferencedFieldsForType
     * @static
     * @param {IReferencedFieldsForType=} [properties] Properties to set
     * @returns {ReferencedFieldsForType} ReferencedFieldsForType instance
     */
    ReferencedFieldsForType.create = function create(properties) {
        return new ReferencedFieldsForType(properties);
    };

    /**
     * Encodes the specified ReferencedFieldsForType message. Does not implicitly {@link ReferencedFieldsForType.verify|verify} messages.
     * @function encode
     * @memberof ReferencedFieldsForType
     * @static
     * @param {IReferencedFieldsForType} message ReferencedFieldsForType message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ReferencedFieldsForType.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.fieldNames != null && message.fieldNames.length)
            for (var i = 0; i < message.fieldNames.length; ++i)
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.fieldNames[i]);
        if (message.isInterface != null && Object.hasOwnProperty.call(message, "isInterface"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isInterface);
        return writer;
    };

    /**
     * Encodes the specified ReferencedFieldsForType message, length delimited. Does not implicitly {@link ReferencedFieldsForType.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ReferencedFieldsForType
     * @static
     * @param {IReferencedFieldsForType} message ReferencedFieldsForType message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ReferencedFieldsForType.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ReferencedFieldsForType message from the specified reader or buffer.
     * @function decode
     * @memberof ReferencedFieldsForType
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ReferencedFieldsForType} ReferencedFieldsForType
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ReferencedFieldsForType.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ReferencedFieldsForType();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.fieldNames && message.fieldNames.length))
                    message.fieldNames = [];
                message.fieldNames.push(reader.string());
                break;
            case 2:
                message.isInterface = reader.bool();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ReferencedFieldsForType message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ReferencedFieldsForType
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ReferencedFieldsForType} ReferencedFieldsForType
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ReferencedFieldsForType.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ReferencedFieldsForType message.
     * @function verify
     * @memberof ReferencedFieldsForType
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ReferencedFieldsForType.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.fieldNames != null && message.hasOwnProperty("fieldNames")) {
            if (!Array.isArray(message.fieldNames))
                return "fieldNames: array expected";
            for (var i = 0; i < message.fieldNames.length; ++i)
                if (!$util.isString(message.fieldNames[i]))
                    return "fieldNames: string[] expected";
        }
        if (message.isInterface != null && message.hasOwnProperty("isInterface"))
            if (typeof message.isInterface !== "boolean")
                return "isInterface: boolean expected";
        return null;
    };

    /**
     * Creates a plain object from a ReferencedFieldsForType message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ReferencedFieldsForType
     * @static
     * @param {ReferencedFieldsForType} message ReferencedFieldsForType
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ReferencedFieldsForType.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.fieldNames = [];
        if (options.defaults)
            object.isInterface = false;
        if (message.fieldNames && message.fieldNames.length) {
            object.fieldNames = [];
            for (var j = 0; j < message.fieldNames.length; ++j)
                object.fieldNames[j] = message.fieldNames[j];
        }
        if (message.isInterface != null && message.hasOwnProperty("isInterface"))
            object.isInterface = message.isInterface;
        return object;
    };

    /**
     * Converts this ReferencedFieldsForType to JSON.
     * @function toJSON
     * @memberof ReferencedFieldsForType
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ReferencedFieldsForType.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ReferencedFieldsForType;
})();

$root.Report = (function() {

    /**
     * Properties of a Report.
     * @exports IReport
     * @interface IReport
     * @property {IReportHeader|null} [header] Report header
     * @property {Object.<string,ITracesAndStats>|null} [tracesPerQuery] Report tracesPerQuery
     * @property {google.protobuf.ITimestamp|null} [endTime] Report endTime
     */

    /**
     * Constructs a new Report.
     * @exports Report
     * @classdesc Represents a Report.
     * @implements IReport
     * @constructor
     * @param {IReport=} [properties] Properties to set
     */
    function Report(properties) {
        this.tracesPerQuery = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Report header.
     * @member {IReportHeader|null|undefined} header
     * @memberof Report
     * @instance
     */
    Report.prototype.header = null;

    /**
     * Report tracesPerQuery.
     * @member {Object.<string,ITracesAndStats>} tracesPerQuery
     * @memberof Report
     * @instance
     */
    Report.prototype.tracesPerQuery = $util.emptyObject;

    /**
     * Report endTime.
     * @member {google.protobuf.ITimestamp|null|undefined} endTime
     * @memberof Report
     * @instance
     */
    Report.prototype.endTime = null;

    /**
     * Creates a new Report instance using the specified properties.
     * @function create
     * @memberof Report
     * @static
     * @param {IReport=} [properties] Properties to set
     * @returns {Report} Report instance
     */
    Report.create = function create(properties) {
        return new Report(properties);
    };

    /**
     * Encodes the specified Report message. Does not implicitly {@link Report.verify|verify} messages.
     * @function encode
     * @memberof Report
     * @static
     * @param {IReport} message Report message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Report.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.header != null && Object.hasOwnProperty.call(message, "header"))
            $root.ReportHeader.encode(message.header, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.endTime != null && Object.hasOwnProperty.call(message, "endTime"))
            $root.google.protobuf.Timestamp.encode(message.endTime, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.tracesPerQuery != null && Object.hasOwnProperty.call(message, "tracesPerQuery"))
            for (var keys = Object.keys(message.tracesPerQuery), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.TracesAndStats.encode(message.tracesPerQuery[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified Report message, length delimited. Does not implicitly {@link Report.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Report
     * @static
     * @param {IReport} message Report message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Report.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Report message from the specified reader or buffer.
     * @function decode
     * @memberof Report
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Report} Report
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Report.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Report(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.header = $root.ReportHeader.decode(reader, reader.uint32());
                break;
            case 5:
                reader.skip().pos++;
                if (message.tracesPerQuery === $util.emptyObject)
                    message.tracesPerQuery = {};
                key = reader.string();
                reader.pos++;
                message.tracesPerQuery[key] = $root.TracesAndStats.decode(reader, reader.uint32());
                break;
            case 2:
                message.endTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Report message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Report
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Report} Report
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Report.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Report message.
     * @function verify
     * @memberof Report
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Report.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.header != null && message.hasOwnProperty("header")) {
            var error = $root.ReportHeader.verify(message.header);
            if (error)
                return "header." + error;
        }
        if (message.tracesPerQuery != null && message.hasOwnProperty("tracesPerQuery")) {
            if (!$util.isObject(message.tracesPerQuery))
                return "tracesPerQuery: object expected";
            var key = Object.keys(message.tracesPerQuery);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.TracesAndStats.verify(message.tracesPerQuery[key[i]]);
                if (error)
                    return "tracesPerQuery." + error;
            }
        }
        if (message.endTime != null && message.hasOwnProperty("endTime")) {
            var error = $root.google.protobuf.Timestamp.verify(message.endTime);
            if (error)
                return "endTime." + error;
        }
        return null;
    };

    /**
     * Creates a plain object from a Report message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Report
     * @static
     * @param {Report} message Report
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Report.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.tracesPerQuery = {};
        if (options.defaults) {
            object.header = null;
            object.endTime = null;
        }
        if (message.header != null && message.hasOwnProperty("header"))
            object.header = $root.ReportHeader.toObject(message.header, options);
        if (message.endTime != null && message.hasOwnProperty("endTime"))
            object.endTime = $root.google.protobuf.Timestamp.toObject(message.endTime, options);
        var keys2;
        if (message.tracesPerQuery && (keys2 = Object.keys(message.tracesPerQuery)).length) {
            object.tracesPerQuery = {};
            for (var j = 0; j < keys2.length; ++j)
                object.tracesPerQuery[keys2[j]] = $root.TracesAndStats.toObject(message.tracesPerQuery[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this Report to JSON.
     * @function toJSON
     * @memberof Report
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Report.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Report;
})();

$root.ContextualizedStats = (function() {

    /**
     * Properties of a ContextualizedStats.
     * @exports IContextualizedStats
     * @interface IContextualizedStats
     * @property {IStatsContext|null} [context] ContextualizedStats context
     * @property {IQueryLatencyStats|null} [queryLatencyStats] ContextualizedStats queryLatencyStats
     * @property {Object.<string,ITypeStat>|null} [perTypeStat] ContextualizedStats perTypeStat
     */

    /**
     * Constructs a new ContextualizedStats.
     * @exports ContextualizedStats
     * @classdesc Represents a ContextualizedStats.
     * @implements IContextualizedStats
     * @constructor
     * @param {IContextualizedStats=} [properties] Properties to set
     */
    function ContextualizedStats(properties) {
        this.perTypeStat = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ContextualizedStats context.
     * @member {IStatsContext|null|undefined} context
     * @memberof ContextualizedStats
     * @instance
     */
    ContextualizedStats.prototype.context = null;

    /**
     * ContextualizedStats queryLatencyStats.
     * @member {IQueryLatencyStats|null|undefined} queryLatencyStats
     * @memberof ContextualizedStats
     * @instance
     */
    ContextualizedStats.prototype.queryLatencyStats = null;

    /**
     * ContextualizedStats perTypeStat.
     * @member {Object.<string,ITypeStat>} perTypeStat
     * @memberof ContextualizedStats
     * @instance
     */
    ContextualizedStats.prototype.perTypeStat = $util.emptyObject;

    /**
     * Creates a new ContextualizedStats instance using the specified properties.
     * @function create
     * @memberof ContextualizedStats
     * @static
     * @param {IContextualizedStats=} [properties] Properties to set
     * @returns {ContextualizedStats} ContextualizedStats instance
     */
    ContextualizedStats.create = function create(properties) {
        return new ContextualizedStats(properties);
    };

    /**
     * Encodes the specified ContextualizedStats message. Does not implicitly {@link ContextualizedStats.verify|verify} messages.
     * @function encode
     * @memberof ContextualizedStats
     * @static
     * @param {IContextualizedStats} message ContextualizedStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.context != null && Object.hasOwnProperty.call(message, "context"))
            $root.StatsContext.encode(message.context, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.queryLatencyStats != null && Object.hasOwnProperty.call(message, "queryLatencyStats"))
            $root.QueryLatencyStats.encode(message.queryLatencyStats, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.perTypeStat != null && Object.hasOwnProperty.call(message, "perTypeStat"))
            for (var keys = Object.keys(message.perTypeStat), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.TypeStat.encode(message.perTypeStat[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified ContextualizedStats message, length delimited. Does not implicitly {@link ContextualizedStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ContextualizedStats
     * @static
     * @param {IContextualizedStats} message ContextualizedStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ContextualizedStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ContextualizedStats message from the specified reader or buffer.
     * @function decode
     * @memberof ContextualizedStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ContextualizedStats} ContextualizedStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ContextualizedStats(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.context = $root.StatsContext.decode(reader, reader.uint32());
                break;
            case 2:
                message.queryLatencyStats = $root.QueryLatencyStats.decode(reader, reader.uint32());
                break;
            case 3:
                reader.skip().pos++;
                if (message.perTypeStat === $util.emptyObject)
                    message.perTypeStat = {};
                key = reader.string();
                reader.pos++;
                message.perTypeStat[key] = $root.TypeStat.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ContextualizedStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ContextualizedStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ContextualizedStats} ContextualizedStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ContextualizedStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ContextualizedStats message.
     * @function verify
     * @memberof ContextualizedStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ContextualizedStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.context != null && message.hasOwnProperty("context")) {
            var error = $root.StatsContext.verify(message.context);
            if (error)
                return "context." + error;
        }
        if (message.queryLatencyStats != null && message.hasOwnProperty("queryLatencyStats")) {
            var error = $root.QueryLatencyStats.verify(message.queryLatencyStats);
            if (error)
                return "queryLatencyStats." + error;
        }
        if (message.perTypeStat != null && message.hasOwnProperty("perTypeStat")) {
            if (!$util.isObject(message.perTypeStat))
                return "perTypeStat: object expected";
            var key = Object.keys(message.perTypeStat);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.TypeStat.verify(message.perTypeStat[key[i]]);
                if (error)
                    return "perTypeStat." + error;
            }
        }
        return null;
    };

    /**
     * Creates a plain object from a ContextualizedStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ContextualizedStats
     * @static
     * @param {ContextualizedStats} message ContextualizedStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ContextualizedStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.perTypeStat = {};
        if (options.defaults) {
            object.context = null;
            object.queryLatencyStats = null;
        }
        if (message.context != null && message.hasOwnProperty("context"))
            object.context = $root.StatsContext.toObject(message.context, options);
        if (message.queryLatencyStats != null && message.hasOwnProperty("queryLatencyStats"))
            object.queryLatencyStats = $root.QueryLatencyStats.toObject(message.queryLatencyStats, options);
        var keys2;
        if (message.perTypeStat && (keys2 = Object.keys(message.perTypeStat)).length) {
            object.perTypeStat = {};
            for (var j = 0; j < keys2.length; ++j)
                object.perTypeStat[keys2[j]] = $root.TypeStat.toObject(message.perTypeStat[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this ContextualizedStats to JSON.
     * @function toJSON
     * @memberof ContextualizedStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ContextualizedStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return ContextualizedStats;
})();

$root.TracesAndStats = (function() {

    /**
     * Properties of a TracesAndStats.
     * @exports ITracesAndStats
     * @interface ITracesAndStats
     * @property {Array.<ITrace|Uint8Array>|null} [trace] TracesAndStats trace
     * @property {$protobuf.ToArray.<IContextualizedStats>|Array.<IContextualizedStats>|null} [statsWithContext] TracesAndStats statsWithContext
     * @property {Object.<string,IReferencedFieldsForType>|null} [referencedFieldsByType] TracesAndStats referencedFieldsByType
     * @property {Array.<ITrace|Uint8Array>|null} [internalTracesContributingToStats] TracesAndStats internalTracesContributingToStats
     */

    /**
     * Constructs a new TracesAndStats.
     * @exports TracesAndStats
     * @classdesc Represents a TracesAndStats.
     * @implements ITracesAndStats
     * @constructor
     * @param {ITracesAndStats=} [properties] Properties to set
     */
    function TracesAndStats(properties) {
        this.trace = [];
        this.statsWithContext = [];
        this.referencedFieldsByType = {};
        this.internalTracesContributingToStats = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TracesAndStats trace.
     * @member {Array.<ITrace|Uint8Array>} trace
     * @memberof TracesAndStats
     * @instance
     */
    TracesAndStats.prototype.trace = $util.emptyArray;

    /**
     * TracesAndStats statsWithContext.
     * @member {Array.<IContextualizedStats>} statsWithContext
     * @memberof TracesAndStats
     * @instance
     */
    TracesAndStats.prototype.statsWithContext = $util.emptyArray;

    /**
     * TracesAndStats referencedFieldsByType.
     * @member {Object.<string,IReferencedFieldsForType>} referencedFieldsByType
     * @memberof TracesAndStats
     * @instance
     */
    TracesAndStats.prototype.referencedFieldsByType = $util.emptyObject;

    /**
     * TracesAndStats internalTracesContributingToStats.
     * @member {Array.<ITrace|Uint8Array>} internalTracesContributingToStats
     * @memberof TracesAndStats
     * @instance
     */
    TracesAndStats.prototype.internalTracesContributingToStats = $util.emptyArray;

    /**
     * Creates a new TracesAndStats instance using the specified properties.
     * @function create
     * @memberof TracesAndStats
     * @static
     * @param {ITracesAndStats=} [properties] Properties to set
     * @returns {TracesAndStats} TracesAndStats instance
     */
    TracesAndStats.create = function create(properties) {
        return new TracesAndStats(properties);
    };

    /**
     * Encodes the specified TracesAndStats message. Does not implicitly {@link TracesAndStats.verify|verify} messages.
     * @function encode
     * @memberof TracesAndStats
     * @static
     * @param {ITracesAndStats} message TracesAndStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TracesAndStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.trace != null && message.trace.length)
            for (var i = 0; i < message.trace.length; ++i)
                if (message.trace[i] instanceof Uint8Array) {
                    writer.uint32(/* id 1, wireType 2 =*/10);
                    writer.bytes(message.trace[i]);
                } else
                    $root.Trace.encode(message.trace[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        var array2;
        if (message.statsWithContext != null && message.statsWithContext.toArray)
            array2 = message.statsWithContext.toArray();
        else
            array2 = message.statsWithContext;
        if (array2 != null && array2.length)
            for (var i = 0; i < array2.length; ++i)
                $root.ContextualizedStats.encode(array2[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.internalTracesContributingToStats != null && message.internalTracesContributingToStats.length)
            for (var i = 0; i < message.internalTracesContributingToStats.length; ++i)
                if (message.internalTracesContributingToStats[i] instanceof Uint8Array) {
                    writer.uint32(/* id 3, wireType 2 =*/26);
                    writer.bytes(message.internalTracesContributingToStats[i]);
                } else
                    $root.Trace.encode(message.internalTracesContributingToStats[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.referencedFieldsByType != null && Object.hasOwnProperty.call(message, "referencedFieldsByType"))
            for (var keys = Object.keys(message.referencedFieldsByType), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.ReferencedFieldsForType.encode(message.referencedFieldsByType[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified TracesAndStats message, length delimited. Does not implicitly {@link TracesAndStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TracesAndStats
     * @static
     * @param {ITracesAndStats} message TracesAndStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TracesAndStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TracesAndStats message from the specified reader or buffer.
     * @function decode
     * @memberof TracesAndStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TracesAndStats} TracesAndStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TracesAndStats.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.TracesAndStats(), key;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.trace && message.trace.length))
                    message.trace = [];
                message.trace.push($root.Trace.decode(reader, reader.uint32()));
                break;
            case 2:
                if (!(message.statsWithContext && message.statsWithContext.length))
                    message.statsWithContext = [];
                message.statsWithContext.push($root.ContextualizedStats.decode(reader, reader.uint32()));
                break;
            case 4:
                reader.skip().pos++;
                if (message.referencedFieldsByType === $util.emptyObject)
                    message.referencedFieldsByType = {};
                key = reader.string();
                reader.pos++;
                message.referencedFieldsByType[key] = $root.ReferencedFieldsForType.decode(reader, reader.uint32());
                break;
            case 3:
                if (!(message.internalTracesContributingToStats && message.internalTracesContributingToStats.length))
                    message.internalTracesContributingToStats = [];
                message.internalTracesContributingToStats.push($root.Trace.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a TracesAndStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TracesAndStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TracesAndStats} TracesAndStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TracesAndStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TracesAndStats message.
     * @function verify
     * @memberof TracesAndStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TracesAndStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.trace != null && message.hasOwnProperty("trace")) {
            if (!Array.isArray(message.trace))
                return "trace: array expected";
            for (var i = 0; i < message.trace.length; ++i)
                if (!(message.trace[i] instanceof Uint8Array)) {
                    var error = $root.Trace.verify(message.trace[i]);
                    if (error)
                        return "trace." + error;
                }
        }
        if (message.statsWithContext != null && message.hasOwnProperty("statsWithContext")) {
            var array2;
            if (message.statsWithContext != null && message.statsWithContext.toArray)
                array2 = message.statsWithContext.toArray();
            else
                array2 = message.statsWithContext;
            if (!Array.isArray(array2))
                return "statsWithContext: array expected";
            for (var i = 0; i < array2.length; ++i) {
                var error = $root.ContextualizedStats.verify(array2[i]);
                if (error)
                    return "statsWithContext." + error;
            }
        }
        if (message.referencedFieldsByType != null && message.hasOwnProperty("referencedFieldsByType")) {
            if (!$util.isObject(message.referencedFieldsByType))
                return "referencedFieldsByType: object expected";
            var key = Object.keys(message.referencedFieldsByType);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.ReferencedFieldsForType.verify(message.referencedFieldsByType[key[i]]);
                if (error)
                    return "referencedFieldsByType." + error;
            }
        }
        if (message.internalTracesContributingToStats != null && message.hasOwnProperty("internalTracesContributingToStats")) {
            if (!Array.isArray(message.internalTracesContributingToStats))
                return "internalTracesContributingToStats: array expected";
            for (var i = 0; i < message.internalTracesContributingToStats.length; ++i)
                if (!(message.internalTracesContributingToStats[i] instanceof Uint8Array)) {
                    var error = $root.Trace.verify(message.internalTracesContributingToStats[i]);
                    if (error)
                        return "internalTracesContributingToStats." + error;
                }
        }
        return null;
    };

    /**
     * Creates a plain object from a TracesAndStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TracesAndStats
     * @static
     * @param {TracesAndStats} message TracesAndStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TracesAndStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.trace = [];
            object.statsWithContext = [];
            object.internalTracesContributingToStats = [];
        }
        if (options.objects || options.defaults)
            object.referencedFieldsByType = {};
        if (message.trace && message.trace.length) {
            object.trace = [];
            for (var j = 0; j < message.trace.length; ++j)
                object.trace[j] = $root.Trace.toObject(message.trace[j], options);
        }
        if (message.statsWithContext && message.statsWithContext.length) {
            object.statsWithContext = [];
            for (var j = 0; j < message.statsWithContext.length; ++j)
                object.statsWithContext[j] = $root.ContextualizedStats.toObject(message.statsWithContext[j], options);
        }
        if (message.internalTracesContributingToStats && message.internalTracesContributingToStats.length) {
            object.internalTracesContributingToStats = [];
            for (var j = 0; j < message.internalTracesContributingToStats.length; ++j)
                object.internalTracesContributingToStats[j] = $root.Trace.toObject(message.internalTracesContributingToStats[j], options);
        }
        var keys2;
        if (message.referencedFieldsByType && (keys2 = Object.keys(message.referencedFieldsByType)).length) {
            object.referencedFieldsByType = {};
            for (var j = 0; j < keys2.length; ++j)
                object.referencedFieldsByType[keys2[j]] = $root.ReferencedFieldsForType.toObject(message.referencedFieldsByType[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this TracesAndStats to JSON.
     * @function toJSON
     * @memberof TracesAndStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TracesAndStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return TracesAndStats;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.seconds = reader.int64();
                        break;
                    case 2:
                        message.nanos = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
