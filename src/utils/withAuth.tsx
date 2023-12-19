import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export function withAuth(gssp?: GetServerSideProps): GetServerSideProps {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const cookie = ctx.req.headers.cookie;
        if (!cookie) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        const dev = process.env.NODE_ENV !== 'production';
        const server = dev ? 'http://localhost:3000' : 'https://copay-calculator.vercel.app/';
        const apiUrl = `${server}/api/user/validate_token`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.req.headers.cookie || '',
            },
        });

        if (!response.ok) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        // Call the provided gssp function
        const result = gssp ? await gssp(ctx) : { props: {} };
        return result;
    };
}