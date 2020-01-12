export class DurationHistogram {
  private buckets: number[];

  public serialize(): number[] {
    let bufferedZeroes = 0;
    let outputArray = Array<number>();

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

  public increment(bucket: number) {
    this.buckets[bucket]++;
  }

  public combine(otherHistogram: DurationHistogram) {
    for (let i = 0; i < otherHistogram.buckets.length; i++)  {
      this.buckets[i] += otherHistogram.buckets[i]
    }
  }

  constructor(buckets?: number[]) {
    if (buckets) {
      this.buckets = Object.assign([], buckets);
    } else {
     this.buckets = Array<number>(383).fill(0);
    }
  }

}
