import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import PropertyManagement from './components/PropertyManagement';
import PropertyDetails from './components/PropertyDetails';
import TransactionSearchPage from './components/TransactionSearchPage';
import Last5TransactionsPage from './components/Last5TransactionsPage';
import TransactionDetailsPage from './components/TransactionDetailsPage';
import Inbox from './components/Inbox';
import MessageDetails from './components/MessageDetails';
import FavoriteList from './components/FavoriteList'; // Import FavoriteList
import AdminUserManagement from './components/AdminUserManagement'; // Import the component

export const AuthContext = createContext();

function App() {
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (token && storedUserId) {
            try {
                const decodedToken = decodeToken(token);
                if (isTokenExpired(decodedToken)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    setUserRole(null);
                    setUserId(null);
                } else {
                    setUserRole(decodedToken.role);
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error("Error decoding token: ", error);
                setUserRole(null);
                setUserId(null);
            }
        }
    }, []);

    const decodeToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error("Error decoding token: ", error);
            return {};
        }
    };

    const isTokenExpired = (token) => {
        const currentTime = Date.now() / 1000;
        return token.exp && token.exp < currentTime;
    };

    return (
        <AuthContext.Provider value={{ userRole, setUserRole, userId, setUserId }}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile/:id" element={<UserProfile />} />
                    <Route path="/manage-properties" element={(userRole === 'ADMIN' || userRole === 'AGENT') ? <PropertyManagement /> : <Navigate to="/" />} />
                    <Route path="/properties/:propertyId" element={<PropertyDetails />} />
                    <Route path="/transaction-search" element={<TransactionSearchPage />} />
                    <Route path="/transactions/:projectName/last5" element={<Last5TransactionsPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetailsPage />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/messages/:messageId" element={<MessageDetails />} />
                    <Route path="/favorites" element={<FavoriteList />} /> {/* Route to Favorite List */}
                    <Route path="/admin/users" element={userRole === 'ADMIN' ? <AdminUserManagement /> : <Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
