export function requireEnv(name: string): string {
  return `MOCK_${name}`;
}

export function optionalEnv(name: string): string {
  return `MOCK_${name}`;
}
