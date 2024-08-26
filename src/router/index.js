import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/components/LoginView.vue';
import RegisterView from '@/components/RegisterView.vue';
import MainApp from '@/components/MainApp.vue';
import ExperimentsView from '@/components/ExperimentsView.vue'; // Import the new page
import CrearExperiment from '@/components/CrearExperiment.vue';
import LineChart from '@/components/LineChart.vue';

const routes = [
  {
    path: '/',
    name: 'ExperimentsView',
    component: ExperimentsView
  },
  {
    path: '/chart',
    name: 'LineChart',
    component: LineChart
  },
  {
    path: '/login',
    name: 'LoginView',
    component: LoginView
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: RegisterView
  },
  {
    path: '/main',
    name: 'MainApp',
    component: MainApp,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-experiment',
    name: 'CrearExperiment',
    component: CrearExperiment,
    meta: { requiresAuth: true }
  },
  // Redirect any unmatched paths to the experiments page
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;