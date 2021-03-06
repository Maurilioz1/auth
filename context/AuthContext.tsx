import { useRouter } from "next/router";
import { createContext, ReactNode, useState } from "react";
import { setCookie } from 'nookies';
import { api } from "../services/api";

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user: User;
};

type AuthProviderProps = {
    children: ReactNode;
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(null);
    const isAuthenticated = !!user;
    const router = useRouter();

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password,
            });

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setUser({
                email,
                permissions,
                roles
            });

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
        }

    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}