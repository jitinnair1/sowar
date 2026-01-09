import { Exercise } from '../../types';

// These imports happen at BUILD time.
// The content is baked into the final JS bundle.
import description from './problem.md?raw';
import initialCode from './template.ml?raw';
import testCode from './test.ml?raw';

export const helloWorld: Exercise = {
  id: "1.1",
  title: "Hello World",

  // We use the imported strings directly
  description: description,
  initialCode: initialCode,

  // You can still keep metadata here
  section: "Basics",

  // The verification logic
  // We append the hidden test.ml content to the user's code before running
  testCode: testCode
};
