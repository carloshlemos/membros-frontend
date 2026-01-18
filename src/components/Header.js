import React from 'react';
import './Header.css';
import ipbLogo from '../assets/ipb-logo.png';
import { useAuthContext } from "@asgardeo/auth-react";

const Header = () => {
    const { state, signOut } = useAuthContext();

    return (
        <header className="ipb-header">
            <div className="container">
                <div className="header-content">
                    <div className="logo-section">
                        <img src={ipbLogo} alt="Igreja Presbiteriana Balneário Meia Ponte" className="ipb-logo" />
                        <div className="header-text">
                            <h1 className="church-name">Igreja Presbiteriana Balneário Meia Ponte</h1>
                            <p className="subtitle">Sistema de Cadastro de Membros</p>
                        </div>
                    </div>
                    <div className="auth-section">
                        { state.isAuthenticated && (
                            <div className="user-info">
                                <span>Bem-vindo, { state.username }</span>
                                <button className="btn btn-secondary" onClick={ () => signOut() }>Logout</button>
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
