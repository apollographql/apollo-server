import { DurationHistogram } from "../durationHistogram";

function assertToArrayHelper(expected: number[], buckets: number[]) {
  expect(new DurationHistogram(buckets).toArray()).toEqual(expected);
}

describe("Duration histogram tests", () => {
  it("generateEmptyHistogram", () => {
    let emptyDurationHistogram = new DurationHistogram();
    expect([]).toEqual(emptyDurationHistogram.toArray());
  });

  it("nonEmptyHistogram", () => {
    let nonEmptyDurationHistogram = new DurationHistogram();
    nonEmptyDurationHistogram.incrementBucket(100);
    expect([-100, 1]).toEqual(nonEmptyDurationHistogram.toArray());

    nonEmptyDurationHistogram.incrementBucket(102);
    expect([-100, 1, 0, 1]).toEqual(nonEmptyDurationHistogram.toArray());

    nonEmptyDurationHistogram.incrementBucket(382);
    expect([-100, 1, 0, 1, -279, 1]).toEqual(nonEmptyDurationHistogram.toArray());
  });

  it("testToArray", () => {
    assertToArrayHelper([], []);
    assertToArrayHelper([], [0]);
    assertToArrayHelper([], [0, 0, 0, 0]);
    assertToArrayHelper([1], [1]);
    assertToArrayHelper([100_000_000_000], [100_000_000_000]);
    assertToArrayHelper([1, 0, 5], [1, 0, 5]);
    assertToArrayHelper([1, -2, 5], [1, 0, 0, 5]);
    assertToArrayHelper([0, 5], [0, 5]);
    assertToArrayHelper([0, 1, -2, 2, -3, 3, -2, 4, 0, 5], [0, 1, 0, 0, 2, 0, 0, 0, 3, 0, 0, 4, 0, 5, 0]);
    assertToArrayHelper([-2, 5], [0, 0, 5]);
    assertToArrayHelper([-3, 5], [0, 0, 0, 5]);
    assertToArrayHelper([-2, 5, -3, 10], [0, 0, 5, 0, 0, 0, 10]);
  });

  it("combineHistogram", () => {
    let firstHistogram = new DurationHistogram();
    firstHistogram.incrementBucket(20);
    let secondHistogram = new DurationHistogram();
    secondHistogram.incrementBucket(40);

    firstHistogram.combine(secondHistogram);

    expect([-20, 1, -19, 1]).toEqual(firstHistogram.toArray());
  });

  it("bucketZeroToOne", () => {
    expect(DurationHistogram.durationToBucket(-1)).toEqual(0);
    expect(DurationHistogram.durationToBucket(0)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1)).toEqual(0);
    expect(DurationHistogram.durationToBucket(999)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1000)).toEqual(0);
    expect(DurationHistogram.durationToBucket(1001)).toEqual(1);
  });

  it("bucketOneToTwo", () => {
    expect(DurationHistogram.durationToBucket(1100)).toEqual(1);
    expect(DurationHistogram.durationToBucket(1101)).toEqual(2);
  });

  it("bucketToThreshold", () => {
    expect(DurationHistogram.durationToBucket(10000)).toEqual(25);
    expect(DurationHistogram.durationToBucket(10834)).toEqual(25);
    expect(DurationHistogram.durationToBucket(10835)).toEqual(26);
  });

  it("bucketForCommonTimes", () => {
    expect(DurationHistogram.durationToBucket(1e5)).toEqual(49);
    expect(DurationHistogram.durationToBucket(1e6)).toEqual(73);
    expect(DurationHistogram.durationToBucket(1e9)).toEqual(145);
  });

  it("testLastBucket", () => {
    // Test an absurdly large number gets stuck in the last bucket
    expect(DurationHistogram.durationToBucket(1e64)).toEqual(383);
  });
});
