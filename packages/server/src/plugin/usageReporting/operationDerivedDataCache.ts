import type { Logger } from '@apollo/utils.logger';
import type { ReferencedFieldsByType } from '@apollo/utils.usagereporting';
import { LRUCache } from 'lru-cache';

export interface OperationDerivedData {
  signature: string;
  referencedFieldsByType: ReferencedFieldsByType;
}

export function createOperationDerivedDataCache({
  logger,
}: {
  logger: Logger;
}): LRUCache<string, OperationDerivedData> {
  let lastWarn: Date;
  let lastDisposals = 0;
  return new LRUCache<string, OperationDerivedData>({
    // Calculate the length of cache objects by the JSON.stringify byteLength.
    sizeCalculation(obj) {
      return Buffer.byteLength(JSON.stringify(obj), 'utf8');
    },
    // 10MiB limit, very much approximately since we can't be sure how V8 might
    // be storing this data internally. Though this should be enough to store a
    // fair amount of operation data, depending on their overall complexity. A
    // future version of this might expose some configuration option to grow the
    // cache, but ideally, we could do that dynamically based on the resources
    // available to the server, and not add more configuration surface area.
    // Hopefully the warning message will allow us to evaluate the need with
    // more validated input from those that receive it.
    maxSize: Math.pow(2, 20) * 10,
    dispose() {
      // Count the number of disposals between warning messages.
      lastDisposals++;

      // Only show a message warning about the high turnover every 60 seconds.
      if (!lastWarn || new Date().getTime() - lastWarn.getTime() > 60000) {
        // Log the time that we last displayed the message.
        lastWarn = new Date();
        logger.warn(
          [
            'This server is processing a high number of unique operations.  ',
            `A total of ${lastDisposals} records have been `,
            'ejected from the ApolloServerPluginUsageReporting signature cache in the past ',
            'interval.  If you see this warning frequently, please open an ',
            'issue on the Apollo Server repository.',
          ].join(''),
        );

        // Reset the disposal counter for the next message interval.
        lastDisposals = 0;
      }
    },
  });
}

export function operationDerivedDataCacheKey(
  queryHash: string,
  operationName: string,
) {
  return `${queryHash}${operationName && ':' + operationName}`;
}
