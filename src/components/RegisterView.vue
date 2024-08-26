<template>
  <div class="register">
    <h2>Registra't</h2>
    <form @submit.prevent="register">
      <div>
        <label for="name">Nom:</label>
        <input id="name" v-model="nom" type="text" required />
      </div>
      <div>
        <label for="surname">Cognom:</label>
        <input id="surname" v-model="cognoms" type="text" required />
      </div>
      <div>
        <label for="email">Correu electrònic:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Contrasenya:</label>
        <input id="password" v-model="passwd" type="password" required />
      </div>
      <div>
        <label for="repeatPassword">Repiteix la contrasenya:</label>
        <input id="repeatPassword" v-model="repeatPassword" type="password" required />
      </div>
      <div>
        <button type="submit">Registra't</button>
        <button @click="goToLogin">Torna a Login</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Definim les referencies pels camps del formulari
const nom = ref('');
const cognoms = ref('');
const email = ref('');
const passwd = ref('');
const repeatPassword = ref('');
const errorMessage = ref('');

//router per navegar entre les pagines
const router = useRouter();

//Funció per register
const register = async () => {
  //Comprovem si les contrasenyes coincideixen
  if (passwd.value !== repeatPassword.value) {
    errorMessage.value = "Les contrasenyes no coincideixen";
    return;
  }

  try {
    //Enviem la sol-licitud de registre al servidor
    const response = await axios.post('http://localhost/apiHydrolysisdb/Register', {
      nom: nom.value,
      cognoms: cognoms.value,
      email: email.value,
      passwd: passwd.value
    });

    //Comprovem la resposta del servidor
    if (response.data.message === "Usuari registrat amb èxit") {
      // Redirigim l'usuari al login
      router.push('/login');
    } else {
      errorMessage.value = response.data.message || 'Error en el registre';
    }
  } catch (error) {
    //Gestionem qualsevol error que pot sorgir
    errorMessage.value = error.response?.data?.message || error.message;
  }
};

//Funció per redirigir al login
const goToLogin = () => {
  router.push('/login');
};
</script>

<style>
.register {
}
.error {
  color: red;
}
</style>