<template>
  <div class="login">
    <h1>Inicia Sessió</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Nom d'usuari</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Contrasenya</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <button type="submit">Iniciar Sessió</button>
    </form>
    <button @click="goToRegister">Registra't</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Definim les referencies pels camps del formulari
const username = ref('');
const password = ref('');
const errorMessage = ref('');

// Definim el router per navegar
const router = useRouter();

// Funció per login
const login = async () => {
  try {
    // Enviem la sol-licitud de login al endpoint
    const response = await axios.post('http://localhost/apiHydrolysisdb/Login', {
      UserEmail: username.value,
      passwd: password.value
    });

    // Comprovem la resposta del servidor
    if (response.data.jwt) {
      // Guardar el token en el localStorage
      localStorage.setItem('token', response.data.jwt);
      // Redirigim a l'usuari a la pagina principal
      router.push('/main');
    } else {
      errorMessage.value = response.data.message || 'Error en l\'inici de sessió';
    }
  } catch (error) {
    // Gestionem errors
    errorMessage.value = error.response?.data?.message || error.message;
  }
};

// Funció per navegar al registre
const goToRegister = () => {
  router.push('/register');
};
</script>

<style>
.login {

}
.error {
  color: red;
}
</style>