declare module 'ink' {
  import { createElement, Component as ReactComponent } from 'react';

  export class Component<P, S> extends ReactComponent<P, S> {}

  export const h: typeof createElement;
  export function renderToString(tree: JSX.Element): string;
  export function render(
    tree: JSX.Element,
    prevTree?: JSX.Element,
  ): JSX.Element;
  export function mount(
    tree: JSX.Element,
    stream: NodeJS.WritableStream,
  ): () => void;
}
