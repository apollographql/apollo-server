import { isDefined } from './isDefined.js';

type AsyncDidEndHook<TArgs extends any[]> = (...args: TArgs) => Promise<void>;
type SyncDidEndHook<TArgs extends any[]> = (...args: TArgs) => void;

export async function invokeDidStartHook<T, TEndHookArgs extends unknown[]>(
  targets: T[],
  hook: (t: T) => Promise<AsyncDidEndHook<TEndHookArgs> | undefined | void>,
): Promise<AsyncDidEndHook<TEndHookArgs>> {
  const didEndHooks = (
    await Promise.all(targets.map((target) => hook(target)))
  ).filter(isDefined);

  didEndHooks.reverse();

  return async (...args: TEndHookArgs) => {
    for (const didEndHook of didEndHooks) {
      didEndHook(...args);
    }
  };
}

// Almost all hooks are async, but as a special case, willResolveField is sync
// due to performance concerns.
export function invokeSyncDidStartHook<T, TEndHookArgs extends unknown[]>(
  targets: T[],
  hook: (t: T) => SyncDidEndHook<TEndHookArgs> | undefined | void,
): SyncDidEndHook<TEndHookArgs> {
  const didEndHooks: SyncDidEndHook<TEndHookArgs>[] = targets
    .map((target) => hook(target))
    .filter(isDefined);

  didEndHooks.reverse();

  return (...args: TEndHookArgs) => {
    for (const didEndHook of didEndHooks) {
      didEndHook(...args);
    }
  };
}

export async function invokeHooksUntilDefinedAndNonNull<T, TOut>(
  targets: T[],
  hook: (t: T) => Promise<TOut | null | undefined>,
): Promise<TOut | null> {
  for (const target of targets) {
    const value = await hook(target);
    if (value != null) {
      return value;
    }
  }
  return null;
}
