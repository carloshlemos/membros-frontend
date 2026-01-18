import { useAuthContext } from "@asgardeo/auth-react";
import React from "react";

const LoginPage = () => {
    const { signIn } = useAuthContext();

    return (
        <div className="container">
            <h1>Login</h1>
            <button className="btn btn-primary" onClick={ () => signIn() }>Login</button>
        </div>
    );
};

export default LoginPage;