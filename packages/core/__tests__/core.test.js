const core = require('../dist/index.js');

describe('core:createThesis and evaluateThesis', () => {
  test('createThesis populates id and timestamps', () => {
    const thesis = core.createThesis({
      type: 'setup',
      description: 'desc',
      supports: ['support'],
      killConditions: ['price drop 10%'],
      reviewCadenceDays: 1,
      horizonDays: 5
    });
    expect(thesis.id).toBeDefined();
    expect(typeof thesis.createdAt).toBe('string');
    expect(thesis.lastReviewedAt).toBeDefined();
  });

  test('evaluateThesis uses kill condition threshold', () => {
    const thesis = core.createThesis({
      type: 'setup',
      description: 'desc',
      supports: ['support'],
      killConditions: ['price drop 20%'],
      reviewCadenceDays: 1,
      horizonDays: 5
    });
    const events = [
      {
        id: 'e1',
        type: 'price',
        description: 'drop 10%',
        timestamp: new Date().toISOString(),
        attributes: { percentageChange: -0.10 }
      },
      {
        id: 'e2',
        type: 'price',
        description: 'drop 25%',
        timestamp: new Date().toISOString(),
        attributes: { percentageChange: -0.25 }
      }
    ];
    const drifts = core.evaluateThesis(thesis, events);
    // first event should be soft, second hard
    expect(drifts.find((d) => d.severity === 'SOFT')).toBeDefined();
    expect(drifts.find((d) => d.severity === 'HARD')).toBeDefined();
  });
});