import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({
    redirectPath = '/login',
    unauthorizedRedirectPath = '/',
    allowedRoles = [],
    children
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return <div>Loading...</div>; // Или спиннер
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    if (
        allowedRoles.length > 0 &&
        !user?.roles?.some(role => allowedRoles.includes(role))
    ) {
        return <Navigate to={unauthorizedRedirectPath} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;