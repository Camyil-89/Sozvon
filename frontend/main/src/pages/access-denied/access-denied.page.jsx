import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaArrowLeft, FaHome } from 'react-icons/fa';

const AccessDeniedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
            >
                <div className="bg-red-500 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <FaLock className="text-white text-5xl animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Доступ запрещен</h1>
                </div>

                <div className="p-8 text-center">
                    <p className="text-gray-600 mb-6">
                        У вас недостаточно прав для просмотра этой страницы. Обратитесь к администратору или вернитесь на предыдущую страницу.
                    </p>

                    <div className="flex flex-col gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            <FaArrowLeft />
                            Вернуться назад
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            <FaHome />
                            На главную страницу
                        </motion.button>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Нужна помощь? <a href="mailto:support@example.com" className="text-indigo-600 hover:underline">Напишите в поддержку</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AccessDeniedPage;