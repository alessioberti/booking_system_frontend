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
    <div v-if="bookings.length === 0" class="text-center">
      <p class="text-gray-500">Non hai ancora prenotazioni.</p>
      <button @click="goBack" class="button-back">Indietro</button>
    </div>

    <!-- altrimenti stampa la lista delle prenotazioni -->
    <div v-else>
      <ul class="space-y-4">
        <li
          v-for="booking in bookings"
          :key="booking.appointment_id"
          class="px-4 py-8 my-4 border-b-4 border-gray-400"
        >
          <div class="mb-4 lg:grid lg:grid-cols-2">
            <div class="modal-info">
              <strong>Esame:&nbsp;</strong>
              {{ booking.exam_type_name || "N/D" }} ({{
                booking.operator_name || "N/D"
              }})
            </div>
            <div class="modal-info">
              <strong>Paziente:&nbsp;</strong>
              {{ booking.patient_name || "N/D" }}
            </div>
            <div class="modal-info">
              <strong>Data:&nbsp;</strong>
              {{ formatDate(booking.appointment_date) }}
            </div>
            <div class="modal-info">
              <strong>Orario:&nbsp;</strong>
              {{ formatTime(booking.appointment_time_start) }} →
              {{ formatTime(booking.appointment_time_end) }}
            </div>
            <div class="modal-info">
              <strong>Presso:&nbsp;</strong>
              {{ booking.laboratory_name || "N/D" }}
            </div>
            <div class="modal-info">
              <strong>Indirizzo:&nbsp;</strong>
              {{ booking.laboratory_address || "N/D" }}
            </div>
            <div class="modal-info">
              <strong>Tel:&nbsp;</strong>
              <a
                class="hover:underline hover:text-blue-600"
                href="tel:+393241234567"
                >3241234567</a
              >
            </div>
            <div class="modal-info">
              <strong>Stato:&nbsp;</strong>
              <div v-if="booking.rejected" class="flex items-center ml-2">
                <div class="text-error mr-1 font-black">X</div>
                Cancellata
              </div>
              <div v-else class="flex items-center ml-2">
                <div class="text-success mr-1 font-black"></div>
                Attiva
              </div>
            </div>
          </div>
          <div class="mt-4 text-right">
            <!-- se l'appuntamento è attivo attiva anche il pulsante per cancellarlo -->
            <button
              v-if="!booking.rejected"
              @click="openCancelModal(booking)"
              class="button-delete"
            >
              Cancella
            </button>
          </div>
        </li>
      </ul>

      <!-- Paginazione -->
      <div class="flex justify-between items-center mt-6">
        <button @click="prevPage" :disabled="currentPage === 1" class="button">
          << Precedente
        </button>
        <div class="text-sm text-gray-700">
          Pagina {{ currentPage }} di {{ totalPages }}
        </div>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="button"
        >
          Successivo >>
        </button>
      </div>

      <div class="flex justify-center mt-6">
        <button @click="goBack" class="button-back">Indietro</button>
      </div>
    </div>

    <!-- Modal di conferma cancellazione -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Conferma Cancellazione</h3>
        <p class="text-gray-700 text-sm mb-4">
          Vuoi davvero annullare la prenotazione del
          <strong>{{ formatDate(bookingToCancel?.appointment_date) }}</strong>
          dalle
          <strong>{{
            formatTime(bookingToCancel?.appointment_time_start)
          }}</strong>
          alle
          <strong>{{
            formatTime(bookingToCancel?.appointment_time_end)
          }}</strong>
          di <strong>{{ bookingToCancel?.patient_name }}</strong
          >?
        </p>
        <div class="flex justify-end gap-4">
          <button @click="cancelBookingConfirmed" class="button-success">
            Sì, Annulla
          </button>
          <button @click="closeCancelModal" class="button-back">
            No, Indietro
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

//definisci variabili reattive

const router = useRouter();
const bookings = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const errorMessage = ref("");
const successMessage = ref("");
const showCancelModal = ref(false);
const bookingToCancel = ref(null);

// richiede le prenotazioni
const fetchBookings = async () => {
  try {
    errorMessage.value = "";
    successMessage.value = "";
    const resp = await api.get("/appointment", {
      withCredentials: true,
      params: { page: currentPage.value, per_page: 10 },
    });
    currentPage.value = resp.data.current_page;
    totalPages.value = resp.data.pages;
    bookings.value = resp.data.data;
  } catch (err) {
    console.error("Errore fetchBookings:", err);
    errorMessage.value =
      err.response?.data?.error ||
      "Errore durante il recupero delle prenotazioni.";
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchBookings();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchBookings();
  }
};

const openCancelModal = (booking) => {
  errorMessage.value = "";
  successMessage.value = "";
  bookingToCancel.value = booking;
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  bookingToCancel.value = null;
};

const cancelBookingConfirmed = async () => {
  if (!bookingToCancel.value) return;
  try {
    errorMessage.value = "";
    successMessage.value = "";
    // Chiamata PUT per annullare (reject) la prenotazione
    await api.put(
      `/appointment/${bookingToCancel.value.appointment_id}/reject`,
      {},
      { withCredentials: true }
    );
    showCancelModal.value = false;
    // Aggiorna lo stato della prenotazione a "rejected"
    bookingToCancel.value.rejected = true;
    successMessage.value = "Prenotazione annullata con successo.";
  } catch (err) {
    console.error("Errore annullamento prenotazione:", err);
    errorMessage.value =
      err.response?.data?.error || "Errore durante la cancellazione.";
  } finally {
    bookingToCancel.value = null;
  }
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(timeStr) {
  const time = new Date(`1970-01-01T${timeStr}`);
  return time.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(fetchBookings);

const goBack = () => {
  router.back();
};
</script>

<style></style>
