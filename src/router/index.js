import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/components/LoginView.vue';
import RegisterView from '@/components/RegisterView.vue';
import MainApp from '@/components/MainApp.vue';
import ExperimentsView from '@/components/ExperimentsView.vue'; // Import the new page
import CrearExperiment from '@/components/CrearExperiment.vue';
import LineChart from '@/components/LineChart.vue';
import AdminComponent from '@/components/AdminComponent.vue';
import axios from 'axios';

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
  {
    path: '/admin',
    name: 'AdminComponent',
    component: AdminComponent,
    beforeEnter: async (to, from, next) => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost/apiHydrolysisdb/check-role', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // resposta del servidor
          const data = response.data;
          
          if (data.role === 'administrador') {
            next(); // Allow navigation to the target route
          } else {
            next('/main'); // Redirecció a la pagina main si no ets admin
          }
        } catch (error) {
          console.error('Error checking role:', error);
          next('/main'); // Redirecció a la pagina main si hi ha algun error
        }
      } else {
        next('/login'); // Redirecció a la pagina login si no hi ha token
      }
    }
  },

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