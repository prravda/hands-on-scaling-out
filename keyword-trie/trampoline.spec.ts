import { trampoline, TrampolineFunction } from "./trampoline";

describe("testing for the utility of the trampoline on recursive function call", () => {
  class TestForTrampoline {
    public fibonacciRecursive(targetNumber: number): number {
      if (targetNumber <= 1) {
        return targetNumber;
      }

      return (
        this.fibonacciRecursive(targetNumber - 1) +
        this.fibonacciRecursive(targetNumber - 2)
      );
    }

    public fibonacciRecursiveWithTrampoline(targetNumber: number): number {
      const fibonacciTrampoline: TrampolineFunction<number> = (
        n: number,
        a: number = 0,
        b: number = 1
      ): number | TrampolineFunction<number> => {
        if (n === 0) {
          return a;
        }
        if (n == 1) {
          return b;
        }
        return () => fibonacciTrampoline(n - 1, b, a + b);
      };

      return trampoline(fibonacciTrampoline)(targetNumber);
    }

    public fibonacciIterative(targetNumber: number): number {
      let sum = 0;

      let former = 1;
      let latter = 1;

      if (targetNumber <= 2) {
        return 1;
      }

      for (let i = 1; i <= targetNumber; i++) {
        if (i > 2) {
          sum = former + latter;
          former = latter;
          latter = sum;
        }
      }

      return sum;
    }
  }

  let instanceForTest: TestForTrampoline;
  beforeEach(() => {
    instanceForTest = new TestForTrampoline();
  });

  it("should run the recursive way without any error without trampoline", () => {
    expect(() => instanceForTest.fibonacciRecursive(10)).not.toThrowError();
  });

  it("should throw an error related callstack exceeding without trampoline", () => {
    expect(() => instanceForTest.fibonacciRecursive(50)).toThrowError();
  });

  it("should run without any error using trampoline", () => {
    expect(() =>
      instanceForTest.fibonacciRecursiveWithTrampoline(100)
    ).not.toThrowError();
  });

  it("should run iteratively", () => {
    instanceForTest.fibonacciIterative(1_000);
  });
});
