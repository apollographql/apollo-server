import { AnyFunction, AnyFunctionMap } from 'apollo-server-types';

type Args<F> = F extends (...args: infer A) => any ? A : never;
type AsFunction<F> = F extends AnyFunction ? F : never;
type StripPromise<T> = T extends Promise<infer U> ? U : never;

type DidEndHook<TArgs extends any[]> = (...args: TArgs) => void;
type AsyncDidEndHook<TArgs extends any[]> = (...args: TArgs) => Promise<void>;

export class Dispatcher<T extends AnyFunctionMap> {
  constructor(protected targets: T[]) {}

  private callTargets<TMethodName extends keyof T>(
    targets: T[],
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): ReturnType<AsFunction<T[TMethodName]>>[] {
    return targets.map((target) => {
      const method = target[methodName];
      if (typeof method === 'function') {
        return method.apply(target, args);
      }
    });
  }

  public async invokeHook<
    TMethodName extends keyof T,
    THookReturn extends StripPromise<ReturnType<AsFunction<T[TMethodName]>>>,
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<THookReturn[]> {
    return Promise.all(this.callTargets(this.targets, methodName, ...args));
  }

  public async invokeHooksUntilNonNull<TMethodName extends keyof T>(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<StripPromise<ReturnType<AsFunction<T[TMethodName]>>> | null> {
    for (const target of this.targets) {
      const method = target[methodName];
      if (typeof method !== 'function') {
        continue;
      }
      const value = await method.apply(target, args);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  public async invokeDidStartHook<
    TMethodName extends keyof T,
    TEndHookArgs extends Args<
      StripPromise<ReturnType<AsFunction<T[TMethodName]>>>
    >,
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<AsyncDidEndHook<TEndHookArgs>> {
    const hookReturnValues: (AsyncDidEndHook<TEndHookArgs> | void)[] =
      await Promise.all(this.callTargets(this.targets, methodName, ...args));

    const didEndHooks = hookReturnValues.filter(
      (hook): hook is AsyncDidEndHook<TEndHookArgs> => !!hook,
    );
    didEndHooks.reverse();

    return async (...args: TEndHookArgs) => {
      await Promise.all(didEndHooks.map((hook) => hook(...args)));
    };
  }

  // Almost all hooks are async, but as a special case, willResolveField is sync
  // due to performance concerns.
  public invokeSyncDidStartHook<
    TMethodName extends keyof T,
    TEndHookArgs extends Args<ReturnType<AsFunction<T[TMethodName]>>>,
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): DidEndHook<TEndHookArgs> {
    const didEndHooks: DidEndHook<TEndHookArgs>[] = [];

    for (const target of this.targets) {
      const method = target[methodName];
      if (typeof method === 'function') {
        const didEndHook = method.apply(target, args);
        if (didEndHook) {
          didEndHooks.push(didEndHook);
        }
      }
    }
    didEndHooks.reverse();

    return (...args: TEndHookArgs) => {
      for (const didEndHook of didEndHooks) {
        didEndHook(...args);
      }
    };
  }
}
