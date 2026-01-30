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
const descElDesktop = document.getElementById('ex-desc') as HTMLElement;
const descElMobile = document.getElementById('ex-desc-mobile') as HTMLElement;
const problemHeaderEl = document.getElementById('problem-header') as HTMLElement;

//get currently visible description element or both
const sidebarEl = document.getElementById('sidebar-list') as HTMLElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const consoleEl = document.getElementById('console-output') as HTMLElement;
const sidebarToggle = document.getElementById('sidebar-toggle') as HTMLButtonElement;
const sidebarNav = document.getElementById('sidebar-nav') as HTMLElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const clearConsoleBtn = document.getElementById('clear-console-btn') as HTMLButtonElement;

//tabs
const tabProblem = document.getElementById('tab-problem') as HTMLButtonElement;
const tabCode = document.getElementById('tab-code') as HTMLButtonElement;
const tabPrev = document.getElementById('tab-prev') as HTMLButtonElement;
const tabNext = document.getElementById('tab-next') as HTMLButtonElement;
const codePane = document.getElementById('code-pane') as HTMLElement;

function switchTab(tab: 'problem' | 'code') {
    if (tab === 'problem') {
        descElMobile.classList.remove('hidden');
        codePane.classList.add('hidden');
        codePane.classList.remove('flex');

        tabProblem.classList.add('text-fg-primary', 'border-brand');
        tabProblem.classList.remove('text-fg-muted', 'border-transparent');
        tabCode.classList.add('text-fg-muted', 'border-transparent');
        tabCode.classList.remove('text-fg-primary', 'border-brand');
    } else {
        descElMobile.classList.add('hidden');
        codePane.classList.remove('hidden');
        codePane.classList.add('flex');

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

function goToNext() {
    const { currentExerciseId } = store.getState();
    const idx = exercises.findIndex(e => e.id === currentExerciseId);
    if (idx < exercises.length - 1) {
        window.location.hash = '#' + exercises[idx + 1].id;
    }
}

function goToPrev() {
    const { currentExerciseId } = store.getState();
    const idx = exercises.findIndex(e => e.id === currentExerciseId);
    if (idx > 0) {
        window.location.hash = '#' + exercises[idx - 1].id;
    }
}

if (tabPrev && tabNext) {
    tabPrev.addEventListener('click', goToPrev);
    tabNext.addEventListener('click', goToNext);
}

function attachConfirmation(btn: HTMLButtonElement, originalIcon: string, onConfirm: () => void) {
    let confirmTimeout: ReturnType<typeof setTimeout> | null = null;

    btn.innerHTML = originalIcon;

    btn.addEventListener('click', () => {
        if (confirmTimeout) {
            //confirmed
            clearTimeout(confirmTimeout);
            confirmTimeout = null;
            btn.innerHTML = originalIcon;
            btn.classList.remove('text-red-500');
            onConfirm();
        } else {
            //first click
            btn.innerHTML = `<span class="text-xs font-bold tracking-wider">Discard changes? Click again to confirm.</span>`;
            btn.classList.add('text-red-500');

            confirmTimeout = setTimeout(() => {
                confirmTimeout = null;
                btn.innerHTML = originalIcon;
                btn.classList.remove('text-red-500');
            }, 5000);
        }
    });
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

//theme switcher
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const isDark = e.matches;
    updateEditorTheme(isDark);
    render();
});

//render function
function render() {
    const { currentExerciseId, completedIds, userCode } = store.getState();
    const currentEx = exercises.find(e => e.id === currentExerciseId);

    if (!currentEx) return;

    //header & instructions
    const idx = exercises.findIndex(e => e.id === currentExerciseId);
    const hasPrev = idx > 0;
    const hasNext = idx < exercises.length - 1;

    //update mobile nav state
    if (tabPrev) tabPrev.disabled = !hasPrev;
    if (tabNext) tabNext.disabled = !hasNext;

    //render description to both mobile and desktop containers
    const descHtml = `<div class="markdown-body">${parseMarkdown(currentEx.description)}</div>`;
    const titleHtml = `<h1 class="text-3xl font-bold mb-6 text-fg-primary">${currentEx.id} ${currentEx.title}</h1>`;
    const fullContent = titleHtml + descHtml;

    if (descElDesktop) descElDesktop.innerHTML = fullContent;
    if (descElMobile) descElMobile.innerHTML = fullContent;

    //update sticky header
    if (problemHeaderEl) {
        problemHeaderEl.innerHTML = `
            <button class="nav-prev-d px-4 py-1.5 hover:bg-bg-app rounded text-fg-muted hover:text-fg-primary transition-colors disabled:opacity-30 disabled:hover:text-fg-muted"
                ${!hasPrev ? 'disabled' : ''} title="Previous (Alt + Left)">
                ${ICONS.LEFT_ARROW}
            </button>
            <div class="flex-1"></div>
            <button class="nav-next-d px-4 py-1.5 hover:bg-bg-app rounded text-fg-muted hover:text-fg-primary transition-colors disabled:opacity-30 disabled:hover:text-fg-muted"
                ${!hasNext ? 'disabled' : ''} title="Next (Alt + Right)">
                ${ICONS.RIGHT_ARROW}
            </button>
        `;

        //attach listeners to new elements
        problemHeaderEl.querySelector('.nav-prev-d')?.addEventListener('click', goToPrev);
        problemHeaderEl.querySelector('.nav-next-d')?.addEventListener('click', goToNext);
    }

    //JN: Right now, codemirror essentially "injects" a read only editor in the markdown codeblocks using this
    //function. So all codeblocks in the problem description are effectively read-only editors. Does this add 
    //an overhead as the number of code blocks across all exercises scales?
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
    toggleRunButton(false);
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
        consoleEl.textContent += "\n\nALL TESTS PASSED!";
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
        toggleRunButton(true);
    }
}
function toggleRunButton(running: boolean) {
    runBtn.disabled = !running;
    runBtn.innerHTML = `<span>${running ? ICONS.PLAY : ICONS.STOP}</span><span>Run</span>`;
}

//wait for compiler
function waitForCompiler() {
    const check = setInterval(() => {
        if (isCompilerReady()) {
            clearInterval(check);
            statusEl.textContent = "Compiler Ready";
            statusEl.className = "text-green-600 text-xs font-mono";
            runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            toggleRunButton(true);
        }
    }, 500);
}

//event listeners
store.subscribe(render);
runBtn.addEventListener('click', runCode);

if (resetBtn) {
    attachConfirmation(resetBtn, ICONS.TRASH, () => {
        const { currentExerciseId } = store.getState();
        const currentEx = exercises.find(e => e.id === currentExerciseId);
        if (!currentEx) return;
        store.getState().saveUserCode(currentExerciseId, currentEx.initialCode);
    });
}
if (clearConsoleBtn) {
    clearConsoleBtn.innerHTML = ICONS.TRASH;
    clearConsoleBtn.addEventListener('click', () => {
        if (consoleEl) {
            consoleEl.textContent = "";
        }
    });
}

if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener('click', () => {
        sidebarNav.classList.toggle('hidden');
        sidebarNav.classList.toggle('flex');
        sidebarNav.classList.toggle('lg:hidden');
        sidebarNav.classList.toggle('lg:flex');
    });
}

//close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (!sidebarNav || !sidebarToggle) return;

    const isMobileOpen = !sidebarNav.classList.contains('hidden');
    const isMobile = window.innerWidth < 1024;

    if (isMobile && isMobileOpen) {
        const target = e.target as HTMLElement;
        const clickedInside = sidebarNav.contains(target);
        const clickedToggle = sidebarToggle.contains(target);

        if (!clickedInside && !clickedToggle) {
            sidebarNav.classList.toggle('hidden');
            sidebarNav.classList.toggle('flex');
            sidebarNav.classList.toggle('lg:hidden');
            sidebarNav.classList.toggle('lg:flex');
        }
    }
});


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
toggleRunButton(false);

render();
