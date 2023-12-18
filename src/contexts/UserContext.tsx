import React, { createContext, useContext, useState } from 'react';

interface UserState {
    username: string;
    userId: number;
}

interface UserContextType {
    user: UserState | null;
    setUser: React.Dispatch<React.SetStateAction<UserState | null>>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [user, setUser] = useState<UserState | null>(null);

    const value = { user, setUser };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
