// src/core/store.ts
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { exercises } from '../exercises/registry';

export interface AppState {
  currentExerciseId: string;
  completedIds: string[];
  markComplete: (id: string) => void;
  setCurrent: (id: string) => void;
  userCode: Record<string, string>;
  saveUserCode: (id: string, code: string) => void;
}

export const store = createStore<AppState>()(
  persist(
    (set, get) => ({
      //initial state
      currentExerciseId: exercises[0]?.id || "1.1",
      completedIds: [],
      userCode: {},

      //actions
      markComplete: (id) => {
        const { completedIds } = get();
        if (!completedIds.includes(id)) {
          set({ completedIds: [...completedIds, id] });
        }
      },

      setCurrent: (id) => set({ currentExerciseId: id }),

      saveUserCode: (id: string, code: string) => set({ userCode: { ...get().userCode, [id]: code } })

    }),
    {
      name: 'sowar-storage',
      //todo: maybe filter out later what all gets saved?
    }
  )
);
