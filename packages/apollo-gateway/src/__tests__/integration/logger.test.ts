import { ApolloGateway } from '../..';
import { Logger } from "apollo-server-types";
import { PassThrough } from "stream";

import * as winston from "winston";
import WinstonTransport from 'winston-transport';
import * as bunyan from "bunyan";
import * as loglevel from "loglevel";
// We are testing an older version of `log4js` which uses older ECMAScript
// in order to still support testing on Node.js 6.
// This should be updated when bump the semver major for AS3.
import * as log4js from "log4js";

const LOWEST_LOG_LEVEL = "debug";

const KNOWN_DEBUG_MESSAGE = "Checking service definitions...";

async function triggerKnownDebugMessage(logger: Logger) {
  // Trigger a known error.
  // This is a bit brittle since it merely leverages a known debug log
  // message outside of the constructor, but it seemed worth testing
  // the compatibility with `ApolloGateway` itself rather than generically.
  // The error does not matter, so it is caught and ignored.
  await new ApolloGateway({ logger }).load().catch(_e => {});
}

describe("logger", () => {
  it("works with 'winston'", async () => {
    const sink = jest.fn();
    const transport = new class extends WinstonTransport {
      constructor() {
        super({
          format: winston.format.json(),
        });
      }

      log(info: any) {
        sink(info);
      }
    };

    const logger = winston.createLogger({ level: 'debug' }).add(transport);

    await triggerKnownDebugMessage(logger);

    expect(sink).toHaveBeenCalledWith(expect.objectContaining({
      level: LOWEST_LOG_LEVEL,
      message: KNOWN_DEBUG_MESSAGE,
    }));
  });

  it("works with 'bunyan'", async () => {
    const sink = jest.fn();

    // Bunyan uses streams for its logging implementations.
    const writable = new PassThrough();
    writable.on("data", data => sink(JSON.parse(data.toString())));

    const logger = bunyan.createLogger({
      name: "test-logger-bunyan",
      streams: [{
        level: LOWEST_LOG_LEVEL,
        stream: writable,
      }]
    });

    await triggerKnownDebugMessage(logger);

    expect(sink).toHaveBeenCalledWith(expect.objectContaining({
      level: bunyan.DEBUG,
      msg: KNOWN_DEBUG_MESSAGE,
    }));
  });

  it("works with 'loglevel'", async () => {
    const sink = jest.fn();

    const logger = loglevel.getLogger("test-logger-loglevel")
    logger.methodFactory = (_methodName, level): loglevel.LoggingMethod =>
      (message) => sink({ level, message });

    // The `setLevel` method must be called after overwriting `methodFactory`.
    // This is an intentional API design pattern of the loglevel package:
    // https://www.npmjs.com/package/loglevel#writing-plugins
    logger.setLevel(loglevel.levels.DEBUG);

    await triggerKnownDebugMessage(logger);

    expect(sink).toHaveBeenCalledWith({
      level: loglevel.levels.DEBUG,
      message: KNOWN_DEBUG_MESSAGE,
    });
  });

  it("works with 'log4js'", async () => {
    const sink = jest.fn();

    log4js.configure({
      appenders: {
        custom: {
          type: {
            configure: () =>
              (loggingEvent: log4js.LoggingEvent) => sink(loggingEvent)
          }
        }
      },
      categories: {
        default: {
          appenders: ['custom'],
          level: LOWEST_LOG_LEVEL,
        }
      }
    });

    const logger = log4js.getLogger();
    logger.level = LOWEST_LOG_LEVEL;

    await triggerKnownDebugMessage(logger);

    expect(sink).toHaveBeenCalledWith(expect.objectContaining({
      level: log4js.levels.DEBUG,
      data: [KNOWN_DEBUG_MESSAGE],
    }));
  });
});
