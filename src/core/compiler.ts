// src/core/compiler.ts

declare global {
  interface Window {
    ocaml?: {
      run: (code: string) => string;
    };
  }
}

export function isCompilerReady(): boolean {
  // Check for the specific function we need, not just the object
  return !!(window.ocaml && window.ocaml.run);
}

export async function evaluateOCaml(code: string): Promise<string> {
  if (!window.ocaml || !window.ocaml.run) {
    throw new Error("Compiler not ready yet.");
  }
  return window.ocaml.run(code);
}
