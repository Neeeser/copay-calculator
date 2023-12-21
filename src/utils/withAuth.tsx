import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export function withAuth(gssp?: GetServerSideProps): GetServerSideProps {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const cookie = ctx.req.headers.cookie;
        const path = ctx.resolvedUrl; // Get the current path

        if (!cookie) {
            // Redirect to home if no cookie is present
            if (path !== '/') {
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                };
            }
        } else {
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
                // Redirect to home if token validation fails
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                };
            } else {
                // Redirect from home to dashboard if the user is already authenticated
                if (path === '/') {
                    return {
                        redirect: {
                            destination: '/dashboard',
                            permanent: false,
                        },
                    };
                }
            }
        }

        // Call the provided gssp function
        const result = gssp ? await gssp(ctx) : { props: {} };
        return result;
    };
}
