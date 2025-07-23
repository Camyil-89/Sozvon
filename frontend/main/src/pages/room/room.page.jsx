import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { useParams } from 'react-router-dom';
import {
    LiveKitRoom,
    VideoConference,
    useRoomContext,
    useParticipants,
    useLocalParticipant,
    useChat,
    TrackLoop,
    useTracks,
    ChatMessage,
    ParticipantTile,
    useParticipantTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import rooms from '../../api/rooms';
import { Mic, MicOff, Video, VideoOff, Share2, PhoneOff, Send, MessageSquare } from 'lucide-react';
import { Spinner } from '../../components/room/Spinner';
import { Button } from '../../components/room/Button';
import { Avatar } from '../../components/room/Avatar';
import { Input } from '../../components/room/Input';
import { Track } from 'livekit-client';
import RoomLayout from './components/roomLayout';
import { useBackround } from '../../components/mainBackground';


function RoomPage() {
    const { id: roomId } = useParams();
    const { user } = useAuth();
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [devices, setDevices] = useState({
        hasMicrophone: false,
        hasCamera: false,
        canScreenShare: true
    });

    const { setHeaderVisibility } = useBackround();
    setHeaderVisibility(false);
    useEffect(() => {
        if (!roomId || !user) return;
        const fetchRoomData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Проверка доступных устройств
                const devices = await navigator.mediaDevices.enumerateDevices();
                setDevices({
                    hasMicrophone: devices.some(d => d.kind === 'audioinput'),
                    hasCamera: devices.some(d => d.kind === 'videoinput'),
                    canScreenShare: 'getDisplayMedia' in navigator.mediaDevices
                });

                // Получение токена для подключения
                const tokenResponse = await rooms.getToken(roomId);
                setToken(tokenResponse.data.token || tokenResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Не удалось подключиться к комнате');
                console.error('Error joining room:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();

        return () => {
            // Очистка при размонтировании
        };
    }, [roomId, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-co">
                <main className="flex-grow container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner className="h-12 w-12" />
                        <p className="text-gray-600">Подключение к комнате...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
                        <h3 className="text-red-600 font-medium text-lg mb-2">Ошибка</h3>
                        <p className="text-red-500">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                            Попробовать снова
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12 md:py-20">
            <style>{`
                    .lk-control-bar {
                        display: none !important;
                    }
                `}</style>
            <div className="flex-1 overflow-hidden mx-auto w-[75%]">
                {token && (
                    <LiveKitRoom
                        token={token}
                        serverUrl="ws://192.168.56.1:7880"
                        connect={true}
                        audio={devices.hasMicrophone}
                        video={devices.hasCamera}
                        options={{
                            adaptiveStream: true,
                            dynacast: true,
                            autoHandleMediaStreamErrors: true
                        }}
                    >
                        <RoomLayout
                            roomId={roomId}
                            user={user}
                            availableDevices={devices}
                        />
                    </LiveKitRoom>
                )}
            </div>
        </div>
    );
}

export default RoomPage;