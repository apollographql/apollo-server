import {
  CursorShape,
  RenderPageOptions as PlaygroundRenderPageOptions,
  Theme,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';
export {
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';

// This specifies the version of `graphql-playground-react` that will be served
// from `graphql-playground-html`.  It's passed to ``graphql-playground-html`'s
// renderPlaygroundPage` via the integration packages' playground configuration.
const playgroundVersion = '1.7.30';

// https://stackoverflow.com/a/51365037
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends (object | undefined)
    ? RecursivePartial<T[P]>
    : T[P];
};

export type PlaygroundConfig =
  | RecursivePartial<PlaygroundRenderPageOptions>
  | boolean;

export const defaultPlaygroundOptions = {
  version: playgroundVersion,
  settings: {
    'general.betaUpdates': false,
    'editor.theme': 'dark' as Theme,
    'editor.cursorShape': 'line' as CursorShape,
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': true,
    'queryPlan.hideQueryPlanResponse': true,
    'editor.fontSize': 14,
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'request.credentials': 'omit',
  },
};

export function createPlaygroundOptions(
  playground?: PlaygroundConfig,
): PlaygroundRenderPageOptions | undefined {
  const isDev = process.env.NODE_ENV !== 'production';
  const enabled: boolean =
    typeof playground !== 'undefined' ? !!playground : isDev;

  if (!enabled) {
    return undefined;
  }

  const playgroundOverrides =
    typeof playground === 'boolean' ? {} : playground || {};

  const settingsOverrides = playgroundOverrides.hasOwnProperty('settings')
    ? {
        settings: {
          ...defaultPlaygroundOptions.settings,
          ...playgroundOverrides.settings,
        },
      }
    : { settings: undefined };

  const playgroundOptions: any = {
    ...defaultPlaygroundOptions,
    ...playgroundOverrides,
    ...settingsOverrides,
  };

  return playgroundOptions;
}
