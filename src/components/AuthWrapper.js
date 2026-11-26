import React from 'react';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Alert, Box, CircularProgress, Container } from '@mui/material';

// Waits for Firebase to restore the session before rendering the page.
// Signing in and out lives in the NavBar.
const AuthWrapper = ({ children }) => {
    const [, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress aria-label="Loading" />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">Authentication error: {error.message}</Alert>
            </Container>
        );
    }

    return <>{children}</>;
}

export default AuthWrapper;
