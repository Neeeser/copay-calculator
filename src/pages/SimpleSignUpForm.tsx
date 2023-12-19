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
import { useRouter } from 'next/router';
import { createUser } from '../utils/database';

import Container from '../components/Container';

const SimpleSignUpForm = (): JSX.Element => {

  const router = useRouter();
  const [usernameValid, setUsernameValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {

    event.preventDefault();
    const target = event.target as typeof event.target & {
      username: { value: string };
      password: { value: string };
    };

    validateUsername(target.username.value);
    if (!usernameValid) {
      console.log("Username is invalid, can't proceed.");
      return; // Prevent form submission
    }


    const username = target.username.value; // get username from form
    const password = target.password.value; // get password from form
    validateUsername(username);
    if (!usernameValid) {
      console.log("Username is invalid, can't proceed.");
      return; // Prevent form submission
    }

    try {
      // Make a POST request to the API endpoint
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Handle response from the API
      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      // Redirect to the home page after successful sign up
      router.push('/');
    } catch (error) {
      console.error(error);
      // handle error
    }
  };

  const validateUsername = async (username: string) => {
    try {
      const response = await fetch('/api/user/validate-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      setUsernameValid(response.ok);
      setValidationMessage(data.message || '');
    } catch (error) {
      console.error(error);
      setUsernameValid(false);
      setValidationMessage('Error validating username');
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
            Signup
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Create an account
          </Typography>
          <Typography color="text.secondary">
            Fill out the form to get started.
          </Typography>
        </Box>
        <Card sx={{ p: { xs: 4, md: 6 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} >
                <Typography variant={'subtitle2'} sx={{ marginBottom: 2 }}>
                  Enter your username
                </Typography>
                <TextField
                  name="username"
                  label="Username *"
                  variant="outlined"
                  fullWidth
                  onChange={(e) => validateUsername(e.target.value)}
                  error={!usernameValid}
                  helperText={!usernameValid && validationMessage}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant={'subtitle2'} sx={{ marginBottom: 2 }}>
                  Enter your password
                </Typography>
                <TextField
                  label="Password *"
                  variant="outlined"
                  name={'password'}
                  type={'password'}
                  fullWidth
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
                      Already have an account?{' '}
                      <MuiLink
                        color={'primary'}
                        underline={'hover'}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push('/');
                        }}
                      >
                        Login.
                      </MuiLink>
                    </Typography>
                  </Box>
                  <Button size={'large'} variant={'contained'} type={'submit'} disabled={!usernameValid}>
                    Sign up
                  </Button>
                </Box>
              </Grid>
              <Grid
                item
                container
                xs={12}
                justifyContent={'center'}
                alignItems={'center'}
              >

              </Grid>
            </Grid>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default SimpleSignUpForm;
