import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, Reply, Send, Loader2, ChevronRight, Wifi, WifiOff, PlusCircle } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import communicationApi from '../../api/modules/communication.api';
import { useDiscussionSocket } from '../../hooks/useDiscussionSocket';
import pusher from '../../services/socket';

// Group Item
const GroupItem = ({ group, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full text-left p-4 rounded-lg border mb-2 transition-all flex items-center justify-between"
    style={{
      borderColor: isActive ? COLORS.PRIMARY_BLUE : COLORS.BORDER,
      backgroundColor: isActive ? `${COLORS.PRIMARY_BLUE}10` : '#FFFFFF',
    }}
    whileHover={{ x: 4 }}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-blue-50">
        <MessageCircle size={18} className="text-blue-600" />
      </div>
      <h3 className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
        {group.title}
      </h3>
    </div>
    <ChevronRight size={16} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
  </motion.button>
);

// Topic Item
const TopicItem = ({ topic, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full text-left p-4 rounded-lg border mb-2 transition-all"
    style={{
      borderColor: isActive ? COLORS.PRIMARY_BLUE : COLORS.BORDER,
      backgroundColor: isActive ? `${COLORS.PRIMARY_BLUE}10` : '#FFFFFF',
    }}
    whileHover={{ x: 4 }}
  >
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold flex-1 text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
        {topic.title}
      </h3>
      {topic.status === 'closed' && (
        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">
          Closed
        </span>
      )}
    </div>
    <div className="flex items-center justify-between mt-2">
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs">
        By {topic.author_name}
      </p>
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-[10px]">
        {new Date(topic.created_at).toLocaleDateString()}
      </p>
    </div>
  </motion.button>
);

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isTeacher = message.author_role === 'TEACHER';
  const isSending = message.status === 'sending';
  
  return (
    <motion.div
      className="mb-4 flex"
      style={{ justifyContent: isTeacher ? 'flex-start' : 'flex-end' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`flex gap-3 max-w-[80%] ${isTeacher ? 'flex-row' : 'flex-row-reverse'}`}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: isTeacher ? COLORS.INDIGO : COLORS.PRIMARY_BLUE }}
        >
          {message.author_name.charAt(0)}
        </div>
        <div className={isTeacher ? 'text-left' : 'text-right'}>
          <p className="text-[10px] font-semibold mb-1" style={{ color: isTeacher ? COLORS.INDIGO : COLORS.PRIMARY_BLUE }}>
            {message.author_name} {isTeacher && '(Teacher)'}
          </p>
          <div
            className={`p-3 rounded-2xl transition-all ${isTeacher ? 'rounded-tl-none' : 'rounded-tr-none'} ${isSending ? 'opacity-70' : 'opacity-100'}`}
            style={{
              backgroundColor: isTeacher ? '#F1F5F9' : COLORS.PRIMARY_BLUE,
              color: isTeacher ? COLORS.TEXT_PRIMARY : '#FFFFFF',
            }}
          >
            <p className="text-sm">{message.message}</p>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-[10px]">
              {isSending ? 'Sending...' : new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Discussion Thread Component
const DiscussionThread = ({ topic }) => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await communicationApi.getMessages(topic.id);
      const data = response.data?.data ?? response.data ?? [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time listener
  useDiscussionSocket(topic?.id, (newMessage) => {
    setMessages((prev) => {
      // Deduplicate: replace optimistic message with real one if IDs match (not possible since optimistic has no real ID yet)
      // Or just check if message content and user match for the last message
      if (prev.some(m => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  });

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    const text = replyText;
    setReplyText('');

    // OPTIMISTIC UPDATE
    const optimisticMessage = {
      id: Date.now(), // temporary ID
      message: text,
      author_name: 'You',
      author_role: 'STUDENT',
      created_at: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await communicationApi.sendMessage(topic.id, { message: text });
      // The socket event will arrive (excluding us) OR we could fetch
      // Since we use X-Socket-ID, the server won't broadcast back to us.
      // So we should update our optimistic message to 'sent' or replace with real data.
      fetchMessages(); 
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading && (!messages || messages.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border p-12 flex flex-col items-center justify-center" style={{ borderColor: COLORS.BORDER }}>
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border flex flex-col h-[600px] shadow-sm" style={{ borderColor: COLORS.BORDER }}>
      {/* Thread Header */}
      <div className="p-6 border-b bg-gray-50 rounded-t-2xl flex justify-between items-center" style={{ borderColor: COLORS.BORDER }}>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.TEXT_PRIMARY }}>
            {topic.title}
          </h2>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs">
            Started by {topic.author_name} • {new Date(topic.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth">
        {!messages || messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-200">
              <MessageCircle size={32} />
            </div>
            <p className="text-gray-500 font-medium">No messages yet.</p>
            <p className="text-gray-400 text-sm">Be the first to start the discussion!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      {topic.status === 'open' ? (
        <div className="p-4 border-t" style={{ borderColor: COLORS.BORDER }}>
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              style={{ borderColor: COLORS.BORDER }}
              rows="2"
            />
            <motion.button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 rounded-xl font-semibold flex items-center justify-center bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 text-red-600 text-center text-sm font-medium border-t border-red-100">
          This topic is closed for new replies.
        </div>
      )}
    </div>
  );
};

// Main Discussions Page
const DiscussionsPage = () => {
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

  // Monitor connection
  useEffect(() => {
    if (pusher && pusher.connection) {
      const handleStateChange = (states) => {
        setConnectionStatus(states.current);
      };
      pusher.connection.bind('state_change', handleStateChange);
      setConnectionStatus(pusher.connection.state);
      return () => pusher.connection.unbind('state_change', handleStateChange);
    }
  }, []);

  // Fetch initial groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await communicationApi.getGroups();
        const groupData = response.data?.data ?? response.data ?? [];
        setGroups(Array.isArray(groupData) ? groupData : []);
        if (Array.isArray(groupData) && groupData.length > 0) {
          setSelectedGroup(groupData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch topics when group changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedGroup) return;
      try {
        const response = await communicationApi.getTopics(selectedGroup.id);
        const data = response.data?.data ?? response.data ?? [];
        const nextTopics = Array.isArray(data) ? data : [];
        setTopics(nextTopics);
        setActiveTopic(nextTopics[0] ?? null);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      }
    };
    fetchTopics();
  }, [selectedGroup]);

  const handleCreateTopic = async () => {
    if (!selectedGroup || !newTopicTitle.trim()) return;

    setCreatingTopic(true);
    try {
      await communicationApi.createTopic(selectedGroup.id, { title: newTopicTitle.trim() });
      const response = await communicationApi.getTopics(selectedGroup.id);
      const data = response.data?.data ?? response.data ?? [];
      const nextTopics = Array.isArray(data) ? data : [];
      setTopics(nextTopics);
      setActiveTopic(nextTopics[0] ?? null);
      setNewTopicTitle('');
    } catch (error) {
      console.error("Failed to create topic:", error);
      alert(error.response?.data?.message || "Failed to create topic.");
    } finally {
      setCreatingTopic(false);
    }
  };

  const filteredTopics = Array.isArray(topics) ? topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 pb-12 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Discussion Forum</h1>
          <p className="text-slate-500">Collaborate with classmates and teachers in real-time topics.</p>
        </div>
        
        {/* Connection Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          connectionStatus === 'connected' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {connectionStatus === 'connected' ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="capitalize">{connectionStatus}</span>
        </div>
      </header>

      {!groups || groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={40} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Discussion Groups</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven't been assigned to any discussion groups yet. 
            Groups are automatically created for your enrolled courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Groups & Topics */}
          <div className="lg:col-span-4 space-y-6">
            {/* Group Selector */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                My Course Groups
              </h2>
              <div className="space-y-1">
                {groups.map((group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    isActive={selectedGroup?.id === group.id}
                    onClick={() => setSelectedGroup(group)}
                  />
                ))}
              </div>
            </section>

            {/* Topics List */}
            <section className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: COLORS.BORDER }}>
              <div className="mb-4 rounded-xl bg-slate-50 p-3">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Start a topic
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTopic();
                      }
                    }}
                    placeholder="Ask a question or start a discussion..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTopic}
                    disabled={creatingTopic || !newTopicTitle.trim() || !selectedGroup}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingTopic ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                    Topic
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Topics</h2>
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTopics.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">No topics found.</p>
                ) : (
                  filteredTopics.map((topic) => (
                    <TopicItem
                      key={topic.id}
                      topic={topic}
                      isActive={activeTopic?.id === topic.id}
                      onClick={() => setActiveTopic(topic)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Messages */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTopic ? (
                <motion.div
                  key={activeTopic.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <DiscussionThread topic={activeTopic} />
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed flex flex-col items-center justify-center h-[600px] text-center p-12" style={{ borderColor: COLORS.BORDER }}>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-200">
                    <Reply size={40} className="transform -rotate-12" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a Topic</h2>
                  <p className="text-slate-500 max-w-sm">
                    Choose a topic from the sidebar to view the conversation and join the discussion.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;
