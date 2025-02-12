<template>
  <div class="box-container">
    <div class="justify-center w-full flex">
      <h2 class="title-page mb-10">Portale Prenotazioni</h2>
    </div>

    <div
      class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0"
    >
      <div
        @click="goToServiceSelection"
        class="cursor-pointer hover:bg-gray-200 group relative rounded-tl-lg rounded-tr-lg bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:rounded-tr-none"
      >
        <div class="inline-flex">
          <div class="rounded-lg bg-teal-50 p-3 text-teal-700 ring-4 ring-white"></div>
          <div class="label-title ml-4">Prenota un nuovo Esame</div>
        </div>
        <div class="mt-4">
          <p class="mt-2 text-sm text-standard">
            Effettua una nuova prenotazione. In questa sezione potrai selezionare un
            <strong>esame o visita specialistica </strong>e prendere un <strong>appuntamento</strong> .
          </p>
        </div>
      </div>
      <div
        @click="goToAppointments"
        class="cursor-pointer hover:bg-gray-200 group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 sm:rounded-tr-lg"
      >
        <div class="inline-flex">
          <div class="rounded-lg bg-purple-50 p-3 text-purple-700 ring-4 ring-white"></div>
          <div class="label-title ml-4 mt-1">Gestisci le tue prenotazioni</div>
        </div>
        <div class="mt-4">
          <p class="mt-2 text-sm text-standard">
            Consulta la lista delle tue prenotazioni. In questa sezione potrai <strong>modificare</strong> una
            prenotazione esistente o richiederne l'<strong>annullamento.</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToServiceSelection = () => {
  router.push({ name: 'service-selection' });
};

const goToAppointments = () => {
  router.push({ name: 'appointments' });
};
</script>

<style></style>
