import api from '../axios.config';

const userApi = {
  getProfile: async () => {
    const response = await api.get('profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('profile', data);
    return response.data;
  },
};

export default userApi;
