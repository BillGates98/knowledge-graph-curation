import axios from 'axios';

const WEB_SERVICE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: WEB_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // const credentials = btoa('admin:admin');
    // config.headers.Authorization = `Basic ${credentials}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
export { WEB_SERVICE_URL };