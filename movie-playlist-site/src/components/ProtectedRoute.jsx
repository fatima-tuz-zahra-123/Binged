import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} />;
  }

  return children;
};

export default ProtectedRoute; 