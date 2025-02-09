<template>
  <div class="box-container">
    <form @submit.prevent="RegisterNewAccount" class="space-y-6">
      <div>
        <h2 class="title-page">Registra un nuovo account</h2>
      </div>
      <!-- Alert per conferme e errori -->
      <div v-if="errorMessage" class="alert-error" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert-success" role="alert">
        {{ successMessage }}
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
              placeholder="da 8 a 32 caratteri (Az-09-!@#$%_&*)"
              class="input"
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
              placeholder="Conferma la tua password"
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
              placeholder="Inserisci telefono (es. +391234567890)"
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
              class="input"
            />
          </div>
        </div>
        <p>
          Se non possiedi un codice fiscale italiano, inserisci il numero del tuo documento di identità o passaporto.
        </p>
        <div>
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

const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const telNumber = ref('');
const firstName = ref('');
const lastName = ref('');
const fiscalCode = ref('');
const birthDate = ref(null);
const errorMessage = ref(null);
const successMessage = ref(null);
// verifica in tempo reale se le password corrispondono
const passwordMismatch = computed(() => password.value !== confirmPassword.value);

const RegisterNewAccount = async () => {
  if (passwordMismatch.value) return;

  try {
    errorMessage.value = null;
    successMessage.value = null;

    const response = await api.post('/register', {
      email: email.value,
      password: password.value,
      tel_number: telNumber.value,
      first_name: firstName.value,
      last_name: lastName.value,
      fiscal_code: fiscalCode.value,
      birth_date: birthDate.value,
    });

    // se non ci sono errori manda un messaggio aspetta 1 secondo e vai alla pagina di login
    successMessage.value = 'Account Registrato con successo';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/login');
    // altrimenti leggi l'errore e mostra un messaggio
  } catch (err) {
    if (err?.response?.status === 409) {
      errorMessage.value = 'La data inserita non è valida';
    } else if (err?.response?.status === 422) {
      errorMessage.value = 'Email già registrata';
    } else {
      errorMessage.value = 'Errore durante la registrazione';
    }
  }
};
</script>

<style></style>
