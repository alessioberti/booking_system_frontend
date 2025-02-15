<template>
  <div class="box-container">
    <div class="flex items-center mb-4">
      <button class="button-back mr-6" @click="goBack">Indietro</button>
      <h2 class="title-page">Disponibilità per {{ serviceName }}</h2>
    </div>
    <hr />

    <!-- Filtri -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-6">
      <div class="w-full sm:w-1/2">
        <label for="operator" class="block text-md font-medium text-standard mb-1">Operatore</label>
        <select id="operator" v-model="filters.operatorId" class="select" @change="applyFilters">
          <option value="">-- Tutti --</option>
          <option v-for="operator in operators" :key="operator.operator_id" :value="operator.operator_id">
            {{ operator.name }}
          </option>
        </select>
      </div>

      <div class="w-full sm:w-1/2">
        <label for="location" class="block text-md font-medium text-standard mb-1">Laboratorio</label>
        <select id="location" v-model="filters.locationId" class="select" @change="applyFilters">
          <option value="">-- Tutti --</option>
          <option v-for="location in locations" :key="location.location_id" :value="location.location_id">
            {{ location.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="sub-title-page my-4">Seleziona il mese per visualizzare gli slot disponibili</div>
    <!-- Paginazione tra mesi -->
    <div class="flex justify-center items-center mb-6">
      <button @click="prevMonth" :disabled="!prevCursor" class="button">
        <div class="flex"><< <span class="hidden-mobile ml-2">Precedente</span></div>
      </button>

      <div class="text-lg font-semibold px-4">{{ currentMonthName }} {{ currentYear }}</div>
      <button @click="nextMonth" :disabled="!nextCursor" class="button">
        <div class="flex"><span class="hidden-mobile mr-2">Successivo</span> >></div>
      </button>
    </div>

    <hr />
    <!-- Elenco delle date disponibili -->
    <div class="mb-6 mt-6">
      <div class="sub-title-page mb-4">Giorni disponibili</div>
      <div class="flex flex-wrap gap-2">
        <div v-if="currentDates.length === 0" class="text-center text-lg text-standard">
          Nessuna giorno prenotabile in questo mese.
        </div>

        <div
          v-else
          v-for="date in currentDates"
          :key="date"
          @click="selectDate(date)"
          class="cursor-pointer px-3 py-2 rounded-md text-center"
          :class="{
            'button-selected': selectedDate === date,
            'button-no-selected': selectedDate !== date,
          }"
        >
          {{ formatDay(date) }}
        </div>
      </div>
    </div>
    <hr />
    <!-- Lista degli slot con selezione anche da tastiera-->
    <div v-if="selectedDate && groupedSlots[selectedDate]" class="mt-10">
      <h3 class="text-xl mb-4">
        Disponibilità per il giorno <span class="font-bold">{{ formatSelectedDate(selectedDate) }}</span>
      </h3>

      <ul role="list" class="divide-y divide-gray-200">
        <li
          v-for="slot in groupedSlots[selectedDate]"
          :key="slot.appointment_time_start"
          tabindex="0"
          @keydown.enter="openAppointmentModal(slot)"
          @click="openAppointmentModal(slot)"
          class="slot-item cursor-pointer hover:bg-gray-100"
        >
          <div>
            <div class="text-md font-semibold text-gray-900">
              <div>Ora inizio: {{ slot.appointment_time_start }}</div>
              <div>Ora fine: {{ slot.appointment_time_end }}</div>
            </div>
            <p class="mt-1 text-sm text-standard">{{ slot.operator_name }}</p>
          </div>
          <div class="text-md font-semibold text-gray-900">
            {{ slot.location_name }}
            <p class="text-sm text-standard">{{ slot.location_address }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- modale per confermare la prenotazione -->
    <AppointmentDetails
      v-if="isModalConfirmOpen"
      @close="closeModals"
      @confirm="saveAppointment"
      :bookingData="selectedSlot"
      :patientData="patientData"
      :serviceName="serviceName"
    />
    <!-- Modale per cambiare prenotazione -->
    <AppointmentReplace
      v-if="isModalReplaceOpen"
      @close="closeModals"
      @confirm="replaceAppointment"
      :newAppointment="selectedSlot"
      :oldAppointment="appointmentToReplace"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useViewDataStore } from '../stores/viewData';
import AppointmentReplace from '../components/AppointmentReplace.vue';
import AppointmentDetails from '../components/AppointmentDetails.vue';

// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();

const router = useRouter();
const viewDataStore = useViewDataStore();

const selectedService = computed(() => viewDataStore.data.selectedService);
const serviceName = computed(() => (selectedService.value ? selectedService.value.name : ''));
const serviceTypeId = computed(() => (selectedService.value ? selectedService.value.service_id : null));
const fromDatetime = ref('');
const toDatetime = ref('');
const currentDates = ref([]);
const groupedSlots = ref({});
const selectedDate = ref('');
const filters = ref({
  operatorId: '',
  locationId: '',
});
const patientData = ref({});
const operators = ref([]);
const locations = ref([]);
const nextCursor = ref(null);
const prevCursor = ref(null);

const isModalConfirmOpen = ref(false);
const selectedSlot = ref(null);

const isModalReplaceOpen = ref(false);
const appointmentToReplace = ref(null);

// calcola il nome del mese e l'anno corrente
const currentMonthName = computed(() => {
  if (!fromDatetime.value) return '';
  const date = new Date(fromDatetime.value);
  return date.toLocaleString('it-IT', { month: 'long' });
});
const currentYear = computed(() => {
  if (!fromDatetime.value) return '';
  return new Date(fromDatetime.value).getFullYear();
});

// aggiungi un mese a una data ISO
const addMonthsToIso = (isoDate, months) => {
  const date = new Date(isoDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

// come per il bakened la richiesta parte dalla data di domani
const initializeDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // domani
  fromDatetime.value = minDate.toISOString();
  toDatetime.value = addMonthsToIso(fromDatetime.value, 1);
};

// formatta i giorni in stringa in italiano es lun 12
const formatDay = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
};

// formatta iso format in stringa in italiano es.12/12/2021
const formatSelectedDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ruchiama available slots e aggiorna le variabili reattive
const getAvailableSlots = async () => {
  alertStore.clearAlerts();
  try {
    const params = {
      datetime_from_filter: fromDatetime.value,
      datetime_to_filter: toDatetime.value,
    };
    // aggiungi filtri operator e laboratorio se presenti
    if (filters.value.operatorId) params.operator_id = filters.value.operatorId;
    if (filters.value.locationId) params.location_id = filters.value.locationId;
    // se è già stata selezionata una data la aggiunge ai parametri
    if (selectedDate.value) params.page_date = selectedDate.value;

    const response = await api.get(`/services/${serviceTypeId.value}/available-slots`, { params });
    const data = response.data;

    // aggiorna le date disponibili e i cursori e le liste dei filtri
    currentDates.value = data.date_list || [];
    nextCursor.value = data.next_cursor_datetime;
    prevCursor.value = data.prev_cursor_datetime;
    operators.value = data.operators || [];
    locations.value = data.locations || [];

    // se non è già stata selezionata una data seleziona la prima (se non fosse usato il backend comunque restiuscie la prima data)
    if (!selectedDate.value && currentDates.value.length > 0) {
      selectedDate.value = currentDates.value[0];
    }

    // usa la data per selezionare gli slots disponibili di quella data
    groupedSlots.value = {};
    if (selectedDate.value) {
      groupedSlots.value[selectedDate.value] = data.slots || [];
    }
  } catch (error) {
    alertStore.setError('Errore durante il caricamento degli slot disponibili');
    console.error('Failed to get Available slots:', error);
  }
};

// ricarica gli slot e filtri quando cambia la data selezionata
const selectDate = (date) => {
  selectedDate.value = date;
  getAvailableSlots();
};

// ricarica gli slot e filtri quando cambiano i filtri
const applyFilters = () => {
  selectedDate.value = currentDates.value.length > 0 ? currentDates.value[0] : '';
  getAvailableSlots();
};

// passa a al prossimo mese
const nextMonth = () => {
  if (nextCursor.value) {
    fromDatetime.value = nextCursor.value;
    toDatetime.value = addMonthsToIso(fromDatetime.value, 1);
    selectedDate.value = ''; // reset della data selezionata
    getAvailableSlots();
  }
};

// passa al mese precedente
const prevMonth = () => {
  if (prevCursor.value) {
    fromDatetime.value = prevCursor.value;
    toDatetime.value = addMonthsToIso(fromDatetime.value, 1);
    selectedDate.value = '';
    getAvailableSlots();
  }
};

// torna alla selezione dell'esame o alla gestione dell'appuntamento
const goBack = () => {
  router.back();
};

// apri un modale per inserire i dati paziente e confermare la prenotazione
const openAppointmentModal = async (slot) => {
  selectedSlot.value = slot;
  // se c'è un appuntamento da sostituire apri il modale di sostituzione
  if (viewDataStore.data.appointmentToReplace) {
    await getAppointmentPatientData();
    isModalReplaceOpen.value = true;
  } else {
    // altrimenti carica il paziente di default dell'account e apri il modale per la conferma  prenotazione
    await getDefaultPatientData();
    isModalConfirmOpen.value = true;
  }
};

// chiudi i modali
const closeModals = () => {
  isModalConfirmOpen.value = false;
  isModalReplaceOpen.value = false;
  selectedSlot.value = null;
};

// recupera le informazioni del paziente di default
const getDefaultPatientData = async () => {
  alertStore.clearAlerts();
  try {
    const response = await api.get('/account/patient');
    if (response && response.data) {
      patientData.value = response.data;
    } else {
      patientData.value = {};
    }
  } catch (error) {
    console.error(': Unable to get default patient data ', error);
    alertStore.setError('Errore durante il caricamento dei dati del paziente');
  }
};

const getAppointmentPatientData = async () => {
  try {
    const response = await api.get(`/appointments/${viewDataStore.data.appointmentToReplace.appointment_id}/patient`);
    if (response && response.data) {
      patientData.value = response.data;
    } else {
      patientData.value = {};
    }
  } catch (error) {
    alertStore.setError('Errore durante il recupero dei dati del paziente');
    console.error(': Unable to get appointment patient data ', error);
  }
};

const replaceAppointment = async () => {
  try {
    // crea il payload per la sostituzione dell'appuntamento e aggiorna i dati paziente e info

    let payload = {
      patient: patientData.value,
      appointment: selectedSlot.value,
    };

    await api.put(`/appointments/${appointmentToReplace.value.appointment_id}/replace`, payload);
    alertStore.setSuccess('Appuntamento modificato. Verrai reindirizzato alla gestione appuntamenti');
    viewDataStore.data.appointmentToReplace = null;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    closeModals();
    router.push({ name: 'appointments' });
  } catch (error) {
    console.error("Errore durante la sostituzione dell'appuntamento:", error);
    alertStore.setError("Si è verificato un errore durante la sostituzione dell'appuntamento");
  }
};

// crea una nuova prenotazione
const saveAppointment = async (emitModal) => {
  try {
    let payload = {
      patient: emitModal.patient,
      appointment: selectedSlot.value,
    };

    payload.appointment.info = emitModal.appointment_info;

    await api.post('/appointment', payload);
    alertStore.setSuccess('Prenotazione completata. Verrai renidirizzato alla gestione appuntamenti');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    closeModals();
    router.push({ name: 'appointments' });
  } catch (error) {
    console.error('Errore nella prenotazione:', error);
    alertStore.setError('Si è verificato un errore durante la prenotazione');
  }
};

onMounted(() => {
  // se non è stato selezionato un esame e non c'è un appuntamento da sostituire torna alla selezione dell'esame
  if (!viewDataStore.data.selectedService && !viewDataStore.data.appointmentToReplace) {
    router.push({ name: 'service-selection' });
    // se non è stato selezionato un esame ma c'è un appuntamento da sostituire torna alla gestione appuntamenti
  } else if (!viewDataStore.data.selectedService && viewDataStore.data.appointmentToReplace) {
    router.push({ name: 'appointments' });
  }
  // se c'è un appuntamento da sostituire caricalo dallo store in una variabile reattiva
  if (viewDataStore.data.appointmentToReplace) {
    appointmentToReplace.value = viewDataStore.data.appointmentToReplace;
  }

  initializeDateRange();
  getAvailableSlots();
});
</script>

<style></style>
