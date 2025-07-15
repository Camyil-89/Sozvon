import { Mic, MicOff } from 'lucide-react';

const Participants = ({ participants }) => {
    return (
        <div className="h-full overflow-y-auto p-4">
            <ul className="space-y-2">
                {participants.map((participant) => (
                    <li
                        key={participant.sid}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            {participant.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {participant.name || 'Участник'}
                            <div className='text-xs text-gray-1000 opacity-30'>{participant.identity}</div>
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            {participant.isMicrophoneEnabled ? (
                                <Mic size={14} className="text-green-500" />
                            ) : (
                                <MicOff size={14} className="text-red-500" />
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Participants;