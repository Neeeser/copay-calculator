import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Cookies from 'js-cookie';



const Topbar = (): JSX.Element => {
    const theme = useTheme();
    // Assuming anchorEl is expected to be an HTML element or null
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    // Assuming openMenuId is a string or null
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                // Make a request to the server endpoint that can access HttpOnly cookies
                const response = await fetch('/api/user/get_user', {
                    method: 'GET',
                    credentials: 'include' // Include credentials to ensure cookies are sent
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.username) {
                    setUsername(data.username);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUsername();
    }, []);

    const mock = [
        {
            groupTitle: 'Home',
            id: 'home',
            pages: [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: <HomeIcon />
                }
            ]
        },
        {
            groupTitle: 'Pages',
            id: 'business',
            pages: [

                {
                    title: 'Customers',
                    href: '#',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    ),
                },
                {
                    title: 'Logs',
                    href: '#',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    ),
                },

            ],
        },
        {
            groupTitle: 'Select tools',
            id: 'select-tools',
            pages: [
                {
                    title: 'Copay Calculator',
                    href: '/calculator',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                    ),
                },
                {
                    title: 'Tooth Prices',
                    href: '/tooth-prices',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    ),
                },
                {
                    title: 'Insurance',
                    href: '#',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                        </svg>
                    ),
                },


            ],
        },
        {
            groupTitle: username,
            id: 'settings',
            pages: [
                {
                    title: 'System',
                    href: '#',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    ),
                },


            ],
        },
        {
            groupTitle: 'Support',
            id: 'support',
            pages: [
                {
                    title: 'Insurance Numbers',
                    href: '#',
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                        </svg>
                    ),
                },
            ],
        },
    ];
    const handleClick = (event: React.MouseEvent<HTMLElement>, id: string): void => {
        setAnchorEl(event.currentTarget);
        setOpenMenuId(id);
    };


    const handleClose = (): void => {
        setAnchorEl(null);
        setOpenMenuId(null);
    };

    return (
        <Box
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            width={1}
        >
            <Box display={'flex'} alignItems={'center'} color={'primary.dark'}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={40}
                    height={40}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <Typography fontWeight={700} marginLeft={1}>
                    Copay Calculator
                </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto' }} alignItems={'center'}>
                {mock.map((item, i) => (
                    <React.Fragment key={i}>
                        <Tooltip title={item.groupTitle}>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginX: 1 }}>
                                <Typography
                                    onClick={(e) => handleClick(e, item.id)}
                                    color={'text.primary'}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {item.groupTitle}
                                </Typography>
                                <ExpandMoreIcon
                                    sx={{
                                        marginLeft: theme.spacing(1 / 4),
                                        width: 16,
                                        height: 16,
                                        transform:
                                            openMenuId === item.id ? 'rotate(180deg)' : 'none',
                                        color: 'text.secondary',
                                    }}
                                />
                            </Box>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenuId === item.id}
                            onClose={handleClose}
                            onClick={handleClose}
                            PaperProps={{
                                elevation: 1,
                                sx: {
                                    padding: 2,
                                    mt: 1.5,
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {item.pages.map((p, i) => (
                                <Box marginBottom={1 / 2} key={i}>
                                    <Button
                                        component={'a'}
                                        href={p.href}
                                        fullWidth
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: 'text.primary',
                                        }}
                                        startIcon={p.icon || null}
                                    >
                                        {p.title}
                                    </Button>
                                </Box>
                            ))}
                        </Menu>
                    </React.Fragment>
                ))}
            </Box>
            <Box display={'flex'} alignItems={'center'}>

                <Box
                    sx={{ display: { xs: 'block', md: 'none' } }}
                    alignItems={'center'}
                >
                    <Button
                        onClick={(e) => handleClick(e, 'mobile-menu')}
                        aria-label="Menu"
                        variant={'outlined'}
                        sx={{
                            borderRadius: 2,
                            minWidth: 'auto',
                            padding: 1,
                            borderColor: alpha(theme.palette.divider, 0.2),
                            marginLeft: 2,
                        }}
                    >
                        <MenuIcon />
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenuId === 'mobile-menu'}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 1,
                            sx: {
                                padding: 2,
                                mt: 1.5,
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Grid container spacing={4}>
                            {mock.map((item, i) => (
                                <Grid key={i} item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color={'text.secondary'}
                                        sx={{
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            marginBottom: 1,
                                            display: 'block',
                                        }}
                                    >
                                        {item.groupTitle}
                                    </Typography>
                                    <Box>
                                        {item.pages.map((p, i) => (
                                            <Box marginBottom={1 / 2} key={i}>
                                                <Button
                                                    component={'a'}
                                                    href={p.href}
                                                    fullWidth
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        color: 'text.primary',
                                                    }}
                                                    startIcon={p.icon || null}
                                                >
                                                    {p.title}
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Menu>
                </Box>
            </Box>
        </Box>

    );
};

export default Topbar;
