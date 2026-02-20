import { Exercise } from '../core/types';
import { Chapter } from '../core/types';

//individual exercises
import helloWorld from './1.1_hello_world/index';
import intsVsFloats from './1.2_ints_vs_floats/index';
import functions from './1.3_functions/index';
import conditionals from './1.4_conditionals/index';
import tuples from './1.5_tuples/index';
import currying from './2.1_currying/index';

export const curriculum: Chapter[] = [
    {
        id: 'basics',
        title: 'Basics',
        exercises: [
            helloWorld,
            intsVsFloats,
            functions,
            conditionals,
            tuples,
            //arrays,
            //lists,
            //strings,
        ]
    },
    {
        id: 'keyConcepts',
        title: 'Key Concepts',
        exercises: [
            //immutability,
            //sideEffects,
            //pureFunctions,
            currying,
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
