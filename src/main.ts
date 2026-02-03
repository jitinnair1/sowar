// src/main.ts
import { store } from './core/store';
import { exercises, curriculum } from './exercises/registry';

//code runner and tests
import { evaluateOCaml, isCompilerReady } from './core/compiler';
import { testHarness } from './exercises/tests';

//editor and syntax highlighting
import { initEditor, getCode, updateEditorTheme } from './core/editor';

//ui
import { ICONS } from './ui/icons';
import { confetti } from './ui/confetti';
import { showPopup } from './ui/popup';
import { renderSidebar, initSidebarToggle } from './ui/sidebar';
import { renderProgressBar } from './ui/progressBar';
import { setupResize } from './ui/resize';
import { initTabs } from './ui/tabs';
import { initNavigation } from './ui/navigation';
import { resetEditorText } from './ui/resetEditorText';

//core
import { configureMarkdown, parseMarkdown, highlightStaticBlocks } from './core/markdown';

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

// Initialize components
configureMarkdown();
const switchTab = initTabs(tabProblem, tabCode, descElMobile, editorConsolePanel);
const navActions = initNavigation(navPrev, navNext, store, switchTab);
initSidebarToggle(sidebarToggle, sidebarNav);

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

    //update nav state
    if (navActions) navActions.updateNavState(currentExerciseId);

    //JN: Right now, codemirror essentially "injects" a read only editor in the markdown codeblocks using this
    //function. So all codeblocks in the problem description are effectively read-only editors. Does this add
    //an overhead as the number of code blocks across all exercises scales?
    highlightStaticBlocks();

    //sidebar
    renderSidebar(sidebarEl, curriculum, currentExerciseId, completedIds);

    //progress bar (stepper)
    renderProgressBar(progressContainer, curriculum, currentExerciseId, completedIds);

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
        showPopup('Saved!');
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
        alert("Loading... please wait.");
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

        const alreadyCompleted = store.getState().completedIds.includes(currentEx.id);
        store.getState().markComplete(currentEx.id);
        if (!alreadyCompleted) {
            confetti();
        } else {
            //pop-up on save
            showPopup('Passed!');
        }

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
            statusEl.textContent = "Ready";
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
    resetEditorText(resetBtn, ICONS.TRASH, () => {
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

//resize logic
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
