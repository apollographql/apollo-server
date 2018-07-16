import {
  RenderPageOptions as PlaygroundRenderPageOptions,
  Theme,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';
export {
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';

// This specifies the version of GraphQL Playground that will be served
// from graphql-playground-html, and is passed to renderPlaygroundPage
// by the integration subclasses
const playgroundVersion = '1.7.2';

// https://stackoverflow.com/a/51365037
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object ? RecursivePartial<T[P]> : T[P]
};

export type PlaygroundConfig =
  | RecursivePartial<PlaygroundRenderPageOptions>
  | boolean;

export const defaultPlaygroundOptions = {
  version: playgroundVersion,
  settings: {
    'general.betaUpdates': false,
    'editor.theme': 'dark' as Theme,
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': true,
    'editor.fontSize': 14,
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'request.credentials': 'omit',
  },
};

export function createPlaygroundOptions(
  playground: PlaygroundConfig = {},
): PlaygroundRenderPageOptions | undefined {
  const isDev = process.env.NODE_ENV !== 'production';
  const enabled: boolean = typeof playground === 'boolean' ? playground : isDev;

  if (!enabled) {
    return undefined;
  }

  const playgroundOverrides =
    typeof playground === 'boolean' ? {} : playground || {};

  const playgroundOptions: PlaygroundRenderPageOptions = {
    ...defaultPlaygroundOptions,
    ...playgroundOverrides,
    settings: {
      ...defaultPlaygroundOptions.settings,
      ...playgroundOverrides.settings,
    },
  };

  return playgroundOptions;
}
