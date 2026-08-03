import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  // Zorunlu degil: ML servisi kapaliyken backend'in ayaga kalkmasini engellememeli.
  mlServiceUrl: process.env.ML_SERVICE_URL ?? "http://localhost:8000",
  gmailUser: requireEnv("GMAIL_USER"),
  gmailAppPassword: requireEnv("GMAIL_APP_PASSWORD"),
};
