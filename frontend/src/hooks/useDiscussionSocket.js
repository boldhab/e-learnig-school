import { useEffect } from 'react';
import pusher from '../services/socket';

/**
 * Hook to listen for real-time discussion updates.
 * 
 * @param {number|string} topicId - The topic ID to listen to
 * @param {function} onNewMessage - Callback when a new message arrives
 */
export const useDiscussionSocket = (topicId, onNewMessage) => {
  useEffect(() => {
    if (!topicId || !pusher) return;

    const channelName = `discussion.topic.${topicId}`;
    const channel = pusher.subscribe(channelName);

    // Listen for the 'NewMessage' event (matches broadcastAs() in backend)
    channel.bind('NewMessage', (data) => {
      console.log('Real-time message received:', data);
      if (onNewMessage) {
        onNewMessage(data.message);
      }
    });

    // Cleanup on unmount or topic change
    return () => {
      console.log(`Unsubscribing from ${channelName}`);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [topicId, onNewMessage]);
};
