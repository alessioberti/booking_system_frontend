<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">Centro Medico Login</h2>
      </div>

      <form class="space-y-6" @submit.prevent="UserLogin">
        <div class="space-y-4">
          <div>
            <input
              id="email"
              type="text"
              class="input"
              v-model="email"
              required="true"
              placeholder="Inserisci username o email"
              @input="clearValidation"
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
      <div class="grid gap-2">
        <div class="grid grid-cols-2 items-center">
          <div class="text-standard">Non hai un account?</div>
          <router-link to="/register" class="font-semibold text-primary hover:underline"> Registrati </router-link>
        </div>
        <div class="grid grid-cols-2 items-center">
          <div class="text-standard">Password dimenticata ?</div>
          <!--  Reset Password non implementato-->
          <router-link to="" class="font-semibold text-primary hover:underline"> Recupera Password </router-link>
        </div>
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
const alertStore = useAlertStore();

const email = ref('');
const password = ref('');

const authStore = useAuthStore();
const router = useRouter();

const UserLogin = async () => {
  alertStore.clearAlerts();
  try {
    await authStore.login(email.value, password.value);
    // Dopo il login reindirizza alla home
    router.push({ name: 'home' });
  } catch (err) {
    if (err?.response && err?.response?.status === 401) {
      alertStore.setError('Email o password errati');
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
</script>

<style></style>
