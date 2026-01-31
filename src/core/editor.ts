import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { themeCompartment, getTheme } from '../ui/theme';

let view: EditorView | null = null;
let tabCount = 0;
let lastTabTime = 0;

function showTabHintToast() {
    const existing = document.getElementById('tab-hint-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tab-hint-toast';
    toast.className = 'fixed bottom-4 right-4 bg-fg-primary text-bg-app px-4 py-2 rounded shadow-lg text-xs font-bold z-50';
    toast.textContent = 'Press Esc + Tab to move focus out of editor';
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000);
}

export function initEditor(initialCode: string, onSave?: () => void) {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    if (!view) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const state = EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                keymap.of([
                    //if user presses tab 3 times, show a toast indicating 
                    //that they can focus out with Esc + Tab
                    {
                        key: "Tab",
                        run: () => {
                            const now = Date.now();
                            if (now - lastTabTime > 2000) {
                                tabCount = 0;
                            }
                            tabCount++;
                            lastTabTime = now;

                            if (tabCount >= 3) {
                                showTabHintToast();
                                tabCount = 0;
                            }
                            return false;
                        }
                    },
                    ...defaultKeymap,

                    //allow tab indents
                    indentWithTab,

                    //enable save with Ctrl/Cmd + S
                    {
                        key: "Mod-s",
                        run: () => {
                            if (onSave) onSave();
                            return true;
                        },
                        preventDefault: true
                    }
                ]),
                StreamLanguage.define(oCaml),
                themeCompartment.of(getTheme(isDark)),
                EditorView.lineWrapping,
                EditorView.theme({
                    "&": { height: "100%", backgroundColor: "var(--bg-app)", color: "var(--fg-primary)" },
                    ".cm-scroller": { overflow: "auto", fontFamily: "var(--font-mono)" },
                }),

                //adding domEventHandlers here ensure the Tab is not overriden by the indentWithTab 
                EditorView.domEventHandlers({
                    keydown: (event) => {
                        if (event.key !== 'Tab') {
                            tabCount = 0;
                        }
                    },
                    mousedown: () => {
                        tabCount = 0;
                    }
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
