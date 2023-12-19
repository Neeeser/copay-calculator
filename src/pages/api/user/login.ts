// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type UserType = {
    username: string;
    userId: number;
};

type ErrorResponse = {
    error: string;
};

type LoginSuccessResponse = {
    user: UserType;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginSuccessResponse | ErrorResponse>
) {
    if (req.method === 'POST') {
        try {
            const { username, password, rememberMe } = req.body;

            const user = await verifyUser(username, password);
            if (user) {
                const token = jwt.sign(
                    { userId: user.userId, username: user.username },
                    process.env.JWT_SECRET ?? '',
                    { expiresIn: rememberMe ? '365d' : '1h' }
                );

                // Set cookie options
                const maxAge = rememberMe ? 365 * 24 * 60 * 60 : 60 * 60; // 1 year or 1 hour in seconds
                const isProduction = process.env.NODE_ENV === 'production';
                res.setHeader('Set-Cookie', [
                    `token=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Strict`
                ]);

                res.status(200).json({ user });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}

async function verifyUser(username: string, password: string): Promise<UserType | null> {
    const { rows } = await sql`SELECT user_id, password FROM users WHERE username = ${username}`;
    if (rows.length === 0) {
        return null;
    }
    const { user_id, password: hashedPassword } = rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
        return { username, userId: user_id };
    } else {
        return null;
    }
}
