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
        if (lastState.status == "incoming_call" && (new Date() - new Date(lastState.incomingCall.time)) < 60000 && incomingCall == null) {
            setIncomingCall(lastState.incomingCall.call)
            console.log("asdasdas");
            setTimeout(() => {
                setIncomingCall(null)
            }, new Date() - new Date(lastState.incomingCall.time))
        }

        else if (lastState.status == "in_room") {
            console.log(lastState, `/room/${lastState?.room?.UID}`);
            navigate(`/room/${lastState?.room?.UID}`)
        }
        console.log(lastState);
    }, [lastState]);

    useEffect(() => {
        console.log("Start WS")
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket']
        });

        setSocket(newSocket);


        newSocket.on("call_state", async (data) => {
            setlastState(data);
        });

        newSocket.on('connect', () => {
            console.log('Connected with ID:', newSocket.id);
            newSocket.emit('call_state')
        });

        // Приходит событие звонка
        newSocket.on('call', async (data) => {
            console.log('Incoming call:', data);
            setIncomingCall(data);
        });

        // Отмена звонка
        newSocket.on('call_cancel', (data) => {
            console.log('Call cancelled:', data);
            setIncomingCall(null);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
            console.error('Description:', err.description);
            console.error('Context:', err.context);
        });

        newSocket.on('call_rejected', (err) => {
            socket?.emit('cancel_call', { callerId: incomingCall.callerId });
            navigate(`/`)
        });

        const loop_fetch = () => {
            newSocket.emit('call_state')
            setTimeout(() => {
                loop_fetch();
            }, 5000);
        }
        loop_fetch();
    }, []);

    const handleAccept = () => {
        setIncomingCall(null);
        navigate(`/room/${incomingCall?.data?.roomUID}`)
        socket?.emit('join_room', { roomUID: incomingCall?.data?.roomUID });
    };

    const handleReject = () => {
        socket?.emit('call_rejected');
        console.log("ASDASD");
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
                                onClick={handleReject}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded transition"
                            >
                                Отклонить
                            </button>
                            <button
                                onClick={handleAccept}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded transition"
                            >
                                Принять
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calls;