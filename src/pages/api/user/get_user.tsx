// api/users/get_user.tsx

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

type Data = {
    username?: string;
    userId?: number;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // Check if it's a GET request
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer <token>"

    // Ensure the token exists
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    // Verify and decode the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');

        // You may want to add checks to ensure 'decoded' contains the expected properties
        if (typeof decoded === 'object' && 'userId' in decoded && 'username' in decoded) {
            res.status(200).json({
                userId: (decoded as any).userId,
                username: (decoded as any).username,
            });
        } else {
            res.status(400).json({ error: 'Token structure is not valid' });
        }
    } catch (error) {
        // Handle errors, such as token expiry
        res.status(403).json({ error: 'Token is not valid or has expired' });
    }
}
