import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App)
const pinia = createPinia();

// abilita la persistenza di pinia
pinia.use(piniaPluginPersistedstate);

app.use(router)
app.use(pinia);
app.mount('#app')
