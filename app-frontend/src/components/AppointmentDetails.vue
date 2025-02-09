<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <!-- alert per conferme e errori -->
    <div v-if="errorMessage" class="alert-error" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert-success" role="alert">
      {{ successMessage }}
    </div>

    <!-- gestisci come pagina per mobile e come modale all'80% per gli schemi medi e in su-->
    <div class="bg-white p-6 md:rounded-lg shadow-lg w-[100%] md:w-[80%] max-h-screen overflow-y-auto">
      <h2 class="title-page mb-4">Prenotazione per: {{ props.examName }}</h2>
      <div class="mb-4 lg:grid lg:grid-cols-2">
        <div class="modal-info"><strong>Data:&nbsp; </strong> {{ formattedDate }}</div>
        <div class="modal-info">
          <strong>Orario:&nbsp;</strong> {{ props.bookingData.appointment_time_start }} -
          {{ props.bookingData.appointment_time_end }}
        </div>
        <div class="modal-info"><strong>Presso:&nbsp; </strong> {{ props.bookingData.laboratory_name }}</div>
        <div class="modal-info"><strong>Indirizzo:&nbsp;</strong> {{ props.bookingData.laboratory_address }}</div>
        <div class="modal-info">
          <strong>Tel:&nbsp;</strong>
          <a class="hover:underline hover:text-blue-600" :href="'tel:${props.bookingData.laboratory_tel_number}'">
            {{ props.bookingData.laboratory_tel_number }}</a
          >
        </div>
        <div class="modal-info">{{ props.bookingData.operator_name }}</div>
      </div>
      <!-- dati anagrafici paziente -->
      <h3 class="sub-title-page mb-4 mt-10">Dati anagrafici paziente</h3>
      <div class="lg:flex block justify-between">
        <div class="mb-4 w-full lg:w-1/2 lg:mr-2">
          <label for="firstName" class="label">Nome</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            :disabled="useDefault"
            class="input"
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
            placeholder="Inserisci l'email"
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
            placeholder="Inserisci il numero di telefono"
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
            placeholder="Inserisci codice fiscale"
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
            placeholder="Inserisci la data di nascita"
          />
        </div>
      </div>
      <div class="mt-4 mb-4">
        <button v-if="useDefault" @click="bookForAnother" class="button">Modifica i dati Paziente</button>
        <p v-else>
          Se non possiedi un codice fiscale italiano, inserisci il numero del tuo documento di identità o passaporto.
        </p>
      </div>
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
        <button @click="returnBack()" class="button-back">Annulla</button>
        <button @click="confirmBooking()" class="button">Conferma</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  bookingData: {
    type: Object,
    required: true,
  },
  examName: {
    type: String,
    required: true,
  },
  appointmentInfo: {
    type: String,
    default: '',
  },
  patientData: {
    type: Object,
    default: null,
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

// Messaggi di errore
const errorMessage = ref('');
const successMessage = ref('');

// Inizializza il form con i dati del paziente se disponibili
const initForm = () => {
  errorMessage.value = '';
  if (props.patientData) {
    firstName.value = props.patientData.first_name;
    lastName.value = props.patientData.last_name;
    email.value = props.patientData.email;
    telNumber.value = props.patientData.tel_number;
    fiscalcode.value = props.patientData.fiscal_code;
    birthdate.value = props.patientData.birth_date;
    useDefault.value = props.patientData.is_default;
  } else {
    bookForAnother();
  }
  appointmentInfo.value = props.appointmentInfo || '';
};

onMounted(() => {
  initForm();
});

// Funzione per "prenotare per un altro paziente" (reset del form)
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

// conferma la prenotazione con i dati del paziente e della prenotazione necessari per il backend
const confirmBooking = () => {
  let payload;
  let patient;
  let appointment;
  // come per il form di registrazione, controlla se i campi obbligatori sono stati compilati
  if (
    !firstName.value.trim() ||
    !lastName.value.trim() ||
    !email.value.trim() ||
    !fiscalcode.value.trim() ||
    !birthdate.value.trim() ||
    !telNumber.value.trim()
  ) {
    errorMessage.value = 'Tutti i campi sono obbligatori';
    return;
  }

  // crea un oggetto paziente sovrascrivendo i dati se sono stati modificati
  patient = props.patientData;
  patient.first_name = firstName.value;
  patient.last_name = lastName.value;
  patient.email = email.value;
  patient.tel_number = telNumber.value;
  patient.fiscal_code = fiscalcode.value;
  patient.birth_date = birthdate.value;
  patient.is_default = useDefault.value;

  // crea un oggetto prenotazione sovrascrivendo le note se sono state modificate
  appointment = props.bookingData;
  appointment.info = appointmentInfo.value;

  // crea un oggetto payload con i dati del paziente e della prenotazione
  const confirmedAppointment = { patient, appointment };

  // ritorna alla view precedente con i dati della prenotazione confermati
  emit('confirm', confirmedAppointment);
};
</script>

<style></style>
