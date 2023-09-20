export type TrampolineFunction<T> = (
  ...args: any[]
) => T | TrampolineFunction<T>;

export function trampoline<T>(
  fn: TrampolineFunction<T>
): (...args: any[]) => T {
  return function (...args: any[]): T {
    let result = fn(...args);
    while (typeof result === "function") {
      result = (result as TrampolineFunction<T>)(...args);
    }
    return result as T;
  };
}
