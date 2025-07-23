import {
    useRoomContext,
    useParticipants
} from '@livekit/components-react';
import Conference from './conference';
import Participants from './participants';
import Chat from './chat';

const RoomLayout = ({ roomId, user, availableDevices }) => {
    const room = useRoomContext();
    const participants = useParticipants();

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