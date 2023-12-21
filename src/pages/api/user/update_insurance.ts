// pages/api/user/update_insurance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
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
        console.log(req.body)
        const [insuranceName, insuranceData] = Object.entries(req.body)[0];

        // Check if the request is to update an existing insurance
        if (req.method === 'PUT') {
            // Convert the JavaScript object to a JSON string
            // Update the insurance for the user based on insurance name
            const result = await sql`
            UPDATE insurance
            SET insurance_data = ${JSON.stringify(insuranceData)},
                insurance_name = ${insuranceName}
            WHERE user_id = ${userId} AND insurance_name = ${insuranceName}
            RETURNING *;
        `;
            if (result.rowCount === 0) {
                // No row was updated, which means the insurance name was not found for this user
                return res.status(404).json({ message: 'Insurance not found with provided name' });
            }

            // Respond with the updated insurance data
            res.status(200).json({ insurance: result.rows[0], message: 'Insurance updated successfully', insuranceId: result.rows[0].insurance_id});
        } else if (req.method === 'POST') {
            // Add a new insurance for the user
            console.log(userId, insuranceName, insuranceData)
            const result = await sql`
                INSERT INTO insurance (user_id, insurance_name, insurance_data)
                VALUES (${userId}, ${insuranceName}, ${JSON.stringify(insuranceData)})
                RETURNING *;
            `;

            if (result.rowCount === 0) {
                // No row was inserted, handle as needed
                return res.status(400).json({ message: 'Failed to add new insurance' });
            }

            // Respond with the newly added insurance data
            res.status(201).json({ insurance: result.rows[0], message: 'Insurance added successfully' });
        }
        else if (req.method === 'DELETE') {
            // Assuming you pass the insurance ID as a query parameter or in the body
            const { insuranceId } = req.body; // or req.query if passed as a query parameter

            // Perform the deletion
            const result = await sql`
                DELETE FROM insurance
                WHERE user_id = ${userId} AND insurance_id = ${insuranceId}
                RETURNING *;
            `;

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Insurance not found or user mismatch' });
            }

            // Respond with success message
            return res.status(200).json({ message: 'Insurance deleted successfully' });
        }

    } catch (error) {
        console.error('Error handling insurance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
