<template>
  <div class="app-container">
    <Navbar />
    <AlertMesagge />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './NavBar.vue';
import AlertMesagge from './AlertMessage.vue';
import Footer from './FooterComp.vue';
</script>

<style scoped></style>
