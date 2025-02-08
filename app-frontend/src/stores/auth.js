import { defineStore } from 'pinia';
import api from '../services/api';

// definisci uno store per la gestione dell'autenticazione
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // utente autenticato
    error: null, 
  }),
  actions: {
    async login(email, password) {
      this.error = null;
      try {
        // richiedi un token al server 
        const response = await api.post(
          '/login',
          { email, password },
          { withCredentials: true }
        );
        this.user = response.data.user;
      } catch (err) {
        this.error = err.response?.data?.error || 'Errore durante il login';
        throw err;
    }},

    // richiedi blocklist del token (effettua il logout)
    logout() {
      axios.post('/logout', {})
        .catch((err) => {
          console.error('Errore durante il logout:', err);
        });
      this.user = null;
    },

    // richiedi un nuovo token
    async refreshAccessToken() {
      try {
        const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_refresh_token='))
        ?.split('=')[1];
        const response = await api.post(
          '/refresh',
          {},
          { withCredentials: true,
            headers: {
              'X-CSRF-TOKEN': csrfToken,
            },
          }
        );
        // Se il backend restituisce eventualmente il nuovo access token (opzionale)
        return response.data.access_token;
      } catch (err) {
        this.logout();
        throw err;
      }
    },

    // verifica credenziali e aggiorna lo stato dell'utente
    async checkAuth() {
     
      try {
        const response = await api.get('/account');
        this.user = response.data;
      } catch (err) {
        try {
          await this.refreshAccessToken();
          const response = await api.get('/account');
          this.user = response.data;
        } catch (err) {
          this.logout();
        }
      }
    },
  },
});
