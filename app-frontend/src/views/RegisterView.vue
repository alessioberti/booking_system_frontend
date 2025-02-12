<template>
  <div class="box-container">
    <form @submit.prevent="RegisterNewAccount" class="space-y-6">
      <div>
        <h2 class="title-page">Registra un nuovo account</h2>
      </div>
      <div class="space-y-6">
        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="firstName" class="label">Nome</label>
            <input id="firstName" type="text" v-model="firstName" required placeholder="Inserisci nome" class="input" />
          </div>
          <div class="flex-1">
            <label for="lastName" class="label">Cognome</label>
            <input
              id="lastName"
              type="text"
              v-model="lastName"
              required
              placeholder="Inserisci cognome"
              class="input"
            />
          </div>
        </div>

        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="password" class="label">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              minlength="8"
              maxlength="32"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,32}$"
              placeholder="Inserisci Password"
              class="input"
              oninvalid="this.setCustomValidity('La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale')"
            />
          </div>
          <div class="flex-1">
            <label for="confirmPassword" class="label">Conferma Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              minlength="8"
              maxlength="32"
              placeholder="Conferma password"
              class="input"
            />
            <p v-if="passwordMismatch" class="text-red-600 text-sm">Le password non corrispondono.</p>
          </div>
        </div>

        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="email" class="label">Email</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              placeholder="Inserisci email"
              class="input"
            />
          </div>

          <div class="flex-1">
            <label for="telNumber" class="label">Telefono</label>
            <input
              id="telNumber"
              type="text"
              v-model="telNumber"
              required
              pattern="^\+?\d{10,13}$"
              placeholder="Inserisci telefono"
              class="input"
            />
          </div>
        </div>
        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="fiscalCode" class="label">Codice Fiscale</label>
            <input
              id="fiscalCode"
              type="text"
              v-model="fiscalCode"
              required
              placeholder="Inserisci codice fiscale"
              class="input"
            />
          </div>
          <div class="flex-1">
            <label for="birthDate" class="label">Data di Nascita</label>
            <input
              id="birthDate"
              type="date"
              v-model="birthDate"
              required
              placeholder="Inserisci cognome"
              class="input text-standard"
            />
          </div>
        </div>
        <p class="text-standard">
          Se non possiedi un codice fiscale italiano, inserisci il numero del tuo documento di identità o passaporto.
        </p>

        <button type="submit" class="button">Registrati</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();

const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const telNumber = ref('');
const firstName = ref('');
const lastName = ref('');
const fiscalCode = ref('');
const birthDate = ref(null);
// verifica in tempo reale se le password corrispondono
const passwordMismatch = computed(() => password.value !== confirmPassword.value);

const RegisterNewAccount = async () => {
  alertStore.clearAlerts();
  if (passwordMismatch.value) {
    alertStore.setError('Le password non corrispondono');
    return;
  }

  // verifica che tutti i campi siano stati inseriti
  if (
    !email.value ||
    !password.value ||
    !telNumber.value ||
    !firstName.value ||
    !lastName.value ||
    !fiscalCode.value ||
    !birthDate.value
  ) {
    alertStore.setError('Attenzone è necessaio insetire tutti i campi');
    return;
  }

  try {
    const response = await api.post('/register', {
      email: email.value,
      password: password.value,
      tel_number: telNumber.value,
      first_name: firstName.value,
      last_name: lastName.value,
      fiscal_code: fiscalCode.value,
      birth_date: birthDate.value,
    });

    // se non ci sono errori manda un messaggio aspetta  e vai alla pagina di login
    alertStore.setSuccess('Account Registrato con successo');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push('/login');
    // altrimenti leggi l'errore e mostra un messaggio
  } catch (err) {
    console.error('Error during registration', err);
    if (err?.response?.status === 409) {
      alertStore.setError('La data inserita non è valida');
    } else if (err?.response?.status === 422) {
      alertStore.setError('Email già registrata');
    } else {
      alertStore.setError('Errore durante la registrazione');
    }
  }
};
const goToHome = () => {
  router.push({ name: 'home' });
};
</script>

<style></style>
