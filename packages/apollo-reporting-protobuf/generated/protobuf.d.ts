import * as $protobuf from "@apollo/protobufjs";
/** Properties of a Trace. */
export interface ITrace {

    /** Trace startTime */
    startTime?: (google.protobuf.ITimestamp|null);

    /** Trace endTime */
    endTime?: (google.protobuf.ITimestamp|null);

    /** Trace durationNs */
    durationNs?: (number|null);

    /** Trace root */
    root?: (Trace.INode|null);

    /** Trace isIncomplete */
    isIncomplete?: (boolean|null);

    /** Trace signature */
    signature?: (string|null);

    /** Trace unexecutedOperationBody */
    unexecutedOperationBody?: (string|null);

    /** Trace unexecutedOperationName */
    unexecutedOperationName?: (string|null);

    /** Trace details */
    details?: (Trace.IDetails|null);

    /** Trace clientName */
    clientName?: (string|null);

    /** Trace clientVersion */
    clientVersion?: (string|null);

    /** Trace http */
    http?: (Trace.IHTTP|null);

    /** Trace cachePolicy */
    cachePolicy?: (Trace.ICachePolicy|null);

    /** Trace queryPlan */
    queryPlan?: (Trace.IQueryPlanNode|null);

    /** Trace fullQueryCacheHit */
    fullQueryCacheHit?: (boolean|null);

    /** Trace persistedQueryHit */
    persistedQueryHit?: (boolean|null);

    /** Trace persistedQueryRegister */
    persistedQueryRegister?: (boolean|null);

    /** Trace registeredOperation */
    registeredOperation?: (boolean|null);

    /** Trace forbiddenOperation */
    forbiddenOperation?: (boolean|null);

    /** Trace fieldExecutionWeight */
    fieldExecutionWeight?: (number|null);
}

/** Represents a Trace. */
export class Trace implements ITrace {

    /**
     * Constructs a new Trace.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITrace);

    /** Trace startTime. */
    public startTime?: (google.protobuf.ITimestamp|null);

    /** Trace endTime. */
    public endTime?: (google.protobuf.ITimestamp|null);

    /** Trace durationNs. */
    public durationNs: number;

    /** Trace root. */
    public root?: (Trace.INode|null);

    /** Trace isIncomplete. */
    public isIncomplete: boolean;

    /** Trace signature. */
    public signature: string;

    /** Trace unexecutedOperationBody. */
    public unexecutedOperationBody: string;

    /** Trace unexecutedOperationName. */
    public unexecutedOperationName: string;

    /** Trace details. */
    public details?: (Trace.IDetails|null);

    /** Trace clientName. */
    public clientName: string;

    /** Trace clientVersion. */
    public clientVersion: string;

    /** Trace http. */
    public http?: (Trace.IHTTP|null);

    /** Trace cachePolicy. */
    public cachePolicy?: (Trace.ICachePolicy|null);

    /** Trace queryPlan. */
    public queryPlan?: (Trace.IQueryPlanNode|null);

    /** Trace fullQueryCacheHit. */
    public fullQueryCacheHit: boolean;

    /** Trace persistedQueryHit. */
    public persistedQueryHit: boolean;

    /** Trace persistedQueryRegister. */
    public persistedQueryRegister: boolean;

    /** Trace registeredOperation. */
    public registeredOperation: boolean;

    /** Trace forbiddenOperation. */
    public forbiddenOperation: boolean;

    /** Trace fieldExecutionWeight. */
    public fieldExecutionWeight: number;

    /**
     * Creates a new Trace instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Trace instance
     */
    public static create(properties?: ITrace): Trace;

    /**
     * Encodes the specified Trace message. Does not implicitly {@link Trace.verify|verify} messages.
     * @param message Trace message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITrace, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Trace message, length delimited. Does not implicitly {@link Trace.verify|verify} messages.
     * @param message Trace message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITrace, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Trace message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Trace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace;

    /**
     * Decodes a Trace message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Trace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace;

    /**
     * Verifies a Trace message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a Trace message. Also converts values to other types if specified.
     * @param message Trace
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Trace, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Trace to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace Trace {

    /** Properties of a CachePolicy. */
    interface ICachePolicy {

        /** CachePolicy scope */
        scope?: (Trace.CachePolicy.Scope|null);

        /** CachePolicy maxAgeNs */
        maxAgeNs?: (number|null);
    }

    /** Represents a CachePolicy. */
    class CachePolicy implements ICachePolicy {

        /**
         * Constructs a new CachePolicy.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.ICachePolicy);

        /** CachePolicy scope. */
        public scope: Trace.CachePolicy.Scope;

        /** CachePolicy maxAgeNs. */
        public maxAgeNs: number;

        /**
         * Creates a new CachePolicy instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CachePolicy instance
         */
        public static create(properties?: Trace.ICachePolicy): Trace.CachePolicy;

        /**
         * Encodes the specified CachePolicy message. Does not implicitly {@link Trace.CachePolicy.verify|verify} messages.
         * @param message CachePolicy message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.ICachePolicy, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CachePolicy message, length delimited. Does not implicitly {@link Trace.CachePolicy.verify|verify} messages.
         * @param message CachePolicy message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.ICachePolicy, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CachePolicy message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CachePolicy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.CachePolicy;

        /**
         * Decodes a CachePolicy message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CachePolicy
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.CachePolicy;

        /**
         * Verifies a CachePolicy message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a CachePolicy message. Also converts values to other types if specified.
         * @param message CachePolicy
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.CachePolicy, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CachePolicy to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace CachePolicy {

        /** Scope enum. */
        enum Scope {
            UNKNOWN = 0,
            PUBLIC = 1,
            PRIVATE = 2
        }
    }

    /** Properties of a Details. */
    interface IDetails {

        /** Details variablesJson */
        variablesJson?: ({ [k: string]: string }|null);

        /** Details operationName */
        operationName?: (string|null);
    }

    /** Represents a Details. */
    class Details implements IDetails {

        /**
         * Constructs a new Details.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.IDetails);

        /** Details variablesJson. */
        public variablesJson: { [k: string]: string };

        /** Details operationName. */
        public operationName: string;

        /**
         * Creates a new Details instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Details instance
         */
        public static create(properties?: Trace.IDetails): Trace.Details;

        /**
         * Encodes the specified Details message. Does not implicitly {@link Trace.Details.verify|verify} messages.
         * @param message Details message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.IDetails, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Details message, length delimited. Does not implicitly {@link Trace.Details.verify|verify} messages.
         * @param message Details message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.IDetails, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Details message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Details
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.Details;

        /**
         * Decodes a Details message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Details
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.Details;

        /**
         * Verifies a Details message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a Details message. Also converts values to other types if specified.
         * @param message Details
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.Details, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Details to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Error. */
    interface IError {

        /** Error message */
        message?: (string|null);

        /** Error location */
        location?: (Trace.ILocation[]|null);

        /** Error timeNs */
        timeNs?: (number|null);

        /** Error json */
        json?: (string|null);
    }

    /** Represents an Error. */
    class Error implements IError {

        /**
         * Constructs a new Error.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.IError);

        /** Error message. */
        public message: string;

        /** Error location. */
        public location: Trace.ILocation[];

        /** Error timeNs. */
        public timeNs: number;

        /** Error json. */
        public json: string;

        /**
         * Creates a new Error instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Error instance
         */
        public static create(properties?: Trace.IError): Trace.Error;

        /**
         * Encodes the specified Error message. Does not implicitly {@link Trace.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link Trace.Error.verify|verify} messages.
         * @param message Error message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.IError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.Error;

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.Error;

        /**
         * Verifies an Error message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @param message Error
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.Error, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Error to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a HTTP. */
    interface IHTTP {

        /** HTTP method */
        method?: (Trace.HTTP.Method|null);

        /** HTTP requestHeaders */
        requestHeaders?: ({ [k: string]: Trace.HTTP.IValues }|null);

        /** HTTP responseHeaders */
        responseHeaders?: ({ [k: string]: Trace.HTTP.IValues }|null);

        /** HTTP statusCode */
        statusCode?: (number|null);
    }

    /** Represents a HTTP. */
    class HTTP implements IHTTP {

        /**
         * Constructs a new HTTP.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.IHTTP);

        /** HTTP method. */
        public method: Trace.HTTP.Method;

        /** HTTP requestHeaders. */
        public requestHeaders: { [k: string]: Trace.HTTP.IValues };

        /** HTTP responseHeaders. */
        public responseHeaders: { [k: string]: Trace.HTTP.IValues };

        /** HTTP statusCode. */
        public statusCode: number;

        /**
         * Creates a new HTTP instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HTTP instance
         */
        public static create(properties?: Trace.IHTTP): Trace.HTTP;

        /**
         * Encodes the specified HTTP message. Does not implicitly {@link Trace.HTTP.verify|verify} messages.
         * @param message HTTP message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.IHTTP, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified HTTP message, length delimited. Does not implicitly {@link Trace.HTTP.verify|verify} messages.
         * @param message HTTP message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.IHTTP, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a HTTP message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HTTP
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.HTTP;

        /**
         * Decodes a HTTP message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns HTTP
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.HTTP;

        /**
         * Verifies a HTTP message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a HTTP message. Also converts values to other types if specified.
         * @param message HTTP
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.HTTP, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this HTTP to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace HTTP {

        /** Properties of a Values. */
        interface IValues {

            /** Values value */
            value?: (string[]|null);
        }

        /** Represents a Values. */
        class Values implements IValues {

            /**
             * Constructs a new Values.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.HTTP.IValues);

            /** Values value. */
            public value: string[];

            /**
             * Creates a new Values instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Values instance
             */
            public static create(properties?: Trace.HTTP.IValues): Trace.HTTP.Values;

            /**
             * Encodes the specified Values message. Does not implicitly {@link Trace.HTTP.Values.verify|verify} messages.
             * @param message Values message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.HTTP.IValues, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Values message, length delimited. Does not implicitly {@link Trace.HTTP.Values.verify|verify} messages.
             * @param message Values message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.HTTP.IValues, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Values message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Values
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.HTTP.Values;

            /**
             * Decodes a Values message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Values
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.HTTP.Values;

            /**
             * Verifies a Values message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a Values message. Also converts values to other types if specified.
             * @param message Values
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.HTTP.Values, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Values to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Method enum. */
        enum Method {
            UNKNOWN = 0,
            OPTIONS = 1,
            GET = 2,
            HEAD = 3,
            POST = 4,
            PUT = 5,
            DELETE = 6,
            TRACE = 7,
            CONNECT = 8,
            PATCH = 9
        }
    }

    /** Properties of a Location. */
    interface ILocation {

        /** Location line */
        line?: (number|null);

        /** Location column */
        column?: (number|null);
    }

    /** Represents a Location. */
    class Location implements ILocation {

        /**
         * Constructs a new Location.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.ILocation);

        /** Location line. */
        public line: number;

        /** Location column. */
        public column: number;

        /**
         * Creates a new Location instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Location instance
         */
        public static create(properties?: Trace.ILocation): Trace.Location;

        /**
         * Encodes the specified Location message. Does not implicitly {@link Trace.Location.verify|verify} messages.
         * @param message Location message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Location message, length delimited. Does not implicitly {@link Trace.Location.verify|verify} messages.
         * @param message Location message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Location message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.Location;

        /**
         * Decodes a Location message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.Location;

        /**
         * Verifies a Location message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a Location message. Also converts values to other types if specified.
         * @param message Location
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Location to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Node. */
    interface INode {

        /** Node responseName */
        responseName?: (string|null);

        /** Node index */
        index?: (number|null);

        /** Node originalFieldName */
        originalFieldName?: (string|null);

        /** Node type */
        type?: (string|null);

        /** Node parentType */
        parentType?: (string|null);

        /** Node cachePolicy */
        cachePolicy?: (Trace.ICachePolicy|null);

        /** Node startTime */
        startTime?: (number|null);

        /** Node endTime */
        endTime?: (number|null);

        /** Node error */
        error?: (Trace.IError[]|null);

        /** Node child */
        child?: (Trace.INode[]|null);
    }

    /** Represents a Node. */
    class Node implements INode {

        /**
         * Constructs a new Node.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.INode);

        /** Node responseName. */
        public responseName: string;

        /** Node index. */
        public index: number;

        /** Node originalFieldName. */
        public originalFieldName: string;

        /** Node type. */
        public type: string;

        /** Node parentType. */
        public parentType: string;

        /** Node cachePolicy. */
        public cachePolicy?: (Trace.ICachePolicy|null);

        /** Node startTime. */
        public startTime: number;

        /** Node endTime. */
        public endTime: number;

        /** Node error. */
        public error: Trace.IError[];

        /** Node child. */
        public child: Trace.INode[];

        /** Node id. */
        public id?: ("responseName"|"index");

        /**
         * Creates a new Node instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Node instance
         */
        public static create(properties?: Trace.INode): Trace.Node;

        /**
         * Encodes the specified Node message. Does not implicitly {@link Trace.Node.verify|verify} messages.
         * @param message Node message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.INode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Node message, length delimited. Does not implicitly {@link Trace.Node.verify|verify} messages.
         * @param message Node message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.INode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.Node;

        /**
         * Decodes a Node message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.Node;

        /**
         * Verifies a Node message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a Node message. Also converts values to other types if specified.
         * @param message Node
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.Node, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Node to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a QueryPlanNode. */
    interface IQueryPlanNode {

        /** QueryPlanNode sequence */
        sequence?: (Trace.QueryPlanNode.ISequenceNode|null);

        /** QueryPlanNode parallel */
        parallel?: (Trace.QueryPlanNode.IParallelNode|null);

        /** QueryPlanNode fetch */
        fetch?: (Trace.QueryPlanNode.IFetchNode|null);

        /** QueryPlanNode flatten */
        flatten?: (Trace.QueryPlanNode.IFlattenNode|null);

        /** QueryPlanNode defer */
        defer?: (Trace.QueryPlanNode.IDeferNode|null);

        /** QueryPlanNode condition */
        condition?: (Trace.QueryPlanNode.IConditionNode|null);
    }

    /** Represents a QueryPlanNode. */
    class QueryPlanNode implements IQueryPlanNode {

        /**
         * Constructs a new QueryPlanNode.
         * @param [properties] Properties to set
         */
        constructor(properties?: Trace.IQueryPlanNode);

        /** QueryPlanNode sequence. */
        public sequence?: (Trace.QueryPlanNode.ISequenceNode|null);

        /** QueryPlanNode parallel. */
        public parallel?: (Trace.QueryPlanNode.IParallelNode|null);

        /** QueryPlanNode fetch. */
        public fetch?: (Trace.QueryPlanNode.IFetchNode|null);

        /** QueryPlanNode flatten. */
        public flatten?: (Trace.QueryPlanNode.IFlattenNode|null);

        /** QueryPlanNode defer. */
        public defer?: (Trace.QueryPlanNode.IDeferNode|null);

        /** QueryPlanNode condition. */
        public condition?: (Trace.QueryPlanNode.IConditionNode|null);

        /** QueryPlanNode node. */
        public node?: ("sequence"|"parallel"|"fetch"|"flatten"|"defer"|"condition");

        /**
         * Creates a new QueryPlanNode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryPlanNode instance
         */
        public static create(properties?: Trace.IQueryPlanNode): Trace.QueryPlanNode;

        /**
         * Encodes the specified QueryPlanNode message. Does not implicitly {@link Trace.QueryPlanNode.verify|verify} messages.
         * @param message QueryPlanNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: Trace.IQueryPlanNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified QueryPlanNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.verify|verify} messages.
         * @param message QueryPlanNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: Trace.IQueryPlanNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a QueryPlanNode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns QueryPlanNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode;

        /**
         * Decodes a QueryPlanNode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns QueryPlanNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode;

        /**
         * Verifies a QueryPlanNode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a plain object from a QueryPlanNode message. Also converts values to other types if specified.
         * @param message QueryPlanNode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: Trace.QueryPlanNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this QueryPlanNode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace QueryPlanNode {

        /** Properties of a SequenceNode. */
        interface ISequenceNode {

            /** SequenceNode nodes */
            nodes?: (Trace.IQueryPlanNode[]|null);
        }

        /** Represents a SequenceNode. */
        class SequenceNode implements ISequenceNode {

            /**
             * Constructs a new SequenceNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.ISequenceNode);

            /** SequenceNode nodes. */
            public nodes: Trace.IQueryPlanNode[];

            /**
             * Creates a new SequenceNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SequenceNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.ISequenceNode): Trace.QueryPlanNode.SequenceNode;

            /**
             * Encodes the specified SequenceNode message. Does not implicitly {@link Trace.QueryPlanNode.SequenceNode.verify|verify} messages.
             * @param message SequenceNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.ISequenceNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SequenceNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.SequenceNode.verify|verify} messages.
             * @param message SequenceNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.ISequenceNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SequenceNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SequenceNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.SequenceNode;

            /**
             * Decodes a SequenceNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SequenceNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.SequenceNode;

            /**
             * Verifies a SequenceNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a SequenceNode message. Also converts values to other types if specified.
             * @param message SequenceNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.SequenceNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SequenceNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ParallelNode. */
        interface IParallelNode {

            /** ParallelNode nodes */
            nodes?: (Trace.IQueryPlanNode[]|null);
        }

        /** Represents a ParallelNode. */
        class ParallelNode implements IParallelNode {

            /**
             * Constructs a new ParallelNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IParallelNode);

            /** ParallelNode nodes. */
            public nodes: Trace.IQueryPlanNode[];

            /**
             * Creates a new ParallelNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ParallelNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IParallelNode): Trace.QueryPlanNode.ParallelNode;

            /**
             * Encodes the specified ParallelNode message. Does not implicitly {@link Trace.QueryPlanNode.ParallelNode.verify|verify} messages.
             * @param message ParallelNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IParallelNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ParallelNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.ParallelNode.verify|verify} messages.
             * @param message ParallelNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IParallelNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ParallelNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ParallelNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.ParallelNode;

            /**
             * Decodes a ParallelNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ParallelNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.ParallelNode;

            /**
             * Verifies a ParallelNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a ParallelNode message. Also converts values to other types if specified.
             * @param message ParallelNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.ParallelNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ParallelNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FetchNode. */
        interface IFetchNode {

            /** FetchNode serviceName */
            serviceName?: (string|null);

            /** FetchNode traceParsingFailed */
            traceParsingFailed?: (boolean|null);

            /** FetchNode trace */
            trace?: (ITrace|null);

            /** FetchNode sentTimeOffset */
            sentTimeOffset?: (number|null);

            /** FetchNode sentTime */
            sentTime?: (google.protobuf.ITimestamp|null);

            /** FetchNode receivedTime */
            receivedTime?: (google.protobuf.ITimestamp|null);
        }

        /** Represents a FetchNode. */
        class FetchNode implements IFetchNode {

            /**
             * Constructs a new FetchNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IFetchNode);

            /** FetchNode serviceName. */
            public serviceName: string;

            /** FetchNode traceParsingFailed. */
            public traceParsingFailed: boolean;

            /** FetchNode trace. */
            public trace?: (ITrace|null);

            /** FetchNode sentTimeOffset. */
            public sentTimeOffset: number;

            /** FetchNode sentTime. */
            public sentTime?: (google.protobuf.ITimestamp|null);

            /** FetchNode receivedTime. */
            public receivedTime?: (google.protobuf.ITimestamp|null);

            /**
             * Creates a new FetchNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FetchNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IFetchNode): Trace.QueryPlanNode.FetchNode;

            /**
             * Encodes the specified FetchNode message. Does not implicitly {@link Trace.QueryPlanNode.FetchNode.verify|verify} messages.
             * @param message FetchNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IFetchNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FetchNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.FetchNode.verify|verify} messages.
             * @param message FetchNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IFetchNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FetchNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FetchNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.FetchNode;

            /**
             * Decodes a FetchNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FetchNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.FetchNode;

            /**
             * Verifies a FetchNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a FetchNode message. Also converts values to other types if specified.
             * @param message FetchNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.FetchNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FetchNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FlattenNode. */
        interface IFlattenNode {

            /** FlattenNode responsePath */
            responsePath?: (Trace.QueryPlanNode.IResponsePathElement[]|null);

            /** FlattenNode node */
            node?: (Trace.IQueryPlanNode|null);
        }

        /** Represents a FlattenNode. */
        class FlattenNode implements IFlattenNode {

            /**
             * Constructs a new FlattenNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IFlattenNode);

            /** FlattenNode responsePath. */
            public responsePath: Trace.QueryPlanNode.IResponsePathElement[];

            /** FlattenNode node. */
            public node?: (Trace.IQueryPlanNode|null);

            /**
             * Creates a new FlattenNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FlattenNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IFlattenNode): Trace.QueryPlanNode.FlattenNode;

            /**
             * Encodes the specified FlattenNode message. Does not implicitly {@link Trace.QueryPlanNode.FlattenNode.verify|verify} messages.
             * @param message FlattenNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IFlattenNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FlattenNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.FlattenNode.verify|verify} messages.
             * @param message FlattenNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IFlattenNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FlattenNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FlattenNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.FlattenNode;

            /**
             * Decodes a FlattenNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FlattenNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.FlattenNode;

            /**
             * Verifies a FlattenNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a FlattenNode message. Also converts values to other types if specified.
             * @param message FlattenNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.FlattenNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FlattenNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DeferNode. */
        interface IDeferNode {

            /** DeferNode primary */
            primary?: (Trace.QueryPlanNode.IDeferNodePrimary|null);

            /** DeferNode deferred */
            deferred?: (Trace.QueryPlanNode.IDeferredNode[]|null);
        }

        /** Represents a DeferNode. */
        class DeferNode implements IDeferNode {

            /**
             * Constructs a new DeferNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IDeferNode);

            /** DeferNode primary. */
            public primary?: (Trace.QueryPlanNode.IDeferNodePrimary|null);

            /** DeferNode deferred. */
            public deferred: Trace.QueryPlanNode.IDeferredNode[];

            /**
             * Creates a new DeferNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeferNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IDeferNode): Trace.QueryPlanNode.DeferNode;

            /**
             * Encodes the specified DeferNode message. Does not implicitly {@link Trace.QueryPlanNode.DeferNode.verify|verify} messages.
             * @param message DeferNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IDeferNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeferNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.DeferNode.verify|verify} messages.
             * @param message DeferNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IDeferNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeferNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeferNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.DeferNode;

            /**
             * Decodes a DeferNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeferNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.DeferNode;

            /**
             * Verifies a DeferNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a DeferNode message. Also converts values to other types if specified.
             * @param message DeferNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.DeferNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeferNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConditionNode. */
        interface IConditionNode {

            /** ConditionNode condition */
            condition?: (string|null);

            /** ConditionNode ifClause */
            ifClause?: (Trace.IQueryPlanNode|null);

            /** ConditionNode elseClause */
            elseClause?: (Trace.IQueryPlanNode|null);
        }

        /** Represents a ConditionNode. */
        class ConditionNode implements IConditionNode {

            /**
             * Constructs a new ConditionNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IConditionNode);

            /** ConditionNode condition. */
            public condition: string;

            /** ConditionNode ifClause. */
            public ifClause?: (Trace.IQueryPlanNode|null);

            /** ConditionNode elseClause. */
            public elseClause?: (Trace.IQueryPlanNode|null);

            /**
             * Creates a new ConditionNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConditionNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IConditionNode): Trace.QueryPlanNode.ConditionNode;

            /**
             * Encodes the specified ConditionNode message. Does not implicitly {@link Trace.QueryPlanNode.ConditionNode.verify|verify} messages.
             * @param message ConditionNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IConditionNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConditionNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.ConditionNode.verify|verify} messages.
             * @param message ConditionNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IConditionNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConditionNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConditionNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.ConditionNode;

            /**
             * Decodes a ConditionNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConditionNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.ConditionNode;

            /**
             * Verifies a ConditionNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a ConditionNode message. Also converts values to other types if specified.
             * @param message ConditionNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.ConditionNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConditionNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DeferNodePrimary. */
        interface IDeferNodePrimary {

            /** DeferNodePrimary node */
            node?: (Trace.IQueryPlanNode|null);
        }

        /** Represents a DeferNodePrimary. */
        class DeferNodePrimary implements IDeferNodePrimary {

            /**
             * Constructs a new DeferNodePrimary.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IDeferNodePrimary);

            /** DeferNodePrimary node. */
            public node?: (Trace.IQueryPlanNode|null);

            /**
             * Creates a new DeferNodePrimary instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeferNodePrimary instance
             */
            public static create(properties?: Trace.QueryPlanNode.IDeferNodePrimary): Trace.QueryPlanNode.DeferNodePrimary;

            /**
             * Encodes the specified DeferNodePrimary message. Does not implicitly {@link Trace.QueryPlanNode.DeferNodePrimary.verify|verify} messages.
             * @param message DeferNodePrimary message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IDeferNodePrimary, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeferNodePrimary message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.DeferNodePrimary.verify|verify} messages.
             * @param message DeferNodePrimary message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IDeferNodePrimary, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeferNodePrimary message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeferNodePrimary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.DeferNodePrimary;

            /**
             * Decodes a DeferNodePrimary message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeferNodePrimary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.DeferNodePrimary;

            /**
             * Verifies a DeferNodePrimary message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a DeferNodePrimary message. Also converts values to other types if specified.
             * @param message DeferNodePrimary
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.DeferNodePrimary, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeferNodePrimary to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DeferredNode. */
        interface IDeferredNode {

            /** DeferredNode depends */
            depends?: (Trace.QueryPlanNode.IDeferredNodeDepends[]|null);

            /** DeferredNode label */
            label?: (string|null);

            /** DeferredNode path */
            path?: (Trace.QueryPlanNode.IResponsePathElement[]|null);

            /** DeferredNode node */
            node?: (Trace.IQueryPlanNode|null);
        }

        /** Represents a DeferredNode. */
        class DeferredNode implements IDeferredNode {

            /**
             * Constructs a new DeferredNode.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IDeferredNode);

            /** DeferredNode depends. */
            public depends: Trace.QueryPlanNode.IDeferredNodeDepends[];

            /** DeferredNode label. */
            public label: string;

            /** DeferredNode path. */
            public path: Trace.QueryPlanNode.IResponsePathElement[];

            /** DeferredNode node. */
            public node?: (Trace.IQueryPlanNode|null);

            /**
             * Creates a new DeferredNode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeferredNode instance
             */
            public static create(properties?: Trace.QueryPlanNode.IDeferredNode): Trace.QueryPlanNode.DeferredNode;

            /**
             * Encodes the specified DeferredNode message. Does not implicitly {@link Trace.QueryPlanNode.DeferredNode.verify|verify} messages.
             * @param message DeferredNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IDeferredNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeferredNode message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.DeferredNode.verify|verify} messages.
             * @param message DeferredNode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IDeferredNode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeferredNode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeferredNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.DeferredNode;

            /**
             * Decodes a DeferredNode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeferredNode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.DeferredNode;

            /**
             * Verifies a DeferredNode message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a DeferredNode message. Also converts values to other types if specified.
             * @param message DeferredNode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.DeferredNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeferredNode to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DeferredNodeDepends. */
        interface IDeferredNodeDepends {

            /** DeferredNodeDepends id */
            id?: (string|null);

            /** DeferredNodeDepends deferLabel */
            deferLabel?: (string|null);
        }

        /** Represents a DeferredNodeDepends. */
        class DeferredNodeDepends implements IDeferredNodeDepends {

            /**
             * Constructs a new DeferredNodeDepends.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IDeferredNodeDepends);

            /** DeferredNodeDepends id. */
            public id: string;

            /** DeferredNodeDepends deferLabel. */
            public deferLabel: string;

            /**
             * Creates a new DeferredNodeDepends instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeferredNodeDepends instance
             */
            public static create(properties?: Trace.QueryPlanNode.IDeferredNodeDepends): Trace.QueryPlanNode.DeferredNodeDepends;

            /**
             * Encodes the specified DeferredNodeDepends message. Does not implicitly {@link Trace.QueryPlanNode.DeferredNodeDepends.verify|verify} messages.
             * @param message DeferredNodeDepends message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IDeferredNodeDepends, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeferredNodeDepends message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.DeferredNodeDepends.verify|verify} messages.
             * @param message DeferredNodeDepends message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IDeferredNodeDepends, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeferredNodeDepends message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeferredNodeDepends
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.DeferredNodeDepends;

            /**
             * Decodes a DeferredNodeDepends message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeferredNodeDepends
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.DeferredNodeDepends;

            /**
             * Verifies a DeferredNodeDepends message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a DeferredNodeDepends message. Also converts values to other types if specified.
             * @param message DeferredNodeDepends
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.DeferredNodeDepends, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeferredNodeDepends to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ResponsePathElement. */
        interface IResponsePathElement {

            /** ResponsePathElement fieldName */
            fieldName?: (string|null);

            /** ResponsePathElement index */
            index?: (number|null);
        }

        /** Represents a ResponsePathElement. */
        class ResponsePathElement implements IResponsePathElement {

            /**
             * Constructs a new ResponsePathElement.
             * @param [properties] Properties to set
             */
            constructor(properties?: Trace.QueryPlanNode.IResponsePathElement);

            /** ResponsePathElement fieldName. */
            public fieldName: string;

            /** ResponsePathElement index. */
            public index: number;

            /** ResponsePathElement id. */
            public id?: ("fieldName"|"index");

            /**
             * Creates a new ResponsePathElement instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ResponsePathElement instance
             */
            public static create(properties?: Trace.QueryPlanNode.IResponsePathElement): Trace.QueryPlanNode.ResponsePathElement;

            /**
             * Encodes the specified ResponsePathElement message. Does not implicitly {@link Trace.QueryPlanNode.ResponsePathElement.verify|verify} messages.
             * @param message ResponsePathElement message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: Trace.QueryPlanNode.IResponsePathElement, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ResponsePathElement message, length delimited. Does not implicitly {@link Trace.QueryPlanNode.ResponsePathElement.verify|verify} messages.
             * @param message ResponsePathElement message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: Trace.QueryPlanNode.IResponsePathElement, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ResponsePathElement message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ResponsePathElement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Trace.QueryPlanNode.ResponsePathElement;

            /**
             * Decodes a ResponsePathElement message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ResponsePathElement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Trace.QueryPlanNode.ResponsePathElement;

            /**
             * Verifies a ResponsePathElement message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a ResponsePathElement message. Also converts values to other types if specified.
             * @param message ResponsePathElement
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: Trace.QueryPlanNode.ResponsePathElement, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ResponsePathElement to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}

/** Properties of a ReportHeader. */
export interface IReportHeader {

    /** ReportHeader graphRef */
    graphRef?: (string|null);

    /** ReportHeader hostname */
    hostname?: (string|null);

    /** ReportHeader agentVersion */
    agentVersion?: (string|null);

    /** ReportHeader serviceVersion */
    serviceVersion?: (string|null);

    /** ReportHeader runtimeVersion */
    runtimeVersion?: (string|null);

    /** ReportHeader uname */
    uname?: (string|null);

    /** ReportHeader executableSchemaId */
    executableSchemaId?: (string|null);
}

/** Represents a ReportHeader. */
export class ReportHeader implements IReportHeader {

    /**
     * Constructs a new ReportHeader.
     * @param [properties] Properties to set
     */
    constructor(properties?: IReportHeader);

    /** ReportHeader graphRef. */
    public graphRef: string;

    /** ReportHeader hostname. */
    public hostname: string;

    /** ReportHeader agentVersion. */
    public agentVersion: string;

    /** ReportHeader serviceVersion. */
    public serviceVersion: string;

    /** ReportHeader runtimeVersion. */
    public runtimeVersion: string;

    /** ReportHeader uname. */
    public uname: string;

    /** ReportHeader executableSchemaId. */
    public executableSchemaId: string;

    /**
     * Creates a new ReportHeader instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReportHeader instance
     */
    public static create(properties?: IReportHeader): ReportHeader;

    /**
     * Encodes the specified ReportHeader message. Does not implicitly {@link ReportHeader.verify|verify} messages.
     * @param message ReportHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IReportHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReportHeader message, length delimited. Does not implicitly {@link ReportHeader.verify|verify} messages.
     * @param message ReportHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IReportHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReportHeader message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReportHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ReportHeader;

    /**
     * Decodes a ReportHeader message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReportHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ReportHeader;

    /**
     * Verifies a ReportHeader message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a ReportHeader message. Also converts values to other types if specified.
     * @param message ReportHeader
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ReportHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ReportHeader to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PathErrorStats. */
export interface IPathErrorStats {

    /** PathErrorStats children */
    children?: ({ [k: string]: IPathErrorStats }|null);

    /** PathErrorStats errorsCount */
    errorsCount?: (number|null);

    /** PathErrorStats requestsWithErrorsCount */
    requestsWithErrorsCount?: (number|null);
}

/** Represents a PathErrorStats. */
export class PathErrorStats implements IPathErrorStats {

    /**
     * Constructs a new PathErrorStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPathErrorStats);

    /** PathErrorStats children. */
    public children: { [k: string]: IPathErrorStats };

    /** PathErrorStats errorsCount. */
    public errorsCount: number;

    /** PathErrorStats requestsWithErrorsCount. */
    public requestsWithErrorsCount: number;

    /**
     * Creates a new PathErrorStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PathErrorStats instance
     */
    public static create(properties?: IPathErrorStats): PathErrorStats;

    /**
     * Encodes the specified PathErrorStats message. Does not implicitly {@link PathErrorStats.verify|verify} messages.
     * @param message PathErrorStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPathErrorStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PathErrorStats message, length delimited. Does not implicitly {@link PathErrorStats.verify|verify} messages.
     * @param message PathErrorStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPathErrorStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PathErrorStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PathErrorStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PathErrorStats;

    /**
     * Decodes a PathErrorStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PathErrorStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PathErrorStats;

    /**
     * Verifies a PathErrorStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a PathErrorStats message. Also converts values to other types if specified.
     * @param message PathErrorStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PathErrorStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PathErrorStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a QueryLatencyStats. */
export interface IQueryLatencyStats {

    /** QueryLatencyStats latencyCount */
    latencyCount?: ($protobuf.ToArray<number>|number[]|null);

    /** QueryLatencyStats requestCount */
    requestCount?: (number|null);

    /** QueryLatencyStats cacheHits */
    cacheHits?: (number|null);

    /** QueryLatencyStats persistedQueryHits */
    persistedQueryHits?: (number|null);

    /** QueryLatencyStats persistedQueryMisses */
    persistedQueryMisses?: (number|null);

    /** QueryLatencyStats cacheLatencyCount */
    cacheLatencyCount?: ($protobuf.ToArray<number>|number[]|null);

    /** QueryLatencyStats rootErrorStats */
    rootErrorStats?: (IPathErrorStats|null);

    /** QueryLatencyStats requestsWithErrorsCount */
    requestsWithErrorsCount?: (number|null);

    /** QueryLatencyStats publicCacheTtlCount */
    publicCacheTtlCount?: ($protobuf.ToArray<number>|number[]|null);

    /** QueryLatencyStats privateCacheTtlCount */
    privateCacheTtlCount?: ($protobuf.ToArray<number>|number[]|null);

    /** QueryLatencyStats registeredOperationCount */
    registeredOperationCount?: (number|null);

    /** QueryLatencyStats forbiddenOperationCount */
    forbiddenOperationCount?: (number|null);

    /** QueryLatencyStats requestsWithoutFieldInstrumentation */
    requestsWithoutFieldInstrumentation?: (number|null);
}

/** Represents a QueryLatencyStats. */
export class QueryLatencyStats implements IQueryLatencyStats {

    /**
     * Constructs a new QueryLatencyStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IQueryLatencyStats);

    /** QueryLatencyStats latencyCount. */
    public latencyCount: number[];

    /** QueryLatencyStats requestCount. */
    public requestCount: number;

    /** QueryLatencyStats cacheHits. */
    public cacheHits: number;

    /** QueryLatencyStats persistedQueryHits. */
    public persistedQueryHits: number;

    /** QueryLatencyStats persistedQueryMisses. */
    public persistedQueryMisses: number;

    /** QueryLatencyStats cacheLatencyCount. */
    public cacheLatencyCount: number[];

    /** QueryLatencyStats rootErrorStats. */
    public rootErrorStats?: (IPathErrorStats|null);

    /** QueryLatencyStats requestsWithErrorsCount. */
    public requestsWithErrorsCount: number;

    /** QueryLatencyStats publicCacheTtlCount. */
    public publicCacheTtlCount: number[];

    /** QueryLatencyStats privateCacheTtlCount. */
    public privateCacheTtlCount: number[];

    /** QueryLatencyStats registeredOperationCount. */
    public registeredOperationCount: number;

    /** QueryLatencyStats forbiddenOperationCount. */
    public forbiddenOperationCount: number;

    /** QueryLatencyStats requestsWithoutFieldInstrumentation. */
    public requestsWithoutFieldInstrumentation: number;

    /**
     * Creates a new QueryLatencyStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns QueryLatencyStats instance
     */
    public static create(properties?: IQueryLatencyStats): QueryLatencyStats;

    /**
     * Encodes the specified QueryLatencyStats message. Does not implicitly {@link QueryLatencyStats.verify|verify} messages.
     * @param message QueryLatencyStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IQueryLatencyStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified QueryLatencyStats message, length delimited. Does not implicitly {@link QueryLatencyStats.verify|verify} messages.
     * @param message QueryLatencyStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IQueryLatencyStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a QueryLatencyStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns QueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): QueryLatencyStats;

    /**
     * Decodes a QueryLatencyStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns QueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): QueryLatencyStats;

    /**
     * Verifies a QueryLatencyStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a QueryLatencyStats message. Also converts values to other types if specified.
     * @param message QueryLatencyStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: QueryLatencyStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this QueryLatencyStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a StatsContext. */
export interface IStatsContext {

    /** StatsContext clientName */
    clientName?: (string|null);

    /** StatsContext clientVersion */
    clientVersion?: (string|null);
}

/** Represents a StatsContext. */
export class StatsContext implements IStatsContext {

    /**
     * Constructs a new StatsContext.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStatsContext);

    /** StatsContext clientName. */
    public clientName: string;

    /** StatsContext clientVersion. */
    public clientVersion: string;

    /**
     * Creates a new StatsContext instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StatsContext instance
     */
    public static create(properties?: IStatsContext): StatsContext;

    /**
     * Encodes the specified StatsContext message. Does not implicitly {@link StatsContext.verify|verify} messages.
     * @param message StatsContext message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStatsContext, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StatsContext message, length delimited. Does not implicitly {@link StatsContext.verify|verify} messages.
     * @param message StatsContext message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStatsContext, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StatsContext message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StatsContext
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): StatsContext;

    /**
     * Decodes a StatsContext message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StatsContext
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): StatsContext;

    /**
     * Verifies a StatsContext message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a StatsContext message. Also converts values to other types if specified.
     * @param message StatsContext
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: StatsContext, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this StatsContext to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a ContextualizedQueryLatencyStats. */
export interface IContextualizedQueryLatencyStats {

    /** ContextualizedQueryLatencyStats queryLatencyStats */
    queryLatencyStats?: (IQueryLatencyStats|null);

    /** ContextualizedQueryLatencyStats context */
    context?: (IStatsContext|null);
}

/** Represents a ContextualizedQueryLatencyStats. */
export class ContextualizedQueryLatencyStats implements IContextualizedQueryLatencyStats {

    /**
     * Constructs a new ContextualizedQueryLatencyStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IContextualizedQueryLatencyStats);

    /** ContextualizedQueryLatencyStats queryLatencyStats. */
    public queryLatencyStats?: (IQueryLatencyStats|null);

    /** ContextualizedQueryLatencyStats context. */
    public context?: (IStatsContext|null);

    /**
     * Creates a new ContextualizedQueryLatencyStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ContextualizedQueryLatencyStats instance
     */
    public static create(properties?: IContextualizedQueryLatencyStats): ContextualizedQueryLatencyStats;

    /**
     * Encodes the specified ContextualizedQueryLatencyStats message. Does not implicitly {@link ContextualizedQueryLatencyStats.verify|verify} messages.
     * @param message ContextualizedQueryLatencyStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IContextualizedQueryLatencyStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ContextualizedQueryLatencyStats message, length delimited. Does not implicitly {@link ContextualizedQueryLatencyStats.verify|verify} messages.
     * @param message ContextualizedQueryLatencyStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IContextualizedQueryLatencyStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ContextualizedQueryLatencyStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ContextualizedQueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ContextualizedQueryLatencyStats;

    /**
     * Decodes a ContextualizedQueryLatencyStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ContextualizedQueryLatencyStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ContextualizedQueryLatencyStats;

    /**
     * Verifies a ContextualizedQueryLatencyStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a ContextualizedQueryLatencyStats message. Also converts values to other types if specified.
     * @param message ContextualizedQueryLatencyStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ContextualizedQueryLatencyStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ContextualizedQueryLatencyStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a ContextualizedTypeStats. */
export interface IContextualizedTypeStats {

    /** ContextualizedTypeStats context */
    context?: (IStatsContext|null);

    /** ContextualizedTypeStats perTypeStat */
    perTypeStat?: ({ [k: string]: ITypeStat }|null);
}

/** Represents a ContextualizedTypeStats. */
export class ContextualizedTypeStats implements IContextualizedTypeStats {

    /**
     * Constructs a new ContextualizedTypeStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IContextualizedTypeStats);

    /** ContextualizedTypeStats context. */
    public context?: (IStatsContext|null);

    /** ContextualizedTypeStats perTypeStat. */
    public perTypeStat: { [k: string]: ITypeStat };

    /**
     * Creates a new ContextualizedTypeStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ContextualizedTypeStats instance
     */
    public static create(properties?: IContextualizedTypeStats): ContextualizedTypeStats;

    /**
     * Encodes the specified ContextualizedTypeStats message. Does not implicitly {@link ContextualizedTypeStats.verify|verify} messages.
     * @param message ContextualizedTypeStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IContextualizedTypeStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ContextualizedTypeStats message, length delimited. Does not implicitly {@link ContextualizedTypeStats.verify|verify} messages.
     * @param message ContextualizedTypeStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IContextualizedTypeStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ContextualizedTypeStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ContextualizedTypeStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ContextualizedTypeStats;

    /**
     * Decodes a ContextualizedTypeStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ContextualizedTypeStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ContextualizedTypeStats;

    /**
     * Verifies a ContextualizedTypeStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a ContextualizedTypeStats message. Also converts values to other types if specified.
     * @param message ContextualizedTypeStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ContextualizedTypeStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ContextualizedTypeStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a FieldStat. */
export interface IFieldStat {

    /** FieldStat returnType */
    returnType?: (string|null);

    /** FieldStat errorsCount */
    errorsCount?: (number|null);

    /** FieldStat observedExecutionCount */
    observedExecutionCount?: (number|null);

    /** FieldStat estimatedExecutionCount */
    estimatedExecutionCount?: (number|null);

    /** FieldStat requestsWithErrorsCount */
    requestsWithErrorsCount?: (number|null);

    /** FieldStat latencyCount */
    latencyCount?: ($protobuf.ToArray<number>|number[]|null);
}

/** Represents a FieldStat. */
export class FieldStat implements IFieldStat {

    /**
     * Constructs a new FieldStat.
     * @param [properties] Properties to set
     */
    constructor(properties?: IFieldStat);

    /** FieldStat returnType. */
    public returnType: string;

    /** FieldStat errorsCount. */
    public errorsCount: number;

    /** FieldStat observedExecutionCount. */
    public observedExecutionCount: number;

    /** FieldStat estimatedExecutionCount. */
    public estimatedExecutionCount: number;

    /** FieldStat requestsWithErrorsCount. */
    public requestsWithErrorsCount: number;

    /** FieldStat latencyCount. */
    public latencyCount: number[];

    /**
     * Creates a new FieldStat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FieldStat instance
     */
    public static create(properties?: IFieldStat): FieldStat;

    /**
     * Encodes the specified FieldStat message. Does not implicitly {@link FieldStat.verify|verify} messages.
     * @param message FieldStat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IFieldStat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified FieldStat message, length delimited. Does not implicitly {@link FieldStat.verify|verify} messages.
     * @param message FieldStat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IFieldStat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a FieldStat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns FieldStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): FieldStat;

    /**
     * Decodes a FieldStat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns FieldStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): FieldStat;

    /**
     * Verifies a FieldStat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a FieldStat message. Also converts values to other types if specified.
     * @param message FieldStat
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: FieldStat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this FieldStat to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a TypeStat. */
export interface ITypeStat {

    /** TypeStat perFieldStat */
    perFieldStat?: ({ [k: string]: IFieldStat }|null);
}

/** Represents a TypeStat. */
export class TypeStat implements ITypeStat {

    /**
     * Constructs a new TypeStat.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITypeStat);

    /** TypeStat perFieldStat. */
    public perFieldStat: { [k: string]: IFieldStat };

    /**
     * Creates a new TypeStat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TypeStat instance
     */
    public static create(properties?: ITypeStat): TypeStat;

    /**
     * Encodes the specified TypeStat message. Does not implicitly {@link TypeStat.verify|verify} messages.
     * @param message TypeStat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITypeStat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TypeStat message, length delimited. Does not implicitly {@link TypeStat.verify|verify} messages.
     * @param message TypeStat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITypeStat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TypeStat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TypeStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TypeStat;

    /**
     * Decodes a TypeStat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TypeStat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TypeStat;

    /**
     * Verifies a TypeStat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a TypeStat message. Also converts values to other types if specified.
     * @param message TypeStat
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TypeStat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TypeStat to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a ReferencedFieldsForType. */
export interface IReferencedFieldsForType {

    /** ReferencedFieldsForType fieldNames */
    fieldNames?: (string[]|null);

    /** ReferencedFieldsForType isInterface */
    isInterface?: (boolean|null);
}

/** Represents a ReferencedFieldsForType. */
export class ReferencedFieldsForType implements IReferencedFieldsForType {

    /**
     * Constructs a new ReferencedFieldsForType.
     * @param [properties] Properties to set
     */
    constructor(properties?: IReferencedFieldsForType);

    /** ReferencedFieldsForType fieldNames. */
    public fieldNames: string[];

    /** ReferencedFieldsForType isInterface. */
    public isInterface: boolean;

    /**
     * Creates a new ReferencedFieldsForType instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReferencedFieldsForType instance
     */
    public static create(properties?: IReferencedFieldsForType): ReferencedFieldsForType;

    /**
     * Encodes the specified ReferencedFieldsForType message. Does not implicitly {@link ReferencedFieldsForType.verify|verify} messages.
     * @param message ReferencedFieldsForType message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IReferencedFieldsForType, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReferencedFieldsForType message, length delimited. Does not implicitly {@link ReferencedFieldsForType.verify|verify} messages.
     * @param message ReferencedFieldsForType message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IReferencedFieldsForType, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReferencedFieldsForType message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReferencedFieldsForType
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ReferencedFieldsForType;

    /**
     * Decodes a ReferencedFieldsForType message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReferencedFieldsForType
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ReferencedFieldsForType;

    /**
     * Verifies a ReferencedFieldsForType message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a ReferencedFieldsForType message. Also converts values to other types if specified.
     * @param message ReferencedFieldsForType
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ReferencedFieldsForType, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ReferencedFieldsForType to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Report. */
export interface IReport {

    /** Report header */
    header?: (IReportHeader|null);

    /** Report tracesPerQuery */
    tracesPerQuery?: ({ [k: string]: ITracesAndStats }|null);

    /** Report endTime */
    endTime?: (google.protobuf.ITimestamp|null);

    /** Report operationCount */
    operationCount?: (number|null);

    /** Report tracesPreAggregated */
    tracesPreAggregated?: (boolean|null);
}

/** Represents a Report. */
export class Report implements IReport {

    /**
     * Constructs a new Report.
     * @param [properties] Properties to set
     */
    constructor(properties?: IReport);

    /** Report header. */
    public header?: (IReportHeader|null);

    /** Report tracesPerQuery. */
    public tracesPerQuery: { [k: string]: ITracesAndStats };

    /** Report endTime. */
    public endTime?: (google.protobuf.ITimestamp|null);

    /** Report operationCount. */
    public operationCount: number;

    /** Report tracesPreAggregated. */
    public tracesPreAggregated: boolean;

    /**
     * Creates a new Report instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Report instance
     */
    public static create(properties?: IReport): Report;

    /**
     * Encodes the specified Report message. Does not implicitly {@link Report.verify|verify} messages.
     * @param message Report message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IReport, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Report message, length delimited. Does not implicitly {@link Report.verify|verify} messages.
     * @param message Report message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IReport, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Report message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Report
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Report;

    /**
     * Decodes a Report message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Report
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Report;

    /**
     * Verifies a Report message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a Report message. Also converts values to other types if specified.
     * @param message Report
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Report, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Report to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a ContextualizedStats. */
export interface IContextualizedStats {

    /** ContextualizedStats context */
    context?: (IStatsContext|null);

    /** ContextualizedStats queryLatencyStats */
    queryLatencyStats?: (IQueryLatencyStats|null);

    /** ContextualizedStats perTypeStat */
    perTypeStat?: ({ [k: string]: ITypeStat }|null);
}

/** Represents a ContextualizedStats. */
export class ContextualizedStats implements IContextualizedStats {

    /**
     * Constructs a new ContextualizedStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IContextualizedStats);

    /** ContextualizedStats context. */
    public context?: (IStatsContext|null);

    /** ContextualizedStats queryLatencyStats. */
    public queryLatencyStats?: (IQueryLatencyStats|null);

    /** ContextualizedStats perTypeStat. */
    public perTypeStat: { [k: string]: ITypeStat };

    /**
     * Creates a new ContextualizedStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ContextualizedStats instance
     */
    public static create(properties?: IContextualizedStats): ContextualizedStats;

    /**
     * Encodes the specified ContextualizedStats message. Does not implicitly {@link ContextualizedStats.verify|verify} messages.
     * @param message ContextualizedStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IContextualizedStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ContextualizedStats message, length delimited. Does not implicitly {@link ContextualizedStats.verify|verify} messages.
     * @param message ContextualizedStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IContextualizedStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ContextualizedStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ContextualizedStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ContextualizedStats;

    /**
     * Decodes a ContextualizedStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ContextualizedStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ContextualizedStats;

    /**
     * Verifies a ContextualizedStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a ContextualizedStats message. Also converts values to other types if specified.
     * @param message ContextualizedStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ContextualizedStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ContextualizedStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a TracesAndStats. */
export interface ITracesAndStats {

    /** TracesAndStats trace */
    trace?: ((ITrace|Uint8Array)[]|null);

    /** TracesAndStats statsWithContext */
    statsWithContext?: ($protobuf.ToArray<IContextualizedStats>|IContextualizedStats[]|null);

    /** TracesAndStats referencedFieldsByType */
    referencedFieldsByType?: ({ [k: string]: IReferencedFieldsForType }|null);

    /** TracesAndStats internalTracesContributingToStats */
    internalTracesContributingToStats?: ((ITrace|Uint8Array)[]|null);
}

/** Represents a TracesAndStats. */
export class TracesAndStats implements ITracesAndStats {

    /**
     * Constructs a new TracesAndStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITracesAndStats);

    /** TracesAndStats trace. */
    public trace: (ITrace|Uint8Array)[];

    /** TracesAndStats statsWithContext. */
    public statsWithContext: IContextualizedStats[];

    /** TracesAndStats referencedFieldsByType. */
    public referencedFieldsByType: { [k: string]: IReferencedFieldsForType };

    /** TracesAndStats internalTracesContributingToStats. */
    public internalTracesContributingToStats: (ITrace|Uint8Array)[];

    /**
     * Creates a new TracesAndStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TracesAndStats instance
     */
    public static create(properties?: ITracesAndStats): TracesAndStats;

    /**
     * Encodes the specified TracesAndStats message. Does not implicitly {@link TracesAndStats.verify|verify} messages.
     * @param message TracesAndStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITracesAndStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TracesAndStats message, length delimited. Does not implicitly {@link TracesAndStats.verify|verify} messages.
     * @param message TracesAndStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITracesAndStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TracesAndStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TracesAndStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TracesAndStats;

    /**
     * Decodes a TracesAndStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TracesAndStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TracesAndStats;

    /**
     * Verifies a TracesAndStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a plain object from a TracesAndStats message. Also converts values to other types if specified.
     * @param message TracesAndStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TracesAndStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TracesAndStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: number;

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
