<template>
  <div class="box-container md:max-w-2xl">
    <h2 class="text-2xl font-bold mb-6 text-center">Gestione Account</h2>

    <div v-if="!showpatientdata">
      <div class="grid grid-cols-1 gap-6">
        <!-- form per aggiornare username -->
        <form
          @submit.prevent="
            () => confirmAction(updateUsername, 'Attenzione: l\'username di accesso verrà modificato. Continuare?')
          "
          class="space-y-6"
        >
          <div>
            <label class="label" for="username">Username</label>
            <div class="flex items-center justify-between">
              <input
                id="username"
                type="text"
                :disabled="!editusername"
                v-model="username"
                required
                placeholder="Inserisci username"
                class="input flex-1"
                pattern="^[A-Za-z0-9]{3,32}$"
                oninvalid="this.setCustomValidity('Inserisci solo lettere, numeri (da 3 a 32 caratteri)')"
                oninput="this.setCustomValidity('')"
              />
              <button v-if="!editusername" @click.prevent="enableusernameEdit" class="button ml-4">Modifica</button>
              <button v-else type="submit" class="button ml-4">Salva</button>
            </div>
          </div>
        </form>

        <!-- form per aggiornare la password -->
        <form
          @submit.prevent="
            () => confirmAction(updatePassword, 'Attenzione: la password di accesso verrà modificata. Continuare?')
          "
          class="space-y-6"
        >
          <div>
            <label class="label" for="password">Password Attuale</label>
            <div class="flex items-center justify-between">
              <input
                id="password"
                type="password"
                :disabled="!editPassword"
                v-model="password"
                minlength="8"
                maxlength="32"
                placeholder="Password attuale"
                class="input flex-1"
              />
              <button v-if="!editPassword" @click.prevent="enablePasswordEdit" class="button ml-4">Modifica</button>
              <button v-else type="submit" class="button ml-4">Salva</button>
            </div>
            <div v-if="editPassword" class="mt-2">
              <label class="label" for="newPassword">Nuova Password</label>
              <input
                id="newPassword"
                type="password"
                v-model="newPassword"
                required
                minlength="8"
                maxlength="32"
                placeholder="Nuova password"
                class="input"
              />
            </div>
            <div v-if="editPassword" class="mt-2">
              <label class="label" for="confirmPassword">Conferma Nuova Password</label>
              <input
                id="confirmPassword"
                type="password"
                v-model="confirmNewPassword"
                required
                minlength="8"
                maxlength="32"
                placeholder="Conferma password"
                class="input"
              />
              <p v-if="passwordMismatch" class="text-error text-sm">Le password non corrispondono.</p>
            </div>
          </div>
        </form>
      </div>

      <div class="flex justify-between mt-6 mb-2">
        <button @click="goToHome" class="button-back mb-4">Indietro</button>
        <button @click="goToPatientData" class="button-success mb-4">Modifica dati anagrafici</button>
      </div>
      <hr />
      <div class="mt-12">
        <button
          @click="
            () =>
              confirmAction(
                deleteAccount,
                'Attenzione la cancellazione dell\'account è irreversibile. Verranno eliminati tutti i dati dei pazienti collegati all\'account.'
              )
          "
          class="button-delete mb-4"
        >
          Cancella i miei dati
        </button>
      </div>
    </div>

    <!-- form per aggiornare il paziente di default dell'account -->
    <div v-else>
      <div class="grid grid-cols-1 gap-6">
        <form @submit.prevent="updatePatientData" class="space-y-6">
          <div>
            <label class="label" for="firstName">Nome</label>
            <input
              type="text"
              id="firstName"
              v-model="firstName"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci il nome"
              @input="clearValidation"
            />
          </div>
          <div>
            <label class="label" for="lastName">Cognome</label>
            <input
              type="text"
              id="lastName"
              v-model="lastName"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci il cognome"
              @input="clearValidation"
            />
          </div>
          <div>
            <label class="label" for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci l'email"
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              oninput="this.setCustomValidity('')"
            />
          </div>
          <div>
            <label class="label" for="telNumber">Telefono</label>
            <input
              type="tel"
              id="telNumber"
              v-model="telNumber"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci il numero di telefono"
              pattern="^\+?\d{10,13}$"
              @input="clearValidation"
            />
          </div>
          <div>
            <label class="label" for="fiscalcode">Codice Fiscale</label>
            <input
              type="text"
              id="fiscalcode"
              v-model="fiscalcode"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci codice fiscale"
              pattern="^[a-zA-Z0-9]{3,32}$"
              @input="clearValidation"
            />
          </div>
          <div>
            <label class="label" for="birthdate">Data di Nascita</label>
            <input
              type="date"
              id="birthdate"
              v-model="birthdate"
              :disabled="useDefault"
              class="input"
              required
              placeholder="Inserisci la data di nascita"
              pattern="\d{4}-\d{2}-\d{2}"
              @input="clearValidation"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="goToAccountData" type="button" class="button-back">Annulla</button>
            <button type="submit" class="button">Conferma</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale per la richiesta di conferma -->
    <div v-if="updateModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Conferma azione</h3>
        <p class="text-standard text-sm mb-4">{{ modalMessage }}</p>
        <div class="flex justify-end gap-4">
          <button @click="proceedAction" class="button-delete">Procedi</button>
          <button @click="closeModal" class="button-back">Indietro</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';
import { useAlertStore } from '../stores/alert';

const alertStore = useAlertStore();
const router = useRouter();
const editusername = ref(false);
const editPassword = ref(false);
const username = ref('');
const password = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const updateModal = ref(false);
const pendingAction = ref(null);
const modalMessage = ref('');
const showpatientdata = ref(false);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const telNumber = ref('');
const fiscalcode = ref('');
const birthdate = ref(null);
const useDefault = ref(false);

// verifica in tempo reale se le password corrispondono
const passwordMismatch = computed(() => {
  return confirmNewPassword.value.length > 0 && newPassword.value !== confirmNewPassword.value;
});

const confirmAction = (action, message) => {
  pendingAction.value = action;
  modalMessage.value = message;
  updateModal.value = true;
};

const proceedAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value();
  }
  updateModal.value = false;
  pendingAction.value = null;
};

const closeModal = () => {
  updateModal.value = false;
  pendingAction.value = null;
};

// Funzioni di abilitazione per modifica
const enableusernameEdit = () => {
  editusername.value = true;
};

const enablePasswordEdit = () => {
  editPassword.value = true;
};

// aggiorna l'username dell'account
const updateUsername = async () => {
  try {
    await api.put('/account/username', { username: username.value });
    alertStore.setSuccess('Username aggiornato con successo');
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante l'aggiornamento dell'username");
  } finally {
    editusername.value = false;
    getAccountData();
  }
};
// aggiorna la password dell'account
const updatePassword = async () => {
  if (passwordMismatch.value) {
    alertStore.setError('Le password non corrispondono');
    return;
  }
  try {
    await api.put('/account/password', {
      password: password.value,
      new_password: newPassword.value,
    });
    alertStore.setSuccess('Password aggiornata con successo');
    editPassword.value = false;
    password.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante l'aggiornamento della password");
  }
};
// cancella l'accout e anonimizza tutti i dati dei pazienti collegati
const deleteAccount = async () => {
  try {
    await api.post('/account/anonimize');
    alertStore.setSuccess('Account eliminato con successo');
    router.push({ name: 'home' });
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante l'eliminazione dell'account");
  }
};

const goToHome = () => {
  router.push({ name: 'home' });
};

const goToPatientData = () => {
  showpatientdata.value = true;
  getDefaultPatientData();
};

const goToAccountData = () => {
  showpatientdata.value = false;
  getAccountData();
};

// recupera username
const getAccountData = async () => {
  try {
    const response = await api.get('/account');
    username.value = response.data.username;
    editusername.value = false;
    editPassword.value = false;
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante il caricamento dei dati dell'account");
  }
};
// recupera i dati del paziente di default
const getDefaultPatientData = async () => {
  alertStore.clearAlerts();
  try {
    const response = await api.get('/account/patient');
    firstName.value = response.data.first_name || '';
    lastName.value = response.data.last_name || '';
    email.value = response.data.email || '';
    telNumber.value = response.data.tel_number || '';
    fiscalcode.value = response.data.fiscal_code || '';
    birthdate.value = response.data.birth_date || '';
  } catch (error) {
    console.error('Unable to get default patient data', error);
    alertStore.setError('Errore durante il caricamento dei dati del paziente');
  }
};
// aggiorna i dati del paziente di default
const updatePatientData = async () => {
  alertStore.clearAlerts();
  try {
    const data = {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      tel_number: telNumber.value,
      fiscal_code: fiscalcode.value,
      birth_date: birthdate.value,
    };
    await api.put('/account/patient/info', data);
    alertStore.setSuccess('Dati paziente aggiornati con successo');
    showpatientdata.value = false;
  } catch (error) {
    console.error('Unable to update patient data', error);
    alertStore.setError("Errore durante l'aggiornamento dei dati del paziente");
  }
};

onMounted(getAccountData);
</script>

<style></style>
