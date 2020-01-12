import {DurationHistogram} from "../durationHistogram";

describe("Duration histogram tests", () => {
  it('generateEmptyHistogram', () => {
    let emptyDurationHistogram = new DurationHistogram();
    expect([]).toEqual(emptyDurationHistogram.serialize());
  });

  it('nonEmptyHistogram', () => {
    let nonEmptyDurationHistogram = new DurationHistogram();
    nonEmptyDurationHistogram.increment(100);
    expect([-100, 1]).toEqual(nonEmptyDurationHistogram.serialize());

    nonEmptyDurationHistogram.increment(102);
    expect([-100, 1, 0, 1]).toEqual(nonEmptyDurationHistogram.serialize());

    nonEmptyDurationHistogram.increment(382);
    expect([-100, 1, 0, 1, -279, 1]).toEqual(nonEmptyDurationHistogram.serialize());
  });

  it('combineHistogram', () => {
    let firstHistogram = new DurationHistogram();
    firstHistogram.increment(20);
    let secondHistogram = new DurationHistogram();
    secondHistogram.increment(40);

    firstHistogram.combine(secondHistogram);

    expect([-20, 1, -19, 1]).toEqual(firstHistogram.serialize());
  });

});
