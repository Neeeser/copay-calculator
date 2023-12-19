/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import MuiLink from '@mui/material/Link';
import Container from '../components/Container';
import { verifyUser } from '../utils/database';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useUser } from '../contexts/UserContext';
import { useRouter } from 'next/router';

const SimpleSignInForm = (): JSX.Element => {
    const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(''); // State to hold login error messages
    const router = useRouter();

    const { setUser } = useUser(); // This is how you get access to the setUser function
    const isFormValid = loginInfo.username && loginInfo.password;

    // Assuming loginInfo, setUser, and rememberMe are defined in your component

    const handleLogin = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        setError(''); // Clear any existing errors
        if (!loginInfo.username || !loginInfo.password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginInfo.username,
                    password: loginInfo.password,
                    rememberMe: rememberMe,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the global user state
                setUser({
                    username: data.user.username,
                    userId: data.user.userId,
                });

                console.log('Login successful:', data.user);
                // Redirect to the dashboard or home page
                router.push('/dashboard'); // Use Next.js router for navigation
            } else {
                setError(data.error || 'Failed to log in. Please try again.');
                console.log('Login failed:', data.error);
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    };




    return (
        <Box bgcolor={'alternate.main'}>
            <Container maxWidth={800}>
                <Box marginBottom={4}>
                    <Typography
                        sx={{
                            textTransform: 'uppercase',
                        }}
                        gutterBottom
                        color={'text.secondary'}
                        fontWeight={700}
                    >
                        Login
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Welcome back
                    </Typography>
                    <Typography color="text.secondary">
                        Login to manage your account.
                    </Typography>
                </Box>



                <Card sx={{ p: { xs: 4, md: 6 } }}>
                    <form onSubmit={handleLogin}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <Typography variant={'subtitle2'} sx={{ marginBottom: 2 }}>
                                    Enter your username
                                </Typography>
                                <TextField
                                    label="Username *"
                                    variant="outlined"
                                    name={'username'}
                                    fullWidth
                                    value={loginInfo.username}
                                    onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box
                                    display="flex"
                                    flexDirection={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'stretched', sm: 'center' }}
                                    justifyContent={'space-between'}
                                    width={1}
                                    marginBottom={2}
                                >
                                    <Box marginBottom={{ xs: 1, sm: 0 }}>
                                        <Typography variant={'subtitle2'}>
                                            Enter your password
                                        </Typography>
                                    </Box>

                                </Box>
                                <TextField
                                    label="Password *"
                                    variant="outlined"
                                    name={'password'}
                                    type={'password'}
                                    fullWidth
                                    value={loginInfo.password}
                                    onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                                />
                            </Grid>
                            {error && (
                                <Box marginBottom={{ xs: 1, sm: 0 }}>
                                    <Typography variant={'subtitle2'}>
                                        {error}
                                    </Typography>
                                </Box>
                            )}

                            <Grid item container xs={12}>
                                <Box
                                    display="flex"
                                    flexDirection={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'stretched', sm: 'center' }}
                                    justifyContent={'space-between'}
                                    width={1}
                                    maxWidth={600}
                                    margin={'0 auto'}
                                >
                                    <Box marginBottom={{ xs: 1, sm: 0 }}>
                                        <Typography variant={'subtitle2'}>
                                            Don't have an account yet?{' '}
                                            <MuiLink
                                                color={'primary'}
                                                underline={'none'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.push('/SimpleSignUpForm');
                                                }}
                                            >
                                                Sign up here.
                                            </MuiLink>
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                name="rememberMe"
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant={'subtitle2'}>
                                                Remember me
                                            </Typography>
                                        }
                                    />
                                    <Button size={'large'} variant={'contained'} type={'submit'} disabled={!isFormValid} >
                                        Login
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Card>
            </Container>
        </Box>
    );
};

export default SimpleSignInForm;
