import { marked } from 'marked';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { c } from '@codemirror/legacy-modes/mode/clike';
import { getTheme } from '../ui/theme';

export function configureMarkdown() {
    const renderer = {
        code({ text, lang }: { text: string; lang?: string }) {
            return `<div class="cm-static-code mb-4" data-lang="${lang || ''}">${text}</div>`;
        }
    };

    marked.use({ renderer: renderer as any });
}

export const parseMarkdown = (text: string) => {
    return marked.parse(text) as string;
};

export function highlightStaticBlocks() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const blocks = document.querySelectorAll('.cm-static-code');
    blocks.forEach(block => {
        const text = block.textContent || "";
        const lang = block.getAttribute('data-lang');

        block.textContent = "";

        new EditorView({
            state: EditorState.create({
                doc: text,
                extensions: [
                    EditorState.readOnly.of(true),
                    EditorView.editable.of(false),
                    getTheme(isDark),
                    lang === 'ocaml' || !lang ? StreamLanguage.define(oCaml) :
                        (lang === 'c' || lang === 'clike') ? StreamLanguage.define(c) : [],
                    EditorView.lineWrapping,
                    EditorView.theme({
                        "&": { borderRadius: "4px", overflow: "hidden", backgroundColor: "var(--bg-app)" },
                        ".cm-scroller": { overflow: "visible" }
                    })
                ]
            }),
            parent: block as HTMLElement
        });
    });
}
