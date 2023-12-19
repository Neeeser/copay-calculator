// In your dbClient.ts
import { createClient } from '@vercel/postgres';

// If your variable is not prefixed with PUBLIC_, it will not be exposed to the client-side.
const connectionString = import.meta.env.POSTGRES_URL;

export const db = createClient({ connectionString });
