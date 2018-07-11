import { RenderPageOptions as PlaygroundRenderPageOptions } from '@apollographql/graphql-playground-html/dist/render-playground-page';
export {
  ISettings,
  Tab,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';

// This specifies the version of GraphQL Playground that will be served
// from graphql-playground-html, and is passed to renderPlaygroundPage
// by the integration subclasses
const playgroundVersion = '1.7.2';

export type GuiOptions = {
  playgroundOptions?: Partial<PlaygroundRenderPageOptions>;
};

export type GuiConfig = GuiOptions | boolean;

export const defaultPlaygroundOptions: PlaygroundRenderPageOptions = {
  version: playgroundVersion,
  settings: {
    'general.betaUpdates': false,
    'editor.theme': 'dark',
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': true,
    'editor.fontSize': 14,
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'request.credentials': 'omit',
  },
};

export function createPlaygroundOptions(
  gui: GuiConfig,
): PlaygroundRenderPageOptions | undefined {
  const isDev = process.env.NODE_ENV === 'production';
  const enabled: boolean = typeof gui === 'boolean' ? gui : !isDev;

  if (!enabled) {
    return undefined;
  }

  const playgroundOverrides =
    typeof gui === 'boolean' ? {} : (gui && gui.playgroundOptions) || {};

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
