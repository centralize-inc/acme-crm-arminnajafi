type LogContext = Record<string, unknown>;

function emit(level: 'debug' | 'info' | 'warn' | 'error', event: string, context?: LogContext) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

export const logger = {
  debug(event: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') emit('debug', event, context);
  },
  info(event: string, context?: LogContext) {
    emit('info', event, context);
  },
  warn(event: string, context?: LogContext) {
    emit('warn', event, context);
  },
  error(event: string, error: Error, context?: LogContext) {
    emit('error', event, {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    });
  },
};
