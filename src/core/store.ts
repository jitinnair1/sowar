// src/core/store.ts
import { createStore } from 'zustand/vanilla'; // Note: vanilla import
import { persist } from 'zustand/middleware';
import { exercises } from '../exercises'; // The array of all exercises

interface AppState {
  currentExerciseId: string;
  completedIds: string[];
  markComplete: (id: string) => void;
  setCurrent: (id: string) => void;
}

export const store = createStore<AppState>()(
  persist(
    (set) => ({
      currentExerciseId: exercises[0].id,
      completedIds: [],
      
      markComplete: (id) => set((state) => ({ 
        completedIds: [...new Set([...state.completedIds, id])] 
      })),
      
      setCurrent: (id) => set({ currentExerciseId: id })
    }),
    { name: 'ocaml-tutor-storage' }
  )
);
