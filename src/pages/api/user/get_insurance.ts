// pages/api/user/get_insurance.ts
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
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const userId = (decoded as any).userId; // Extract user ID from the token

        // Fetch the insurance records for the user
        const result = await sql`
            SELECT insurance_id, insurance_name, insurance_data
            FROM insurance
            WHERE user_id = ${userId};
        `;

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No insurance records found' });
        }

        // Transform the result into the InsuranceEntry format
        const insuranceEntries = result.rows.map(row => ({
            id: row.insurance_id.toString(),
            name: row.insurance_name,
            website: row.insurance_data.website,
            phone: row.insurance_data.phone_number,
            username: row.insurance_data.username,
            password: row.insurance_data.password
        }));

        // Respond with the formatted insurance data
        res.status(200).json({ insurances: insuranceEntries });
    } catch (error) {
        console.error('Error fetching insurance records:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
