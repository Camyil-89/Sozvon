import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/header';
import Footer from '../../components/footer';

function ProfilePage() {
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        imageProfile: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
        showNewPassword: false,
        showConfirmPassword: false,
        passwordChanged: false
    });
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Загрузка данных профиля при монтировании
    useEffect(() => {
        if (user?.profile) {
            setProfileData({
                name: user.profile.name || '',
                imageProfile: user.profile.imageProfile || ''
            });
        }
    }, [user]);

    const validatePasswordForm = () => {
        const newErrors = {
            newPassword: !passwordData.newPassword ? 'Введите новый пароль' :
                passwordData.newPassword.length < 6 ? 'Пароль должен содержать минимум 6 символов' : '',
            confirmPassword: passwordData.newPassword !== passwordData.confirmPassword ? 'Пароли не совпадают' : ''
        };
        setPasswordErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handlePasswordChange = async () => {
        if (!validatePasswordForm()) return;
        try {
            setIsLoading(true);
            await axios.post('/api/auth/change-password', {
                password: passwordData.newPassword
            });
            setPasswordData({
                newPassword: '',
                confirmPassword: '',
                showNewPassword: false,
                showConfirmPassword: false,
                passwordChanged: true
            });
            setPasswordErrors({ newPassword: '', confirmPassword: '' });
            setApiError(null);
        } catch (err) {
            setApiError('Не удалось изменить пароль');
            console.error('Error changing password:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setIsLoading(true);
            setApiError(null);
            setSuccessMessage('');

            const response = await axios.put('/api/profile', {
                name: profileData.name,
                imageProfile: profileData.imageProfile
            });

            setSuccessMessage('Профиль успешно обновлён');
        } catch (err) {
            setApiError('Не удалось обновить профиль');
            console.error('Ошибка при обновлении профиля:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden p-8 border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль</h1>

                    {apiError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {apiError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
                            <p className="px-3 py-2 bg-gray-100 rounded text-gray-800">{user?.email}</p>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Имя</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        name: e.target.value
                                    })
                                }
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        {/* Пока изображение не реализуем */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Фото профиля</label>
                            <input
                                type="text"
                                value={profileData.imageProfile}
                                placeholder="URL изображения"
                                disabled // временно отключено
                                className="w-full px-3 py-2 bg-gray-100 border rounded cursor-not-allowed"
                            />
                        </div>

                        <div className="flex flex-col space-y-3 pt-2">
                            <button
                                onClick={handleProfileUpdate}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full disabled:opacity-50"
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить профиль'}
                            </button>

                            <button
                                onClick={() => setPasswordModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                            >
                                Изменить пароль
                            </button>

                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Модальное окно изменения пароля */}
            {passwordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Изменение пароля</h2>
                        {passwordData.passwordChanged && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">
                                Пароль успешно изменен
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1">Новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={passwordData.showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                            passwordChanged: false
                                        })}
                                        className="w-full px-3 py-2 border rounded pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setPasswordData({
                                            ...passwordData,
                                            showNewPassword: !passwordData.showNewPassword
                                        })}
                                    >
                                        {passwordData.showNewPassword ? (
                                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1">Подтвердите новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={passwordData.showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                            passwordChanged: false
                                        })}
                                        className="w-full px-3 py-2 border rounded pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setPasswordData({
                                            ...passwordData,
                                            showConfirmPassword: !passwordData.showConfirmPassword
                                        })}
                                    >
                                        {passwordData.showConfirmPassword ? (
                                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex-1"
                                >
                                    {isLoading ? 'Сохранение...' : 'Изменить пароль'}
                                </button>
                                <button
                                    onClick={() => {
                                        setPasswordModalOpen(false);
                                        setPasswordData({
                                            newPassword: '',
                                            confirmPassword: '',
                                            showNewPassword: false,
                                            showConfirmPassword: false,
                                            passwordChanged: false
                                        });
                                        setPasswordErrors({ newPassword: '', confirmPassword: '' });
                                        setApiError(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 flex-1"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;