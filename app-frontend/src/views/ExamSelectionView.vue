<template>
  <div class="box-container">
    <div class="flex items-center mb-4">
      <button class="button-back mr-6" @click="goToHome">Indietro</button>
      <h2 class="title-page">Seleziona un esame</h2>
    </div>

    <!-- Lista degli esami -->
    <ul role="list" class="divide-y divide-gray-200">
      <li
        v-for="exam in examTypes"
        :key="exam.exam_type_id"
        @click="selectExam(exam)"
        class="slot-item cursor-pointer hover:bg-gray-100"
      >
        <div>
          <p class="text-md font-semibold text-gray-900">{{ exam.name }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ exam.description }}</p>
        </div>
        <div class="text-md text-gray-700">Clicca per selezionare</div>
      </li>
    </ul>

    <!-- Paginazione -->
    <div class="flex justify-between items-center mt-6">
      <button @click="prevPage" :disabled="currentPage === 1" class="button">
        <div class="flex">
          << <span class="hidden-mobile ml-2">Precedente</span>
        </div>
      </button>
      <div class="text-sm text-gray-700">
        Pagina {{ currentPage }} di {{ totalPages }}
      </div>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="button"
      >
        <div class="flex">
          <span class="hidden-mobile mr-2">Successivo</span> >>
        </div>
      </button>
    </div>

    <!-- Messaggi di stato -->
    <p v-if="errorMessage" class="text-red-600 text-sm mt-4">
      {{ errorMessage }}
    </p>
    <p v-if="loading" class="text-gray-600 text-sm mt-4">
      Caricamento in corso...
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { useViewDataStore } from "../stores/viewData";

// Definizione delle variabili reattive
const router = useRouter();
const viewDataStore = useViewDataStore();
const examTypes = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(10);
const loading = ref(false);
const errorMessage = ref(null);

// Recuperare gli esami dal backend
const fetchExamTypes = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await api.get("/exam", {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
      },
    });
    currentPage.value = response.data.page;
    totalPages.value = response.data.pages;
    examTypes.value = response.data.data;
  } catch (err) {
    console.error("Errore caricamento exam_types", err);
    errorMessage.value = "Errore durante il caricamento degli esami";
  } finally {
    loading.value = false;
  }
};

// Funzioni per la paginazione
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchExamTypes();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchExamTypes();
  }
};

// Salva l'esame selezionato nello store e passa alla selezione degli slot
const selectExam = (exam) => {
  viewDataStore.setData("selectedExam", exam);
  router.push({ name: "available-slots" });
};

// torna alla home
const goToHome = () => {
  router.push({ name: "home" });
};

// Carica gli esami al montaggio della view
fetchExamTypes();
</script>

<style scoped></style>
