import userApi from '../api/modules/user.api';

const userService = {
  async getProfile() {
    // Transform data or add logic if needed
    return await userApi.getProfile();
  },

  async updateProfile(data) {
    const response = await userApi.updateProfile(data);
    // Update local storage if necessary
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response }));
    return response;
  },
};

export default userService;
