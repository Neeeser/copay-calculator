// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the shape of your user state
interface UserState {
    username: string;
    userId: number;
}

// Create the context with a default value
const UserContext = createContext<UserState | null>(null);

// Create a provider component
export const UserProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<UserState | null>(null);

    // The value that will be given to the context
    const value = { user, setUser };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Export the useContext hook for your user context
export const useUser = () => useContext(UserContext);
