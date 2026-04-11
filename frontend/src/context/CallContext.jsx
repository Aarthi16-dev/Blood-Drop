import { createContext, useState, useRef, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';

// eslint-disable-next-line react-refresh/only-export-components -- context + provider stay together for this app
export const CallContext = createContext();

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

export const CallProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [callState, setCallState] = useState('idle'); // idle, calling, incoming, connected
    const [callType, setCallType] = useState(null); // 'voice' or 'video'
    const [remoteUser, setRemoteUser] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const stompClient = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callTimer = useRef(null);
    const pendingCandidates = useRef([]);

    const cleanup = useCallback(() => {
        if (callTimer.current) {
            clearInterval(callTimer.current);
            callTimer.current = null;
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        remoteStream.current = null;
        pendingCandidates.current = [];
        setCallState('idle');
        setRemoteUser(null);
        setCallType(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setCallDuration(0);
    }, []);

    const startTimer = useCallback(() => {
        setCallDuration(0);
        callTimer.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    }, []);

    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && stompClient.current?.active) {
                stompClient.current.publish({
                    destination: '/app/ice-candidate',
                    body: JSON.stringify({
                        targetUserId: remoteUser?.id,
                        candidate: event.candidate
                    })
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Remote track received:', event.streams);
            remoteStream.current = event.streams[0];
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE state:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected') {
                setCallState('connected');
                startTimer();
            }
            if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
                cleanup();
            }
        };

        peerConnection.current = pc;
        return pc;
    }, [remoteUser, cleanup, startTimer]);

    const getMediaStream = useCallback(async (type) => {
        const constraints = {
            audio: true,
            video: type === 'video' ? { width: 640, height: 480 } : false
        };
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Failed to get media:', err);
            alert('Could not access camera/microphone. Please allow permissions.');
            throw err;
        }
    }, []);

    const handleOffer = useCallback(async (data) => {
        try {
            const stream = await getMediaStream(callType);
            const pc = createPeerConnection();

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

            // Process any pending ICE candidates
            for (const candidate of pendingCandidates.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.current = [];

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            stompClient.current.publish({
                destination: '/app/webrtc-answer',
                body: JSON.stringify({
                    targetUserId: remoteUser?.id,
                    sdp: pc.localDescription
                })
            });
        } catch (err) {
            console.error('Handle offer failed:', err);
        }
    }, [callType, remoteUser, createPeerConnection, getMediaStream]);

    const handleAnswer = useCallback(async (data) => {
        try {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

                // Process any pending ICE candidates
                for (const candidate of pendingCandidates.current) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidates.current = [];
            }
        } catch (err) {
            console.error('Handle answer failed:', err);
        }
    }, []);

    const handleIceCandidate = useCallback(async (data) => {
        try {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
                pendingCandidates.current.push(data.candidate);
            }
        } catch (err) {
            console.error('ICE candidate error:', err);
        }
    }, []);

    const startWebRTC = useCallback(async (isCaller) => {
        try {
            const stream = await getMediaStream(callType);
            const pc = createPeerConnection();

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            if (isCaller) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                stompClient.current.publish({
                    destination: '/app/webrtc-offer',
                    body: JSON.stringify({
                        targetUserId: remoteUser?.id,
                        sdp: pc.localDescription
                    })
                });
            }

            setCallState('connected');
        } catch (err) {
            console.error('WebRTC start failed:', err);
            cleanup();
        }
    }, [callType, remoteUser, createPeerConnection, cleanup, getMediaStream]);

    const webrtcHandlersRef = useRef({
        startWebRTC: async () => {},
        cleanup: () => {},
        handleOffer: async () => {},
        handleAnswer: async () => {},
        handleIceCandidate: async () => {},
    });

    useEffect(() => {
        webrtcHandlersRef.current = {
            startWebRTC,
            cleanup,
            handleOffer,
            handleAnswer,
            handleIceCandidate,
        };
    }, [startWebRTC, cleanup, handleOffer, handleAnswer, handleIceCandidate]);

    // Connect to WebSocket when user is available
    useEffect(() => {
        if (!user?.id) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket connected for calling');

                // Listen for incoming calls
                client.subscribe(`/user/${user.id}/queue/incoming-call`, (message) => {
                    const data = JSON.parse(message.body);
                    console.log('Incoming call:', data);
                    setRemoteUser({ id: data.callerUserId, name: data.callerName });
                    setCallType(data.callType || 'video');
                    setCallState('incoming');
                });

                // Call accepted
                client.subscribe(`/user/${user.id}/queue/call-accepted`, (message) => {
                    const data = JSON.parse(message.body);
                    console.log('Call accepted:', data);
                    void webrtcHandlersRef.current.startWebRTC(true);
                });

                // Call declined
                client.subscribe(`/user/${user.id}/queue/call-declined`, () => {
                    console.log('Call declined');
                    webrtcHandlersRef.current.cleanup();
                    alert('Call was declined.');
                });

                // WebRTC offer
                client.subscribe(`/user/${user.id}/queue/webrtc-offer`, async (message) => {
                    const data = JSON.parse(message.body);
                    console.log('Received WebRTC offer');
                    await webrtcHandlersRef.current.handleOffer(data);
                });

                // WebRTC answer
                client.subscribe(`/user/${user.id}/queue/webrtc-answer`, async (message) => {
                    const data = JSON.parse(message.body);
                    console.log('Received WebRTC answer');
                    await webrtcHandlersRef.current.handleAnswer(data);
                });

                // ICE candidate
                client.subscribe(`/user/${user.id}/queue/ice-candidate`, async (message) => {
                    const data = JSON.parse(message.body);
                    await webrtcHandlersRef.current.handleIceCandidate(data);
                });

                // Call ended
                client.subscribe(`/user/${user.id}/queue/call-ended`, () => {
                    console.log('Call ended by remote');
                    webrtcHandlersRef.current.cleanup();
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (client.active) client.deactivate();
        };
    }, [user?.id]);

    // Public API
    const callUser = (targetUserId, targetUserName, type = 'video') => {
        if (callState !== 'idle') {
            alert('You are already in a call.');
            return;
        }
        setRemoteUser({ id: targetUserId, name: targetUserName });
        setCallType(type);
        setCallState('calling');

        stompClient.current?.publish({
            destination: '/app/call-request',
            body: JSON.stringify({
                targetUserId,
                callerUserId: user.id,
                callerName: user.name,
                callType: type
            })
        });
    };

    const acceptCall = () => {
        if (callState !== 'incoming') return;
        setCallState('connected');

        stompClient.current?.publish({
            destination: '/app/call-accept',
            body: JSON.stringify({
                callerUserId: remoteUser?.id
            })
        });

        void startWebRTC(false);
    };

    const declineCall = () => {
        if (callState !== 'incoming') return;

        stompClient.current?.publish({
            destination: '/app/call-decline',
            body: JSON.stringify({
                callerUserId: remoteUser?.id
            })
        });

        cleanup();
    };

    const endCall = () => {
        if (remoteUser?.id) {
            stompClient.current?.publish({
                destination: '/app/call-end',
                body: JSON.stringify({
                    targetUserId: remoteUser.id
                })
            });
        }
        cleanup();
    };

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(prev => !prev);
        }
    };

    return (
        <CallContext.Provider value={{
            callState, callType, remoteUser,
            isMuted, isVideoOff, callDuration,
            localVideoRef, remoteVideoRef,
            callUser, acceptCall, declineCall, endCall,
            toggleMute, toggleVideo
        }}>
            {children}
        </CallContext.Provider>
    );
};
