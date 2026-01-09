// src/main.ts
import { store } from './core/store';
import { exercises } from './exercises/registry';
import { initEditor } from './core/editor';

// 1. Select DOM Elements
const titleEl = document.getElementById('ex-title') as HTMLElement;
const descEl = document.getElementById('ex-desc') as HTMLElement;
const sidebarEl = document.getElementById('sidebar-list') as HTMLElement;

// Helper: Zero-dep markdown parser (Headers + Code blocks)
const parseMarkdown = (text: string) => {
    return text
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-yellow-500">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
        .replace(/\`\`\`([\s\S]*?)\`\`\`/gim, '<pre class="bg-slate-800 p-2 rounded"><code>$1</code></pre>')
        .replace(/\`([^\`]+)\`/gim, '<code class="bg-slate-800 px-1 rounded text-sm">$1</code>')
        .replace(/\n/gim, '<br />');
};

// 2. Define the Render Function
function render() {
  // Access state directly if using the singleton class from previous steps
  const { currentId } = store.state;
  const currentEx = exercises.find(e => e.id === currentId);

  if (!currentEx) return;

  // Update Instructions
  titleEl.textContent = currentEx.title;
  descEl.innerHTML = parseMarkdown(currentEx.description);

  // Update Sidebar (Active State)
  // We re-generate the sidebar here to ensure state (checks/active) is fresh
  sidebarEl.innerHTML = exercises.map(e => {
      const active = e.id === currentId ? 'bg-slate-800 text-white border-l-2 border-yellow-500' : 'text-slate-400';
      const check = store.isCompleted(e.id) ? '<span class="text-green-500">✓</span>' : '';
      return `<div class="nav-item cursor-pointer p-2 ${active}" data-id="${e.id}" onclick="location.hash='#${e.id}'">
                ${e.id} ${e.title} ${check}
              </div>`;
  }).join('');

  // Initialize/Update Editor content
  initEditor(currentEx.initialCode);
}

// 3. Subscribe to State Changes
store.subscribe(render);

// 4. Handle Navigation
window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (exercises.find(e => e.id === id)) {
    store.setCurrent(id);
  }
});

// 5. Initial Load
const initialId = window.location.hash.slice(1) || exercises[0].id;
store.setCurrent(initialId);
