// src/main.ts
import { store } from './core/store';
import { exercises } from './exercises/registry';
import { initEditor, getCode } from './core/editor';
import { evaluateOCaml, isCompilerReady } from './core/compiler';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { ICONS } from './ui/icons';

//select DOM elements
const descEl = document.getElementById('ex-desc') as HTMLElement;
const sidebarEl = document.getElementById('sidebar-list') as HTMLElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const consoleEl = document.getElementById('console-output') as HTMLElement;

//markdown parser
const parseMarkdown = (text: string) => {
    return marked.parse(text) as string
};

//render function
function render() {
    const { currentExerciseId, completedIds } = store.getState();
    const currentEx = exercises.find(e => e.id === currentExerciseId);

    if (!currentEx) return;

    //header & instructions
    const titleHtml = `<h1 class="text-3xl font-bold mb-6 text-white">${currentEx.id} ${currentEx.title}</h1>`;

    descEl.innerHTML = titleHtml + `<div class="markdown-body">${parseMarkdown(currentEx.description)}</div>`;

    //sidebar
    sidebarEl.innerHTML = exercises.map(e => {
        const isCompleted = completedIds.includes(e.id);
        const active = e.id === currentExerciseId ? 'bg-slate-800 text-white border-l-2 border-yellow-500' : 'text-slate-400 hover:text-slate-300';
        const completed = isCompleted ? 'opacity-40' : '';

        return `<div class="nav-item cursor-pointer p-3 text-sm flex justify-between items-center transition-colors ${active} ${completed}"
                    onclick="location.hash='#${e.id}'">
                  <span>${e.id} ${e.title}</span>
                  ${isCompleted ? ICONS.CHECK : ''}
                </div>`;
    }).join('');

    //initialize editor
    initEditor(currentEx.initialCode);

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
        render();

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
