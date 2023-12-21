// pages/dashboard.tsx

import { GetServerSideProps } from 'next';
import Topbar from '../components/Topbar'; // Import the Topbar component
import DashboardCard from '../components/DashboardCard';
import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { withAuth } from '../utils/withAuth';

export const getServerSideProps = withAuth();


const Dashboard = () => {
    return (

        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                // Gradient starts with white and transitions to blue towards the bottom
                backgroundImage: 'linear-gradient(180deg, hsla(0, 0%, 100%, 1) 0%, hsla(215, 100%, 95%, 1) 50%, hsla(215, 100%, 85%, 1) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                m: 0,
                p: 0,
                overflowX: 'hidden',
            }}
        >
            <Topbar />
            <Grid container spacing={2} sx={{ padding: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Calculator" link="/calculator" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Insurance" link="/insurances" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Tooth Prices" link="/tooth-prices" />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;