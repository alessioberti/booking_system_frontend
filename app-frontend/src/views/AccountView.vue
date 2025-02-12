<template>
  <div class="box-container lg:max-w-2xl">
    <h2 class="text-2xl font-bold mb-6 text-center">Gestione Account</h2>

    <div class="grid grid-cols-1 gap-6">
      <form @submit.prevent="updateEmail">
        <div>
          <label for="email" class="label">Username</label>
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <input
                :disabled="!editEmail"
                id="email"
                type="email"
                v-model="email"
                placeholder="Email di Accesso"
                class="input"
                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              />
            </div>
            <button v-if="!editEmail" @click="enableEmailEdit()" class="button ml-4">Modifica</button>
            <button v-else type="submit" class="button ml-4">Salva</button>
          </div>
        </div>
      </form>
      <div>
        <label for="password" class="label">Password</label>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <input
              :disabled="!editPassword"
              id="password"
              type="password"
              v-model="password"
              minlength="8"
              maxlength="32"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,32}$"
              placeholder="Password di accesso"
              class="input"
            />
          </div>
          <button v-if="!editPassword" @click="enablePasswordEdit()" class="button ml-4">Modifica</button>
          <button v-else @click="showPasswordModal()" class="button ml-4">Salva</button>
        </div>
      </div>
      <div></div>
    </div>
    <div class="flex justify-between mt-6">
      <button @click="goToHome()" class="button-back mb-4">Indietro</button>
      <button @click="deleteAccount" class="button-success mb-4">Modifica dati anagrafici</button>
    </div>
    <hr />
    <div class="mt-4">
      <button @click="deleteAccount" class="button-delete mb-4">Elimina Account</button>
      <p class="text-standard">Attenzione: l'azione di cancellazione dei dati non può essere annullata</p>
    </div>
  </div>
  <div v-if="emailModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4">Conferma modifica username</h3>
      <p class="text-gray-700 text-sm mb-4">Sei sicuro di voler modificare la tua email di accesso?</p>
      <div class="flex justify-end gap-4">
        <button @click="updateEmail()" class="button-delete">Sì, modifica</button>
        <button @click="closeModals()" class="button-back">No, Indietro</button>
      </div>
    </div>
  </div>
  <div v-if="passwordModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4">Conferma modifica password</h3>
      <p class="text-gray-700 text-sm mb-4">Sei sicuro di voler modificare la tua password?</p>
      <div class="flex justify-end gap-4">
        <button @click="updatePassword()" class="button-delete">Sì, modifica</button>
        <button @click="closeModals()" class="button-back">No, Indietro</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';
import { useAlertStore } from '../stores/alert';

const alertStore = useAlertStore();
const router = useRouter();
const editEmail = ref(false);
const editPassword = ref(false);
const passwordModal = ref(false);
const password = ref('');
const emailModal = ref(false);

const email = ref('');

const showEmailModal = () => {
  emailModal.value = true;
};

const showPasswordModal = () => {
  passwordModal.value = true;
};

const enableEmailEdit = () => {
  editEmail.value = true;
};

const enablePasswordEdit = () => {
  editPassword.value = true;
};

const closeModals = () => {
  emailModal.value = false;
  passwordModal.value = false;
};

const updateEmail = async () => {
  try {
    await api.patch('/account', { email: email.value });
    alertStore.setSuccess('Email aggiornata con successo');
    editEmail.value = false;
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante l'aggiornamento dell'email");
  } finally {
    closeModals();
    getAccountData();
  }
};

const updatePassword = async () => {
  try {
    await api.patch('/account', { password: password.value });
    alertStore.setSuccess('Password aggiornata con successo');
    editPassword.value = false;
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante l'aggiornamento della password");
  }
};

const goToHome = () => {
  router.push({ name: 'home' });
};

const getAccountData = async () => {
  try {
    const response = await api.get('/account');
    email.value = response.data.email;
    editEmail.value = false;
    editPassword.value = false;
  } catch (err) {
    console.error(err);
    alertStore.setError("Errore durante il caricamento dei dati dell'account");
  }
};

onMounted(getAccountData);
</script>
<style scoped></style>
