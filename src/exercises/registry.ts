import { Exercise } from '../core/types';

// 1. Explicitly import each exercise module
// This guarantees the bundler includes the files and Typescript checks them.
import helloWorld from './01_hello_world/index';
// import variables from './02_variables/index'; // Example for later

// 2. Add them to the array manually
export const exercises: Exercise[] = [
    helloWorld,
    intsVsFloats,
];

// Helper to find exercise by ID
export const getExercise = (id: string) => {
    return exercises.find(e => e.id === id) || exercises[0];
};
