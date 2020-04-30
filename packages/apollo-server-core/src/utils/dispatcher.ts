import { GraphQLRequestListener } from "apollo-server-plugin-base";

type AnyFunction = (...args: any[]) => any;
type Args<F> = F extends (...args: infer A) => any ? A : never;
type AsFunction<F> = F extends AnyFunction ? F : never;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type DidEndHook<TArgs extends any[]> = (...args: TArgs) => void;

export class Dispatcher<T extends GraphQLRequestListener> {
  constructor(protected targets: T[]) {}

  public async invokeHookAsync<TMethodName extends keyof T>(
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

  public async invokeDidStartHook<
    TMethodName extends keyof T,
    TEndHookArgs extends Args<ReturnType<AsFunction<T[TMethodName]>>>,
  >(
    methodName: TMethodName,
    ...args: Args<T[TMethodName]>
  ): Promise<DidEndHook<TEndHookArgs>> {
    const hookReturnValues: (DidEndHook<TEndHookArgs> | unknown)[] = await this.invokeHookAsync(methodName, ...args);

    const didEndHooks = hookReturnValues.filter(
      (hook): hook is DidEndHook<TEndHookArgs> => typeof hook !== 'undefined',
    );

    return (...args: TEndHookArgs) => {
      didEndHooks.reverse();

      for (const didEndHook of didEndHooks) {
        didEndHook(...args);
      }
    };
  }
}
