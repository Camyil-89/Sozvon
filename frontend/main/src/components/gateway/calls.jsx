import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import profile from '../../api/profile';

const SOCKET_URL = 'http://localhost:3001/calls';

const Calls = () => {
    const [socket, setSocket] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null); // { callerId: string }
    const [incomingCallUser, setIncomingCallUser] = useState(null); // { callerId: string }
    const [lastState, setlastState] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

    }, [location]);

    useEffect(() => {
        const fetch = async () => {
            const user = await profile.getProfileByUID(incomingCall.callerUID)
            setIncomingCallUser(user);

        }
        console.log(incomingCall)
        if (!incomingCall)
            return;
        fetch();
    }, [incomingCall])


    useEffect(() => {
        if (location.pathname.includes("/room/") && lastState.status != "in_room") {
            navigate("/")
        }
        if (lastState.status == "incoming_call") {
            setIncomingCall({ callerUID: lastState.incomingCall.userUID, roomUID: lastState.room.roomUID });
        }
        else {
            setIncomingCall(null);
        }
        console.log(lastState);
    }, [lastState]);

    useEffect(() => {
        console.log("Инициализация WebSocket");

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            timeout: 3000,
        });

        setSocket(newSocket);

        newSocket.on("call_state", (data) => {
            setlastState(data);
        });

        newSocket.on('connect', () => {
            console.log('Подключён с ID:', newSocket.id);
            newSocket.emit('call_state');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Отключён:', reason);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Ошибка подключения:', err.message);
        });

        newSocket.on('call', (data) => {
            console.log('Входящий звонок:', data);
            setIncomingCall(data);
        });

        newSocket.on('call_cancel', (data) => {
            console.log('Звонок отменён:', data);
            setIncomingCall(null);
        });

        newSocket.on('call_rejected', () => {
            newSocket.emit('cancel_call', { callerId: incomingCall?.callerId });
            navigate(`/`);
        });

        // Периодическая отправка состояния
        const loopFetch = () => {
            if (newSocket.connected) {
                newSocket.emit('call_state');
            }
            const timer = setTimeout(loopFetch, 5000);
            return timer;
        };
        const timerId = loopFetch();

        // Очистка при размонтировании
        return () => {
            console.log("Очистка WebSocket");
            clearTimeout(timerId);
            newSocket.close(); // Закрываем соединение
        };
    }, []);

    const handleAccept = () => {
        setIncomingCall(null);
        navigate(`/room/${incomingCall?.roomUID}`)
        socket?.emit('join_room');
    };

    const handleReject = () => {
        socket?.emit('call_rejected');
        setIncomingCall(null);
    };

    return (
        <div className="relative z-20">
            {incomingCall && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                        <h3 className="text-lg font-medium mb-4">Входящий звонок</h3>
                        <p className="text-gray-700 mb-6">
                            <span className="font-semibold"></span> {incomingCallUser?.profile?.name}
                        </p>
                        <div className="flex justify-center gap-4">

                            <button
                                onClick={handleAccept}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded transition"
                            >
                                Принять
                            </button>
                            <button
                                onClick={handleReject}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded transition"
                            >
                                Отклонить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calls;