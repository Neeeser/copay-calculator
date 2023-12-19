// pages/api/user/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { sql } from "@vercel/postgres";

const procedureCosts = {
    molar: 1795,
    premolar: 1695,
    anterior: 1595,
    molarRetreatment: 1925,
    premolarRetreatment: 1795,
    anteriorRetreatment: 1695
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { username, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await sql`INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword}) RETURNING user_id`;
        const userId = result.rows[0].user_id;

        // Set default tooth values
        const defaultToothValues = JSON.stringify(procedureCosts);
        await sql`INSERT INTO tooth_values (user_id, tooth_data) VALUES (${userId}, ${defaultToothValues}::jsonb)`;

        // Respond with the created user ID
        res.status(201).json({ userId: userId, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
