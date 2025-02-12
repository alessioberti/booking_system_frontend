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

export default api;
