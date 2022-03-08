import { Type } from "@chainsafe/ssz";
export declare enum InputType {
    SSZ = "ssz",
    SSZ_SNAPPY = "ssz_snappy",
    YAML = "yaml"
}
export declare type ExpandedInputType = {
    type: InputType;
    treeBacked: boolean;
};
export declare function toExpandedInputType(inputType: InputType | ExpandedInputType): ExpandedInputType;
export interface ISpecTestOptions<TestCase extends {
    meta?: any;
}, Result> {
    /**
     * If directory contains both ssz or yaml file version,
     * you can choose which one to use. Default is ssz snappy.
     */
    inputTypes?: {
        [K in keyof NonNullable<TestCase>]?: InputType | ExpandedInputType;
    };
    sszTypes?: Record<string, Type<any>>;
    /**
     * Some tests need to access the test case in order to generate ssz types for each input file.
     */
    getSszTypes?: (meta: TestCase["meta"]) => Record<string, Type<any>>;
    /**
     * loadInputFiles sometimes not create TestCase due to abnormal input file names.
     * Use this to map to real test case.
     */
    mapToTestCase?: (t: Record<string, any>) => TestCase;
    /**
     * Optionally
     * @param testCase
     */
    getExpected?: (testCase: TestCase) => Result | undefined;
    /**
     * Optionally pass function to transform loaded values
     * (values from input files)
     */
    inputProcessing?: {
        [K: string]: (value: any) => any;
    };
    shouldError?: (testCase: TestCase) => boolean;
    shouldSkip?: (testCase: TestCase, name: string, index: number) => boolean;
    expectFunc?: (testCase: TestCase, expected: any, actual: any) => void;
    timeout?: number;
}
export interface ITestCaseMeta {
    directoryName: string;
}
export declare function describeDirectorySpecTest<TestCase extends {
    meta?: any;
}, Result>(name: string, testCaseDirectoryPath: string, testFunction: (testCase: TestCase, directoryName: string) => Result, options: Partial<ISpecTestOptions<TestCase, Result>>): void;
//# sourceMappingURL=single.d.ts.map