<template>
  <div class="box-container">
    <div class="flex items-center mb-4">
      <button class="button-back mr-6" @click="goToHome">Indietro</button>
      <h2 class="title-page">Seleziona un esame</h2>
    </div>
    <!-- barra di ricerca -->
    <div class="mb-4">
      <input
        type="text"
        v-model="searchService"
        placeholder="Cerca esame..."
        class="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>

    <!-- Stampa la lista degli esami  per -->
    <ul role="list" class="divide-y divide-gray-200">
      <li
        v-for="(service, index) in serviceTypes"
        :key="service.service_id"
        tabindex="0"
        @click="selectService(service)"
        @keydown.enter="selectService(service)"
        class="slot-item cursor-pointer hover:bg-gray-100"
      >
        <div>
          <p class="text-md font-semibold text-gray-900">{{ service.name }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ service.description }}</p>
        </div>
        <div v-if="service.has_enabled_availability" class="text-md text-primary hover:underline">Seleziona</div>
        <div v-else class="text-md text-gray-700">Non disponibile</div>
      </li>
    </ul>

    <!-- paginazione -->
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useViewDataStore } from '../stores/viewData';

// gestione degli alert in tramite pinia e composizione
import { useAlertStore } from '../stores/alert';
const alertStore = useAlertStore();

// consente di gestire un ritardo nell'esecuzione della ricerca degli esami
import debounce from 'lodash.debounce';

// Definizione delle variabili reattive
const router = useRouter();
const viewDataStore = useViewDataStore();
const serviceTypes = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(10);
const searchService = ref('');

// Recuperare gli esami dal backend
const getServices = async () => {
  alertStore.clearAlerts();
  try {
    const response = await api.get('/services', {
      params: {
        search: searchService.value,
        page: currentPage.value,
        per_page: perPage.value,
      },
    });
    currentPage.value = response.data.page;
    totalPages.value = response.data.pages;
    serviceTypes.value = response.data.data;
  } catch (err) {
    console.error('Unable to get services', err);
    alertStore.setError('Errore durante il caricamento degli esami');
  }
};
// Ricerca degli esami con un ritardo di 300ms
const debouncedGetServices = debounce(getServices, 300);
watch(searchService, () => {
  debouncedGetServices();
});

// Funzioni per la paginazione
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    getServices();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    getServices();
  }
};

// Salva l'esame selezionato nello store e passa alla selezione degli slot
const selectService = (service) => {
  viewDataStore.setData('selectedService', service);
  router.push({ name: 'slot-selection' });
};

// torna alla home
const goToHome = () => {
  router.push({ name: 'home' });
};

// Carica gli esami al montaggio della view e cacella dallo store un eventuale replace di un appuntamento
onMounted(() => {
  getServices();
  viewDataStore.clearData('appointmentToReplace');
});
</script>

<style></style>
