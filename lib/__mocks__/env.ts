export function requireEnv(name: string): string {
  return optionalEnv(name);
}

export function optionalEnv(name: string): string {
  switch (name) {
    case "CREDENTIALS_SECRET":
      return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    default:
      return `MOCK_${name}`;
  }
}
