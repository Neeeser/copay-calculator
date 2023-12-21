// pages/logout.tsx
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Cookies from 'cookies';

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
    // Initialize Cookies
    const cookies = new Cookies(ctx.req, ctx.res);

    // Clear the specific cookies related to authentication
    cookies.set('token', '', { maxAge: -1, path: '/' });
    // You can add more cookies to clear if needed

    // Redirect to home page or login page after logout
    return {
        redirect: {
            destination: '/',
            permanent: false,
        },
    };
};

// This page does not render anything as it's just for logout functionality
const Logout = () => {
    return null;
};

export default Logout;
