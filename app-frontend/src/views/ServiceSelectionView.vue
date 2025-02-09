<template>
  <div class="box-container">
    <div class="flex items-center mb-4">
      <button class="button-back mr-6" @click="goToHome">Indietro</button>
      <h2 class="title-page">Seleziona un esame</h2>
    </div>

    <!-- Lista degli esami -->
    <ul role="list" class="divide-y divide-gray-200">
      <li
        v-for="service in serviceTypes"
        :key="service.service_id"
        @click="selectService(service)"
        class="slot-item cursor-pointer hover:bg-gray-100"
      >
        <div>
          <p class="text-md font-semibold text-gray-900">{{ service.name }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ service.description }}</p>
        </div>
        <div class="text-md text-gray-700">Clicca per selezionare</div>
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

    <!-- Messaggi di stato -->
    <p v-if="errorMessage" class="text-red-600 text-sm mt-4">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useViewDataStore } from '../stores/viewData';

// Definizione delle variabili reattive
const router = useRouter();
const viewDataStore = useViewDataStore();
const serviceTypes = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(10);
const errorMessage = ref(null);

// Recuperare gli esami dal backend
const getServices = async () => {
  errorMessage.value = null;
  try {
    const response = await api.get('/services', {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
      },
    });
    currentPage.value = response.data.page;
    totalPages.value = response.data.pages;
    serviceTypes.value = response.data.data;
  } catch (err) {
    console.error('Unable to get services', err);
    errorMessage.value = 'Errore durante il caricamento degli esami';
  }
};

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

// Carica gli esami al montaggio della view
getServices();
</script>

<style scoped></style>
