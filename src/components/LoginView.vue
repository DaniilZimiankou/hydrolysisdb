<template>
  <div id="papa">
    <div id="ImatgeLogoL" @click="goToPrincipal"><img id="ImatgeLogoK" src="@/assets/HydrolysisDBNL.jpg"/></div>
    <form @submit.prevent="login" class="form">
        <input class="LoginContrasenya" type="email" id="username" placeholder="Email d'usuari" v-model="username" required />

        <input class="LoginContrasenya" type="password" id="password" placeholder="Contrasenya" v-model="password" required />

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <button class="button" type="submit">Iniciar Sessió</button>
    </form>
    <div class="signup">
        <span class="signup">No tens un compte?
          <button class="buttonRegistre" @click="goToRegister">Registra't</button>
        </span>
    </div>
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
      passwd: password.value // La verificació es fa al backend
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

const goToPrincipal = () => {
  router.push('/');
};
</script>

<style>
  #ImatgeLogoL{
          margin-top: 6%;
          margin-bottom: 30px;
          width: 30%;
          height: 25%;
          /* position: absolute; */
          object-fit: cover;
          cursor: pointer;
        }
        #ImatgeLogoL:hover{
          border: 1px solid #ddd;
          cursor: pointer;
        }
  .form{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .form header{
  font-size: 2rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1.5rem;
}
 .form input{
   height: 60px;
   width: 100%;
   padding: 0 15px;
   font-size: 17px;
   margin-bottom: 1.3rem;
   border: 1px solid #ddd;
   border-radius: 6px;
   outline: none;
 }
 .form input:focus{
   box-shadow: 0 1px 0 rgba(0,0,0,0.2);
 }
.form a{
  font-size: 16px;
  color: #009579;
  text-decoration: none;
}
.form a:hover{
  text-decoration: underline;
}
.button{
  color: #fff;
  background: #0943c9;
  font-size: 1.2rem;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: 0.4s;
  margin-bottom: 15px;
  border-radius: 7px;
}
.button:hover{
  background: #1d2891;
}
        #ImatgeLogoK{
          
          border-radius: 10px;
          width: 100%;
          height: 100%;
        }
        #papa{
          width: 100%;
          height: 100%;
          background-color: #EAF9FF;
          display: flex;
          align-items: center;
          flex-direction: column;
        }
        .LoginContrasenya{
          width: 30%;
          height: 10%;
          border-radius: 10px;
          background-color: white;
          margin-top: 5%;
        }
        #formLogin{
          height: 100%;
          width: 100%;
        }
        .buttonRegistre {
          border-radius: 5px;
  background-color: #007bff;
  color: #fff;
}

.buttonRegistre:hover {
  background-color: #0056b3;
}
</style>