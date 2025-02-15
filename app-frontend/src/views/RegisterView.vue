<template>
  <div class="box-container">
    <!-- form per la registrazione di un nuovo account -->
    <form @submit.prevent="RegisterNewAccount" class="space-y-6">
      <div>
        <h2 class="title-page">Registra un nuovo account</h2>
      </div>
      <div class="space-y-6">
        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="username" class="label">Username</label>
            <input
              id="username"
              type="text"
              v-model="username"
              required="true"
              placeholder="Inserisci username"
              class="input"
              pattern="^[A-Za-z0-9]{3,32}$"
              oninvalid="this.setCustomValidity('Inserisci solo lettere, numeri (da 3 a 32 caratteri)')"
              oninput="this.setCustomValidity('')"
            />
          </div>
          <div class="flex-1"></div>
        </div>

        <div class="flex justify-between gap-6">
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
        <hr />
        <h2 class="sub-title-page">Inserisci i tuoi dati</h2>
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
              required="true"
              placeholder="Inserisci cognome"
              class="input"
            />
          </div>
        </div>
        <div class="flex justify-between gap-6">
          <div class="flex-1">
            <label for="email" class="label">Email</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required="true"
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
              required="true"
              pattern="^\+?\d{7,13}$"
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
              minlength="3"
              maxlength="32"
              pattern="^[a-zA-Z0-9]{3,32}$"
              required="true"
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
              required="true"
              min="1900-01-01"
              class="input text-standard"
              pattern="\d{4}-\d{2}-\d{2}"
            />
          </div>
        </div>
        <p class="text-standard">
          Se non possiedi un codice fiscale italiano, inserisci il numero del tuo documento di identità o passaporto.
        </p>
        <div class="flex justify-end mt-6">
          <button type="submit" class="button">Registrati</button>
        </div>
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
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const telNumber = ref('');
const firstName = ref('');
const lastName = ref('');
const fiscalCode = ref('');
const birthDate = ref(null);
// verifica in tempo reale se le password corrispondono
const passwordMismatch = computed(() => {
  return password.value.length > 0 && password.value !== confirmPassword.value;
});

const RegisterNewAccount = async () => {
  alertStore.clearAlerts();

  try {
    const response = await api.post('/register', {
      username: username.value,
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/login');
    // altrimenti leggi l'errore e mostra un messaggio
  } catch (err) {
    console.error('Error during registration', err);
    if (err?.response?.status === 409) {
      alertStore.setError('La data inserita non è valida');
    } else if (err?.response?.status === 422 && err?.response?.data?.error === 'email_already_exists') {
      console.log(err?.response?.data);
      alertStore.setError('Email già registrata');
    } else if (err?.response?.status === 422 && err?.response?.data?.error === 'username_already_exists') {
      alertStore.setError('Username già registrato');
    } else {
      alertStore.setError('Errore durante la registrazione');
    }
  }
};
</script>

<style></style>
