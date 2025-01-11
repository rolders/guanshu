export function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function serializeDate(date: Date): string {
  return date.toISOString();
}

export function deserializeDate(dateString: string): Date {
  return new Date(dateString);
}
