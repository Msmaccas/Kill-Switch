const reports = require('..');

describe('reports', () => {
  test('generateBoardReport produces human readable lines', () => {
    const board = [
      {
        thesis: { id: 'id1', type: 'setup', supports: [], killConditions: [], description: '', reviewCadenceDays: 1, horizonDays: 1, createdAt: '', lastReviewedAt: '' },
        severity: 'SOFT',
        lastUpdate: new Date().toISOString(),
        notes: 'note',
        reviewDue: false
      }
    ];
    const text = reports.generateBoardReport(board);
    expect(typeof text).toBe('string');
    expect(text).toContain('id1');
  });
});