import { Exercise } from '../../core/types';
import description from "./problem.md" with { type: "text" };
import initialCode from "./template.ml" with { type: "text" };
import testCode from "./test.ml" with { type: "text" };

const exercise: Exercise = {
  id: "1.3",
  title: "Functions",
  description: description,
  initialCode: initialCode,
  testCode: testCode,
  validate: () => {
    return true;
  }
};

export default exercise;