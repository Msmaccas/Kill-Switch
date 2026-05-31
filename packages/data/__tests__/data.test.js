const data = require('../dist/index.js');
const core = require('../../core/dist/index.js');

describe('data storage', () => {
  beforeEach(async () => {
    await data.resetData();
  });
  test('addThesis and loadTheses', async () => {
    const thesis = core.createThesis({
      type: 'setup',
      description: 'desc',
      supports: ['s'],
      killConditions: ['price drop 10%'],
      reviewCadenceDays: 1,
      horizonDays: 5
    });
    await data.addThesis(thesis);
    const list = await data.loadTheses();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(thesis.id);
  });
  test('addEvent and loadEvents', async () => {
    const event = {
      id: 'e',
      type: 'price',
      description: 'drop',
      timestamp: new Date().toISOString(),
      attributes: { percentageChange: -0.05 }
    };
    await data.addEvent(event);
    const list = await data.loadEvents();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(event.id);
  });
});