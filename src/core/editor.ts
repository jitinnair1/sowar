// src/core/editor.ts
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-ocaml';

let jar: any;

export function initEditor(initialCode: string) {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    // Only initialize CodeJar once
    if (!jar) {
        jar = CodeJar(editorEl, (editor: HTMLElement) => {
            editor.innerHTML = Prism.highlight(
                editor.textContent || "",
                Prism.languages.ocaml,
                'ocaml'
            );
        });
    }

    // Update code only if it's strictly different (avoids cursor jumping)
    if (jar.toString() !== initialCode) {
        jar.updateCode(initialCode);
    }
}

export function getCode(): string {
    return jar ? jar.toString() : "";
}
