import React from 'react';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Container, Typography } from '@mui/material';
import Button from 'react-bootstrap/Button';

const provider = new GoogleAuthProvider();

const AuthWrapper = ({ children }) => {
    const [user, loading, error] = useAuthState(auth);
    if (loading) {
        return <div>Loading Authentication...</div>;
    }
  
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            {user ? (
                <Container>
                    <header>
                        <Typography variant="h5" gutterBottom>
                            Welcome, {user.displayName}
                        </Typography>
                        <Button variant="outline-secondary" size="sm" onClick={() => signOut(auth)}>Log Out</Button>
                    </header>
                </Container>
            ): (
                <Container>
                    <div className="login-container">
                        <h2>Please Login To Manage Your Tasks</h2>
                        <Button variant="primary" onClick={() => signInWithPopup(auth, provider)}>
                        Sign in with Google
                        </Button>
                    </div>
                </Container>
            )}
            {children}
        </>
    );
}

export default AuthWrapper;