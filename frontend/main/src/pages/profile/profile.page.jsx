import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import MainBackground from '../../components/mainBackground';
import FormCard from '../../components/formCard';

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
        <MainBackground>
            <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                <div className="max-w-md mx-auto">
                    <FormCard
                        title="Профиль"
                        error={apiError}
                    >
                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-400/50 text-green-200 rounded-lg backdrop-blur-sm">
                                {successMessage}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">Email</label>
                                <p className="px-3 py-2 bg-white/10 rounded text-white border border-white/20">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">UID</label>
                                <p className="px-3 py-2 bg-white/10 rounded text-white border border-white/20">{user?.UID}</p>
                            </div>
                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">Имя</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            name: e.target.value
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            {/* Пока изображение не реализуем */}
                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">Фото профиля</label>
                                <input
                                    type="text"
                                    value={profileData.imageProfile}
                                    placeholder="URL изображения"
                                    disabled // временно отключено
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-gray-400 placeholder-indigo-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col space-y-3 pt-2">
                                <button
                                    onClick={handleProfileUpdate}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 w-full disabled:opacity-50 transition-all duration-200 shadow-lg"
                                >
                                    {isLoading ? 'Сохранение...' : 'Сохранить профиль'}
                                </button>
                                <button
                                    onClick={() => setPasswordModalOpen(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 w-full transition-all duration-200 shadow-lg"
                                >
                                    Изменить пароль
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 w-full transition-all duration-200 shadow-lg"
                                >
                                    Выйти
                                </button>
                            </div>
                        </div>
                    </FormCard>
                </div>
            </main>

            {passwordModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Изменение пароля</h2>

                        {passwordData.passwordChanged && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-400/50 text-green-200 rounded-lg backdrop-blur-sm">
                                Пароль успешно изменен
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">Новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={passwordData.showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                            passwordChanged: false
                                        })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                                        placeholder="Введите новый пароль"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-white"
                                        onClick={() => setPasswordData({
                                            ...passwordData,
                                            showNewPassword: !passwordData.showNewPassword
                                        })}
                                    >
                                        {passwordData.showNewPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>}
                            </div>

                            <div>
                                <label className="block text-indigo-200 text-sm font-bold mb-1">Подтвердите новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={passwordData.showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                            passwordChanged: false
                                        })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                                        placeholder="Повторите новый пароль"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-white"
                                        onClick={() => setPasswordData({
                                            ...passwordData,
                                            showConfirmPassword: !passwordData.showConfirmPassword
                                        })}
                                    >
                                        {passwordData.showConfirmPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 flex-1 transition-all duration-200 shadow-lg"
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
                                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 flex-1 transition-all duration-200"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainBackground>
    );
}

export default ProfilePage;