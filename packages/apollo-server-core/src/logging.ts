export enum LogAction {
  request,
  parse,
  validation,
  execute,
  setup,
  cleanup,
}

export enum LogStep {
  start,
  end,
  status,
}

export interface LogMessage {
  action: LogAction;
  step: LogStep;
  key?: string;
  data?: any;
}

export interface LogFunction {
  (message: LogMessage);
}
