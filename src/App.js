import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuthContext } from "@asgardeo/auth-react";
import AdminDashboard from './components/AdminDashboard';
import MemberUpdate from './components/MemberUpdate';
import MemberNew from "./components/MemberNew";
import MemberTokenRequester from "./components/MemberTokenRequester";
import Header from './components/Header';
import LoginPage from "./components/LoginPage";
import './App.css';

function App() {
    const { state } = useAuthContext();

    return (
        <Router>
            {
                state.isAuthenticated ? (
                    <>
                        <Header />
                        <div className="container mt-3">
                            <Routes>
                                <Route path="/" element={<AdminDashboard />} />
                                <Route path="/update-member" element={<MemberUpdate />} />
                                <Route path="/new-member" element={<MemberNew />} />
                                <Route path="/request-new-member-token" element={<MemberTokenRequester />} />
                            </Routes>
                        </div>
                    </>
                ) : (
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                    </Routes>
                )
            }
        </Router>
    );
}

export default App;
