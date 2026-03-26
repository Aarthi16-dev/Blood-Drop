import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Phone, Clock, Send, Inbox, CheckCircle, RefreshCcw, Heart, Check } from 'lucide-react';

const Dashboard = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [allMessages, setAllMessages] = useState([]);
    const [conversations, setConversations] = useState({});
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);
    const [isEditingDonations, setIsEditingDonations] = useState(false);
    const [tempDonations, setTempDonations] = useState(user?.totalDonations || 0);

    console.log("Dashboard Render - Detailed User Info:", {
        hasUser: !!user,
        id: user?.id,
        idType: typeof user?.id,
        isVerified: user?.isVerified,
        allKeys: user ? Object.keys(user) : []
    });

    const fetchMessages = async () => {
        console.log("fetchMessages called, checking user.id:", user?.id);
        if (user?.id) {
            setLoading(true);
            try {
                console.log(`Fetching messages for user ID: ${user.id}`);
                const response = await api.get(`/message/all/${user.id}`);
                const messages = response.data;
                console.log("Messages received from backend:", messages);
                setAllMessages(messages);

                // Group messages into conversations
                const grouped = {};
                messages.forEach(msg => {
                    console.log(`Processing message ${msg.id}: senderId=${msg.senderId}, donorId=${msg.donorId}, myId=${user.id}`);

                    // Determine the "other" person in the conversation
                    const isMeSender = Number(msg.senderId) === Number(user.id);
                    const isMeDonor = Number(msg.donorId) === Number(user.id);

                    // If it's a system message (senderId is null), use a special 'system' ID
                    // But if it's a blood request alert, maybe group it by request info? 
                    // Actually, let's just use 'system' for all system alerts for now but ensure they show up.
                    const otherId = isMeSender ? (msg.donorId || 'system') : (msg.senderId || 'system');
                    const otherName = isMeSender ? (msg.donorName || 'System Notification') : (msg.senderName || 'Blood Drop Network');

                    const finalId = String(otherId);
                    const finalName = String(otherName);

                    console.log(`Mapped msg ${msg.id} to folder: ${finalId} (${finalName})`);

                    if (!grouped[finalId]) {
                        grouped[finalId] = {
                            id: finalId,
                            name: finalName,
                            messages: []
                        };
                    }
                    grouped[finalId].messages.push(msg);
                });

                // Sort messages in each conversation by date
                Object.values(grouped).forEach(conv => {
                    conv.messages.sort((a, b) => new Date(a.sentDate) - new Date(b.sentDate));
                });

                console.log("Grouped conversations:", grouped);
                setConversations(grouped);
            } catch (error) {
                console.error("Failed to fetch messages", error);
                console.log("Error details:", error.response?.data || error.message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [user?.id]);

    const handleManualRefresh = () => {
        setRefreshing(true);
        refreshUser();
        fetchMessages();
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConversationId) return;

        const conv = conversations[selectedConversationId];
        const lastMsg = conv.messages[conv.messages.length - 1];

        // The recipient of the reply is the "other" person in the conversation.
        // If I am the sender of the last message, the recipient is the donor of that message.
        // If I am the donor of the last message, the recipient is the sender of that message.
        // donorId in /message/send is the target recipient's ID.
        const targetRecipientId = Number(lastMsg.senderId) === Number(user.id) ? lastMsg.donorId : lastMsg.senderId;

        setSendingReply(true);
        try {
            await api.post('/message/send', {
                donorId: targetRecipientId, // This is our recipient
                senderId: user.id,
                senderName: user.name,
                contactNumber: user.phoneNumber,
                message: replyText
            });
            setReplyText('');
            fetchMessages(); // Refresh to show the new message
        } catch (error) {
            console.error("Failed override reply", error);
            alert("Failed to send reply.");
        } finally {
            setSendingReply(false);
        }
    };

    const handleConfirmDonation = async (senderName) => {
        if (!window.confirm(`Did you successfully donate blood to ${senderName}? This will increase your total donation count.`)) return;

        try {
            await api.post(`/donors/${user.id}/donated`);
            alert("Thank you for your life-saving contribution!");
            refreshUser();
        } catch (error) {
            console.error("Failed to update donation count", error);
            alert("Error updating donation count. Please try again.");
        }
    };

    const handleUpdateDonationCount = async () => {
        try {
            await api.put(`/donors/${user.id}/donations`, null, {
                params: { count: tempDonations }
            });
            setIsEditingDonations(false);
            refreshUser();
            alert("Donation count updated successfully!");
        } catch (error) {
            console.error("Failed to manual update donation count", error);
            alert("Error updating donation count.");
        }
    };

    const conversationList = Object.values(conversations).sort((a, b) => {
        const lastA = new Date(a.messages[a.messages.length - 1].sentDate);
        const lastB = new Date(b.messages[b.messages.length - 1].sentDate);
        return lastB - lastA;
    });

    const activeConversation = selectedConversationId ? conversations[selectedConversationId] : null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* User Profile Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            Welcome, {user?.name}!
                        </h2>
                        <p className="text-red-100 mt-1 opacity-90">{user?.email} • {user?.role}</p>
                    </div>
                    <button
                        onClick={handleManualRefresh}
                        className={`p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all ${refreshing ? 'animate-spin' : ''}`}
                        title="Refresh Dashboard"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                        <p className="text-red-100 text-sm font-medium">Blood Group</p>
                        <p className="text-3xl font-black mt-1">{user?.bloodGroup || 'N/A'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all flex flex-col justify-between">
                        <p className="text-red-100 text-sm font-medium">Total Donations</p>
                        {isEditingDonations ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="number"
                                    value={tempDonations}
                                    onChange={(e) => setTempDonations(parseInt(e.target.value))}
                                    className="bg-white/20 border border-white/30 rounded px-2 py-1 w-20 text-white font-bold h-10"
                                />
                                <button
                                    onClick={handleUpdateDonationCount}
                                    className="bg-green-500 hover:bg-green-600 p-2 rounded text-xs font-bold transition-colors h-10"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditingDonations(false)}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded text-xs font-bold transition-colors h-10"
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between group">
                                <p className="text-3xl font-black mt-1">{user?.totalDonations || 0}</p>
                                <button
                                    onClick={() => {
                                        setTempDonations(user?.totalDonations || 0);
                                        setIsEditingDonations(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-all"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                        <p className="text-red-100 text-sm font-medium">Search Visibility</p>
                        <p className="text-3xl font-black mt-1">{user?.available ? 'Active' : 'Hidden'}</p>
                    </div>
                </div>
            </div>

            {/* Messaging Section - Conversation View */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* Conversations Sidebar */}
                <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                    <div className="p-4 border-b bg-white">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Inbox size={20} className="text-red-600" /> Conversations
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading && !refreshing ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : conversationList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic">No conversations yet</div>
                        ) : (
                            conversationList.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversationId(conv.id)}
                                    className={`w-full p-4 text-left border-b border-gray-100 transition-all hover:bg-white flex items-center gap-3 ${selectedConversationId === conv.id ? 'bg-white border-l-4 border-l-red-600 shadow-sm' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                                        {conv.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-900 truncate">{conv.name}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {conv.messages[conv.messages.length - 1].message}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Thread */}
                <div className="flex-1 flex flex-col bg-gray-50/20">
                    {activeConversation ? (
                        <>
                            <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {activeConversation.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{activeConversation.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="capitalize">{activeConversation.role?.toLowerCase() || 'User'}</span>
                                            {activeConversation.messages.find(m => m.contactNumber)?.contactNumber && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 font-medium text-red-600">
                                                        {activeConversation.messages.find(m => m.contactNumber).contactNumber}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {user?.role === 'DONOR' && activeConversation.messages.some(m => m.donor?.id === user.id) && (
                                    <button
                                        onClick={() => handleConfirmDonation(activeConversation.name)}
                                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold hover:bg-green-200 transition-colors"
                                    >
                                        Mark as Donated
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                {activeConversation.messages.map(msg => {
                                    const isMe = Number(msg.senderId) === Number(user.id);
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                                <div className={`text-[10px] mt-2 flex items-center gap-2 ${isMe ? 'text-red-100' : 'text-gray-400'}`}>
                                                    {isMe ? <Check size={12} className="text-green-300" /> : <Clock size={10} />}
                                                    {new Date(msg.sentDate).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-white border-t">
                                <form onSubmit={handleSendReply} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type your reply..."
                                        className="flex-1 bg-gray-100 border-none rounded-full px-5 py-2.5 focus:ring-2 focus:ring-red-500"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        disabled={sendingReply}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim() || sendingReply}
                                        className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        {sendingReply ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Send size={18} />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                <Inbox size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Select a Conversation</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Choose a contact from the sidebar to view your message history and send replies.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
