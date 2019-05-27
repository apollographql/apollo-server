type AnyFunction = (...args: any[]) => any;
type Args<F> = F extends (...args: infer A) => any ? A : never;
type FunctionPropertyNames<T, F extends AnyFunction = AnyFunction> = {
  [K in keyof T]: T[K] extends F ? K : never
}[keyof T];
type AsFunction<F> = F extends AnyFunction ? F : never;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type DidEndHook<TArgs extends any[]> = (...args: TArgs) => void;

export class Dispatcher<T> {
  constructor(protected targets: T[]) {}

  public async invokeHookAsync<
    TMethodName extends FunctionPropertyNames<Required<T>>
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<UnwrapPromise<ReturnType<AsFunction<T[TMethodName]>>>[]> {
    return await Promise.all(
      this.targets.map(target => {
        const method = target[methodName];
        if (method && typeof method === 'function') {
          return method.apply(target, args);
        }
      }),
    );
  }

  public async invokeHooksUntilNonNull<
    TMethodName extends FunctionPropertyNames<Required<T>>
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<UnwrapPromise<ReturnType<AsFunction<T[TMethodName]>>> | null> {
    for (const target of this.targets) {
      const method = target[methodName];
      if (!(method && typeof method === 'function')) {
        continue;
      }
      const value = await method.apply(target, args);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  public invokeDidStartHook<
    TMethodName extends FunctionPropertyNames<
      Required<T>,
      (...args: any[]) => AnyFunction | void
    >,
    TEndHookArgs extends Args<ReturnType<AsFunction<T[TMethodName]>>>
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): DidEndHook<TEndHookArgs> {
    const didEndHooks: DidEndHook<TEndHookArgs>[] = [];

    for (const target of this.targets) {
      const method = target[methodName];
      if (method && typeof method === 'function') {
        const didEndHook = method.apply(target, args);
        if (didEndHook) {
          didEndHooks.push(didEndHook);
        }
      }
    }

    return (...args: TEndHookArgs) => {
      didEndHooks.reverse();

      for (const didEndHook of didEndHooks) {
        didEndHook(...args);
      }
    };
  }
}
