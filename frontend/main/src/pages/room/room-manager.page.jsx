import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import roomsProvider from "../../api/rooms";
import { useNavigate } from 'react-router-dom';

function RoomManagerPage() {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Загрузка комнат при монтировании компонента
        const fetchRooms = async () => {
            try {
                const response = await roomsProvider.getRooms();
                setRooms(response.data);
            } catch (error) {
                console.error("Ошибка при загрузке комнат:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;

        try {
            const response = await roomsProvider.createRoom(newRoomName);
            // Обновляем список комнат после создания
            const updatedRooms = await roomsProvider.getRooms();
            setRooms(updatedRooms.data);
            setNewRoomName("");
        } catch (error) {
            console.error("Ошибка при создании комнаты:", error);
        }
    };

    const handleJoinRoom = (room) => {
        console.log("Попытка войти в комнату:", room.name);
        // Здесь будет логика входа в комнату
        navigate(`/room/${room.UID}`)
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Левая панель с комнатами */}
                    <div className="w-full md:w-1/3 lg:w-1/4 bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Комнаты</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="Название комнаты"
                                    className="px-3 py-1 border rounded text-sm"
                                />
                                <button
                                    onClick={handleCreateRoom}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Создать
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <p>Загрузка...</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {rooms.map(room => (
                                    <li
                                        key={room.sid}
                                        className="p-3 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{room.name}</span>
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                                участников
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">
                                                <div className='text-xs text-gray-1000 opacity-30'>{room.UID.substring(0, 32)}</div>
                                            </span>
                                            <button
                                                onClick={() => handleJoinRoom(room)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                            >
                                                Войти
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Основное содержимое */}
                    <div className="flex-grow bg-white p-6 rounded-lg shadow">
                        {selectedRoom ? (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedRoom.name}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Здесь будет информация о комнате */}
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium">Статистика</h3>
                                        <p className="text-sm text-gray-500">Участников: {selectedRoom.numParticipants}</p>
                                        <p className="text-sm text-gray-500">Публикаторов: {selectedRoom.numPublishers}</p>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium">Настройки</h3>
                                        <p className="text-sm text-gray-500">Таймаут: {selectedRoom.emptyTimeout} сек</p>
                                        <p className="text-sm text-gray-500">Макс участников: {selectedRoom.maxParticipants}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">Выберите комнату для просмотра деталей</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RoomManagerPage;