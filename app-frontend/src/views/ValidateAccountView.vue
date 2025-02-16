<template>
  <div class="box-container">
    <!-- form per la registrazione di un nuovo account -->
    <form @submit.prevent="ValidateAccount" class="space-y-6">
      <div>
        <h2 class="title-page">Valida il tuo account</h2>
      </div>
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:justify-between gap-6">
          <div class="flex-1">
            <label for="password" class="label">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required="true"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,32}$"
              placeholder="Inserisci Password"
              class="input"
              oninvalid="this.setCustomValidity('La password deve contenere da 8 a 32 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale')"
              oninput="this.setCustomValidity('')"
            />
          </div>
          <div class="flex-1">
            <label for="confirmPassword" class="label">Conferma Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required="true"
              placeholder="Conferma password"
              class="input"
            />
            <p v-if="passwordMismatch" class="text-error text-sm">Le password non corrispondono.</p>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button type="submit" class="button">Valida</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useRoute, useRouter } from 'vue-router';
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();
const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const passwordMismatch = computed(() => password.value !== confirmPassword.value);

// recupera il token dall'url
const getToken = () => {
  try {
    const token = route.query.token;
    if (!token) {
      router.push({ name: 'login' });
    }
  } catch (error) {
    router.push({ name: 'login' });
  }
};

// invia il token e la password al backend per la validazione dell'account
const ValidateAccount = async () => {
  const token = route.query.token;
  if (passwordMismatch.value) {
    alertStore.setError('Le password non corrispondono');
  } else {
    try {
      await api.post(
        '/validate',
        { password: password.value, access_token_cookie: token },
        // non serve il token CSRF per questa richiesta perchè impostiamo il token nell'header
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alertStore.setSuccess('Account validato con successo verrai reindirizzato al login');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push({ name: 'login' });
    } catch (error) {
      alertStore.setError("Errore durante la validazione dell'account");
    }
  }
};

onMounted(() => {
  getToken();
});
</script>
