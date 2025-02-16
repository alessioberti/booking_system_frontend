<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">Centro Medico Login</h2>
      </div>
      <!-- form per login-->
      <div v-if="!passwordForgot">
        <form class="space-y-6" @submit.prevent="Login">
          <div class="space-y-4">
            <div>
              <input
                id="username"
                type="text"
                class="input"
                v-model="username"
                required="true"
                placeholder="Inserisci la tua mail o username"
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                class="input"
                v-model="password"
                required="true"
                placeholder="Inserisci la tua password"
                oninvalid="this.setCustomValidity('La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale')"
                oninput="this.setCustomValidity('')"
              />
            </div>
          </div>
          <div>
            <button type="submit" class="button">Accedi</button>
          </div>
        </form>

        <div class="grid grid-cols-2 mt-4 justify-items-start">
          <div class="text-standard">Non hai un account?</div>
          <button @click="goToRegister" class="font-semibold text-primary hover:underline">Registrati</button>
          <div class="text-standard">Password dimenticata ?</div>
          <button @click="showPasswordForgot" class="font-semibold text-primary hover:underline">
            Recupera Password
          </button>
        </div>
      </div>
      <!-- form per reset password-->
      <div v-else>
        <form class="space-y-6" @submit.prevent="RequestReset">
          <div class="space-y-4">
            <div>
              <input
                id="username"
                type="text"
                class="input"
                v-model="username"
                required
                placeholder="Inserisci la tua mail o username"
              />
            </div>
          </div>
          <div>
            <button type="submit" class="button mb-4">Richiedi reset password</button>
          </div>
        </form>
        <p>
          Cliccando riceverai una mail con il di reset. Una volta cliccato il link potrai inserire la nuova password.
          <button @click="hidePasswordForgot" class="font-semibold text-primary hover:underline">Torna al login</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
import api from '../services/api';
const alertStore = useAlertStore();

const passwordForgot = ref(false);
const username = ref('');
const password = ref('');

const authStore = useAuthStore();
const router = useRouter();

const hidePasswordForgot = () => {
  passwordForgot.value = false;
};

const showPasswordForgot = () => {
  passwordForgot.value = true;
};

const goToRegister = () => {
  router.push({ name: 'register' });
};

const Login = async () => {
  alertStore.clearAlerts();
  try {
    await authStore.login(username.value, password.value);
    // Dopo il login reindirizza alla home
    router.push({ name: 'home' });
  } catch (err) {
    if (err?.response && err?.response?.status === 401) {
      alertStore.setError('username o password errati');
      return;
    }
    if (err?.response && err?.response?.status === 403) {
      alertStore.setError('Account disabilitato contatta il centro per assistenza');
      return;
    }
    if (err?.response && err?.response?.status === 409) {
      alertStore.setError('Account disabilitato causa troppi tentativi riprova più tardi');
      return;
    }
    alertStore.setError('Errore durante il login');
    console.error('Error during login', err);
  }
};

const RequestReset = async () => {
  alertStore.clearAlerts();
  try {
    await api.post('/forgot', {
      username: username.value,
    });
    alertStore.setSuccess('Richiesta inviata con successo');
  } catch (err) {
    alertStore.setError('Errore durante la richiesta di reset password');
    console.error('Error during reset password request', err);
  }
};
</script>

<style></style>
