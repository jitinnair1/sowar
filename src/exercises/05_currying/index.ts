import { Exercise } from '../../core/types';
import description from "./problem.md" with { type: "text" };
import initialCode from "./template.ml" with { type: "text" };
import testCode from "./test.ml" with { type: "text" };

const exercise: Exercise = {
  id: "2.1",
  title: "Currying",
  description: description,
  initialCode: initialCode,
  testCode: testCode,
  validate: () => true
};

export default exercise;
