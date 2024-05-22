import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth, reauthenticateWithCredential, EmailAuthProvider, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // El usuario está autenticado, se queda en la página actual
            console.log('Usuario autenticado:', user);
        } else {
            // El usuario no está autenticado, redirigir al índice
            window.location.href = 'index.html';
        }
    });

    const btnAceptar = document.querySelector('.btn-aceptar');
    const inputPassword = document.querySelector('input[name="contraseña"]');

    btnAceptar.addEventListener('click', async () => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, inputPassword.value);

        try {
            await reauthenticateWithCredential(user, credential);
            document.querySelector('.div-cambiar-contraseña').innerHTML = `
                <div class="rectangulo-contenedor1">
                    <p class="text-info2">Ingresa tu nuevo correo electronico</p>
                    <p class="text-info3">
                        Ahora ingresa tu nuevo e-mail y presiona el boton de aceptar para cambiar tu e-mail
                    </p>
                    <input type="email" name="email" placeholder="Nuevo Correo Electronico" required>
                    <input type="email" name="confirmarEmail" placeholder="Confirma tu Correo Electronico" required>
                    <div class="btn-cambiar-email">Aceptar</div>
                    <div class="btn-cancelar1">Cancelar</div>
                </div>
            `;

            const btnCambiarEmail = document.querySelector('.btn-cambiar-email');
            const inputEmail = document.querySelector('input[name="email"]');
            const inputConfirmarEmail = document.querySelector('input[name="confirmarEmail"]');

            btnCambiarEmail.addEventListener('click', async () => {
                const newEmail = inputEmail.value;
                const confirmEmail = inputConfirmarEmail.value;

                if (newEmail !== confirmEmail) {
                    console.error('Los correos electrónicos no coinciden');
                    return;
                }

                try {
                    // Establecer el nuevo correo electrónico en el usuario
                    await updateEmail(auth.currentUser, newEmail);
                    await sendEmailVerification(auth.currentUser);
                    alert('Se ha enviado un correo de verificación a tu nuevo correo electrónico. Por favor verifica tu correo electrónico antes de continuar.');
                } catch (error) {
                    console.error('Error al cambiar el correo electrónico:', error);
                }
            });
        } catch (error) {
            console.error('Error al reautenticar:', error);
        }
    });
});
