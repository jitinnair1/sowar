export const status = {
    element: document.getElementById('status') as HTMLElement,

    setRunning() {
        if (!this.element) return;
        this.element.textContent = "Running...";
        this.element.className = "text-yellow-500 text-xs font-mono animate-pulse";
    },

    setPassed() {
        if (!this.element) return;
        this.element.textContent = "PASSED";
        this.element.className = "text-green-500 font-bold text-xs";
    },

    setFailed() {
        if (!this.element) return;
        this.element.textContent = "FAILED";
        this.element.className = "text-red-500 font-bold text-xs";
    },

    setError() {
        if (!this.element) return;
        this.element.textContent = "ERROR";
        this.element.className = "text-red-600 font-bold text-xs";
    },

    setReady() {
        if (!this.element) return;
        this.element.textContent = "Ready";
        this.element.className = "text-green-600 text-xs font-mono";
    }
};
