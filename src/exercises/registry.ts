import { Exercise } from '../core/types';
import { Chapter } from '../core/types';

//individual exercises
import helloWorld from './01_hello_world/index';
import intsVsFloats from './02_ints_vs_floats/index';
import functions from './03_functions/index';
import currying from './04_currying/index';

export const curriculum: Chapter[] = [
    {
        id: 'basics',
        title: 'Basics',
        exercises: [
            helloWorld,
            intsVsFloats,
            functions,
        ]
    },
    {
        id: 'keyConcepts',
        title: 'Key Concepts',
        exercises: [
            currying,
        ]
    }
];

export const exercises: Exercise[] = curriculum.flatMap(c => c.exercises);

export const getExercise = (id: string) => {
    return exercises.find(e => e.id === id) || exercises[0];
};
