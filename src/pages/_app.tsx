// src/pages/_app.tsx
import React from 'react';
import { UserProvider } from '../contexts/UserContext';

const App = ({ Component, pageProps }) => {
    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
};

export default App;
