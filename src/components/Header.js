import React from 'react';
import './Header.css';
import ipbLogo from '../assets/ipb-logo.png';

const Header = () => {
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
                </div>
            </div>
        </header>
    );
};

export default Header;
