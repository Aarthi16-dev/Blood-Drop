import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchDonors from './pages/SearchDonors';
import Campaigns from './pages/Campaigns';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="search-donors"
              element={
                <ProtectedRoute>
                  <SearchDonors />
                </ProtectedRoute>
              }
            />
            <Route
              path="campaigns"
              element={
                <ProtectedRoute>
                  <Campaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
