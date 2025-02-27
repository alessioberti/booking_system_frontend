<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <!-- gestisci come pagina per mobile e come modale all'80% per gli schemi medi e in su-->
    <div class="bg-white p-6 md:rounded-lg shadow-lg w-[100%] md:w-[80%] max-h-screen overflow-y-auto">
      <h2 class="title-page mb-4">Prenotazione per: {{ props.serviceName }}</h2>
      <div class="mb-4 lg:grid lg:grid-cols-2">
        <div class="modal-info"><strong>Data:&nbsp; </strong> {{ formattedDate }}</div>
        <div class="modal-info">
          <strong>Orario:&nbsp;</strong> {{ props.bookingData.appointment_time_start }} -
          {{ props.bookingData.appointment_time_end }}
        </div>
        <div class="modal-info"><strong>Presso:&nbsp; </strong> {{ props.bookingData.location_name }}</div>
        <div class="modal-info"><strong>Indirizzo:&nbsp;</strong> {{ props.bookingData.location_address }}</div>
        <div class="modal-info">
          <strong>Tel:&nbsp;</strong>
          <a class="hover:underline hover:text-primary" :href="'tel:${props.bookingData.location_tel_number}'">
            {{ props.bookingData.location_tel_number }}</a
          >
        </div>
        <div class="modal-info">{{ props.bookingData.operator_name }}</div>
      </div>
      <div></div>
      <!-- dati anagrafici paziente -->
      <h3 v-if="useDefault" class="sub-title-page mb-2 mt-4">Verifica i tuoi dati prima di prenotare:</h3>
      <h3 v-else class="sub-title-page mb-2 mt-4">Modifica i dati paziente:</h3>
      <form @submit.prevent="confirmBooking()" class="space-y-6">
        <div class="lg:flex block justify-between">
          <div class="mb-4 w-full lg:w-1/2 lg:mr-2">
            <label for="firstName" class="label">Nome</label>
            <input
              type="text"
              id="firstName"
              v-model="firstName"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci il nome"
            />
          </div>

          <div class="mb-4 w-full lg:w-1/2 lg:ml-2">
            <label for="lastName" class="label">Cognome</label>
            <input
              type="text"
              id="lastName"
              v-model="lastName"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci il cognome"
            />
          </div>
        </div>
        <div class="lg:flex block justify-between">
          <div class="mb-4 w-full lg:w-1/2 lg:mr-2">
            <label for="email" class="label">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci l'email"
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              oninput="this.setCustomValidity('')"
            />
          </div>

          <div class="mb-4 w-full lg:w-1/2 lg:ml-2">
            <label for="telNumber" class="label">Numero di Telefono</label>
            <input
              type="tel"
              id="telNumber"
              v-model="telNumber"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci il numero di telefono"
              pattern="^\+?\d{7,13}$"
            />
          </div>
        </div>
        <div class="lg:flex block justify-between">
          <div class="mb-4 w-full lg:w-1/2 lg:mr-2">
            <label for="fiscalcode" class="label">Codice Fiscale</label>
            <input
              type="text"
              id="fiscalcode"
              v-model="fiscalcode"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci codice fiscale"
              pattern="^[a-zA-Z0-9]{3,32}$"
            />
          </div>

          <div class="mb-4 w-full lg:w-1/2 lg:ml-2">
            <label for="birthdate" class="label">Data di Nascita</label>
            <input
              type="date"
              id="birthdate"
              v-model="birthdate"
              :disabled="useDefault"
              class="input"
              required="true"
              placeholder="Inserisci la data di nascita"
              pattern="\d{4}-\d{2}-\d{2}"
            />
          </div>
        </div>

        <button v-if="useDefault" @click="bookForAnother" class="button-success mb-4">Modifica dati paziente</button>
        <p v-if="!useDefault" class="text-standard mb-4">
          Se non possiedi un codice fiscale italiano, inserisci il numero del tuo documento di identità o passaporto.
        </p>
        <div class="mb-4">
          <label for="appointmentInfo" class="label">Note</label>
          <textarea
            id="appointmentInfo"
            v-model="appointmentInfo"
            class="input"
            placeholder="Inserisci eventuali note"
            rows="3"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-2">
          <button @click="returnBack()" class="button-back">Indietro</button>
          <button type="submit" class="button">Conferma</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();

const props = defineProps({
  bookingData: {
    type: Object,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },

  // dati aggiuntivi per la prenotazione viene passato solo alla modifica appuntamento
  appointmentInfo: {
    type: String,
    default: '',
  },

  patientData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'confirm']);

// formatta la data in formato italiano
const formattedDate = computed(() => {
  const date = new Date(props.bookingData.appointment_date);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Campi del form
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const telNumber = ref('');
const fiscalcode = ref('');
const birthdate = ref('');
const appointmentInfo = ref(props.appointmentInfo);
const useDefault = ref(true);

// se clicca su prenota per un altro paziente, resetta i campi del form
const bookForAnother = () => {
  useDefault.value = false;
  firstName.value = '';
  lastName.value = '';
  email.value = '';
  telNumber.value = '';
  fiscalcode.value = '';
  birthdate.value = '';
};

// Chiude il modale
const returnBack = () => {
  emit('close');
};

// conferma la prenotazione
const confirmBooking = () => {
  emit('confirm', {
    patient: {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      tel_number: telNumber.value,
      fiscal_code: fiscalcode.value,
      birth_date: birthdate.value,
    },
    appointment_info: appointmentInfo.value,
  });
};

// inizialiizza il form con i dati del paziente
const initForm = () => {
  alertStore.clearAlerts();
  if (!props.patientData) {
    alertStore.setError('Errore durante il caricamento dei dati del paziente');
  }
  firstName.value = props.patientData.first_name || '';
  lastName.value = props.patientData.last_name || '';
  email.value = props.patientData.email || '';
  telNumber.value = props.patientData.tel_number || '';
  fiscalcode.value = props.patientData.fiscal_code || '';
  birthdate.value = props.patientData.birth_date || '';
  useDefault.value = props.patientData.is_default;
  appointmentInfo.value = props.appointmentInfo || '';
};

onMounted(() => {
  initForm();
});
</script>

<style></style>
