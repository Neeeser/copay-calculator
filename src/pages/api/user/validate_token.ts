// pages/api/validate.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

type ValidateResponse = {
    valid: boolean;
    message?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ValidateResponse>
) {
    if (req.method === 'POST') {
        // Extract the token from the cookie
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;

        const secret = process.env.JWT_SECRET;

        if (!token) {
            return res.status(400).json({ valid: false, message: 'No token provided.' });
        }

        try {
            if (!secret) {
                return res.status(500).json({ valid: false, message: 'Failed to validate token. Invalid secret.' });
            }

            jwt.verify(token, secret, (error: jwt.VerifyErrors | null, decoded: any) => {
                if (error) {
                    return res.status(401).json({ valid: false, message: 'Invalid token.' });
                }
                // Token is valid
                return res.status(200).json({ valid: true });
            });
        } catch (error) {
            return res.status(500).json({ valid: false, message: 'Failed to validate token.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ valid: false, message: 'Method Not Allowed' });
    }
}
