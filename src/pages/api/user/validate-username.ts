// pages/api/user/validate-username.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from "@vercel/postgres"; // Adjust the import path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.body;

  // Check if username contains only letters and numbers
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    return res.status(400).json({ message: 'Invalid username. Only letters and numbers are allowed.' });
  }

  try {
    // Check for existing user with the same username
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (result.rows.length > 0) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // If username is valid and not taken
    res.status(200).json({ message: 'Username is valid and available.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
