import { promises as fs } from 'fs';
import path from 'path';
import type { BoardItem } from '../../core/src/types';
import type { BreakSeverity } from '../../core/src/types';

/**
 * Generate a human‑readable summary of the board. Each line contains
 * the thesis id, its type, severity, review due status and a short
 * note. This text is intended for quick inspection in logs or
 * dashboards. For more structured output consider using the JSON
 * representation returned directly from evaluateBoard().
 */
export function generateBoardReport(board: BoardItem[]): string {
  const lines: string[] = [];
  for (const item of board) {
    const sev = item.severity;
    const due = item.reviewDue ? 'REVIEW_DUE' : 'OK';
    const note = item.notes.replace(/\n/g, '; ');
    lines.push(`${item.thesis.id} [${item.thesis.type}] severity=${sev} review=${due} notes=${note}`);
  }
  return lines.join('\n');
}

/**
 * Persist a board report to disk. The report is saved both as a
 * human‑readable text file and as a JSON file containing the raw
 * board items. The directory structure is created if needed.
 */
export async function saveBoardReport(board: BoardItem[], reportDir: string, basename: string): Promise<void> {
  try {
    await fs.mkdir(reportDir, { recursive: true });
  } catch {
    /* ignore */
  }
  const jsonPath = path.join(reportDir, `${basename}.json`);
  const textPath = path.join(reportDir, `${basename}.txt`);
  await fs.writeFile(jsonPath, JSON.stringify(board, null, 2), 'utf8');
  const text = generateBoardReport(board);
  await fs.writeFile(textPath, text, 'utf8');
}