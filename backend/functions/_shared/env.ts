import { HttpError } from "./http.ts";

export type EnvRequirement = {
  name: string;
  required: boolean;
  configured: boolean;
  purpose: string;
};

export function getEnv(name: string): string | null {
  const value = Deno.env.get(name)?.trim();
  return value ? value : null;
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new HttpError(500, "missing_environment_variable", `Missing required environment variable: ${name}`, {
      env: name,
    });
  }
  return value;
}

export function isEnvConfigured(name: string): boolean {
  return Boolean(getEnv(name));
}

export function describeEnv(
  requirements: Array<Omit<EnvRequirement, "configured">>,
): EnvRequirement[] {
  return requirements.map((requirement) => ({
    ...requirement,
    configured: isEnvConfigured(requirement.name),
  }));
}

export function missingRequiredEnv(requirements: EnvRequirement[]): string[] {
  return requirements
    .filter((requirement) => requirement.required && !requirement.configured)
    .map((requirement) => requirement.name);
}
