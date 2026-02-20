import { CodeRunner, ExecutionResult } from '../../core/types';
import harness from './harness.ml' with { type: "text" };

declare global {
    interface Window {
        ocaml?: {
            run: (code: string) => { out: string; err: string; success: boolean };
        };
    }
}

export const ocamlRunner: CodeRunner = {
    name: 'ocaml',

    async isReady() {
        return !!(window.ocaml && window.ocaml.run);
    },

    async run(userCode: string, testCode: string = ""): Promise<ExecutionResult> {
        if (!window.ocaml || !window.ocaml.run) {
            return {
                success: false,
                output: "",
                error: "Compiler not ready"
            };
        }

        const fullCode = harness + "\n" + userCode + "\n" + testCode + ";;";

        try {
            const result = window.ocaml.run(fullCode);

            // Allow "Test failed" in output to count as a success run (compilation success),
            // but the runner logic will determine pass/fail based on content.
            // However, the original logic had `evaluateOCaml` return success:false for runtime errors.
            // window.ocaml.run likely returns success:false for compilation errors.

            // Clean up harness output
            const cleanOutput = result.out.replace(/module Tests :[\s\S]*?end\n/g, "");

            return {
                success: result.success,
                output: cleanOutput,
                error: result.err
            };
        } catch (e: any) {
            return {
                success: false,
                output: "",
                error: e.message
            };
        }
    }
};
