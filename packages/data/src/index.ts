import { promises as fs } from 'fs';
import path from 'path';
import type { Thesis, Event } from '../../core/src/types';

// Determine the data directory from the environment variable. If not
// provided, default to a "data" folder relative to the project root.
const DEFAULT_DIR = path.join(process.cwd(), 'data');
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DIR;
const THESIS_FILE = path.join(DATA_DIR, 'theses.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function loadTheses(): Promise<Thesis[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(THESIS_FILE, 'utf8');
    return JSON.parse(raw) as Thesis[];
  } catch (err: any) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new Error(`Failed to parse thesis file: ${err}`);
  }
}

export async function saveTheses(theses: Thesis[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(THESIS_FILE, JSON.stringify(theses, null, 2), 'utf8');
}

export async function addThesis(thesis: Thesis): Promise<void> {
  const theses = await loadTheses();
  theses.push(thesis);
  await saveTheses(theses);
}

export async function loadEvents(): Promise<Event[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf8');
    return JSON.parse(raw) as Event[];
  } catch (err: any) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new Error(`Failed to parse events file: ${err}`);
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

export async function addEvent(event: Event): Promise<void> {
  const events = await loadEvents();
  events.push(event);
  await saveEvents(events);
}

export async function resetData(): Promise<void> {
  // remove existing files to start from scratch
  await ensureDataDir();
  try {
    await fs.unlink(THESIS_FILE);
  } catch {}
  try {
    await fs.unlink(EVENTS_FILE);
  } catch {}
}