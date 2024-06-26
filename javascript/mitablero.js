import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.loader-background').classList.add('visible');
    const firebaseConfig = {
        apiKey: "AIzaSyApGQm8o2efr0t8MBKczFF7yi7-lexS-xY",
        authDomain: "alumassistprueba.firebaseapp.com",
        projectId: "alumassistprueba",
        storageBucket: "alumassistprueba.appspot.com",
        messagingSenderId: "290788592374",
        appId: "1:290788592374:web:85967780d4373795ea3ad7",
        measurementId: "G-89RQQTTHMK"
      };
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de autenticación de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Verificar el estado de autenticación del usuario en cada página protegida
onAuthStateChanged(auth, async (user) => {

    const tablero = document.querySelector('.tablero');
    if (!user) {
        // Si el usuario no está autenticado, redirigirlo a la página de inicio de sesión o al index.html
        window.location.replace("index");
    } else {
        // Si el usuario está autenticado, mostrar el contenido de la página
        tablero.style.display = "block";

        // Obtener el documento del usuario desde Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);


        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Mostrar el nombre, apellidos y correo electrónico del usuario en la página
            const nombreCompleto = `${userData.nombre} ${userData.apellidos}`;
            document.querySelector('.text_holadenuevo').textContent = `Hola de nuevo ${userData.nombre}`;
            document.querySelector('.text_usuario').textContent = nombreCompleto;
            document.querySelector('.email_usuario').textContent = user.email;

            // Obtener la imagen de perfil del usuario
            const profilePicRef = ref(storage, `/profilePictures/${user.uid}`);
            getDownloadURL(profilePicRef)
                .then((url) => {
                    document.querySelector('.img_perfil').src = url;
                })
                .catch((error) => {
                    console.error("Error al obtener la imagen de perfil: ", error);
                });
        } else {
            console.log("No se encontró el documento del usuario en Firestore");
        }
        // Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    }
    // Agregar evento click al botón para redirigir al usuario a la página crear-grupo.html
    document.querySelector('.btn_crear_grupo').addEventListener('click', function() {
        window.location.href = 'crear-grupo';
    });

    // Agregar evento click al botón para redirigir al usuario a la página crear-grupo.html
    document.querySelector('.btn_tomar_asistencia').addEventListener('click', function() {
        window.location.href = 'TomarAsistencias';
    });
    document.querySelector('.btn_editar_lista').addEventListener('click', function() {
        window.location.href = 'EditarLista';
    });
    document.querySelector('.btn_despedir_grupo').addEventListener('click', function() {
        window.location.href = 'DespedirGrupo';
    });

});
});