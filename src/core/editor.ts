import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-ocaml';

let jar: any;

export function initEditor(initialCode: string) {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    if (!jar) {
        jar = CodeJar(editorEl, (editor: HTMLElement) => {
            editor.innerHTML = Prism.highlight(
                editor.textContent || "",
                Prism.languages.ocaml,
                'ocaml'
            );
        });
    }

    //update code only if it's strictly different
    if (jar.toString() !== initialCode) {
        jar.updateCode(initialCode);
    }
}

export function getCode(): string {
    return jar ? jar.toString() : "";
}
