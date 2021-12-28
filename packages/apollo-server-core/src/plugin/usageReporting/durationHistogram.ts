export interface DurationHistogramOptions {
  initSize?: number;
  buckets?: number[];
}
export class DurationHistogram {
  // Note that it's legal for the values in "buckets" to be non-integers; they
  // will be floored by toArray (which is called by the protobuf encoder).
  // (We take advantage of this for field latencies specifically, because
  // the ability to return a non-1 weight from fieldLevelInstrumentation
  // means we want to build up our histograms as floating-point rather than
  // rounding after every operation.)
  private readonly buckets: number[];
  static readonly BUCKET_COUNT = 384;
  static readonly EXPONENT_LOG = Math.log(1.1);

  toArray(): number[] {
    let bufferedZeroes = 0;
    const outputArray: number[] = [];

    for (const value of this.buckets) {
      if (value === 0) {
        bufferedZeroes++;
      } else {
        if (bufferedZeroes === 1) {
          outputArray.push(0);
        } else if (bufferedZeroes !== 0) {
          outputArray.push(-bufferedZeroes);
        }
        outputArray.push(Math.floor(value));
        bufferedZeroes = 0;
      }
    }
    return outputArray;
  }

  static durationToBucket(durationNs: number): number {
    const log = Math.log(durationNs / 1000.0);
    const unboundedBucket = Math.ceil(log / DurationHistogram.EXPONENT_LOG);

    // Compare <= 0 to catch -0 and -infinity
    return unboundedBucket <= 0 || Number.isNaN(unboundedBucket)
      ? 0
      : unboundedBucket >= DurationHistogram.BUCKET_COUNT
      ? DurationHistogram.BUCKET_COUNT - 1
      : unboundedBucket;
  }

  incrementDuration(durationNs: number, value = 1): DurationHistogram {
    this.incrementBucket(DurationHistogram.durationToBucket(durationNs), value);
    return this;
  }

  incrementBucket(bucket: number, value = 1) {
    if (bucket >= DurationHistogram.BUCKET_COUNT) {
      // Since we don't have fixed size arrays I'd rather throw the error manually
      throw Error('Bucket is out of bounds of the buckets array');
    }

    // Extend the array if we haven't gotten it long enough to handle the new bucket
    if (bucket >= this.buckets.length) {
      const oldLength = this.buckets.length;
      this.buckets.length = bucket + 1;
      this.buckets.fill(0, oldLength);
    }

    this.buckets[bucket] += value;
  }

  combine(otherHistogram: DurationHistogram) {
    for (let i = 0; i < otherHistogram.buckets.length; i++) {
      this.incrementBucket(i, otherHistogram.buckets[i]);
    }
  }

  constructor(options?: DurationHistogramOptions) {
    const initSize = options?.initSize || 74;
    const buckets = options?.buckets;

    const arrayInitSize = Math.max(buckets?.length || 0, initSize);

    this.buckets = Array<number>(arrayInitSize).fill(0);

    if (buckets) {
      buckets.forEach((val, index) => (this.buckets[index] = val));
    }
  }
}
