import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";

const PrivateRoute = ({ children }) => {
    const { state } = useAuthContext();

    if (state.isLoading) {
        return <div>Loading...</div>; // Or a more elaborate loading spinner
    }

    return state.isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;