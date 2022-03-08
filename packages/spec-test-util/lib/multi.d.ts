export interface IBaseCase {
    description: string;
}
/**
 * Run yaml Eth2.0 bulk spec tests (m) for a certain function
 * Compares actual vs expected for all test cases
 * @param {string} testYamlPath - path to yaml spec test
 * @param {Function} testFunc - function to use to generate output
 * @param {Function} getInput - function to convert test case into input array
 * @param {Function} getExpected - function to convert test case into a
 *   comparable expected output
 * @param {Function} getActual - function to convert function output into
 *   comparable actual output
 * @param {Function} shouldError - function to convert test case into a
 *   boolean, if the case should result in an error
 * @param {Function} shouldSkip - function to convert test case into a boolean,
 *   if the case should be skipped
 * @param {Function} expectFunc - function to run expectations against expected
 *   and actual output
 * @param timeout - how long to wait before marking tests as failed (default 2000ms). Set to 0 to wait infinitely
 */
export declare function describeMultiSpec<TestCase extends IBaseCase, Result>(testYamlPath: string, testFunc: (...args: any) => any, getInput: (testCase: TestCase) => any, getExpected: (testCase: TestCase) => any, getActual: (result: any) => Result, shouldError?: (testCase: TestCase, index: number) => boolean, shouldSkip?: (testCase: TestCase, index: number) => boolean, expectFunc?: (testCase: TestCase, expect: any, expected: any, actual: any) => any, timeout?: number): void;
//# sourceMappingURL=multi.d.ts.map