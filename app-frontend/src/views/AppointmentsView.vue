<template>
  <div class="box-container">
    <div class="flex items-center mb-4">
      <button class="button-back mr-6" @click="goBack">Indietro</button>
      <h2 class="title-page">Le mie Prenotazioni</h2>
    </div>
    <hr />

    <div>
      <h3 class="font-semibold text-grey-800 mt-4">Filtra Appuntamenti:</h3>
      <!-- chekbox per filtrare i risultati -->
      <ul
        class="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex mt-4"
      >
        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
          <div class="flex items-center ps-3">
            <input
              id="past_appointments"
              type="checkbox"
              v-model="includePastAppointments"
              @change="getAppointments"
              value=""
              class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm focus:ring-primary"
            />
            <label for="past_appointments" class="w-full py-3 ms-2 text-sm font-medium text-gray-900"
              >Visualizza appuntamenti passati</label
            >
          </div>
        </li>
        <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
          <div class="flex items-center ps-3">
            <input
              id="rejected_appointments"
              v-model="includeRejectedAppointments"
              @change="getAppointments"
              type="checkbox"
              value=""
              class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm focus:ring-primary"
            />
            <label for="rejected_appointments" class="w-full py-3 ms-2 text-sm font-medium text-gray-900"
              >Visualizza Appuntamenti Cancellati</label
            >
          </div>
        </li>
      </ul>
      <!-- Lista delle prenotazioni -->
      <ul class="space-y-4">
        <li
          v-for="appointment in appointments"
          :key="appointment.appointment_id"
          class="px-4 py-8 my-4 border-b-4 border-gray-400"
        >
          <div class="mb-4 lg:grid lg:grid-cols-2">
            <div class="modal-info">
              <strong>Esame:&nbsp;</strong>
              {{ appointment.service_name }} ({{ appointment.operator_name }})
            </div>
            <div class="modal-info">
              <strong>Paziente:&nbsp;</strong>
              {{ appointment.patient_name }}
            </div>
            <div class="modal-info">
              <strong>Data:&nbsp;</strong>
              {{ formatDate(appointment.appointment_date) }}
            </div>
            <div class="modal-info">
              <strong>Orario:&nbsp;</strong>
              {{ formatTime(appointment.appointment_time_start) }} -
              {{ formatTime(appointment.appointment_time_end) }}
            </div>
            <div class="modal-info">
              <strong>Presso:&nbsp;</strong>
              {{ appointment.location_name }}
            </div>
            <div class="modal-info">
              <strong>Indirizzo:&nbsp;</strong>
              {{ appointment.location_address }}
            </div>
            <div class="modal-info">
              <strong>Tel:&nbsp;</strong>
              <a class="hover:underline hover:text-primary" :href="`tel:${appointment.location_tel_number}`">{{
                appointment.location_tel_number
              }}</a>
            </div>
            <div class="modal-info">
              <strong>Stato:&nbsp;</strong>
              <div v-if="appointment.rejected" class="flex items-center ml-2">
                <div class="text-error mr-1 font-black">Cancellata</div>
              </div>
              <div v-else class="flex items-center ml-2">
                <div class="text-success mr-1 font-black">Attiva</div>
              </div>
            </div>
          </div>

          <div class="mt-4 text-right">
            <!-- se l'appuntamento è attivo attiva anche il pulsante per cancellarlo -->
            <div v-if="!appointment.rejected" class="flex justify-end gap-4">
              <button @click="openEditModal(appointment)" class="button">Modifica</button>
              <button @click="openCancelModal(appointment)" class="button-delete">Cancella</button>
            </div>
          </div>
        </li>
      </ul>
      <!-- mostra messaggio in caso non siano prenotazioni-->
      <div v-if="appointments.length === 0">
        <div class="flex justify-left mt-6">
          <p class="text-standard">Nessuna prenotazione</p>
        </div>
      </div>

      <!-- Paginazione -->
      <div class="flex justify-between items-center mt-6">
        <button @click="prevPage" :class="{ 'button-disabled': currentPage === 1 }" class="button">
          <div class="flex"><< <span class="hidden-mobile ml-2">Precedente</span></div>
        </button>
        <div class="text-sm text-gray-700">Pagina {{ currentPage }} di {{ totalPages }}</div>
        <button @click="nextPage" :class="{ 'button-disabled': currentPage === totalPages }" class="button">
          <div class="flex"><span class="hidden-mobile mr-2">Successivo</span> >></div>
        </button>
      </div>
    </div>

    <!-- Modale di conferma cancellazione -->
    <div v-if="showCancelModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Conferma Cancellazione</h3>
        <p class="text-standard text-sm mb-4">
          Vuoi davvero annullare la prenotazione del
          <strong>{{ formatDate(appointmentToCancel?.appointment_date) }}</strong>
          dalle
          <strong>{{ formatTime(appointmentToCancel?.appointment_time_start) }}</strong>
          alle
          <strong>{{ formatTime(appointmentToCancel?.appointment_time_end) }}</strong>
          di <strong>{{ appointmentToCancel?.patient_name }}</strong
          >?
        </p>
        <div class="flex justify-end gap-4">
          <button @click="cancelappointmentConfirmed" class="button-delete">Sì, Annulla</button>
          <button @click="closeCancelModal" class="button-back">No, Indietro</button>
        </div>
      </div>
    </div>

    <!-- Modale di scelta Modifica -->
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Modifica Appuntamento</h3>
        <p class="text-sm mb-4">
          Vuoi modificare la prenotazione del
          <strong>{{ formatDate(appointmentToEdit?.appointment_date) }}</strong>
          dalle
          <strong>{{ formatTime(appointmentToEdit?.appointment_time_start) }}</strong>
          alle
          <strong>{{ formatTime(appointmentToEdit?.appointment_time_end) }}</strong>
          di <strong>{{ appointmentToEdit?.patient_name }}</strong
          >?
        </p>
        <div class="mt-4 flex center gap-4">
          <button @click="openAppointmentDetails" class="button-success">Modifica Note/Paziente</button>
          <button @click="selectNewSlot" class="button-success">Modifica Sede Data/Orario</button>
        </div>
        <div class="flex justify-end gap-4 mt-4">
          <button @click="closeEditModal" class="button-back">Indietro</button>
        </div>
      </div>
    </div>
    <!-- Modale per confermare la prenotazione -->
    <appointmentDetails
      v-if="showAppointmentDetails"
      @close="closeappointmentModal"
      @confirm="updateAppointment"
      :bookingData="appointmentToEdit"
      :patientData="patientToEdit"
      :serviceName="appointmentToEdit?.service_name"
      :appointmentInfo="appointmentToEdit?.info"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import appointmentDetails from '../components/AppointmentDetails.vue';

// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();
import { useViewDataStore } from '../stores/viewData';

const viewDataStore = useViewDataStore();
// Dichiarazione delle variabili reattive
const router = useRouter();

// Dichiarazione dei singoli ref
const includeRejectedAppointments = ref(false);
const includePastAppointments = ref(false);
const appointments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const showCancelModal = ref(false);
const appointmentToCancel = ref(null);
const showEditModal = ref(false);
const showAppointmentDetails = ref(false);
const patientToEdit = ref(null);
const appointmentToEdit = ref(null);
let isOriginPatientDeafult = false;

// Funzioni di formattazione per date e orari
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(timeStr) {
  const time = new Date(`1970-01-01T${timeStr}`);
  return time.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Funzione per recuperare le prenotazioni
const getAppointments = async () => {
  try {
    alertStore.clearAlerts();
    const resp = await api.get('/appointments', {
      params: {
        page: currentPage.value,
        per_page: 10,
        rejected_appointments: includeRejectedAppointments.value,
        past_appointments: includePastAppointments.value,
      },
    });
    currentPage.value = resp.data.current_page;
    totalPages.value = resp.data.pages;
    appointments.value = resp.data.data;
  } catch (err) {
    console.error('Unable to get appointments:', err);
    alertStore.setError('Errore durante il recupero delle prenotazioni');
  }
};

// Funzioni per la paginazione
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    getAppointments();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    getAppointments();
  }
};

// Funzioni per gestire il modale di cancellazione
const openCancelModal = (appointment) => {
  alertStore.clearAlerts();
  appointmentToCancel.value = appointment;
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  appointmentToCancel.value = null;
};

const cancelappointmentConfirmed = async () => {
  if (!appointmentToCancel.value) return;
  try {
    alertStore.clearAlerts();
    // Esegui la chiamata per annullare l'appuntamento
    await api.put(`/appointments/${appointmentToCancel.value.appointment_id}/reject`);
    // per migliorare l'esperienza utente in caso di successo facendo prima sparire il modale
    // e impostando manualmente lo stato dell'appuntamento
    showCancelModal.value = false;
    appointmentToCancel.value.rejected = true;
    alertStore.setSuccess('Prenotazione annullata con successo.');
  } catch (err) {
    alertStore.setError("Si verifica un errore durante l'annullamento della prenotazione.");
  } finally {
    appointmentToCancel.value = null;
  }
};

// Funzioni per gestire il modale di modifica
const openEditModal = (appointment) => {
  alertStore.clearAlerts();
  appointmentToEdit.value = appointment;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;

  appointmentToEdit.value = null;
};

const openAppointmentDetails = async () => {
  await getAppointmentPatientData();
  showEditModal.value = false;
  showAppointmentDetails.value = true;
};

const getAppointmentPatientData = async () => {
  try {
    const response = await api.get(`/appointments/${appointmentToEdit.value.appointment_id}/patient`);
    if (response && response.data) {
      patientToEdit.value = response.data;
      // salva i dati del paziente originale per confronto prima di fare la modifica
      isOriginPatientDeafult = response.data.is_default;
    } else {
      patientToEdit.value = {};
    }
  } catch (error) {
    alertStore.setError('Errore durante il recupero dei dati del paziente');
    console.error(': Unable to get appointment patient data ', error);
  }
};

const closeappointmentModal = () => {
  showAppointmentDetails.value = false;
  appointmentToEdit.value = null;
};

const selectNewSlot = () => {
  // salva l'appuntamento da modificare nello store sotto una chiave specifica
  viewDataStore.setData('appointmentToReplace', appointmentToEdit.value);
  // imposta lo stesso esame dell'appuntamento nello store
  viewDataStore.setData('selectedService', {
    service_id: appointmentToEdit.value.service_id,
    name: appointmentToEdit.value.service_name,
  });
  // Reindirizza l'utente alla pagina di selezione degli slot
  router.push({ name: 'slot-selection' });
};

const updateAppointment = async () => {
  try {
    alertStore.clearAlerts();
    // se il paziente era di default ma è richiesto un nuovo paziente crea un nuovo paziente e lo associa alla prenotazione
    if (patientToEdit.value.is_default === false && isOriginPatientDeafult === true) {
      await api.put(`/appointments/${appointmentToEdit.value.appointment_id}/patient/replace`, {
        patient: patientToEdit.value,
      });
      // se il paziente non era di default aggiorna i dati del paziente
    } else if (patientToEdit.value.is_default === false && isOriginPatientDeafult === false) {
      await api.put(`/appointments/${appointmentToEdit.value.appointment_id}/patient/update`, {
        patient: patientToEdit.value,
      });
    }
    // aggiorna le note della prenotazione
    await api.put(`/appointments/${appointmentToEdit.value.appointment_id}/info`, {
      info: appointmentToEdit.value.info,
    });
    alertStore.setSuccess('Prenotazione modificata con successo');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    closeappointmentModal();
    getAppointments();
  } catch (error) {
    alertStore.setError('Errore durante la modifica della prenotazione');
    console.error('Unable to update appointment:', error);
  }
};

onMounted(getAppointments);

const goBack = () => {
  router.back();
};
</script>

<style></style>
