import { Logger } from 'loglevel';
declare module 'loglevel-debug' {
  export default function(logger: Logger): any;
}
