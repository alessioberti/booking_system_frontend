import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../components/MainLayout.vue';
import LoginView from '../views/LoginView.vue';
import Home from '../views/HomeView.vue';
import ExamSelection from '../views/ExamSelectionView.vue';
import AvailableSlots from '../views/AvailableSlotsView.vue';
import Appointments from '../views/AppointmentsView.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: '/login', name: 'login', component: LoginView },
      //{ path: '/register', name: 'register', component: RegisterView },
      { path: '/appointments', name: 'appointments', component: Appointments, meta: { requiresAuth: true } },
      { path: '/exam-selection', name: 'exam-selection', component: ExamSelection, meta: { requiresAuth: true } },
      { path: '/available-slots', name: 'available-slots', component: AvailableSlots, meta: { requiresAuth: true } },
      
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// guardia per il router: se /mylogin non restituisce l'utente, vai alla pagina di login
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth) {
    if (!authStore.user) {
      try {
        await authStore.checkAuth();
      } catch (err) {
        return next({ name: 'login' });
      }
      if (!authStore.user) {
        return next({ name: 'login' });
      }
    }
    next();
  } else {
    next();
  }
});

export default router;
