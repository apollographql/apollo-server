export class DurationHistogram {
  private readonly buckets: number[];
  public static readonly BUCKET_COUNT = 384;
  public static readonly EXPONENT_LOG = Math.log(1.1);

  public toArray(): number[] {
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
        outputArray.push(value);
        bufferedZeroes = 0;
      }
    }
    return outputArray;
  }

  static durationToBucket(durationNs: number): number {
    const log = Math.log(durationNs / 1000.0);
    const unboundedBucket = Math.ceil(log / DurationHistogram.EXPONENT_LOG);

    // Comapre <= 0 to catch -0
    return (unboundedBucket <= 0 || Number.isNaN(unboundedBucket)) ?
      0 :
      (unboundedBucket >= DurationHistogram.BUCKET_COUNT) ? DurationHistogram.BUCKET_COUNT - 1 : unboundedBucket;
  }


  public incrementDuration(durationNs: number) {
    this.incrementBucket(DurationHistogram.durationToBucket(durationNs));
  }

  public incrementBucket(bucket: number) {
    this.buckets[bucket]++;
  }

  public combine(otherHistogram: DurationHistogram) {
    for (let i = 0; i < otherHistogram.buckets.length; i++) {
      this.buckets[i] += otherHistogram.buckets[i];
    }
  }

  constructor(buckets?: number[]) {
    this.buckets = Array<number>(DurationHistogram.BUCKET_COUNT).fill(0);
    if (buckets) {
      buckets.forEach((val, index) => this.buckets[index] = val);
    }
  }
}
