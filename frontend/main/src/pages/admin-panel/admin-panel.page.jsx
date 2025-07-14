// pages/admin-panel/admin-panel.page.tsx
import { act, useEffect, useState } from 'react';
import {
    FaUsers,
    FaBoxOpen,
    FaClipboardList,
    FaCog,
    FaChartLine,
    FaComments
} from 'react-icons/fa';
import { RiCoupon3Line } from 'react-icons/ri';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/header';
import Footer from '../../components/footer';
import AdminUsersTable from '../../components/admin-panel/admin-users';

const AdminPanelPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const items = [];

        if (user?.roles?.includes("admin")) {
            setActiveTab("users");
            items.push(
                { id: 'users', name: 'Пользователи', icon: <FaUsers className="text-lg" /> },
            );
        }

        const uniqueItems = [...new Map(items.map(item => [item.id, item])).values()];
        setMenuItems(Array.from(uniqueItems));
    }, [user]);



    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <div className="flex flex-1 container mx-auto px-4 pt-24">
                <aside className="w-64 bg-white shadow-md rounded-lg mr-6 p-4 h-fit sticky top-28">
                    <nav>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center px-4 py-3 rounded-md transition-all ${activeTab === item.id
                                            ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="mr-3 text-gray-500">
                                            {item.icon}
                                        </span>
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="flex-1 bg-white shadow-md rounded-lg p-6 min-h-[calc(100vh-12rem)]">
                    {activeTab === 'users' && <AdminUsersTable />}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AdminPanelPage;