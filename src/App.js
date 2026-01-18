import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthContext } from "@asgardeo/auth-react";

import AdminDashboard from './components/AdminDashboard';
import MemberUpdate from './components/MemberUpdate';
import MemberNew from "./components/MemberNew";
import MemberTokenRequester from "./components/MemberTokenRequester";
import Header from './components/Header';
import LoginPage from "./components/LoginPage";
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
    const { state } = useAuthContext();

    return (
        <Router>
            <Routes>
                {/* Publicly accessible routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/new-member" element={<MemberNew />} />
                <Route path="/update-member" element={<MemberUpdate />} />
                <Route path="/request-new-member-token" element={<MemberTokenRequester />} />

                {/* Root path handling based on authentication */}
                <Route
                    path="/"
                    element={
                        state.isLoading ? (
                            <div>Loading...</div>
                        ) : state.isAuthenticated ? (
                            <Navigate to="/dashboard" replace /> // Redirect to dashboard if authenticated
                        ) : (
                            <Navigate to="/login" replace /> // Redirect to login if not authenticated
                        )
                    }
                />

                {/* Authenticated routes */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Header />
                            <div className="container mt-3">
                                <AdminDashboard />
                            </div>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
