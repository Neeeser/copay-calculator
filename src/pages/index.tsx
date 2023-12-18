/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Container from '../components/Container';
import { verifyUser } from '../utils/database';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


const SimpleSignInForm = (): JSX.Element => {
    const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        // Call verifyUser from your database.ts with loginInfo
        try {
            const result = await verifyUser(loginInfo.username, loginInfo.password);
            if (result) {
                // If 'Remember Me' is checked, store the user information in local storage
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(result));
                }
                // Update your user context or global state here as well
                // setUser(result);
                console.log('Login successful:', result);
            } else {
                console.log('Login failed: Invalid username or password');
            }
        } catch (error) {
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
                                    Enter your email
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
                                    <Typography variant={'subtitle2'}>
                                        <Link
                                            component={'a'}
                                            color={'primary'}
                                            href={'#'}
                                            underline={'none'}
                                        >
                                            Forgot your password?
                                        </Link>
                                    </Typography>
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
                                            <Link
                                                component={'a'}
                                                color={'primary'}
                                                href={'#'}
                                                underline={'none'}
                                            >
                                                Sign up here.
                                            </Link>
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
                                    <Button size={'large'} variant={'contained'} type={'submit'}>
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
