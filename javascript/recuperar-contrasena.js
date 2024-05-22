import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

document.addEventListener("DOMContentLoaded", async function () {
    const firebaseConfig = {
        apiKey: "AIzaSyApGQm8o2efr0t8MBKczFF7yi7-lexS-xY",
        authDomain: "alumassistprueba.firebaseapp.com",
        projectId: "alumassistprueba",
        storageBucket: "alumassistprueba.appspot.com",
        messagingSenderId: "290788592374",
        appId: "1:290788592374:web:85967780d4373795ea3ad7",
        measurementId: "G-89RQQTTHMK"
      };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(); // Obtener la instancia de autenticación
    const storage = getStorage(app); // Obtener la instancia de almacenamiento

    // Manejador de eventos para el botón "btn-aceptar"
    document.querySelector('.btn-aceptar').addEventListener('click', async () => {
        const email = document.querySelector('input[name="CorreoElectronico"]').value;
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Correo electrónico de restablecimiento de contraseña enviado');
            // Reemplazar el HTML existente con el nuevo HTML
            document.querySelector('.div-cambiar-contraseña').innerHTML = `
                      <div class="rectangulo-contenedor2">
        <p class="text-info4">¡Checa tu correo!</p>
        <p class="text-info5">
          Se envio un enlace al correo: ${email}, sigue las instrucciones para restrablecer tu contraseña
        </p>
        <img class="imagen_like" src="./assets/thumb-up-front-color.png"/>
        <button class="btn-aceptar2">Aceptar</button>
      </div>
            `;
        } catch (error) {
            console.error('Error al enviar el correo electrónico de restablecimiento de contraseña:', error);
        }
        // Agrega un manejador de eventos para el botón "btn-aceptar2"
        document.querySelector('.btn-aceptar2').addEventListener('click', () => {
            window.location.href = 'index';
        });
    });
    // Manejador de eventos para el botón "btn-cancelar"
    document.querySelector('.btn-cancelar').addEventListener('click', () => {
        window.location.href = 'index';
    });
});
