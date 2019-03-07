import { ASTNode, print } from 'graphql';
import { Plugin, Config, Refs } from 'pretty-format';

export default {
  test(value: any) {
    return value && typeof value.kind === 'string';
  },

  serialize(
    value: ASTNode,
    _config: Config,
    indentation: string,
    _depth: number,
    _refs: Refs,
    _printer: any,
  ): string {
    return print(value)
      .trim()
      .replace(/\n/g, '\n' + indentation);
  },
} as Plugin;
