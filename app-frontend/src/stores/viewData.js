// src/stores/viewData.js
import { defineStore } from 'pinia';

export const useViewDataStore = defineStore('viewData', {
  state: () => ({
    data: {} 
  }),
  actions: {
    // aggiungi nuovi dati
    setData(key, value) {
      this.data[key] = value;
    },
    // ottieni un dato
    getData(key) {
      return this.data[key];
    },
    // cancella un dato
    clearData(key) {
      if (key) {
        delete this.data[key];
      } else {
        this.data = {};
      }
    }
  }
});
