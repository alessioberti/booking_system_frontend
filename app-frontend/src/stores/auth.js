import api from '../services/api';
import { defineStore } from 'pinia';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  
  actions: {
    async login(username, password) {
      this.error = null;
      try {
        const response = await api.post('/login', { username, password });
        this.user = response.data;
      } catch (err) {
        this.error = err.response?.data?.error || 'login error';
        throw err;
      }
    },

    async logout() {
      try {
        
        await api.post('/logout');

      } catch (err) {
        console.error('logout error:', err);
      }
      this.user = null;
      router.push({ name: 'login' });
    },

    async checkAuth() {
      try {
        const response = await api.get('/account');
        this.user = response.data;
      } catch (err) {
        console.error('checkAuth error:', err);
        await this.logout();
      }
    },
  },

  // Configurazione della persistenza in sessione
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: window.sessionStorage,
        paths: ['user']
      }
    ]
  }
});