<template>
  <div class="box-container">
    <!-- form per la registrazione di un nuovo account -->
    <form v-if="!emailsent" @submit.prevent="RegisterNewAccount" class="space-y-6">
      <div>
        <h2 class="title-page">Registra un nuovo account</h2>
      </div>
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:justify-between gap-6">
          <div class="flex-1">
            <label for="username" class="label mb-1">Nome utente</label>
            <input
              id="username"
              type="text"
              v-model="username"
              required
              placeholder="Inserisci username"
              class="input"
              pattern="^[A-Za-z0-9]{3,32}$"
              oninvalid="this.setCustomValidity('Inserisci solo lettere, numeri (da 3 a 32 caratteri)')"
              oninput="this.setCustomValidity('')"
            />
          </div>
          <div class="hidden md:block flex-1"></div>
        </div>

        <div class="flex flex-col md:flex-row md:justify-between gap-6">
          <div class="flex-1">
            <label for="firstName" class="label mb-1">Nome</label>
            <input id="firstName" type="text" v-model="firstName" required placeholder="Inserisci nome" class="input" />
          </div>
          <div class="flex-1">
            <label for="lastName" class="label mb-1">Cognome</label>
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
        <div class="flex flex-col md:flex-row md:justify-between gap-6">
          <div class="flex-1">
            <label for="email" class="label mb-1">Email</label>
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
            <label for="telNumber" class="label mb-1">Telefono</label>
            <input
              id="telNumber"
              type="text"
              v-model="telNumber"
              required
              pattern="^\+?\d{7,13}$"
              placeholder="Inserisci telefono"
              class="input"
            />
          </div>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between gap-6">
          <div class="flex-1">
            <label for="fiscalCode" class="label mb-1">Codice Fiscale</label>
            <input
              id="fiscalCode"
              type="text"
              v-model="fiscalCode"
              minlength="3"
              maxlength="32"
              pattern="^[a-zA-Z0-9]{3,32}$"
              required
              placeholder="Inserisci codice fiscale"
              class="input"
            />
          </div>
          <div class="flex-1">
            <label for="birthDate" class="label mb-1">Data di Nascita</label>
            <input
              id="birthDate"
              type="date"
              v-model="birthDate"
              required
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
    <!-- messaggio di conferma registrazione -->
    <div v-else>
      <div class="space-y-6">
        <div>
          <h2 class="title-page">Registrazione completata</h2>
        </div>
        <div>
          <p class="text-standard">
            Ti abbiamo inviato una mail all'indirizzo <span class="font-semibold">{{ email }}</span> per confermare la
            registrazione.
          </p>
          <p class="text-standard">Controlla la tua casella di posta elettronica e segui le istruzioni.</p>
        </div>
      </div>
    </div>
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
const emailsent = ref(false);
// verifica in tempo reale se le password corrispondono
const passwordMismatch = computed(() => {
  return password.value.length > 0 && password.value !== confirmPassword.value;
});

const ShowEmailSent = () => {
  emailsent.value = true;
};

const RegisterNewAccount = async () => {
  alertStore.clearAlerts();

  try {
    const response = await api.post('/register', {
      username: username.value,
      email: email.value,
      tel_number: telNumber.value,
      first_name: firstName.value,
      last_name: lastName.value,
      fiscal_code: fiscalCode.value,
      birth_date: birthDate.value,
    });

    // se non ci sono errori manda un messaggio aspetta  e vai alla pagina di login
    alertStore.setSuccess('Account Registrato con successo');
    ShowEmailSent();
    // altrimenti leggi l'errore e mostra un messaggio
  } catch (err) {
    console.error('Error during registration', err);
    if (err?.response?.status === 409) {
      alertStore.setError('La data inserita non è valida');
    } else if (err?.response?.status === 422 && err?.response?.data?.error === 'email_already_exists') {
      console.log(err?.response?.data);
      // se l'email è già registrata o l'utente non ha validato in tempo la registrazione invia un messaggio
      alertStore.setError(
        'Email già registrata. Se hai dimenticato la password o non ancora validato il tuo account clicca su password dimenticata'
      );
    } else if (err?.response?.status === 422 && err?.response?.data?.error === 'username_already_exists') {
      alertStore.setError('Username già registrato');
    } else {
      alertStore.setError('Errore durante la registrazione');
    }
  }
};
</script>

<style></style>
