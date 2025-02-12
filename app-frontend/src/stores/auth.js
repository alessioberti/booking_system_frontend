import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null, 
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(email, password) {
      this.error = null;
      try {
        const response = await api.post('/login', { email, password });
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (err) {
        this.error = err.response?.data?.error || 'login error';
        // propaga l'errore per gestirlo nel componente
        throw err;
      }
    },

    // chiede al bakckend di sovrascrivere il token
    async logout() {
      try {
        await api.post('/logout');
      } catch (err) {
        console.error('logout error:', err);
      }
      this.user = null;
      localStorage.removeItem('user'); 
    },

    // verifica se l'utente è collegato
    async checkAuth() {
      try {
        const response = await api.get('/account');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user)); 
      } catch (err) {
        console.error('Errore durante il checkAuth:', err);
        await this.logout();
      }
    },
  },
});