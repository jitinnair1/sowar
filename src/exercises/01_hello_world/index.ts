import { Exercise } from '../../types';
import description from "./problem.md" with { type: "text" };
import initialCode from "./template.ml" with { type: "text" };

const exercise: Exercise = {
    id: "1.1",
    title: "Hello World",
    description: description,
    initialCode: initialCode,
    validate: (output: string) => {
        if (output.includes("Hello, World!")) return true;
        return "Expected output to contain: Hello, World!";
    }
};

export default exercise;
