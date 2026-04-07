import { useContext } from 'react';
import { CallContext } from '../context/CallContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, PhoneIncoming } from 'lucide-react';

const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const CallUI = () => {
    const {
        callState, callType, remoteUser,
        isMuted, isVideoOff, callDuration,
        localVideoRef, remoteVideoRef,
        acceptCall, declineCall, endCall,
        toggleMute, toggleVideo
    } = useContext(CallContext);

    if (callState === 'idle') return null;

    // Incoming call popup
    if (callState === 'incoming') {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full mx-4 animate-pulse">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhoneIncoming size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Incoming {callType === 'video' ? 'Video' : 'Voice'} Call</h2>
                    <p className="text-lg text-gray-600 mb-6">{remoteUser?.name || 'Unknown User'}</p>
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={declineCall}
                            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                            title="Decline"
                        >
                            <PhoneOff size={28} />
                        </button>
                        <button
                            onClick={acceptCall}
                            className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 animate-bounce"
                            title="Accept"
                        >
                            <Phone size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calling (waiting for answer) or Connected
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-[9999] flex flex-col">
            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-black">
                    {remoteUser?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <h2 className="text-2xl font-bold text-white">{remoteUser?.name || 'Unknown'}</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {callState === 'calling' ? 'Calling...' :
                     callState === 'connected' ? formatDuration(callDuration) :
                     'Connecting...'}
                </p>
            </div>

            {/* Video area */}
            <div className="flex-1 relative flex items-center justify-center px-4">
                {callType === 'video' ? (
                    <>
                        {/* Remote video (large) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full max-h-[70vh] object-cover rounded-2xl bg-gray-800"
                        />
                        {/* Local video (small overlay) */}
                        <div className="absolute bottom-4 right-4 w-32 h-44 sm:w-40 sm:h-56 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover bg-gray-700"
                            />
                            {isVideoOff && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <VideoOff size={24} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Voice call - show avatar */
                    <div className="text-center">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-5xl font-black ring-4 ring-white/20">
                            {remoteUser?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        {callState === 'calling' && (
                            <div className="flex gap-2 justify-center">
                                <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="pb-12 pt-6">
                <div className="flex justify-center gap-6">
                    {/* Mute toggle */}
                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            isMuted ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    {/* Video toggle (only for video calls) */}
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                isVideoOff ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                        </button>
                    )}

                    {/* End call */}
                    <button
                        onClick={endCall}
                        className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-600/30"
                        title="End call"
                    >
                        <PhoneOff size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallUI;
