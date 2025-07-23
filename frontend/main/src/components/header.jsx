import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import rooms from '../api/rooms';

function Header() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    return (
        <nav className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6">
            <div className="px-4 sm:px-6 md:px-[200px]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2 hover:opacity-75 cursor-pointer">
                        <img src="/logoSozvonLite1.svg" alt="Логотип Sozvon" className="h-16 w-auto" />
                        <Link to="/" className="text-2xl font-bold">
                            Sozvon
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <Link to="/room" className="hover:text-[#6e9eac] transition">Создать комнату</Link>
                        <Link to="/friend" className="hover:text-[#6e9eac] transition">Друзья</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="px-4 py-2 rounded-lg hover:bg-[#1e4c61] transition hidden sm:block">
                                    Профиль
                                </Link>
                                {user?.roles.includes("admin") || user?.roles.includes("seller") ? (
                                    <Link to="/admin/users" className="px-4 py-2 rounded-lg hover:bg-[#1e4c61] transition hidden sm:block">
                                        Панель администратора
                                    </Link>
                                ) : null}
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-[#1e4c61] transition hidden sm:block">
                                Войти
                            </Link>
                        )}
                        <Link to="/room">
                            <button className="px-4 py-2 bg-[#256e91] rounded-lg hover:bg-[#1e4c61] transition">
                                Начать встречу
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
        // <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10">
        //     <div className="container mx-auto flex justify-between items-center">
        //         <div className="text-2xl font-bold">
        //             <Link to="/" className="hover:text-gray-300">
        //                 Sozvon
        //             </Link></div>
        //         <div className="hidden md:flex space-x-6">
        //             <Link to="/room" className="hover:text-gray-300">
        //                 Создать комнату
        //             </Link>
        //         </div>
        //         <div className="hidden md:flex space-x-6">
        //             <Link to="/friend" className="hover:text-gray-300">
        //                 Друзья
        //             </Link>
        //         </div>
        //         <div className="flex items-center space-x-4">
        //             {isAuthenticated ? (
        //                 <Link to="/profile" className="text-sm font-medium hover:text-gray-300">
        //                     Профиль
        //                 </Link>
        //             ) : (
        //                 <Link to="/login" className="text-sm font-medium hover:text-gray-300">
        //                     Войти
        //                 </Link>
        //             )}
        //             {user?.roles.includes("admin") || user?.roles.includes("seller") ? (
        //                 <Link to="/admin/users" className="text-sm font-medium hover:text-gray-300">
        //                     Панель администратора
        //                 </Link>
        //             ) : null}
        //         </div>
        //     </div>
        // </nav >
    );
}

export default Header;