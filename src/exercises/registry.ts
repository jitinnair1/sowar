import { Exercise } from '../types';

// 1. The Magic: Ask the bundler to find all index.ts files inside subfolders
// { eager: true } means "bundle them right now", don't wait for a network request.
const modules = import.meta.glob('./*/index.ts', { eager: true });

// 2. Transform the raw import object into a clean array
export const exercises: Exercise[] = Object.values(modules)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .map((module: any) => module.default) // Get the default export from each file
  .sort((a, b) => {
    // 3. Auto-Sort based on ID (assuming IDs are "1.1", "1.2", etc.)
    return parseFloat(a.id) - parseFloat(b.id);
  });
