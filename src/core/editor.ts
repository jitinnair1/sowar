import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { oneDark } from '@codemirror/theme-one-dark';

let view: EditorView | null = null;

export function initEditor(initialCode: string) {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    if (!view) {
        const state = EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                StreamLanguage.define(oCaml),
                oneDark,
                EditorView.theme({
                    "&": { height: "100%", backgroundColor: "#1e1e1e", outline: "none !important" },
                    ".cm-scroller": { overflow: "auto", fontFamily: "var(--font-mono)" },
                    ".cm-content": {
                        padding: "24px 16px",
                        whiteSpace: "pre",
                        flexShrink: "0"
                    },
                    ".cm-gutters": { backgroundColor: "#1e1e1e", borderRight: "1px solid #334155" },
                    ".cm-gutterElement": { padding: "0 8px" }
                })
            ]
        });

        view = new EditorView({
            state,
            parent: editorEl
        });
    } else {
        // Update code only if it's strictly different
        const currentCode = view.state.doc.toString();
        if (currentCode !== initialCode) {
            view.dispatch({
                changes: { from: 0, to: currentCode.length, insert: initialCode }
            });
        }
    }
}

export function getCode(): string {
    return view ? view.state.doc.toString() : "";
}
