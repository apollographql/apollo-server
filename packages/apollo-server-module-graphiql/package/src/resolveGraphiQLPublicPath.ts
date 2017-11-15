import * as path from 'path';

export function resolveGraphiQLPublicPath(): string {
  return path.join(__dirname, `public`);
}
