import { defineStore } from 'pinia';

export const useViewDataStore = defineStore('viewData', {
  state: () => ({
    data: {}
  }),
  actions: {
    // Aagiunge o aggiorna un dato
    setData(key, value) {
      this.data = { ...this.data, [key]: value };
    },
    // cancella un dato
    clearData(key) {
      if (key) {
        const newData = { ...this.data };
        delete newData[key];
        this.data = newData;
      } else {
        this.data = {};
      }
    }
  },
  persist: {
    key: 'viewData',
    storage: window.sessionStorage
  }
});
