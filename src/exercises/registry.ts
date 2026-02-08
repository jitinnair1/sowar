import { Exercise } from '../core/types';
import { Chapter } from '../core/types';

//individual exercises
import helloWorld from './01_hello_world/index';
import intsVsFloats from './02_ints_vs_floats/index';
import functions from './03_functions/index';
import conditionals from './04_conditionals/index';
import currying from './05_currying/index';

export const curriculum: Chapter[] = [
    {
        id: 'basics',
        title: 'Basics',
        exercises: [
            helloWorld,
            intsVsFloats,
            functions,
            conditionals,
            //strings,
            //tuples,
            //arrays,
            //lists,
        ]
    },
    {
        id: 'keyConcepts',
        title: 'Key Concepts',
        exercises: [
            currying,
            //pureFunctions,
            //immutability,
            //sideEffects,
            //recursion,
            //patternMatching,
            //map,
            //filter,
            //reduce,
            //functionComposition,
        ]
    },
    // {
    //     id: 'intermediateConcepts',
    //     title: 'Intermediate Concepts',
    //     exercises: [
    //         //memoization,
    //         //tailRecursion,
    //         //referenceVsValue,
    //     ]
    // }
];

export const exercises: Exercise[] = curriculum.flatMap(c => c.exercises);

export const getExercise = (id: string) => {
    return exercises.find(e => e.id === id) || exercises[0];
};
