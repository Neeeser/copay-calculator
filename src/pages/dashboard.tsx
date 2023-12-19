// pages/dashboard.tsx

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const cookie = ctx.req.headers.cookie;
    // Check if the cookie is present
    if (!cookie) {
        // Redirect if no cookie is found
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const dev = process.env.NODE_ENV !== 'production';
    const server = dev ? 'http://localhost:3000' : 'https://copay-calculator-andrew-neesers-projects.vercel.app';
    const apiUrl = `${server}/api/user/validate_token`;
    console.log('apiUrl', apiUrl);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': ctx.req.headers.cookie || '',
        },
    });

    console.log('response', response);
    // Redirect if the validation fails
    if (!response.ok) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    // Proceed to render the Dashboard if validation is successful
    return {
        props: {},
    };
};

const Dashboard = () => {
    return <h1>You are logged in</h1>;
};

export default Dashboard;
