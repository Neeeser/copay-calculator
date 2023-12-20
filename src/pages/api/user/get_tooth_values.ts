// pages/api/users/get_tooth_values.tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const cookies = new Cookies(req, res);
    const token = cookies.get('token'); // Get the token from HttpOnly cookie

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const userId = (decoded as any).userId; // Extract user ID from the token

        // Retrieve the tooth values for the user
        const result = await sql`
            SELECT tooth_data
            FROM tooth_values
            WHERE user_id = ${userId};
        `;

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Tooth values not found for the user' });
        }
        console.log(result.rows[0].tooth_data);
        // Respond with the current tooth values
        res.status(200).json({ toothData: result.rows[0].tooth_data });
    } catch (error) {
        console.error('Error retrieving tooth values:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
