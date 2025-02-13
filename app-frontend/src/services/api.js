import axios from 'axios';
import { useAuthStore } from '../stores/auth';


// definisci l'url base per le richieste
const api = axios.create({
  xsrfCookieName: 'csrf_access_token',
  xsrfHeaderName: 'X-CSRF-TOKEN',
  baseURL: 'https://localhost:10000/api/v1',
  withXSRFToken: true,
  withCredentials: true,
});


// interceptor per intercettare le richieste con token scaduto
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default api;