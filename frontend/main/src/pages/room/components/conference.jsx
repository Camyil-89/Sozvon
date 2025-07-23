import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Share2, PhoneOff } from 'lucide-react';
import { VideoConference } from '@livekit/components-react';
import axios from '../../../api/axios';

const Conference = ({ room, availableDevices }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    useEffect(() => {
        if (!room) return;

        const handleConnected = async () => {
            await room.localParticipant.setMicrophoneEnabled(false);
            setIsMuted(true);
            // Вы можете здесь выполнить mute, UI-обновления и т.д.
        };

        room.on('connected', handleConnected);

        return () => {
            room.off('connected', handleConnected);
        };
    }, [room]);


    const toggleMute = useCallback(async () => {
        try {
            if (isMuted) {
                await room.localParticipant.setMicrophoneEnabled(true);
            } else {
                await room.localParticipant.setMicrophoneEnabled(false);
            }
            setIsMuted(!isMuted);
        } catch (error) {
            console.warn('Не удалось изменить состояние микрофона', error);
        }
    }, [isMuted, room]);

    const toggleCamera = useCallback(async () => {
        try {
            if (isCameraOff) {
                await room.localParticipant.setCameraEnabled(true);
            } else {
                await room.localParticipant.setCameraEnabled(false);
            }
            setIsCameraOff(!isCameraOff);
        } catch (error) {
            console.warn('Не удалось изменить состояние камеры', error);
        }
    }, [isCameraOff, room]);

    const toggleScreenShare = useCallback(async () => {
        try {
            if (isScreenSharing) {
                await room.localParticipant.setScreenShareEnabled(false);
            } else {
                const stream = await room.localParticipant.setScreenShareEnabled(true);
                const track = stream?.track?.mediaStreamTrack;
                if (track) {
                    track.onended = () => setIsScreenSharing(false);
                }
            }
            setIsScreenSharing(!isScreenSharing);
        } catch (error) {
            console.warn('Не удалось изменить демонстрацию экрана', error);
        }
    }, [isScreenSharing, room]);

    const handleLeave = useCallback(() => {
        room.disconnect();
        axios.get(`/api/rooms/${room.name}/leave`)
        window.location.href = '/';
    }, [room]);

    return (
        <div className='h-full w-full border-black border rounded-tl-xl rounded-bl-xl relative'>
            <div className="flex-1 min-h-0 overflow-hidden">
                <VideoConference className="h-full w-full object-cover" />
            </div>
            <div className="bg-gray-400 absolute top-0 left-0 w-full h-full opacity-25 z-[-1000] rounded-tl-xl rounded-bl-xl"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex gap-4">
                {availableDevices.hasMicrophone && (
                    <button
                        onClick={toggleMute}
                        className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                        aria-label={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                    >
                        {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                    </button>
                )}
                {availableDevices.hasCamera && (
                    <button
                        onClick={toggleCamera}
                        className={`p-3 rounded-full transition-all ${isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                        aria-label={isCameraOff ? 'Включить камеру' : 'Выключить камеру'}
                    >
                        {isCameraOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
                    </button>
                )}
                {availableDevices.canScreenShare && (
                    <button
                        onClick={toggleScreenShare}
                        className={`p-3 rounded-full transition-all ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                        aria-label={isScreenSharing ? 'Остановить демонстрацию экрана' : 'Демонстрация экрана'}
                    >
                        <Share2 size={20} className="text-white" />
                    </button>
                )}
                <button
                    onClick={handleLeave}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all"
                    aria-label="Покинуть встречу"
                >
                    <PhoneOff size={20} className="text-white" />
                </button>
            </div>
        </div>
    );
};

export default Conference;