import { store } from './store';
import { exercises } from '../exercises/registry';
import { getCode } from './editor';
import { status } from '../ui/status';
import { confetti } from '../ui/confetti';
import { showPopup } from '../ui/popup';
import { elements } from './elements';
import { activeRunner } from '../language';
import { ICONS } from '../ui/icons';

class Orchestrator {
    private isRunning = false;

    async run() {
        if (this.isRunning) return;

        //check if coderunner is ready
        const ready = await activeRunner.isReady();
        if (!ready) {
            alert("Loading...");
            return;
        }

        const { currentExerciseId, completedIds } = store.getState();
        const currentEx = exercises.find(e => e.id === currentExerciseId);
        if (!currentEx) return;

        //prepare ui
        this.setRunningState(true);
        status.setRunning();
        elements.console.textContent = "";

        try {
            //get code
            const userCode = getCode();
            store.getState().saveUserCode(currentExerciseId, userCode);

            //run via adapter
            const finalTestCode = currentEx.testCode || "";
            const result = await activeRunner.run(userCode, finalTestCode);

            //handle result
            if (!result.success) {
                this.handleFailure(result.error || "Unknown Error", result.output);
                return;
            }

            elements.console.textContent = result.output;

            //output-based validation (Runtime tests)
            if (result.output.includes("Test failed") || result.output.includes("Failure")) {
                status.setFailed();
                return;
            }

            //structural/custom validation
            const validation = currentEx.validate(userCode, result.output);
            if (validation !== true) {
                status.setFailed();
                elements.console.textContent += `\n\n${validation}`;
                return;
            }

            //success
            this.handleSuccess(currentEx.id, completedIds);

        } catch (e: any) {
            this.handleError(e.message);
        } finally {
            this.setRunningState(false);
        }
    }

    private handleFailure(error: string, output: string) {
        status.setFailed();
        elements.console.textContent = output ? output + "\n" + error : error;
    }

    private handleError(msg: string) {
        status.setError();
        elements.console.textContent = "Runtime Error: " + msg;
    }

    private handleSuccess(id: string, completedIds: string[]) {
        status.setPassed();
        elements.console.textContent += "\nALL TESTS PASSED!";

        const alreadyCompleted = completedIds.includes(id);
        store.getState().markComplete(id);

        if (!alreadyCompleted) {
            confetti();
        } else {
            showPopup('Passed!');
        }
    }

    private setRunningState(running: boolean) {
        this.isRunning = running;
        elements.runBtn.disabled = running;
        const icon = running ? ICONS.STOP : ICONS.PLAY;
        elements.runBtn.innerHTML = `<span>${icon}</span><span>Run</span>`;

        if (running) {
            elements.runBtn.classList.add("progress");
        } else {
            elements.runBtn.classList.remove("progress");
        }
    }

    waitForCompiler() {
        const check = setInterval(async () => {
            if (await activeRunner.isReady()) {
                clearInterval(check);
                status.setReady();
                elements.runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                this.setRunningState(false);
            }
        }, 500);
    }
}

//export new instance of Orchestrator for the runner
export const runner = new Orchestrator();
