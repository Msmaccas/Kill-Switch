const data = require('../../data/dist/index.js');
const core = require('../../core/dist/index.js');
const workflows = require('../dist/index.js');

describe('workflows', () => {
  beforeEach(async () => {
    await data.resetData();
  });
  test('evaluateBoard reflects drift severities', async () => {
    const t1 = core.createThesis({
      type: 'setup',
      description: 'desc',
      supports: ['s'],
      killConditions: ['price drop 10%'],
      reviewCadenceDays: 1,
      horizonDays: 5
    });
    await data.addThesis(t1);
    // add event causing soft break
    await data.addEvent({
      id: 'e1',
      type: 'price',
      description: 'drop 6%',
      timestamp: new Date().toISOString(),
      attributes: { percentageChange: -0.06 }
    });
    const board = await workflows.evaluateBoard();
    expect(board.length).toBe(1);
    expect(board[0].severity).toBe('SOFT');
  });
});