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

// interceptor per intercettare le richieste con token scaduto e reindirizzare al login
// se il client rileva errore 401 (non autorizzato) dalla risposta del server
api.interceptors.response.use( 
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      await authStore.logout();
      throw error;
    }
    return Promise.reject(error);
  }
);

export default api;