import { createContext, useContext, useState, type ReactNode } from 'react';
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from 'react-oidc-context';
import { User } from 'oidc-client-ts';

// Mock user for development
const createMockUser = (): User => {
    const now = new Date();
    return new User({
        id_token: 'mock-id-token',
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        scope: 'openid profile email',
        profile: {
            sub: '123456789',
            email: 'dev@example.com',
            email_verified: true,
            name: 'Dev User',
            given_name: 'Dev',
            family_name: 'User',
            picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevUser',
            aud: 'mock-client-id',
            exp: Math.floor(now.getTime() / 1000) + 3600,
            iat: Math.floor(now.getTime() / 1000),
            iss: 'https://mock-issuer.com',
        },
        expires_at: Math.floor(now.getTime() / 1000) + 3600,
    });
};

interface MockAuthContextType {
    user: User | undefined;
    isAuthenticated: boolean;
    isLoading: boolean;
    signinRedirect: () => void;
    removeUser: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

interface MockAuthProviderProps {
    children: ReactNode;
}

const MockAuthProvider = ({ children }: MockAuthProviderProps) => {
    const [user, setUser] = useState<User | undefined>(createMockUser());
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const value = {
        user,
        isAuthenticated,
        isLoading: false,
        signinRedirect: () => {
            console.log('Mock auth: Sign in redirect');
            setUser(createMockUser());
            setIsAuthenticated(true);
        },
        removeUser: () => {
            console.log('Mock auth: User removed');
            setUser(undefined);
            setIsAuthenticated(false);
        },
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const isDevelopment = import.meta.env.MODE === 'development';
    const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

    // If mock auth is enabled in development, render a mock provider
    if (isDevelopment && useMockAuth) {
        return <MockAuthProvider>{children}</MockAuthProvider>;
    }

    // Otherwise use real Cognito auth
    const awsRegion = import.meta.env.VITE_AWS_REGION;
    const congitoUserPoolID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
    const congitoUserPoolClientID = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;
    const scope = import.meta.env.VITE_AWS_SCOPE;

    const cognitoAuthConfig = {
        authority: `https://cognito-idp.${awsRegion}.amazonaws.com/${congitoUserPoolID}`,
        client_id: congitoUserPoolClientID,
        redirect_uri: import.meta.env.VITE_AWS_REDIRECT_URL,
        response_type: 'code',
        scope: scope,
    };

    return (
        <OidcAuthProvider {...cognitoAuthConfig} revokeTokensOnSignout={true}>
            {children}
        </OidcAuthProvider>
    );
};

// Custom hook that works with both mock and real auth
export const useAuth = () => {
    const mockAuth = useContext(MockAuthContext);
    if (mockAuth) {
        return mockAuth;
    }

    // Fall back to real oidc-context auth
    return useOidcAuth();
};

