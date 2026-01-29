// src/main.ts
import { store } from './core/store';
import { exercises } from './exercises/registry';
import { initEditor, getCode, updateEditorTheme } from './core/editor';
import { evaluateOCaml, isCompilerReady } from './core/compiler';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { c } from '@codemirror/legacy-modes/mode/clike';
import { getTheme } from './core/theme';
import { ICONS } from './ui/icons';

//select DOM elements
const descEl = document.getElementById('ex-desc') as HTMLElement;
const sidebarEl = document.getElementById('sidebar-list') as HTMLElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const consoleEl = document.getElementById('console-output') as HTMLElement;
const sidebarToggle = document.getElementById('sidebar-toggle') as HTMLButtonElement;
const sidebarNav = document.getElementById('sidebar-nav') as HTMLElement;

//tabs
const tabProblem = document.getElementById('tab-problem') as HTMLButtonElement;
const tabCode = document.getElementById('tab-code') as HTMLButtonElement;
const codePane = document.getElementById('code-pane') as HTMLElement;

function switchTab(tab: 'problem' | 'code') {
    if (tab === 'problem') {
        //show problem
        descEl.classList.remove('hidden');
        codePane.classList.add('hidden');
        codePane.classList.remove('flex'); // Remove flex when hidden

        //styles
        tabProblem.classList.add('text-fg-primary', 'border-brand');
        tabProblem.classList.remove('text-fg-muted', 'border-transparent');
        tabCode.classList.add('text-fg-muted', 'border-transparent');
        tabCode.classList.remove('text-fg-primary', 'border-brand');
    } else {
        //show code
        descEl.classList.add('hidden');
        codePane.classList.remove('hidden');
        codePane.classList.add('flex'); // Add flex back

        //styles
        tabCode.classList.add('text-fg-primary', 'border-brand');
        tabCode.classList.remove('text-fg-muted', 'border-transparent');
        tabProblem.classList.add('text-fg-muted', 'border-transparent');
        tabProblem.classList.remove('text-fg-primary', 'border-brand');
    }
}

if (tabProblem && tabCode) {
    tabProblem.addEventListener('click', () => switchTab('problem'));
    tabCode.addEventListener('click', () => switchTab('code'));
}

//markdown parser
const renderer = {
    code({ text, lang }: { text: string; lang?: string }) {
        return `<div class="cm-static-code mb-4" data-lang="${lang || ''}">${text}</div>`;
    }
};

marked.use({ renderer: renderer as any });

const parseMarkdown = (text: string) => {
    return marked.parse(text) as string
};

function highlightStaticBlocks() {
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

// System theme listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const isDark = e.matches;
    updateEditorTheme(isDark);
    render(); // Re-render to update static block highlighting
});

//render function
function render() {
    const { currentExerciseId, completedIds, userCode } = store.getState();
    const currentEx = exercises.find(e => e.id === currentExerciseId);

    if (!currentEx) return;

    //header & instructions
    const titleHtml = `<h1 class="text-3xl font-bold mb-6 text-fg-primary">${currentEx.id} ${currentEx.title}</h1>`;

    descEl.innerHTML = titleHtml + `<div class="markdown-body">${parseMarkdown(currentEx.description)}</div>`;
    highlightStaticBlocks();

    //sidebar
    sidebarEl.innerHTML = exercises.map(e => {
        const isCompleted = completedIds.includes(e.id);
        const active = e.id === currentExerciseId ? 'bg-bg-surface text-fg-primary border-l-2 border-brand' : 'text-fg-muted hover:text-fg-primary';
        const completed = isCompleted ? 'opacity-40' : '';

        return `<div class="nav-item cursor-pointer p-3 text-sm flex justify-between items-center transition-colors ${active} ${completed}"
                    onclick="location.hash='#${e.id}'">
                  <span>${e.id} ${e.title}</span>
                  ${isCompleted ? ICONS.CHECK : ''}
                </div>`;
    }).join('');

    //initialize editor
    let editorText = "";
    if (!userCode[currentExerciseId]) {
        editorText = currentEx.initialCode;
    } else {
        editorText = userCode[currentExerciseId];
    }
    initEditor(editorText);

    //clear console on exercise switch
    consoleEl.textContent = "// Ready...";
}

//run code
async function runCode() {
    if (!isCompilerReady()) {
        alert("Compiler is still loading... please wait.");
        return;
    }

    const { currentExerciseId } = store.getState();

    const currentEx = exercises.find(e => e.id === currentExerciseId);
    if (!currentEx) return;

    statusEl.textContent = "Running...";
    statusEl.className = "text-yellow-500 text-xs font-mono animate-pulse";
    runBtn.disabled = true;
    consoleEl.textContent = "";

    let finalOutput = "";

    try {
        const userCode = getCode();
        store.getState().saveUserCode(currentExerciseId, userCode);
        const fullCode = userCode + "\n" + (currentEx.testCode || "");
        const result = await evaluateOCaml(fullCode);

        //check for runtime/compiler errors
        if (!result.success) {
            statusEl.textContent = "FAILED";
            statusEl.className = "text-red-500 font-bold text-xs";
            consoleEl.textContent = result.err || "Compilation/Runtime Error";
            return;
        }

        finalOutput = result.out;
        consoleEl.textContent = finalOutput;

        //check for explicit test failures in output
        if (finalOutput.includes("Test failed") || finalOutput.includes("Failure")) {
            statusEl.textContent = "FAILED";
            statusEl.className = "text-red-500 font-bold text-xs";
            return;
        }

        //run custom validation (hints/structural checks)
        const validation = currentEx.validate(userCode, result.out);
        if (validation !== true) {
            statusEl.textContent = "FAILED";
            statusEl.className = "text-red-500 font-bold text-xs";
            consoleEl.textContent += `\n\n${validation}`;
            return;
        }

        //success!
        statusEl.textContent = "PASSED";
        statusEl.className = "text-green-500 font-bold text-xs";
        store.getState().markComplete(currentEx.id);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

    } catch (e: any) {
        statusEl.textContent = "ERROR";
        statusEl.className = "text-red-600 font-bold text-xs";
        consoleEl.textContent = "Runtime Error: " + e.message;
    } finally {
        runBtn.disabled = false;
    }
}

//wait for compiler
function waitForCompiler() {
    const check = setInterval(() => {
        if (isCompilerReady()) {
            clearInterval(check);
            statusEl.textContent = "Compiler Ready";
            statusEl.className = "text-green-600 text-xs font-mono";
            runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            runBtn.disabled = false;
        }
    }, 500);
}

//event listeners
store.subscribe(render);
runBtn.addEventListener('click', runCode);

if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener('click', () => {
        sidebarNav.classList.toggle('hidden');
        sidebarNav.classList.toggle('flex');
        sidebarNav.classList.toggle('lg:hidden');
        sidebarNav.classList.toggle('lg:flex');
    });
}

window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (exercises.find(e => e.id === id)) {
        store.getState().setCurrent(id);
    }
});

//init
waitForCompiler();
const initialId = window.location.hash.slice(1) || exercises[0].id;
store.getState().setCurrent(initialId);

render();
