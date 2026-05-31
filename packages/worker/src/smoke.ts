import { resetData, addThesis, addEvent } from '../../data/dist/index.js';
import { createThesis } from '../../core/dist/index.js';
import { evaluateBoard } from '../../workflows/dist/index.js';
import { saveBoardReport, generateBoardReport } from '../../reports/dist/index.js';

/**
 * Smoke test script. This script resets the data store, creates three
 * theses, injects synthetic events that lead to one soft break and one
 * hard break, evaluates the board and writes a report into
 * fixtures/golden. It logs a short summary to stdout.
 */
async function smoke() {
  await resetData();
  // create theses with different kill thresholds
  const thesis1 = createThesis({
    type: 'setup',
    description: 'Group leadership continuation and constructive pullbacks',
    supports: ['group leadership continues', 'constructive pullbacks'],
    killConditions: ['price drop 10%'],
    reviewCadenceDays: 1,
    horizonDays: 10
  });
  const thesis2 = createThesis({
    type: 'catalyst',
    description: 'Product launch expected to beat expectations',
    supports: ['innovative product', 'strong demand indications'],
    killConditions: ['price drop 20%', 'launch delayed'],
    reviewCadenceDays: 1,
    horizonDays: 20
  });
  const thesis3 = createThesis({
    type: 'macro',
    description: 'Macro expansion with stable rates',
    supports: ['GDP growth', 'stable rates'],
    killConditions: ['price drop 50%', 'rate hikes resume'],
    reviewCadenceDays: 1,
    horizonDays: 30
  });
  await addThesis(thesis1);
  await addThesis(thesis2);
  await addThesis(thesis3);

  const now = new Date().toISOString();
  // event causing soft break for thesis1 (threshold 10% -> half threshold 5%, change -8% triggers soft)
  await addEvent({
    id: 'evt-soft',
    type: 'price',
    description: 'Price drop -8%',
    timestamp: now,
    attributes: { percentageChange: -0.08 }
  });
  // event causing hard break for thesis2 (threshold 20%, change -25% triggers hard)
  await addEvent({
    id: 'evt-hard',
    type: 'price',
    description: 'Price drop -25%',
    timestamp: now,
    attributes: { percentageChange: -0.25 }
  });
  // benign event for thesis3
  await addEvent({
    id: 'evt-benign',
    type: 'price',
    description: 'Price rise 5%',
    timestamp: now,
    attributes: { percentageChange: 0.05 }
  });
  // evaluate board
  const board = await evaluateBoard();
  // write report to fixtures/golden
  const reportDir = 'fixtures/golden';
  const basename = 'smoke-board';
  await saveBoardReport(board, reportDir, basename);
  // output summary
  // eslint-disable-next-line no-console
  console.log('Smoke test board:');
  // eslint-disable-next-line no-console
  console.log(generateBoardReport(board));
}

if (require.main === module) {
  smoke().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}