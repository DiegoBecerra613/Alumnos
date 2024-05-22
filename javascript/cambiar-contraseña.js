import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
    const auth = getAuth(); // Obtener la instancia de autenticación

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // El usuario está autenticado, se queda en la página actual
            console.log('Usuario autenticado:', user);
        } else {
            // El usuario no está autenticado, redirigir al índice
            window.location.href = 'index';
        }
    });

    const btnAceptar = document.querySelector('.btn-aceptar');
    const btncancelar = document.querySelector('.btn-cancelar');

    btncancelar.addEventListener('click', () => {
        window.location.href = 'MiPerfil';
    });

    btnAceptar.addEventListener('click', async () => {
        const contraseña = document.querySelector('input[name="contraseña"]').value;
        const credential = EmailAuthProvider.credential(auth.currentUser.email, contraseña);
        try {
            await reauthenticateWithCredential(auth.currentUser, credential);
            // La contraseña es correcta, mostrar el siguiente paso
            document.querySelector('.div-cambiar-contraseña').innerHTML = `
                <div class="rectangulo-contenedor1">
                    <p class="text-info2">Ingresa tu nueva contraseña</p>
                    <p class="text-info3">
                        Ahora ingresa tu nueva contraseña
                        <br/>
                        y presiona el boton de aceptar para
                        <br/>
                        cambiar tu contraseña
                    </p>
                    <input type="password" name="nuevacontraseña" placeholder="Contraseña" required>
                    <input type="password" name="confirmarContraseña" placeholder="Confirma tu contraseña" required>
                    <div class="btn-cambiar-contraseña">Aceptar</div>
                    <div class="btn-cancelar1">Cancelar</div>
                </div>
            `;
            const btncancelar1 = document.querySelector('.btn-cancelar1');
            btncancelar1.addEventListener('click', () => {
                window.location.href = 'MiPerfil';
            });
        } catch (error) {
            console.error('La contraseña ingresada no es correcta', error);
        }

        const btnCambiarContrasena = document.querySelector('.btn-cambiar-contraseña');
        btnCambiarContrasena.addEventListener('click', async () => {
            const nuevaContrasena = document.querySelector('input[name="nuevacontraseña"]').value;
            const confirmarContrasena = document.querySelector('input[name="confirmarContraseña"]').value;
            if (nuevaContrasena === confirmarContrasena) {
                try {
                    await updatePassword(auth.currentUser, nuevaContrasena);
                    // La contraseña ha sido cambiada, mostrar el mensaje de éxito
                    document.querySelector('.div-cambiar-contraseña').innerHTML = `
                <div class="rectangulo-contenedor2">
                    <p class="text-info4">¡Enhorabuena!</p>
                    <p class="text-info5">
                        Tu contraseña ha sigo cambiada,
                        <br/>
                        ya puedes iniciar sesion con tu
                        <br/>
                        nueva contraseña
                    </p>
                    <img class="imagen_like" src="./assets/thumb-up-front-color.png"/>
                    <button class="btn-aceptar1">Aceptar</button>
                </div>
            `;
                    const btnAceptar1 = document.querySelector('.btn-aceptar1');
                    btnAceptar1.addEventListener('click', () => {
                        window.location.href = 'MiPerfil';
                    });
                } catch (error) {
                    console.error('Error al cambiar la contraseña', error);
                }
            } else {
                console.error('Las contraseñas no coinciden');
            }
        });
    });



});
