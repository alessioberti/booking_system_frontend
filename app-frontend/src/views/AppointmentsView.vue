<template>
  <div class="box-container">
    <h2 class="title-page">Le mie Prenotazioni</h2>

    <!-- Alert per conferme e errori -->
    <div v-if="errorMessage" class="alert-error" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert-success" role="alert">
      {{ successMessage }}
    </div>

    <!-- mostra messaggio in caso non siano prenotazioni-->
    <div v-if="appointments.length === 0" class="text-center">
      <p class="text-gray-500">Non hai ancora prenotazioni.</p>
      <button @click="goBack" class="button-back">Indietro</button>
    </div>

    <!-- altrimenti stampa la lista delle prenotazioni -->
    <div v-else>
      <ul class="space-y-4">
        <li
          v-for="appointment in appointments"
          :key="appointment.appointment_id"
          class="px-4 py-8 my-4 border-b-4 border-gray-400"
        >
          <div class="mb-4 lg:grid lg:grid-cols-2">
            <div class="modal-info">
              <strong>Esame:&nbsp;</strong>
              {{ appointment.exam_type_name }} ({{ appointment.operator_name }})
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
              {{ appointment.laboratory_name }}
            </div>
            <div class="modal-info">
              <strong>Indirizzo:&nbsp;</strong>
              {{ appointment.laboratory_address }}
            </div>
            <div class="modal-info">
              <strong>Tel:&nbsp;</strong>
              <a class="hover:underline hover:text-blue-600" :href="`tel:${appointment.laboratory_tel_number}`">{{
                appointment.laboratory_tel_number
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

      <div class="flex justify-center mt-6">
        <button @click="goBack" class="button-back">Indietro</button>
      </div>
    </div>

    <!-- Modale di conferma cancellazione -->
    <div v-if="showCancelModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Conferma Cancellazione</h3>
        <p class="text-gray-700 text-sm mb-4">
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
        <p class="text-gray-700 text-sm mb-4">
          Vuoi modificare la prenotazione del
          <strong>{{ formatDate(appointment?.appointment_date) }}</strong>
          dalle
          <strong>{{ formatTime(appointment?.appointment_time_start) }}</strong>
          alle
          <strong>{{ formatTime(appointment?.appointment_time_end) }}</strong>
          di <strong>{{ appointment?.patient_name }}</strong
          >?
        </p>
        <div class="mt-4 flex center gap-4">
          <button @click="openAppointmentDetails" class="button-success">Modifica Note/Paziente</button>
          <button class="button-success">Modifica Data/Orario</button>
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
      @confirm="updateBookingDetails"
      :bookingData="appointmentToEdit"
      :patientData="patientToEdit"
      :examName="appointmentToEdit?.exam_type_name"
      :appointmentInfo="appointmentToEdit?.info"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import appointmentDetails from '../components/AppointmentDetails.vue';

const router = useRouter();

// Dichiarazione dei singoli ref
const appointments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const errorMessage = ref('');
const successMessage = ref('');
const showCancelModal = ref(false);
const appointmentToCancel = ref(null);
const showEditModal = ref(false);
const showAppointmentDetails = ref(false);
const patientToEdit = ref(null);
const appointmentToEdit = ref(null);

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
    errorMessage.value = '';
    successMessage.value = '';
    const resp = await api.get('/appointments', {
      withCredentials: true,
      params: { page: currentPage.value, per_page: 10 },
    });
    currentPage.value = resp.data.current_page;
    totalPages.value = resp.data.pages;
    appointments.value = resp.data.data;
  } catch (err) {
    console.error('Unable to get appointments:', err);
    errorMessage.value = 'Errore durante il recupero delle prenotazioni.';
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
  errorMessage.value = '';
  successMessage.value = '';
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
    errorMessage.value = '';
    successMessage.value = '';
    // Esegui la chiamata per annullare l'appuntamento
    await api.put(`/appointment/${appointmentToCancel.value.appointment_id}/reject`);
    showCancelModal.value = false;
    appointmentToCancel.value.rejected = true;
    successMessage.value = 'Prenotazione annullata con successo.';
  } catch (err) {
    console.error('Errore annullamento prenotazione:', err);
    errorMessage.value = err.response?.data?.error || 'Errore durante la cancellazione.';
  } finally {
    appointmentToCancel.value = null;
  }
};

// Funzioni per gestire il modale di modifica
const openEditModal = (appointment) => {
  errorMessage.value = '';
  successMessage.value = '';
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
    const response = await api.get(`/appointments/${appointment.value.appointment_id}/patient`);
    if (response && response.data) {
      patientToEdit.value = response.data;
    } else {
      patientToEdit.value = {};
    }
  } catch (error) {
    console.error(': Unable to get appointment patient data ', error);
  }
};

const closeappointmentModal = () => {
  showAppointmentDetails.value = false;
  appointment.value = null;
};

const editappointmentDatetime = () => {
  // da implementare
};

const updateBookingDetails = async (confirmedappointment) => {
  try {
    errorMessage.value = '';
    successMessage.value = '';
    const response = await api.put(
      `/appointment/${appointment.value.appointment_id}/patient`,
      confirmedappointment.patient
    );
    if (response && response.data) {
      successMessage.value = 'Prenotazione modificata con successo.';
      showAppointmentDetails.value = false;
      getAppointments();
    }
  } catch (error) {
    console.error('Errore modifica prenotazione:', error);
    errorMessage.value = error.response?.data?.error || 'Errore durante la modifica della prenotazione.';
  }
};

onMounted(getAppointments);

const goBack = () => {
  router.back();
};
</script>

<style></style>
