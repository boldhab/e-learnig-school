import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Loader2,
  Lock,
  MessageCircle,
  MessageSquarePlus,
  MessageSquareText,
  Search,
  Send,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../constants/teacherTheme';
import communicationApi from '../../api/modules/communication.api';
import contentApi from '../../api/modules/content.api';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div
    className="rounded-2xl border bg-white p-5"
    style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          {value}
        </p>
      </div>
      <div className="rounded-2xl p-3 text-white" style={{ backgroundColor: accent }}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const TopicRow = ({ topic, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(topic)}
    className={`w-full rounded-2xl border p-4 text-left transition ${active ? 'shadow-sm' : 'hover:bg-slate-50'}`}
    style={{
      borderColor: active ? TEACHER_COLORS.PRIMARY_BLUE : TEACHER_COLORS.BORDER,
      backgroundColor: active ? `${TEACHER_COLORS.PRIMARY_BLUE}12` : '#FFFFFF',
    }}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{topic.title}</p>
        <p className="mt-1 text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          {topic.author_name} • {new Date(topic.created_at).toLocaleDateString()}
        </p>
      </div>
      <span
        className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{
          backgroundColor: topic.status === 'open' ? '#DCFCE7' : '#FEE2E2',
          color: topic.status === 'open' ? TEACHER_COLORS.SUCCESS : TEACHER_COLORS.DANGER,
        }}
      >
        {topic.status}
      </span>
    </div>
  </button>
);

const MessageRow = ({ message, onDelete }) => (
  <div className="rounded-2xl border bg-white p-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          {message.author_name}
          {message.author_role === 'TEACHER' ? ' (Teacher)' : ''}
        </p>
        <p className="mt-1 text-xs" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(message)}
        className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-red-50"
        style={{ borderColor: '#FCA5A5', color: TEACHER_COLORS.DANGER }}
      >
        <Trash2 size={14} className="inline-block" /> Remove
      </button>
    </div>
    <p className="mt-3 whitespace-pre-wrap text-sm" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
      {message.message}
    </p>
  </div>
);

const DiscussionManagementPage = () => {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [topicLoading, setTopicLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await communicationApi.getGroups();
      const nextGroups = response.data?.data ?? response.data ?? [];
      const normalizedGroups = Array.isArray(nextGroups) ? nextGroups : [];
      setGroups(normalizedGroups);
      setSelectedGroup((current) => normalizedGroups.find((group) => group.id === current?.id) ?? normalizedGroups[0] ?? null);
    } catch (error) {
      console.error('Failed to load teacher discussion groups:', error);
      setGroups([]);
      setSelectedGroup(null);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await contentApi.getCourses();
      const nextCourses = response.data?.data ?? response.data ?? [];
      const normalizedCourses = Array.isArray(nextCourses) ? nextCourses : [];
      setCourses(normalizedCourses);
    } catch (error) {
      console.error('Failed to load teacher courses:', error);
      setCourses([]);
    }
  }, []);

  const fetchTopics = useCallback(async (groupId, preferredTopicId = null) => {
    if (!groupId) {
      setTopics([]);
      setSelectedTopic(null);
      return;
    }

    setTopicLoading(true);
    try {
      const response = await communicationApi.getTopics(groupId);
      const nextTopics = response.data?.data ?? response.data ?? [];
      const normalizedTopics = Array.isArray(nextTopics) ? nextTopics : [];
      setTopics(normalizedTopics);
      setSelectedTopic((current) =>
        normalizedTopics.find((topic) => topic.id === preferredTopicId)
        ?? normalizedTopics.find((topic) => topic.id === current?.id)
        ?? normalizedTopics[0]
        ?? null
      );
    } catch (error) {
      console.error('Failed to load discussion topics:', error);
      setTopics([]);
      setSelectedTopic(null);
    } finally {
      setTopicLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (topicId) => {
    if (!topicId) {
      setMessages([]);
      return;
    }

    setMessageLoading(true);
    try {
      const response = await communicationApi.getMessages(topicId);
      const nextMessages = response.data?.data ?? response.data ?? [];
      setMessages(Array.isArray(nextMessages) ? nextMessages : []);
    } catch (error) {
      console.error('Failed to load discussion messages:', error);
      setMessages([]);
    } finally {
      setMessageLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchGroups(), fetchCourses()]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchGroups, fetchCourses]);

  useEffect(() => {
    if (selectedGroup?.id) {
      fetchTopics(selectedGroup.id);
    } else {
      setTopics([]);
      setSelectedTopic(null);
    }
  }, [selectedGroup, fetchTopics]);

  useEffect(() => {
    fetchMessages(selectedTopic?.id);
  }, [selectedTopic, fetchMessages]);

  const availableSectionsForGroups = useMemo(() => {
    const groupedSectionKeys = new Set(
      groups.map((group) => `${group.course_id}:${group.class_id ?? ''}`)
    );

    return courses.filter((course) => {
      const key = `${course.id}:${course.class_id ?? ''}`;
      return !groupedSectionKeys.has(key);
    });
  }, [courses, groups]);

  useEffect(() => {
    if (
      !selectedSectionKey ||
      !availableSectionsForGroups.some((course) => `${course.id}:${course.class_id ?? ''}` === selectedSectionKey)
    ) {
      const first = availableSectionsForGroups[0];
      setSelectedSectionKey(first ? `${first.id}:${first.class_id ?? ''}` : '');
    }
  }, [availableSectionsForGroups, selectedSectionKey]);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) =>
      `${topic.title} ${topic.author_name}`.toLowerCase().includes(term)
    );
  }, [topics, search]);

  const stats = useMemo(() => ({
    groups: groups.length,
    topics: topics.length,
    openTopics: topics.filter((topic) => topic.status === 'open').length,
    messages: messages.length,
  }), [groups, topics, messages]);

  const handleCreateGroup = async () => {
    const course = availableSectionsForGroups.find((item) => `${item.id}:${item.class_id ?? ''}` === selectedSectionKey);
    if (!course) {
      alert('Please select a course and class without an existing discussion group.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await communicationApi.createGroup({
        course_id: course.id,
        class_id: course.class_id,
        title: newGroupTitle.trim() || `${course.name} - ${course.class_name || 'Class'}`,
      });
      const createdGroup = response.data?.data ?? response.data ?? null;
      setNewGroupTitle('');
      setShowCreateGroup(false);
      await fetchGroups();
      if (createdGroup?.id) {
        setSelectedGroup(createdGroup);
      }
    } catch (error) {
      console.error('Failed to create discussion group:', error);
      alert(error.response?.data?.message || 'Failed to create discussion group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!selectedGroup?.id || !newTopicTitle.trim()) return;

    setSubmitting(true);
    try {
      const response = await communicationApi.createTopic(selectedGroup.id, { title: newTopicTitle.trim() });
      const newTopicId = response.data?.data?.topic_id ?? null;
      setNewTopicTitle('');
      await fetchTopics(selectedGroup.id, newTopicId);
    } catch (error) {
      console.error('Failed to create discussion topic:', error);
      alert(error.response?.data?.message || 'Failed to create topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTopic?.id || !replyText.trim()) return;

    setSubmitting(true);
    try {
      await communicationApi.sendMessage(selectedTopic.id, { message: replyText.trim() });
      setReplyText('');
      await fetchMessages(selectedTopic.id);
    } catch (error) {
      console.error('Failed to send teacher message:', error);
      alert(error.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTopicStatus = async (nextStatus) => {
    if (!selectedTopic?.id) return;

    setSubmitting(true);
    try {
      await communicationApi.updateTopicStatus(selectedTopic.id, nextStatus);
      await fetchTopics(selectedGroup?.id, selectedTopic.id);
    } catch (error) {
      console.error(`Failed to ${nextStatus} topic:`, error);
      alert(error.response?.data?.message || `Failed to ${nextStatus} topic.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!window.confirm(`Remove this message from ${message.author_name}?`)) return;

    try {
      await communicationApi.deleteMessage(message.id);
      await fetchMessages(selectedTopic?.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert(error.response?.data?.message || 'Failed to delete message.');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic?.id) return;
    if (!window.confirm(`Delete "${selectedTopic.title}" and all of its messages?`)) return;

    setSubmitting(true);
    try {
      await communicationApi.deleteTopic(selectedTopic.id);
      await fetchTopics(selectedGroup?.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to delete topic:', error);
      alert(error.response?.data?.message || 'Failed to delete topic.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} size={42} />
      </div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-7xl p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
              Discussion Management
            </h1>
            <p className="mt-2 max-w-2xl" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
              Moderate course discussions, guide conversations, and create student discussion groups for your courses.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics or authors..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none transition focus:ring-2"
              style={{ borderColor: TEACHER_COLORS.BORDER }}
            />
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={BookOpen} label="Course Groups" value={stats.groups} accent={TEACHER_COLORS.PRIMARY_BLUE} />
        <StatCard icon={MessageCircle} label="Topics" value={stats.topics} accent={TEACHER_COLORS.ACCENT_TEAL} />
        <StatCard icon={Unlock} label="Open Topics" value={stats.openTopics} accent={TEACHER_COLORS.SUCCESS} />
        <StatCard icon={Users} label="Messages" value={stats.messages} accent={TEACHER_COLORS.GRADE} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                Course Group
              </label>
              <button
                type="button"
                onClick={() => setShowCreateGroup((current) => !current)}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: TEACHER_COLORS.BORDER, color: TEACHER_COLORS.TEXT_PRIMARY }}
              >
                <MessageSquarePlus size={16} />
                Create Group
              </button>
            </div>

            {showCreateGroup ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                  New Student Group
                </label>
                <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_auto]">
                  <select
                    value={selectedSectionKey}
                    onChange={(event) => setSelectedSectionKey(event.target.value)}
                    className="rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
                    style={{ borderColor: TEACHER_COLORS.BORDER }}
                  >
                    <option value="">Select course and class</option>
                    {availableSectionsForGroups.map((course) => (
                      <option key={`${course.id}:${course.class_id}`} value={`${course.id}:${course.class_id ?? ''}`}>
                        {course.name} - {course.class_name || 'Class'}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newGroupTitle}
                    onChange={(event) => setNewGroupTitle(event.target.value)}
                    placeholder="Group title (optional)"
                    className="rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
                    style={{ borderColor: TEACHER_COLORS.BORDER }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateGroup}
                    disabled={submitting || !selectedSectionKey || availableSectionsForGroups.length === 0}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
                  >
                    Create
                  </button>
                </div>
                <p className="mt-2 text-xs" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                  {availableSectionsForGroups.length === 0
                    ? 'All of your assigned course sections already have discussion groups.'
                    : 'Choose one of your assigned course and class sections that does not already have a student discussion group.'}
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <select
                value={selectedGroup?.id ?? ''}
                onChange={(event) => setSelectedGroup(groups.find((group) => String(group.id) === event.target.value) ?? null)}
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
              >
                {groups.length === 0 ? (
                  <option value="">No groups available</option>
                ) : (
                  groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.title}{group.class_name ? ` - ${group.class_name}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                Create Topic
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(event) => setNewTopicTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleCreateTopic();
                    }
                  }}
                  placeholder="Start a guided discussion..."
                  className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: TEACHER_COLORS.BORDER }}
                />
                <button
                  type="button"
                  onClick={handleCreateTopic}
                  disabled={submitting || !newTopicTitle.trim() || !selectedGroup}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Topics</h2>
              {topicLoading && <Loader2 size={18} className="animate-spin" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />}
            </div>
            <div className="space-y-3">
              {filteredTopics.length === 0 ? (
                <p className="py-10 text-center text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                  {groups.length === 0 ? 'Create a group first to start student discussions.' : 'No topics match this view.'}
                </p>
              ) : (
                filteredTopics.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    active={selectedTopic?.id === topic.id}
                    onSelect={setSelectedTopic}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
          {selectedTopic ? (
            <>
              <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-start md:justify-between" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: TEACHER_COLORS.ACCENT_TEAL }}>
                    Active Thread
                  </p>
                  <h2 className="mt-2 text-2xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                    {selectedTopic.title}
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                    Created by {selectedTopic.author_name} on {new Date(selectedTopic.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleTopicStatus(selectedTopic.status === 'open' ? 'close' : 'open')}
                    disabled={submitting}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: selectedTopic.status === 'open' ? TEACHER_COLORS.WARNING : TEACHER_COLORS.SUCCESS }}
                  >
                    {selectedTopic.status === 'open' ? <Lock size={16} className="mr-2 inline-block" /> : <Unlock size={16} className="mr-2 inline-block" />}
                    {selectedTopic.status === 'open' ? 'Close Topic' : 'Reopen Topic'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTopic}
                    disabled={submitting}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-60"
                    style={{ borderColor: '#FCA5A5', color: TEACHER_COLORS.DANGER }}
                  >
                    <Trash2 size={16} className="mr-2 inline-block" />
                    Delete Topic
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Messages</h3>
                <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
                  {messageLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={24} className="animate-spin" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="rounded-2xl border border-dashed py-10 text-center text-sm" style={{ borderColor: TEACHER_COLORS.BORDER, color: TEACHER_COLORS.TEXT_SECONDARY }}>
                      No messages in this topic yet.
                    </p>
                  ) : (
                    messages.map((message) => (
                      <MessageRow key={message.id} message={message} onDelete={handleDeleteMessage} />
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 border-t pt-5" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                  Add Teacher Reply
                </label>
                <div className="flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder={selectedTopic.status === 'open' ? 'Guide the discussion or answer questions...' : 'Reopen this topic to reply.'}
                    disabled={selectedTopic.status !== 'open' || submitting}
                    className="min-h-[96px] flex-1 rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 disabled:bg-slate-50"
                    style={{ borderColor: TEACHER_COLORS.BORDER }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={selectedTopic.status !== 'open' || submitting || !replyText.trim()}
                    className="self-end rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
                  >
                    <Send size={16} className="mr-2 inline-block" />
                    Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <MessageSquareText size={48} className="mb-4 opacity-30" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
              <p className="text-lg font-medium" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Select a topic to manage it.</p>
              <p className="mt-2 max-w-sm text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                Create a group for students, open a topic, then review messages and add teacher replies from here.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DiscussionManagementPage;
