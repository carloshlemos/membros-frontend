import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import MemberUpdate from './components/MemberUpdate';
import MemberNew from "./components/MemberNew";
import MemberTokenRequester from "./components/MemberTokenRequester";
import Header from './components/Header';
import './App.css';

function App() {
    return (
        <Router>
            <Header />
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<AdminDashboard/>}/>
                    <Route path="/update-member" element={<MemberUpdate/>}/>
                    <Route path="/new-member" element={<MemberNew/>}/>
                    <Route path="/request-new-member-token" element={<MemberTokenRequester/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
