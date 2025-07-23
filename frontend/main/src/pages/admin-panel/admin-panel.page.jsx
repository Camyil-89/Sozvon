import { useEffect, useState } from 'react';
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
import MainBackground from '../../components/mainBackground';
import AdminUsersTable from '../../components/admin-panel/admin-users';
import FormCard from '../../components/formCard';

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

    // Иконки для FormCard (опционально)
    const getIconForTab = (tabId) => {
        switch (tabId) {
            case 'users': return <FaUsers />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-1 container mx-auto px-4 py-4">
            <aside className="w-64 bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl mr-6 p-4 h-fit sticky top-28 border border-white/20">
                <nav>
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                        ? 'bg-white/20 text-white font-medium border-l-4 border-white'
                                        : 'hover:bg-white/10 text-indigo-200'
                                        }`}
                                >
                                    <span className="mr-3">
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="flex-1">
                <div className="max-w-6xl mx-auto">
                    <FormCard
                        title={
                            menuItems.find(item => item.id === activeTab)?.name || 'Админ панель'
                        }
                        icon={getIconForTab(activeTab)}
                        className="min-h-[calc(100vh-12rem)]"
                    >
                        {activeTab === 'users' && <AdminUsersTable />}
                    </FormCard>
                </div>
            </main>
        </div>
    );
};

export default AdminPanelPage;