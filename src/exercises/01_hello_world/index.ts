import { Exercise } from '../../types';
import description from "./problem.md" with { type: "text" };
import initialCode from "./template.ml" with { type: "text" };

const exercise: Exercise = {
    id: "1.1",
    title: "Hello World",
    description: description,
    initialCode: initialCode,
    validate: (output: string) => {
      const lowercaseOutput = output.toLowerCase();
      if (lowercaseOutput.includes("hello") && lowercaseOutput.includes("world")) return true;
      return "Expected output to contain: hello and world";
    }
};

export default exercise;
