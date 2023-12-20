// pages/api/users/update_tooth_values.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const cookies = new Cookies(req, res);
    const token = cookies.get('token'); // Get the token from HttpOnly cookie

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const userId = (decoded as any).userId; // Extract user ID from the token
        const { toothData } = req.body; // Ensure this matches the structure of the data you expect

        // Update the tooth values for the user
        const result = await sql`
            UPDATE tooth_values
            SET tooth_data = ${JSON.stringify(toothData)}::jsonb
            WHERE user_id = ${userId}
            RETURNING *;
        `;

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found or tooth data not set' });
        }

        // Respond with the updated tooth values
        res.status(200).json({ toothData: result.rows[0].tooth_data, message: 'Tooth values updated successfully' });
    } catch (error) {
        console.error('Error updating tooth values:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
