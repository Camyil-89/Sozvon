import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import Calls from '../../api/calls';
import FormCard from '../../components/formCard';

import profile from '../../api/profile'

const FriendPage = () => {
    const [friends, setFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('friends'); // friends or all
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [callError, setCallError] = useState(null);
    const navigate = useNavigate();

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
    }, [friends, allUsers]);

    const callUser = async (uid) => {
        try {
            const call = await Calls.callUserByUID(uid);
            if (!call) {
                alert("Не удалось совершить вызов. Попробуйте позже.");
                return;
            }
            if (call.messages) {
                let messages = []
                for (let message of call.messages) {
                    messages.push({ ...message, profile: await profile.getProfileByUID(message.UID) })
                }
                console.log(messages);
                setCallError(messages);
                return;
            }
            console.log(call);
            navigate(`/room/${call.UID}`)
        } catch (err) {
            console.error('Ошибка вызова:', err);
        }
    }

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
                                className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
                            >
                                <div>
                                    <p className="font-semibold text-white">
                                        {friend.profile?.name || 'Пользователь'}
                                    </p>
                                    <p className="text-sm text-indigo-200">UID: {friend.UID}</p>
                                </div>
                                <div className='space-x-3'>
                                    <button
                                        onClick={() => callUser(friend.UID)}
                                        className="bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Позвонить
                                    </button>
                                    <button
                                        onClick={() => removeFriend(friend.UID)}
                                        className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-indigo-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="mt-4 text-indigo-200">У вас пока нет друзей</p>
                        </div>
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
                            className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
                        >
                            <div>
                                <p className="font-semibold text-white">
                                    {user.profile?.name || 'Пользователь'}
                                </p>
                                <p className="text-sm text-indigo-200">UID: {user.UID}</p>
                            </div>
                            <div className='space-x-3'>
                                <button
                                    onClick={() => callUser(user.UID)}
                                    className="bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                >
                                    Позвонить
                                </button>
                                {user.isFriend ? (
                                    <button
                                        onClick={() => removeFriend(user.UID)}
                                        className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Удалить
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addFriend(user.UID)}
                                        className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Добавить
                                    </button>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-indigo-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-indigo-200">Нет доступных пользователей</p>
                    </div>
                )}
            </ul>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-indigo-200">Загрузка друзей...</p>
                </div>
            </div>
        );
    }
    if (callError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full">
                    <FormCard
                        title="Звонок не удался"
                        subtitle="Не удалось  позвонить"
                        error={error}
                        icon={
                            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        {callError.map((element, index) => (
                            <div key={index} className="text-red-600 text-md">
                                [{element.profile.profile.name}] {element.message}
                            </div>
                        ))}
                        <div className="text-center mt-6">

                            <button
                                onClick={() => { setCallError(null); }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                назад
                            </button>
                        </div>
                    </FormCard>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full">
                    <FormCard
                        title="Ошибка"
                        subtitle="Произошла ошибка при загрузке данных"
                        error={error}
                        icon={
                            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        <div className="text-center mt-6">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Повторить попытку
                            </button>
                        </div>
                    </FormCard>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full h-full max-w-4xl">
                <FormCard className="text-white h-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Друзья
                        </h1>
                        <p className="text-indigo-200">
                            Управляйте своими контактами и звонками
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/20 mb-8">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === 'friends'
                                ? 'text-white bg-white/20 border-b-2 border-indigo-400'
                                : 'text-indigo-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Мои друзья
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === 'all'
                                ? 'text-white bg-white/20 border-b-2 border-indigo-400'
                                : 'text-indigo-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Все пользователи
                        </button>
                    </div>

                    {/* Content */}
                    {renderContent()}
                </FormCard>
            </div>
        </div>
    );
};

export default FriendPage;