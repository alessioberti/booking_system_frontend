<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <!-- gestisci come pagina per mobile e come modale all'80% per gli schemi medi e in su-->

    <div class="bg-white p-6 md:rounded-lg shadow-lg w-[100%] md:w-[50%] max-h-screen overflow-y-auto">
      <h2 class="title-page mb-4">Modifica apputamento per: {{ props.oldAppointment.service_name }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Colonna Appuntamento Attuale -->
        <div>
          <div class="modal-info mb-2 text-red-700 text-lg">
            <strong>Appuntamento Attuale</strong>
          </div>
          <div class="modal-info"><strong>Operatore:&nbsp;</strong> {{ props.oldAppointment.operator_name }}</div>
          <div class="modal-info"><strong>Presso:&nbsp;</strong> {{ props.oldAppointment.location_name }}</div>
          <div class="modal-info"><strong>Indirizzo:&nbsp;</strong> {{ props.oldAppointment.location_address }}</div>
          <div class="modal-info"><strong>Data:&nbsp;</strong> {{ formattedDate }}</div>
          <div class="modal-info">
            <strong>Orario:&nbsp;</strong>
            {{ props.oldAppointment.appointment_time_start }} - {{ props.oldAppointment.appointment_time_end }}
          </div>
          <div class="modal-info">
            <strong>Tel:&nbsp;</strong>
            <a class="hover:underline hover:text-primary" :href="'tel:' + props.oldAppointment.location_tel_number">
              {{ props.oldAppointment.location_tel_number }}
            </a>
          </div>
        </div>

        <!-- Colonna Nuovo Appuntamento -->
        <div>
          <div class="modal-info mb-2 text-green-700 text-lg">
            <strong>Nuovo Appuntamento</strong>
          </div>
          <div class="modal-info"><strong>Operatore:&nbsp;</strong> {{ props.newAppointment.operator_name }}</div>
          <div class="modal-info"><strong>Presso:&nbsp;</strong> {{ props.newAppointment.location_name }}</div>
          <div class="modal-info"><strong>Indirizzo:&nbsp;</strong> {{ props.newAppointment.location_address }}</div>
          <div class="modal-info"><strong>Data:&nbsp;</strong> {{ formattedNewDate }}</div>
          <div class="modal-info">
            <strong>Orario:&nbsp;</strong>
            {{ props.newAppointment.appointment_time_start }} - {{ props.newAppointment.appointment_time_end }}
          </div>
          <div class="modal-info">
            <strong>Tel:&nbsp;</strong>
            <a class="hover:underline hover:text-primary" :href="'tel:' + props.newAppointment.location_tel_number">
              {{ props.newAppointment.location_tel_number }}
            </a>
          </div>
        </div>
      </div>
      <button @click="returnBack()" class="button-back">Indietro</button>
      <button @click="confirmBooking()" class="button ml-4">Procedi con la modifica</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();

const props = defineProps({
  newAppointment: {
    type: Object,
    required: true,
  },
  oldAppointment: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'confirm']);

// formatta la data in formato italiano
const formattedNewDate = computed(() => {
  const date = new Date(props.oldAppointment.appointment_date);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

const formattedDate = computed(() => {
  const date = new Date(props.oldAppointment.appointment_date);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Chiude il modale
const returnBack = () => {
  emit('close');
};

// conferma la prenotazione con i dati del paziente e della prenotazione necessari per il backend
const confirmBooking = () => {
  let appointment;

  // crea un oggetto payload con i dati del paziente e della prenotazione
  const confirmedAppointment = { appointment };

  // ritorna alla view precedente con i dati della prenotazione confermati
  emit('confirm', confirmedAppointment);
};
</script>

<style></style>
