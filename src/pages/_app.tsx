import React from 'react';
import { UserProvider } from '../contexts/UserContext';
import type { AppProps } from 'next/app';
import '../styles/globals.css'; // Add this line to import your global styles

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default App;
