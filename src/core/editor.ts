import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { themeCompartment, getTheme } from '../ui/theme';

let view: EditorView | null = null;

export function initEditor(initialCode: string) {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    if (!view) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const state = EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                StreamLanguage.define(oCaml),
                themeCompartment.of(getTheme(isDark)),
                EditorView.lineWrapping,
                EditorView.theme({
                    "&": { height: "100%", backgroundColor: "var(--bg-app)", color: "var(--fg-primary)" },
                    ".cm-scroller": { overflow: "auto", fontFamily: "var(--font-mono)" },
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

export function updateEditorTheme(isDark: boolean) {
    if (view) {
        view.dispatch({
            effects: themeCompartment.reconfigure(getTheme(isDark))
        });
    }
}

export function getCode(): string {
    return view ? view.state.doc.toString() : "";
}
