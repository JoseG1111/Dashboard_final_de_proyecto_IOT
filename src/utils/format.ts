const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const fullFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export const formatClock = (date: Date): string => timeFormatter.format(date);

export const formatTimestamp = (iso: string): string => fullFormatter.format(new Date(iso));

export const formatShortTime = (iso: string): string => timeFormatter.format(new Date(iso));

export const formatConfidence = (value: number): string => `${Math.round(value * 100)}%`;

export const formatLatency = (value: number): string => `${Math.round(value)} ms`;

export const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

