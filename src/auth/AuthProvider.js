import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import keycloak from './keycloak';

const AuthContext = createContext(null);

const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({ isLoading: true, isAuthenticated: false, username: null });
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        keycloak.onTokenExpired = () => {
            keycloak.updateToken(30)
                .then((refreshed) => {
                    if (refreshed) setAuthHeader(keycloak.token);
                })
                .catch(() => {
                    setAuthHeader(null);
                    setState({ isLoading: false, isAuthenticated: false, username: null });
                });
        };

        keycloak
            .init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
            })
            .then((authenticated) => {
                setAuthHeader(authenticated ? keycloak.token : null);
                setState({
                    isLoading: false,
                    isAuthenticated: authenticated,
                    username: keycloak.tokenParsed?.preferred_username || null,
                });
            })
            .catch(() => {
                setState({ isLoading: false, isAuthenticated: false, username: null });
            });
    }, []);

    const signIn = () => keycloak.login();

    const signOut = () => {
        setAuthHeader(null);
        keycloak.logout({ redirectUri: window.location.origin });
    };

    return (
        <AuthContext.Provider value={{ state, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
    }
    return context;
};
