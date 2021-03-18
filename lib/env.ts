// Get the value of an environment variable or throw an error if it is not set.
// You should only call this method at the top level of a module, so that all
// errors happen at application startup.
export function requireEnv(name: string): string {
  if (name in process.env) {
    return process.env[name]!;
  } else {
    throw new Error(`Required environment variable ${name} is not set`);
  }
}

// Get the value of an environment variable with a default value.
export function optionalEnv(name: string, def = ""): string {
  if (name in process.env) {
    return process.env[name]!;
  } else {
    return def;
  }
}
