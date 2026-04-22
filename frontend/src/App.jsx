import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import Services from './pages/Services';
import PrintInvoice from './pages/PrintInvoice';
import Logs from './pages/Logs';
import Coupons from './pages/Coupons';
import MyInvoices from './pages/MyInvoices';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="invoices" element={<PrivateRoute roles={['admin', 'receptionist']}><Invoices /></PrivateRoute>} />
          <Route path="services" element={<Services />} />
          <Route path="users" element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
          <Route path="logs" element={<PrivateRoute roles={['admin']}><Logs /></PrivateRoute>} />
          <Route path="coupons" element={<PrivateRoute roles={['admin']}><Coupons /></PrivateRoute>} />
          <Route path="my-bills" element={<PrivateRoute roles={['customer']}><MyInvoices /></PrivateRoute>} />
        </Route>
        
        <Route path="/print-invoice/:id" element={<PrivateRoute roles={['admin', 'receptionist', 'customer']}><PrintInvoice /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
