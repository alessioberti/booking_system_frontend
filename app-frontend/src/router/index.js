import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import Home from '../views/HomeView.vue';
import ServiceSelection from '../views/ServiceSelectionView.vue';
import SlotSelection from '../views/SlotSelectionView.vue';
import Appointments from '../views/AppointmentsView.vue';
import RegisterView from '../views/RegisterView.vue';
import { useAuthStore } from '../stores/auth';
import MainLayout from '../components/MainLayout.vue';
import Account from '../views/AccountView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: RegisterView },
      // rotte protette
      { path: '/appointments', name: 'appointments', component: Appointments, meta: { requiresAuth: true } },
      { path: '/service-selection', name: 'service-selection', component: ServiceSelection, meta: { requiresAuth: true } },
      { path: '/slot-selection', name: 'slot-selection', component: SlotSelection, meta: { requiresAuth: true } },
      { path: '/account', name: 'account', component: Account, meta: { requiresAuth: true } },
      
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// guardia per il router se l'utente prova ad accedere ad una rotta protetta

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.user === null) {
    await authStore.checkAuth(); // controlla se l'utente è ancora autenticato
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Utente non autenticato, reindirizzamento al login');
    return next({ name: 'login' });
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return next({ name: 'home' }); // evita che gli utenti autenticati accedano alla login
  }

  next();
});

export default router;
