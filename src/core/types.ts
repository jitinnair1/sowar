export interface Exercise {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    testCode: string;
    validate: (code: string, output: string) => true | string;
}

export interface Chapter {
    id: string;
    title: string;

    exercises: Exercise[];
}

export interface ExecutionResult {

    success: boolean;
    output: string;
    error?: string;
}

export interface CodeRunner {
    name: string;
    isReady(): Promise<boolean>;
    run(userCode: string, testCode?: string): Promise<ExecutionResult>;
}