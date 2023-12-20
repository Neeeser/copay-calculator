// api/users/get_user.tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

type Data = {
    username?: string;
    userId?: number;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // Initialize Cookies with the current request and response
    const cookies = new Cookies(req, res);
    const token = cookies.get('token'); // Get the token from HttpOnly cookie


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
