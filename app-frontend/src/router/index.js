import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/LoginView.vue';
import Home from '../views/HomeView.vue';
import ServiceSelection from '../views/ServiceSelectionView.vue';
import SlotSelection from '../views/SlotSelectionView.vue';
import Appointments from '../views/AppointmentsView.vue';
import Register from '../views/RegisterView.vue';
import { useAuthStore } from '../stores/auth';
import MainLayout from '../components/MainLayout.vue';
import Account from '../views/AccountView.vue';
import ValidateAccount from '../views/ValidateAccountView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: '/login', name: 'login', component: Login},
      { path: '/register', name: 'register', component: Register },
      { path: '/validate-account', name: 'validate-account', component: ValidateAccount },
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

// guardia per il router che verifica se l'utente è autenticato

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // se non c'è un utente in memoria, prova a fare una chiamata al backend per verificarlo
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      await authStore.checkAuth();
  }
  // se la rotta richiede l'autenticazione e l'utente non è autenticato, reindirizza al login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' });
  }
  // altrimenti, prosegui con la navigazione (interceptor interviene per token scaduto)
  next();
});

export default router;
