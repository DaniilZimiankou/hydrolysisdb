import axios from 'axios';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

//Logout si token s'expira
axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );

// const app = createApp(App);
// app.use(router);
// app.use(BootstrapVue);
// app.use(IconsPlugin);
// app.mount('#app');
createApp(App).use(router).mount('#app')
