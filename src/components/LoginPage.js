import { useAuthContext } from "@asgardeo/auth-react";
import React from "react";
import Header from "./Header";
import './LoginPage.css';

const LoginPage = () => {
    const { signIn } = useAuthContext();

    return (
        <div className="login-page">
            <Header />
            <div className="login-container">
                <h2>Acesso ao Sistema</h2>
                <p>Para continuar, por favor, autentique-se usando sua conta.</p>
                <button className="btn btn-primary" onClick={ () => signIn() }>Entrar</button>
            </div>
        </div>
    );
};

export default LoginPage;