import {
    useRoomContext,
    useParticipants
} from '@livekit/components-react';
import Conference from './conference';
import Participants from './participants';
import Chat from './chat';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from '../../../api/axios';


const RoomLayout = ({ roomId, user, availableDevices }) => {
    const room = useRoomContext();
    const participants = useParticipants();


    const [UID_add, setUID_add] = useState('');

    const addUser = async () => {
        console.log(UID_add);
        try {
            let data = (await axios.get(`/api/rooms/${room.name}/add/${UID_add}`)).data;
            console.log(data);
        } catch { }

    }

    return (
        <div className="flex h-full w-full p-16">
            {/* Main Conference Area - Left Side */}
            <div className="flex flex-col flex-1 overflow-hidden h-full">
                {/* Conference Area */}
                <div className="flex-1 overflow-hidden">
                    <Conference
                        room={room}
                        availableDevices={availableDevices}
                    />
                </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="w-[300px] bg-white border-l shadow-lg flex flex-col h-full">
                {/* Participants List */}
                <div className="p-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Участники</h2>
                    <input
                        value={UID_add}
                        onChange={(e) => setUID_add(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addUser()} // Добавление по Enter
                        placeholder="Введите UID пользователя"
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <Participants participants={participants} />
                </div>

                {/* Chat Area - теперь с правильной структурой */}
                <div className="flex-1 flex flex-col max-h-full h-auto h-full">
                    <Chat
                        localParticipant={room.localParticipant}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomLayout;