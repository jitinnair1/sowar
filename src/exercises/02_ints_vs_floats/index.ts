import { Exercise } from '../../types';
import description from "./problem.md" with { type: "text" };
import initialCode from "./template.ml" with { type: "text" };

const exercise: Exercise = {
    id: "1.2",
    title: "Int, Float and Functions",
    description: description,
    initialCode: initialCode,
    validate: (output: string) => {
      const hasError = output.includes("Exception") || output.includes("Error");
      return !hasError;
    }
};

export default exercise;
