import api from "../axios.config";

const communicationApi = {
  getGroups: () => api.get("discussions/groups"),
  
  getTopics: (groupId) => api.get(`discussions/groups/${groupId}/topics`),
  
  createTopic: (groupId, data) => api.post(`discussions/groups/${groupId}/topics`, data),
  
  getMessages: (topicId) => api.get(`discussions/topics/${topicId}/messages`),
  
  sendMessage: (topicId, data) => api.post(`discussions/topics/${topicId}/messages`, data),
  
  deleteMessage: (messageId) => api.delete(`discussions/messages/${messageId}`),

  deleteTopic: (topicId) => api.delete(`discussions/topics/${topicId}`),
  
  updateTopicStatus: (topicId, status) => api.post(`discussions/topics/${topicId}/${status}`)
};

export default communicationApi;
