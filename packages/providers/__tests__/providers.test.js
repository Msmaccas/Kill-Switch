const { FixtureEventProvider, PriceEventGenerator } = require('..');

describe('providers', () => {
  test('fixture provider returns NOT_AVAILABLE for missing file', async () => {
    const provider = new FixtureEventProvider('nonexistent.json');
    const result = await provider.fetch();
    expect(result.state).toBe('NOT_AVAILABLE');
  });
  test('price event generator emits events sequentially', async () => {
    const generator = new PriceEventGenerator([-0.1, -0.2], 'ABC');
    const first = await generator.fetch();
    expect(first.value.length).toBe(1);
    expect(first.value[0].attributes.percentageChange).toBe(-0.1);
    const second = await generator.fetch();
    expect(second.value[0].attributes.percentageChange).toBe(-0.2);
    // subsequent call yields no events
    const third = await generator.fetch();
    expect(third.value.length).toBe(0);
  });
});