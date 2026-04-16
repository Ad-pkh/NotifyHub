import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './modules/dashboard/Dashboard';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import Events from './modules/event/Events';
import Subscriptions from './modules/subscription/Subscriptions';
import Layout from './shared/components/Layout';
import ProtectedRoute from './shared/lib/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/events" element={<Events />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
