import { Exercise } from '../core/types';

// 1. Explicitly import each exercise module
// This guarantees the bundler includes the files and Typescript checks them.
import helloWorld from './01_hello_world/index';
import intsVsFloats from './02_ints_vs_floats/index';
import currying from './03_currying/index';

// 2. Add them to the array manually
export const exercises: Exercise[] = [
    helloWorld,
    intsVsFloats,
    currying
];

// Helper to find exercise by ID
export const getExercise = (id: string) => {
    return exercises.find(e => e.id === id) || exercises[0];
};
