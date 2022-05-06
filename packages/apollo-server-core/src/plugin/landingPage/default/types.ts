export interface ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * By default, the landing page plugin uses the latest version of the landing
   * page published to Apollo's CDN. If you'd like to pin the current version,
   * pass the SHA served at
   * https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt
   * here.
   */
  version?: string;
  /**
   * Set to false to suppress the footer which explains how to configure the
   * landing page.
   */
  footer?: boolean;
  /**
   * Users can configure their landing page to link to Studio Explorer with a
   * document loaded in the UI.
   */
  document?: string;
  /**
   * Users can configure their landing page to link to Studio Explorer with
   * variables loaded in the UI.
   */
  variables?: Record<string, string>;
  /**
   * Users can configure their landing page to link to Studio Explorer with
   * headers loaded in the UI.
   */
  headers?: Record<string, string>;
  /**
   * Users can configure their landing page to link to Studio Explorer with the
   * setting to include/exclude cookies loaded in the UI.
   */
  includeCookies?: boolean;
  /**
   * Users can configure their landing page to render an embedded Explorer if
   * given a graphRef, or an embedded Sandbox if there is not graphRef provided.
   */
  shouldEmbed?: boolean;
  // For Apollo use only.
  __internal_apolloStudioEnv__?: 'staging' | 'prod';
}

export interface ApolloServerPluginNonEmbeddedLandingPageLocalDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * Users can configure their landing page to render an embedded Explorer if
   * given a graphRef, or an embedded Sandbox if there is not graphRef provided.
   */
  shouldEmbed?: false;
}

export interface ApolloServerPluginNonEmbeddedLandingPageProductionDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * If specified, provide a link (with opt-in auto-redirect) to the Studio page
   * for the given graphRef. (You need to explicitly pass this here rather than
   * relying on the server's ApolloConfig, because if your server is publicly
   * accessible you may not want to display the graph ref publicly.)
   */
  graphRef?: string;
  /**
   * Users can configure their landing page to render an embedded Explorer if
   * given a graphRef, or an embedded Sandbox if there is not graphRef provided.
   */
  shouldEmbed?: false;
}

export interface ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * Users can configure their landing page to render an embedded Explorer if
   * given a graphRef, or an embedded Sandbox if there is not graphRef provided.
   */
  shouldEmbed: true;
}

export interface ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * If specified, provide a link (with opt-in auto-redirect) to the Studio page
   * for the given graphRef. (You need to explicitly pass this here rather than
   * relying on the server's ApolloConfig, because if your server is publicly
   * accessible you may not want to display the graph ref publicly.)
   */
  graphRef: string;
  /**
   * Users can configure their landing page to render an embedded Explorer if
   * given a graphRef, or an embedded Sandbox if there is not graphRef provided.
   */
  shouldEmbed: true;
  /**
   * Display options can be configured for the embedded Explorer.
   */
  displayOptions?: {
    // If showHeadersAndEnvVars is false, we don't show the tab where users can input headers & env vars.
    showHeadersAndEnvVars: boolean;
    // The initial state for the left documentation panel in Explorer. Users can expand this when using the Explorer.
    docsPanelState: 'open' | 'closed';
    // The theme for the embedded Explorer.  Users can configure this via settings using the Explorer.
    theme: 'light' | 'dark';
  };
  persistExplorerState: boolean;
}

export type ApolloServerPluginLandingPageLocalDefaultOptions =
  | ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions
  | ApolloServerPluginNonEmbeddedLandingPageLocalDefaultOptions;

export type ApolloServerPluginLandingPageProductionDefaultOptions =
  | ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions
  | ApolloServerPluginNonEmbeddedLandingPageProductionDefaultOptions;

export type LandingPageConfig =
  | ApolloServerPluginLandingPageLocalDefaultOptions
  | ApolloServerPluginLandingPageProductionDefaultOptions;
