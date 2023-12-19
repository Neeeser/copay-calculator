// lib/database.ts
import { sql } from "@vercel/postgres";
import bcrypt from 'bcryptjs';

type UserConfig = {
    // ... define your UserConfig structure
};

type ToothValues = {
    // ... define your ToothValues structure
};

type UserType = {
    username: string;
    userId: number;
};

const procedureCosts = {
    molar: 1795,
    premolar: 1695,
    anterior: 1595,
    molarRetreatment: 1925,
    premolarRetreatment: 1795,
    anteriorRetreatment: 1695
};

export async function getUserData(userId: string) {
    const { rows } = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
    return rows;
}

export const createUser = async (username: string, password: string) => {
    console.log(process.env.POSTGRES_URL)
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user
    const result = await sql`INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword}) RETURNING user_id`;
    const userId = result.rows[0].user_id;

    // Set default tooth values
    const defaultToothValues = JSON.stringify(procedureCosts);
    await sql`INSERT INTO tooth_values (user_id, tooth_data) VALUES (${userId}, ${defaultToothValues}::jsonb)`;

    // Console log
    console.log(`Created new user with id ${userId}`);

};


// export async function updateUserConfig(userId: string, newConfig: UserConfig) {
//     await sql`UPDATE configurations SET config_data = ${newConfig} WHERE user_id = ${userId}`;
// }

export async function getInsuranceData(userId: string) {
    const { rows } = await sql`SELECT insurance_data FROM insurance WHERE user_id = ${userId}`;
    return rows;
}

// export async function updateToothValues(userId: string, newToothValues: ToothValues) {
//     await sql`UPDATE tooth_values SET tooth_data = ${newToothValues} WHERE user_id = ${userId}`;
// }

export async function verifyUser(username: string, password: string): Promise<UserType | null> {
    // Retrieve the user and their hashed password from the database
    const { rows } = await sql`SELECT user_id, password FROM users WHERE username = ${username}`;

    // Check if any user was found
    if (rows.length === 0) {
        return null; // No user found with that username
    }

    // Extract user data
    const { user_id, password: hashedPassword } = rows[0];

    // Verify the password against the hashed password
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
        // If the password is correct, return the user data
        return { username, userId: user_id };
    } else {
        // Password is incorrect
        return null;
    }
}


