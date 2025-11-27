import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import MemberUpdate from './components/MemberUpdate';
import MemberCreate from "./components/MemberCreate";

function App() {
    return (
        <Router>
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<AdminDashboard/>}/>
                    <Route path="/update-member" element={<MemberUpdate/>}/>
                    <Route path="/new-member" element={<MemberCreate/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
