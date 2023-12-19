// src/components/DashboardCard.tsx

import React from 'react';
import { useRouter } from 'next/router';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Parallax from 'react-parallax-tilt';

interface DashboardCardProps {
    title: string;
    link: string;
    value?: number; // Optional value prop, if you want to display a number
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, link, value }) => {
    const router = useRouter();
    const theme = useTheme();

    const handleCardClick = () => {
        router.push(link);
    };

    return (
        <Parallax tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <Card
                sx={{
                    maxWidth: '100%', // Maximum width is 100% of its parent container
                    height: '400px', // Height is automatic based on its content
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.palette.common.white,
                    margin: 'auto', // Center the card in its grid cell
                    boxShadow: 3, // Optional shadow for better visual hierarchy
                }}
                onClick={handleCardClick}
            >
                <CardActionArea sx={{ width: '100%', height: '100%' }}>
                    <CardContent>
                        <Typography variant="h3" align="center" sx={{ color: theme.palette.primary.main }}>
                            {title}
                        </Typography>
                        {value !== undefined && (
                            <Typography variant="h4" align="center" sx={{ color: theme.palette.primary.main }}>
                                ${isNaN(value) || value === null ? '0' : value.toFixed(2)}
                            </Typography>
                        )}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Parallax>
    );
};

export default DashboardCard;