// src/core/compiler.ts
export interface CompilerResult {
  out: string;
  err: string;
  success: boolean;
}

declare global {
  interface Window {
    ocaml?: {
      run: (code: string) => CompilerResult;
    };
  }
}

export function isCompilerReady(): boolean {
  return !!(window.ocaml && window.ocaml.run);
}

export async function evaluateOCaml(code: string): Promise<CompilerResult> {
  if (!window.ocaml || !window.ocaml.run) {
    throw new Error("Compiler not ready yet.");
  }
  const result = window.ocaml.run(code);

  //remove test harness from output
  result.out = result.out.replace(/module Tests :[\s\S]*?end\n/g, "");
  return result;
}

