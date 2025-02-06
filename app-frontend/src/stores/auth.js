import { defineStore } from 'pinia';
import api from '../service/api';

// definisci uno store per la gestione dell'autenticazione
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // I token sono gestiti interamente dal backend via cookie,
    // quindi qui memorizziamo solo le informazioni dell'utente
    user: null, 
    loading: false,
    error: null,
  }),
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        // richiedi un token al server; il backend imposterà i cookie se il login ha successo
        const response = await api.post(
          '/login',
          { email, password },
          { withCredentials: true }
        );
        // Supponiamo che il backend restituisca un oggetto user (es. { user: { email: "..." } })
        this.user = response.data.user;
      } catch (err) {
        this.error = err.response?.data?.error || 'Errore durante il login';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // richiedi blocklist del token (effettua il logout)
    logout() {
      axios.post('/logout', {}, { withCredentials: true })
        .catch((err) => {
          console.error('Errore durante il logout:', err);
        });
      this.user = null;
    },

    // richiedi un nuovo token
    async refreshAccessToken() {
      try {
        const response = await api.post(
          '/refresh-token',
          {},
          { withCredentials: true }
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
      this.loading = true;
      try {
        const response = await api.get('/mylogin', { withCredentials: true });
        this.user = response.data;
      } catch (err) {
        try {
          await this.refreshAccessToken();
          const response = await api.get('/mylogin', { withCredentials: true });
          this.user = response.data;
        } catch (err) {
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
