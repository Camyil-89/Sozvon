import React, { useEffect, useState } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import axios from '../../api/axios';

const FriendPage = () => {
    const [friends, setFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('friends'); // friends or all
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch friends and all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const friendsRes = await axios.get('/api/friends');
                const usersRes = await axios.get('/api/friends/all');

                setFriends(friendsRes.data);

                // Filter out current user by UID
                const currentUserUID = friendsRes.data[0]?.UID; // assuming the current user is included in friends data
                const filteredUsers = usersRes.data.filter(user => user.UID !== currentUserUID);
                setAllUsers(filteredUsers);
            } catch (err) {
                setError('Не удалось загрузить данные.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add a friend
    const addFriend = async (id) => {
        try {
            await axios.post(`/api/friends/${id}`);
            setAllUsers((prev) =>
                prev.map((user) => (user.UID === id ? { ...user, isFriend: true } : user))
            );
        } catch (err) {
            console.error('Не удалось добавить друга:', err);
        }
    };

    // Remove a friend
    const removeFriend = async (id) => {
        try {
            await axios.delete(`/api/friends/${id}`);
            setFriends((prev) => prev.filter((user) => user.UID !== id));
            setAllUsers((prev) =>
                prev.map((user) => (user.UID === id ? { ...user, isFriend: false } : user))
            );
        } catch (err) {
            console.error('Не удалось удалить друга:', err);
        }
    };

    const renderContent = () => {
        if (activeTab === 'friends') {
            return (
                <ul className="space-y-4">
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <li
                                key={friend.UID}
                                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {friend.profile.name}
                                    </p>
                                    <p className="text-sm text-gray-500">UID: {friend.UID}</p>
                                </div>
                                <button
                                    onClick={() => removeFriend(friend.UID)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                                >
                                    Удалить
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">У вас пока нет друзей.</p>
                    )}
                </ul>
            );
        }

        return (
            <ul className="space-y-4">
                {allUsers.length > 0 ? (
                    allUsers.map((user) => (
                        <li
                            key={user.UID}
                            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {user.profile.name}
                                </p>
                                <p className="text-sm text-gray-500">UID: {user.UID}</p>
                            </div>
                            {user.isFriend ? (
                                <button
                                    onClick={() => removeFriend(user.UID)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                                >
                                    Удалить
                                </button>
                            ) : (
                                <button
                                    onClick={() => addFriend(user.UID)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md transition"
                                >
                                    Добавить
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-4">Нет доступных пользователей.</p>
                )}
            </ul>
        );
    };

    if (loading)
        return <p className="text-center mt-10 text-gray-600">Загрузка...</p>;
    if (error)
        return <p className="text-red-500 text-center mt-10">{error}</p>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />

            <main className="flex flex-1 container mx-auto px-4 pt-24 pb-10">
                <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Друзья</h1>

                    {/* Tabs */}
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`py-2 px-4 font-medium ${activeTab === 'friends'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Мои друзья
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`py-2 px-4 font-medium ${activeTab === 'all'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Все пользователи
                        </button>
                    </div>

                    {/* Content */}
                    {renderContent()}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FriendPage;