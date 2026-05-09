import Pusher from 'pusher-js';

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1';

let pusher = null;

if (pusherKey) {
  pusher = new Pusher(pusherKey, {
    cluster: cluster,
    forceTLS: true
  });
} else {
  console.warn("Pusher App Key is missing. Real-time features will be disabled.");
  // Mock pusher for development if needed
  pusher = {
    subscribe: () => ({
      bind: () => {},
      unbind_all: () => {},
      unsubscribe: () => {}
    }),
    unsubscribe: () => {}
  };
}

export default pusher;
