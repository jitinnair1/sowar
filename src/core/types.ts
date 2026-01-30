export interface Exercise {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    testCode: string;
    validate: (code: string, output: string) => true | string;
}
