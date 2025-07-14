import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import rooms from '../api/rooms';

function Header() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold">
                    <Link to="/" className="hover:text-gray-300">
                        Sozvon
                    </Link></div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/room" className="hover:text-gray-300">
                        Создать комнату
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <Link to="/profile" className="text-sm font-medium hover:text-gray-300">
                            Профиль
                        </Link>
                    ) : (
                        <Link to="/login" className="text-sm font-medium hover:text-gray-300">
                            Войти
                        </Link>
                    )}
                    {user?.roles.includes("admin") || user?.roles.includes("seller") ? (
                        <Link to="/admin/users" className="text-sm font-medium hover:text-gray-300">
                            Панель администратора
                        </Link>
                    ) : null}
                </div>
            </div>
        </nav >
    );
}

export default Header;