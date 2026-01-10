// src/main.ts
import { store } from './core/store';
import { exercises } from './exercises/registry';
import { initEditor, getCode } from './core/editor';
import { evaluateOCaml, isCompilerReady } from './core/compiler';
import confetti from 'canvas-confetti';

// 1. Select DOM Elements
const descEl = document.getElementById('ex-desc') as HTMLElement;
const sidebarEl = document.getElementById('sidebar-list') as HTMLElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const consoleEl = document.getElementById('console-output') as HTMLElement;

// Markdown Parser
const parseMarkdown = (text: string) => {
    return text
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-brand-500">$1</h1>') // Updated color to match brand
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-300">$1</h3>')
        .replace(/\`\`\`([\s\S]*?)\`\`\`/gim, '<pre class="bg-slate-800 p-3 rounded-md my-2 overflow-x-auto border border-slate-700"><code>$1</code></pre>')
        .replace(/\`([^\`]+)\`/gim, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-yellow-200 font-mono">$1</code>')
        .replace(/\n/gim, '<br />');
};

// --- 3. Render Function ---
function render() {
    const { currentExerciseId, completedIds } = store.getState();
    const currentEx = exercises.find(e => e.id === currentExerciseId);

    if (!currentEx) return;

    // Header & Instructions
    const titleHtml = `<h1 class="text-3xl font-bold mb-6 text-white">${currentEx.id} ${currentEx.title}</h1>`;

    descEl.innerHTML = titleHtml + parseMarkdown(currentEx.description);

    // Sidebar
    sidebarEl.innerHTML = exercises.map(e => {
        const active = e.id === currentExerciseId ? 'bg-slate-800 text-white border-l-2 border-yellow-500' : 'text-slate-400 hover:text-slate-300';
        const check = completedIds.includes(e.id) ? '<span class="text-green-500 font-bold">✓</span>' : '';
        return `<div class="nav-item cursor-pointer p-3 text-sm flex justify-between items-center transition-colors ${active}"
                    onclick="location.hash='#${e.id}'">
                  <span>${e.id} ${e.title}</span>
                  ${check}
                </div>`;
    }).join('');

    // Initialize Editor
    initEditor(currentEx.initialCode);

    // Clear console on exercise switch
    consoleEl.textContent = "// Ready...";
}

// --- 4. Logic: Run Code ---
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
        const result = await evaluateOCaml(userCode);

        console.log("FINAL OBJECT:", result);

        if (result.success) {
          finalOutput = result.out;
        } else {
          finalOutput = result.err || "Unknown Error";
        }

    } catch (e: any) {
        finalOutput = "Runtime Error: " + e.message;
    } finally {
        runBtn.disabled = false;
    }

    consoleEl.textContent = finalOutput;

    const validation = currentEx.validate(finalOutput);

    if (validation === true) {
        statusEl.textContent = "PASSED";
        statusEl.className = "text-green-500 font-bold text-xs";
        store.getState().markComplete(currentEx.id); // Ensure getState() is used if using Zustand
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        render();
    } else {
        statusEl.textContent = "FAILED";
        statusEl.className = "text-red-500 font-bold text-xs";
        consoleEl.textContent += `\n\n ${validation}`;
    }
}

// --- 5. Logic: Wait for Compiler ---
function waitForCompiler() {
    const check = setInterval(() => {
        // USE THE HELPER: consistent check
        if (isCompilerReady()) {
            clearInterval(check);
            statusEl.textContent = "Compiler Ready";
            statusEl.className = "text-green-600 text-xs font-mono";
            runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            runBtn.disabled = false;
        }
    }, 500);
}

// --- 6. Event Listeners ---
store.subscribe(render);
runBtn.addEventListener('click', runCode);

window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (exercises.find(e => e.id === id)) {
      store.getState().setCurrent(id);
    }
});

// Init
waitForCompiler();
const initialId = window.location.hash.slice(1) || exercises[0].id;
store.getState().setCurrent(initialId);

render();
