<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">Centro Medico Login</h2>
      </div>

      <form class="space-y-6" @submit.prevent="UserLogin">
        <div class="space-y-4">
          <div>
            <input id="email" type="text" class="input" v-model="email" required placeholder="Inserisci la tua email" />
          </div>
          <div>
            <input
              id="password"
              type="password"
              class="input"
              v-model="password"
              required
              placeholder="Inserisci la tua password"
            />
          </div>
        </div>

        <div>
          <button type="submit" class="button">Sign in</button>
        </div>
      </form>

      <div class="flex items-center justify-between">
        <router-link to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Registrati
        </router-link>
        <router-link to="/reset-password" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Recupera Password
        </router-link>
      </div>

      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const errorMessage = ref(null);

const authStore = useAuthStore();
const router = useRouter();

const UserLogin = async () => {
  errorMessage.value = null;
  try {
    await authStore.login(email.value, password.value);
    // Dopo il login reindirizza alla home
    router.push({ name: 'home' });
  } catch (err) {
    errorMessage.value = authStore.error || 'Errore di login';
  }
};
</script>

<style scoped></style>
