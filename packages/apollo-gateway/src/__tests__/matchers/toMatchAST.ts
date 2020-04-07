import { print, ASTNode } from 'graphql';
const diff = require('jest-diff');

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toMatchAST(expected: ASTNode): R;
    }
  }
}

const lineEndRegex = /^/gm;
function indentString(string: string, count = 2) {
  if (!string) return string;
  return string.replace(lineEndRegex, ' '.repeat(count));
}

function toMatchAST(
  this: jest.MatcherUtils,
  received: ASTNode,
  expected: ASTNode,
): { message(): string; pass: boolean } {
  const receivedString = print(received);
  const expectedString = print(expected);

  const printReceived = (string: string) =>
    this.utils.RECEIVED_COLOR(indentString(string));
  const printExpected = (string: string) =>
    this.utils.EXPECTED_COLOR(indentString(string));

  const pass = this.equals(receivedString, expectedString);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toMatchAST') +
        '\n\n' +
        `Expected AST to not equal:\n` +
        printExpected(expectedString) +
        '\n' +
        `Received:\n` +
        printReceived(receivedString)
    : () => {
        const diffString = diff(expectedString, receivedString, {
          expand: this.expand,
        });
        return (
          this.utils.matcherHint('.toMatchAST') +
          '\n\n' +
          `Expected AST to equal:\n` +
          printExpected(expectedString) +
          '\n' +
          `Received:\n` +
          printReceived(receivedString) +
          (diffString ? `\n\nDifference:\n\n${diffString}` : '')
        );
      };
  return {
    message,
    pass,
  };
}

expect.extend({
  toMatchAST,
});
