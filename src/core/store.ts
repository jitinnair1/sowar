// src/core/store.ts
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { exercises } from '../exercises/registry';

interface AppState {
  currentExerciseId: string;
  completedIds: string[];
  markComplete: (id: string) => void;
  setCurrent: (id: string) => void;
}
export const store = createStore<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentExerciseId: exercises[0]?.id || "1.1",
      completedIds: [],

      // Actions
      markComplete: (id) => {
        const { completedIds } = get();
        if (!completedIds.includes(id)) {
          set({ completedIds: [...completedIds, id] });
        }
      },

      setCurrent: (id) => set({ currentExerciseId: id })
    }),
    {
      name: 'ocaml-tutor-storage',
      //maybe filter out later what all gets saved?
    }
  )
);
