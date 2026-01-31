// src/main.ts
import { store } from './core/store';
import { exercises, curriculum } from './exercises/registry';

//code runner and tests
import { evaluateOCaml, isCompilerReady } from './core/compiler';
import { testHarness } from './exercises/tests';

//editor and syntax highlighting
import { initEditor, getCode, updateEditorTheme } from './core/editor';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { oCaml } from '@codemirror/legacy-modes/mode/mllike';
import { c } from '@codemirror/legacy-modes/mode/clike';

//ui
import { getTheme } from './ui/theme';
import { ICONS } from './ui/icons';
import { confetti } from './ui/confetti';
import { marked } from 'marked';

//select DOM elements
const descElDesktop = document.getElementById('ex-desc-desktop') as HTMLElement;
const descElMobile = document.getElementById('ex-desc-mobile') as HTMLElement;

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
const navPrev = document.getElementById('nav-prev') as HTMLButtonElement;
const navNext = document.getElementById('nav-next') as HTMLButtonElement;
const editorConsolePanel = document.getElementById('editor-and-console-panel') as HTMLElement;

//resize handles
const paneProblem = document.getElementById('ex-desc-desktop') as HTMLElement;
const paneConsole = document.getElementById('pane-console') as HTMLElement;
const dragHDesktop = document.getElementById('drag-h-desktop') as HTMLElement;
const dragVConsole = document.getElementById('drag-v-console') as HTMLElement;
const progressContainer = document.getElementById('progress-container') as HTMLElement;

function switchTab(tab: 'problem' | 'code') {
    if (tab === 'problem') {
        descElMobile.classList.remove('hidden');
        editorConsolePanel.classList.add('hidden');
        editorConsolePanel.classList.remove('flex');

        tabProblem.classList.add('text-fg-primary', 'border-brand');
        tabProblem.classList.remove('text-fg-muted', 'border-transparent');
        tabCode.classList.add('text-fg-muted', 'border-transparent');
        tabCode.classList.remove('text-fg-primary', 'border-brand');
    } else {
        descElMobile.classList.add('hidden');
        editorConsolePanel.classList.remove('hidden');
        editorConsolePanel.classList.add('flex');

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
        switchTab('problem');
    }
}

function goToPrev() {
    const { currentExerciseId } = store.getState();
    const idx = exercises.findIndex(e => e.id === currentExerciseId);
    if (idx > 0) {
        window.location.hash = '#' + exercises[idx - 1].id;
        switchTab('problem');
    }
}

if (navPrev && navNext) {
    navPrev.innerHTML = ICONS.LEFT_ARROW;
    navNext.innerHTML = ICONS.RIGHT_ARROW;
    navPrev.addEventListener('click', goToPrev);
    navNext.addEventListener('click', goToNext);
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
            onConfirm();
        } else {
            //first click
            btn.innerHTML = `<span class="text-xs font-bold tracking-wider">Discard changes? Click to confirm.</span>`;

            confirmTimeout = setTimeout(() => {
                confirmTimeout = null;
                btn.innerHTML = originalIcon;
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
let lastRenderedExerciseId: string | null = null;
function render() {
    const { currentExerciseId, completedIds, userCode } = store.getState();
    const currentEx = exercises.find(e => e.id === currentExerciseId);

    if (!currentEx) return;

    //render description to both mobile and desktop containers
    const descHtml = parseMarkdown(currentEx.description);
    const titleHtml = `<h1 class="text-3xl font-bold mb-6 text-fg-primary">${currentEx.id} ${currentEx.title}</h1>`;
    const fullContent = titleHtml + descHtml;

    if (descElDesktop) descElDesktop.innerHTML = fullContent;
    if (descElMobile) descElMobile.innerHTML = fullContent;

    //prep for prev and next buttons
    const idx = exercises.findIndex(e => e.id === currentExerciseId);
    const hasPrev = idx > 0;
    const hasNext = idx < exercises.length - 1;

    //update nav state
    if (navPrev) navPrev.disabled = !hasPrev;
    if (navNext) navNext.disabled = !hasNext;

    //JN: Right now, codemirror essentially "injects" a read only editor in the markdown codeblocks using this
    //function. So all codeblocks in the problem description are effectively read-only editors. Does this add
    //an overhead as the number of code blocks across all exercises scales?
    highlightStaticBlocks();

    //sidebar
    sidebarEl.innerHTML = curriculum.map(chapter => {
        const chapterHeader = `<div class="px-2 py-1 pb-0 text-[10px] font-bold text-fg-muted uppercase">${chapter.title}</div>`;

        const chapterExercises = chapter.exercises.map(e => {
            const isCompleted = completedIds.includes(e.id);
            const active = e.id === currentExerciseId ? 'bg-bg-surface text-fg-primary border-l-2 border-brand' : 'text-fg-muted hover:text-fg-primary';
            const completed = isCompleted ? 'opacity-40' : '';

            return `<div class="nav-item cursor-pointer p-2 pl-4 text-sm flex justify-between items-center transition-colors ${active} ${completed}"
                        onclick="location.hash='#${e.id}'">
                      <span>${e.id} ${e.title}</span>
                      ${isCompleted ? ICONS.CHECK : ''}
                    </div>`;
        }).join('');

        return chapterHeader + chapterExercises;
    }).join('');

    //progress bar (stepper)
    if (progressContainer) {
        const currentChapter = curriculum.find(c => c.exercises.some(e => e.id === currentExerciseId));
        if (currentChapter) {
            const total = currentChapter.exercises.length;
            const nextUncompletedIndex = currentChapter.exercises.findIndex(e => !completedIds.includes(e.id));

            progressContainer.innerHTML = currentChapter.exercises.map((e, idx) => {
                const isCompleted = completedIds.includes(e.id);
                const isNext = idx === nextUncompletedIndex || (nextUncompletedIndex === -1 && false);
                const isLast = idx === total - 1;

                //circle style
                let circleClass = 'border border-border-default bg-bg-surface';
                let content = '';

                if (isNext) {
                    circleClass = 'border border-brand bg-bg-surface';
                }

                if (isCompleted) {
                    circleClass = 'border border-brand bg-brand';
                    content = ICONS.WHITE_CHECK;
                }

                //connection logic
                let line = '';
                if (!isLast) {
                    const lineClass = isCompleted ? 'bg-brand' : 'bg-border-default opacity-50';
                    line = `<div class="w-8 h-0.5 mx-0.5 rounded ${lineClass}"></div>`;
                }

                return `
                    <div class="relative flex items-center group cursor-pointer" onclick="location.hash='#${e.id}'" title="${e.title}">
                        <div class="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${circleClass}">
                            ${content}
                        </div>
                        ${line}
                        <!-- tooltip on hover -->
                        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-bg-surface border border-border-default px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20 pointer-events-none">
                            ${e.title}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    //initialize editor
    let editorText = "";
    if (!userCode[currentExerciseId]) {
        editorText = currentEx.initialCode;
    } else {
        editorText = userCode[currentExerciseId];
    }

    initEditor(editorText, () => {
        const code = getCode();
        store.getState().saveUserCode(currentExerciseId, code);

        //pop-up on save
        const saveBtn = document.createElement('div');
        saveBtn.className = 'fixed bottom-4 right-4 bg-fg-primary text-bg-app px-4 py-2 rounded shadow-lg text-xs font-bold z-50';
        saveBtn.textContent = 'Saved!';
        document.body.appendChild(saveBtn);
        setTimeout(() => saveBtn.remove(), 1000);
    });

    //clear console on exercise switch
    if (currentExerciseId !== lastRenderedExerciseId) {
        consoleEl.textContent = "// Ready...";
        lastRenderedExerciseId = currentExerciseId;
    }
}

//run code
async function runCode() {
    if (!isCompilerReady()) {
        alert("Compiler is still loading... please wait.");
        return;
    }

    runBtn.classList.add("progress");
    const { currentExerciseId } = store.getState();

    const currentEx = exercises.find(e => e.id === currentExerciseId);
    if (!currentEx) {
        runBtn.classList.remove("progress");
        return;
    }

    statusEl.textContent = "Running...";
    statusEl.className = "text-yellow-500 text-xs font-mono animate-pulse";
    toggleRunButton(false);
    consoleEl.textContent = "";

    let finalOutput = "";

    try {
        const userCode = getCode();
        store.getState().saveUserCode(currentExerciseId, userCode);
        const fullCode = testHarness + userCode + (currentEx.testCode || "");
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
        consoleEl.textContent += "\nALL TESTS PASSED!";
        store.getState().markComplete(currentEx.id);

        confetti();

    } catch (e: any) {
        statusEl.textContent = "ERROR";
        statusEl.className = "text-red-600 font-bold text-xs";
        consoleEl.textContent = "Runtime Error: " + e.message;
    } finally {
        toggleRunButton(true);
        runBtn.classList.remove("progress");
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
    sidebarToggle.innerHTML = ICONS.MENU; // Inject menu icon
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

//resize logic
function setupResize(
    handle: HTMLElement,
    targetPane: HTMLElement,
    direction: 'horizontal' | 'vertical',
    isReversed: boolean = false
) {
    if (!handle || !targetPane) return;

    let isDragging = false;
    let startVal = 0;
    let startSize = 0;

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        document.body.classList.add('resizing');
        startVal = direction === 'horizontal' ? e.clientX : e.clientY;
        startSize = direction === 'horizontal' ? targetPane.offsetWidth : targetPane.offsetHeight;

        document.body.style.userSelect = 'none';
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        handle.classList.add('bg-brand');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const currentVal = direction === 'horizontal' ? e.clientX : e.clientY;
        const delta = isReversed ? startVal - currentVal : currentVal - startVal;
        const newSize = startSize + delta;

        if (direction === 'horizontal') {
            //min width 200px, max width 70% of screen
            if (newSize > 200 && newSize < window.innerWidth * 0.7) {
                targetPane.style.width = `${newSize}px`;
                targetPane.style.flex = 'none';
            }
        } else {
            //min height 100px, max height 80% of container
            const containerHeight = targetPane.parentElement?.offsetHeight || window.innerHeight;
            if (newSize > 100 && newSize < containerHeight * 0.8) {
                targetPane.style.height = `${newSize}px`;
                targetPane.style.flex = 'none';
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.classList.remove('resizing');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            handle.classList.remove('bg-brand');
        }
    });
}

//init resize handles
setupResize(dragHDesktop, paneProblem, 'horizontal');
setupResize(dragVConsole, paneConsole, 'vertical', true);


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
