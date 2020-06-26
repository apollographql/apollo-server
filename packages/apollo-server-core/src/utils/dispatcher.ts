import { AnyFunction, AnyFunctionMap } from "apollo-server-types";

type Args<F> = F extends (...args: infer A) => any ? A : never;
type AsFunction<F> = F extends AnyFunction ? F : never;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type DidEndHook<TArgs extends any[]> = (...args: TArgs) => void;

export class Dispatcher<T extends AnyFunctionMap> {
  constructor(protected targets: T[]) {}

  private callTargets<TMethodName extends keyof T>(
    targets: T[],
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): ReturnType<AsFunction<T[TMethodName]>>[] {
    return targets.map(target => {
      const method = target[methodName];
      if (method && typeof method === 'function') {
        return method.apply(target, args);
      }
    });
  }

  public async invokeHookAsync<TMethodName extends keyof T>(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<ReturnType<AsFunction<T[TMethodName]>>[]> {
    return await Promise.all(
      this.callTargets(this.targets, methodName, ...args));
  }

  public invokeHookSync<TMethodName extends keyof T>(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): ReturnType<AsFunction<T[TMethodName]>>[] {
    return this.callTargets(this.targets, methodName, ...args);
  }

  public reverseInvokeHookSync<TMethodName extends keyof T>(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): ReturnType<AsFunction<T[TMethodName]>>[] {
    return this.callTargets(this.targets.reverse(), methodName, ...args);
  }

  public async invokeHooksUntilNonNull<TMethodName extends keyof T>(
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
    TMethodName extends keyof T,
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
