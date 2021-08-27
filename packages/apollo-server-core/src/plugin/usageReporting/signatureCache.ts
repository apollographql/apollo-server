import LRUCache from 'lru-cache';
import type { Logger } from 'apollo-server-types';

export function createSignatureCache({
  logger,
}: {
  logger: Logger;
}): LRUCache<string, string> {
  let lastSignatureCacheWarn: Date;
  let lastSignatureCacheDisposals: number = 0;
  return new LRUCache<string, string>({
    // Calculate the length of cache objects by the JSON.stringify byteLength.
    length(obj) {
      return Buffer.byteLength(JSON.stringify(obj), 'utf8');
    },
    // 3MiB limit, very much approximately since we can't be sure how V8 might
    // be storing these strings internally. Though this should be enough to
    // store a fair amount of operation signatures (~10000?), depending on their
    // overall complexity. A future version of this might expose some
    // configuration option to grow the cache, but ideally, we could do that
    // dynamically based on the resources available to the server, and not add
    // more configuration surface area. Hopefully the warning message will allow
    // us to evaluate the need with more validated input from those that receive
    // it.
    max: Math.pow(2, 20) * 3,
    dispose() {
      // Count the number of disposals between warning messages.
      lastSignatureCacheDisposals++;

      // Only show a message warning about the high turnover every 60 seconds.
      if (
        !lastSignatureCacheWarn ||
        new Date().getTime() - lastSignatureCacheWarn.getTime() > 60000
      ) {
        // Log the time that we last displayed the message.
        lastSignatureCacheWarn = new Date();
        logger.warn(
          [
            'This server is processing a high number of unique operations.  ',
            `A total of ${lastSignatureCacheDisposals} records have been `,
            'ejected from the ApolloServerPluginUsageReporting signature cache in the past ',
            'interval.  If you see this warning frequently, please open an ',
            'issue on the Apollo Server repository.',
          ].join(''),
        );

        // Reset the disposal counter for the next message interval.
        lastSignatureCacheDisposals = 0;
      }
    },
  });
}

export function signatureCacheKey(queryHash: string, operationName: string) {
  return `${queryHash}${operationName && ':' + operationName}`;
}
