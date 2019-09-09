declare module 'subtext' {
  import { IncomingMessage } from 'http'
  import stream from 'stream'

  export interface SubtextParseOptions {
    parse: boolean
    output: 'data' | 'file' | 'stream'
  }

  export function parse(
    request: IncomingMessage,
    tap: stream,
    options: SubtextParseOptions
  ): Promise<{
    mime: string,
    payload: any
  }>
}
