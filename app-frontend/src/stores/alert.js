import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
    state: () => ({
      errorMessage: '',
      successMessage: '',
    }),
    actions: {
      setError(message) {
        this.errorMessage = message;
        // Se vuoi che il messaggio sparisca dopo qualche secondo:
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      },
      setSuccess(message) {
        this.successMessage = message;
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      clearAlerts() {
        this.errorMessage = '';
        this.successMessage = '';
      },
    },
  });
  