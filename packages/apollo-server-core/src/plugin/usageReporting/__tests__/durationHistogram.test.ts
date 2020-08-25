import { DurationHistogram } from '../durationHistogram';

describe('Duration histogram tests', () => {
  it('generateEmptyHistogram', () => {
    let emptyDurationHistogram = new DurationHistogram();
    expect([]).toEqual(emptyDurationHistogram.toArray());
  });

  it('nonEmptyHistogram', () => {
    let nonEmptyDurationHistogram = new DurationHistogram();
    nonEmptyDurationHistogram.incrementBucket(100);
    expect([-100, 1]).toEqual(nonEmptyDurationHistogram.toArray());

    nonEmptyDurationHistogram.incrementBucket(102);
    expect([-100, 1, 0, 1]).toEqual(nonEmptyDurationHistogram.toArray());

    nonEmptyDurationHistogram.incrementBucket(382);
    expect([-100, 1, 0, 1, -279, 1]).toEqual(
      nonEmptyDurationHistogram.toArray(),
    );
  });

  it('testToArray', () => {
    function assertInitArrayHelper(
      expected: number[],
      buckets: number[],
      initSize = 118,
    ) {
      expect(new DurationHistogram({ initSize, buckets }).toArray()).toEqual(
        expected,
      );
    }

    function assertInsertValueHelper(
      expected: number[],
      buckets: number[],
      initSize = 118,
    ) {
      let histogram = new DurationHistogram({ initSize });
      buckets.forEach((val, bucket) => {
        histogram.incrementBucket(bucket, val);
      });
      expect(histogram.toArray()).toEqual(expected);
    }

    function metaToArrayFuzzer(assertToArrayHelper: any, initSize = 118) {
      assertToArrayHelper([], [], initSize);
      assertToArrayHelper([], [0], initSize);
      assertToArrayHelper([], [0, 0, 0, 0], initSize);
      assertToArrayHelper([1], [1], initSize);
      assertToArrayHelper([100_000_000_000], [100_000_000_000], initSize);
      assertToArrayHelper([1, 0, 5], [1, 0, 5], initSize);
      assertToArrayHelper([1, -2, 5], [1, 0, 0, 5], initSize);
      assertToArrayHelper([0, 5], [0, 5], initSize);
      assertToArrayHelper(
        [0, 1, -2, 2, -3, 3, -2, 4, 0, 5],
        [0, 1, 0, 0, 2, 0, 0, 0, 3, 0, 0, 4, 0, 5, 0],
        initSize,
      );
      assertToArrayHelper([-2, 5], [0, 0, 5], initSize);
      assertToArrayHelper([-3, 5], [0, 0, 0, 5], initSize);
      assertToArrayHelper([-2, 5, -3, 10], [0, 0, 5, 0, 0, 0, 10], initSize);
    }

    metaToArrayFuzzer(assertInitArrayHelper);
    metaToArrayFuzzer(assertInitArrayHelper, 1);
    metaToArrayFuzzer(assertInitArrayHelper, 5);

    metaToArrayFuzzer(assertInsertValueHelper);
    metaToArrayFuzzer(assertInsertValueHelper, 1);
    metaToArrayFuzzer(assertInsertValueHelper, 5);
  });

  it('combineHistogram', () => {
    let firstHistogram = new DurationHistogram({ initSize: 0 });
    firstHistogram.incrementBucket(20);
    let secondHistogram = new DurationHistogram();
    secondHistogram.incrementBucket(40);
    secondHistogram.incrementBucket(100, 10);

    firstHistogram.combine(secondHistogram);

    expect([-20, 1, -19, 1, -59, 10]).toEqual(firstHistogram.toArray());
  });

  it('bucketZeroToOne', () => {
    expect(DurationHistogram.durationToBucket(-1)).toEqual(0);
    expect(DurationHistogram.durationToBucket(0)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1)).toEqual(0);
    expect(DurationHistogram.durationToBucket(999)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1000)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1001)).toEqual(1);
  });

  it('bucketOneToTwo', () => {
    expect(DurationHistogram.durationToBucket(1100)).toEqual(1);
    expect(DurationHistogram.durationToBucket(1101)).toEqual(2);
  });

  it('bucketToThreshold', () => {
    expect(DurationHistogram.durationToBucket(10000)).toEqual(25);
    expect(DurationHistogram.durationToBucket(10834)).toEqual(25);
    expect(DurationHistogram.durationToBucket(10835)).toEqual(26);
  });

  it('bucketForCommonTimes', () => {
    expect(DurationHistogram.durationToBucket(1e5)).toEqual(49);
    expect(DurationHistogram.durationToBucket(1e6)).toEqual(73);
    expect(DurationHistogram.durationToBucket(1e9)).toEqual(145);
  });

  it('testLastBucket', () => {
    // Test an absurdly large number gets stuck in the last bucket
    expect(DurationHistogram.durationToBucket(1e64)).toEqual(383);
  });
});
