/**
 * Environment Loader
 *
 * Loads environment variables from .env files in the Next.js project
 * Following Next.js environment variable loading priority:
 * 1. .env.local (highest priority, loaded in all environments except test)
 * 2. .env.development / .env.production / .env (based on NODE_ENV)
 * 3. .env (lowest priority)
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

/**
 * Load environment variables from Next.js project .env files
 * This mimics Next.js behavior for environment variable loading
 */
export function loadNextjsEnv(projectRoot?: string): void {
  const root = projectRoot || process.cwd();
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Files to load in priority order (last one wins for dotenv, but we reverse it)
  // We'll load in reverse order so higher priority files override lower priority ones
  const envFiles = ['.env', `.env.${nodeEnv}`, '.env.local'];

  // Load each file if it exists
  for (const envFile of envFiles) {
    const envPath = path.join(root, envFile);
    if (fs.existsSync(envPath)) {
      // Load without overriding existing env vars (so later files can override)
      config({ path: envPath, override: false });
    }
  }
}
