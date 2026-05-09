import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, ThumbsUp, Reply, Send, User } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Discussion Topic Item
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
      <h3 className="font-semibold flex-1" style={{ color: COLORS.TEXT_PRIMARY }}>
        {topic.title}
      </h3>
      <span
        className="text-xs font-semibold px-2 py-1 rounded-full"
        style={{
          backgroundColor: `${COLORS.PRIMARY_BLUE}15`,
          color: COLORS.PRIMARY_BLUE,
        }}
      >
        {topic.replies}
      </span>
    </div>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mb-2">
      {topic.preview}
    </p>
    <div className="flex items-center justify-between">
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs">
        {topic.author}
      </p>
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs">
        {topic.lastActivity}
      </p>
    </div>
  </motion.button>
);

// Message Bubble Component
const MessageBubble = ({ message, isTeacher }) => (
  <motion.div
    className="mb-4 flex"
    style={{ justifyContent: isTeacher ? 'flex-start' : 'flex-end' }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <div className="flex gap-3 max-w-xs">
      {isTeacher && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: COLORS.INDIGO }}
        >
          {message.author.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        {isTeacher && (
          <p className="text-xs font-semibold mb-1" style={{ color: COLORS.INDIGO }}>
            {message.author}
            {message.isTeacher && ' (Teacher)'}
          </p>
        )}
        <div
          className="p-3 rounded-2xl"
          style={{
            backgroundColor: isTeacher ? `${COLORS.PRIMARY_BLUE}15` : COLORS.PRIMARY_BLUE,
            color: isTeacher ? COLORS.TEXT_PRIMARY : '#FFFFFF',
          }}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p
          style={{ color: COLORS.TEXT_SECONDARY }}
          className="text-xs mt-1"
        >
          {message.time}
        </p>
      </div>
      {!isTeacher && (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ThumbsUp size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Reply size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
          </motion.button>
        </div>
      )}
    </div>
  </motion.div>
);

// Discussion Thread Component
const DiscussionThread = ({ topic }) => {
  const [messages, setMessages] = useState(topic.messages);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = () => {
    if (replyText.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          author: 'You',
          content: replyText,
          time: 'just now',
          isTeacher: false,
        },
      ]);
      setReplyText('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: COLORS.BORDER }}>
      {/* Thread Header */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: COLORS.BORDER }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          {topic.title}
        </h2>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mb-3">
          Started by {topic.author} • {topic.replies} replies
        </p>
        <p style={{ color: COLORS.TEXT_PRIMARY }} className="text-sm">
          {topic.description}
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-8 h-96 overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isTeacher={message.isTeacher}
          />
        ))}
      </div>

      {/* Reply Input */}
      <div className="border-t pt-4" style={{ borderColor: COLORS.BORDER }}>
        <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Add your reply
        </label>
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20"
            style={{
              borderColor: COLORS.BORDER,
              focusRingColor: COLORS.PRIMARY_BLUE,
            }}
            rows="3"
          />
          <motion.button
            onClick={handleSendReply}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            style={{
              backgroundColor: COLORS.PRIMARY_BLUE,
              color: '#FFFFFF',
            }}
          >
            <Send size={16} />
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Main Discussions Page
const DiscussionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    {
      id: 1,
      title: 'React Hooks Best Practices',
      author: 'Prof. John Smith',
      preview: 'What are the best practices when using React hooks in production...',
      replies: 24,
      lastActivity: '2 hours ago',
      description: 'This discussion covers the best practices and patterns for using React hooks effectively in production applications.',
      messages: [
        {
          id: 1,
          author: 'Prof. John Smith',
          content: 'What are the best practices when using React hooks in production applications? Share your experiences!',
          time: '2 days ago',
          isTeacher: true,
        },
        {
          id: 2,
          author: 'Alex Kumar',
          content: 'Always keep hooks at the top level of your component. Avoid calling hooks inside loops or conditionals.',
          time: '2 days ago',
          isTeacher: false,
        },
        {
          id: 3,
          author: 'Prof. John Smith',
          content: 'Exactly right! And remember to use custom hooks to extract component logic into reusable functions.',
          time: '1 day ago',
          isTeacher: true,
        },
      ],
    },
    {
      id: 2,
      title: 'Database Optimization Techniques',
      author: 'Dr. Sarah Johnson',
      preview: 'How to optimize queries for better performance...',
      replies: 18,
      lastActivity: '4 hours ago',
      description: 'Discussion about various database optimization techniques and query performance tuning.',
      messages: [
        {
          id: 1,
          author: 'Dr. Sarah Johnson',
          content: 'What techniques do you use to optimize slow queries?',
          time: '3 days ago',
          isTeacher: true,
        },
        {
          id: 2,
          author: 'Sarah',
          content: 'Indexing is crucial! Always analyze execution plans before optimizing.',
          time: '2 days ago',
          isTeacher: false,
        },
      ],
    },
    {
      id: 3,
      title: 'Cloud Storage Solutions',
      author: 'Alex Kumar',
      preview: 'Comparing AWS S3, Azure Blob Storage, and GCP...',
      replies: 12,
      lastActivity: '1 day ago',
      description: 'Comprehensive discussion comparing different cloud storage solutions.',
      messages: [
        {
          id: 1,
          author: 'Alex Kumar',
          content: 'Which cloud storage solution do you prefer for production use?',
          time: '3 days ago',
          isTeacher: false,
        },
      ],
    },
    {
      id: 4,
      title: 'UI Design Trends 2024',
      author: 'Emma Wilson',
      preview: 'What design trends are you noticing in modern applications?',
      replies: 31,
      lastActivity: '1 hour ago',
      description: 'Current UI/UX design trends and their implementation in modern web applications.',
      messages: [
        {
          id: 1,
          author: 'Emma Wilson',
          content: 'What design trends are you noticing in modern applications?',
          time: '5 days ago',
          isTeacher: false,
        },
      ],
    },
  ];

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTopic = selectedTopic || filteredTopics[0];

  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Discussion Forum
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          Join conversations and learn from your peers
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics Sidebar */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Search Topics */}
          <div className="mb-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full px-4 py-2.5 pr-10 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{
                borderColor: COLORS.BORDER,
              }}
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.TEXT_SECONDARY }}
            />
          </div>

          {/* Topics List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTopics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                isActive={activeTopic?.id === topic.id}
                onClick={() => setSelectedTopic(topic)}
              />
            ))}
          </div>
        </motion.div>

        {/* Discussion Thread */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {activeTopic && <DiscussionThread topic={activeTopic} />}
        </motion.div>
      </div>
    </div>
  );
};

export default DiscussionsPage;
