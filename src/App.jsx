import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import Product from './components/Product';
import Orders from './components/Orders';
import CustomerPage from './components/CustomerPage';
import OrdersPage from './components/OrdersPage';
import Inventory from './components/Inventory';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }/>
                <Route
                    path="/product"
                    element={
                        <ProtectedRoute>
                            <Product />
                        </ProtectedRoute>
                    }/>  
                    <Route
                    path="/customers"
                    element={
                        <ProtectedRoute>
                            <CustomerPage />
                        </ProtectedRoute>
                    }/>  

                    <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  }
/>
        <Route
          path="/orders/:userId"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;