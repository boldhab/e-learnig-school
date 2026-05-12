import api from '../axios.config';

const authApi = {
  login: async (credentials) => {
    // Backend validation expects field named 'login' (accepts email or username)
    const payload = {
      login: credentials.email || credentials.login,
      password: credentials.password,
    };
    const response = await api.post('/auth/login', payload);
    // ApiResponseTrait wraps result as: { status, message, data: { token, user } }
    // Unwrap and return the inner data directly so callers get { token, user }
    return response.data?.data ?? response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data?.data ?? response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data?.data ?? response.data;
  },

  register: async (payload) => {
    // payload: { full_name, username, email, password, grade_name?, class_id? }
    const response = await api.post('/auth/register', payload);
    return response.data?.data ?? response.data;
  },
};

export default authApi;
