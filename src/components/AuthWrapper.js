import React from 'react';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Container, Typography } from '@mui/material';

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
                        <button onClick={() => signOut(auth)}>Log Out</button>
                    </header>
                </Container>
            ): (
                <Container>
                    <div className="login-container">
                        <h2>Please Login To Manage Your Tasks</h2>
                        <button onClick={() => signInWithPopup(auth, provider)}>
                        Sign in with Google
                        </button>
                    </div>
                </Container>
            )}
            {children}
        </>
    );
}

export default AuthWrapper;