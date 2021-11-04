import {
  CursorShape,
  RenderPageOptions as PlaygroundRenderPageOptions,
  Theme,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';
export {
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';

// This specifies the React version of our fork of GraphQL Playground,
// `@apollographql/graphql-playground-react`.  It is related to, but not to
// be confused with, the `@apollographql/graphql-playground-html` package which
// is a dependency of Apollo Server's various integration `package.json`s files.
//
// The HTML (stub) file renders a `<script>` tag that loads the React (guts)
// from a CDN URL on jsdelivr.com, which allows serving of files from npm packages.
// 
// The version is passed to `@apollographql/graphql-playground-html`'s
// `renderPlaygroundPage` via the integration packages' `playground` config.
const playgroundVersion = '1.7.42';

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
