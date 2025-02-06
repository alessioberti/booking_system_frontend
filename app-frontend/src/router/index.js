import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../components/MainLayout.vue';
import LoginView from '../views/LoginView.vue';
//import RegisterView from '../views/RegisterView.vue';
//import ResetPassword from '../views/ResetPassword.vue';
import Home from '../views/HomeView.vue';
//import ExamSelection from '../views/ExamSelection.vue';
//import BookView from '../views/BookView.vue';
//import ManageView from '../views/ManageView.vue';
//import AccountView from '../views/AccountView.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: '/login', name: 'login', component: LoginView },
      //{ path: '/register', name: 'register', component: RegisterView },
      //{ path: '/reset-password', name: 'reset-password', component: ResetPassword },
      // Rotte protette, ad esempio:
      //{ path: '/account', name: 'account', component: AccountView, meta: { requiresAuth: true } },
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
