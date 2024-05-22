import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
document.querySelector('.loader-background').classList.add('visible');
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        if (userDoc.exists() && adminDoc.exists()) {
            const userKey = userDoc.data().claveMaestro;
            const adminKey = adminDoc.data().claveAdmin;
            if (userKey === adminKey && window.location.pathname !== '/Tablero') {
                window.location.href = 'Tablero';
            } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                window.location.href = 'mitablero';
            }
        }

        // Obtener los datos del usuario
        const nombre = userDoc.data().nombre;
        const apellidos = userDoc.data().apellidos;
        const correo = user.email;

        // Concatenar el nombre y los apellidos
        const nombreCompleto = `${nombre} ${apellidos}`;

        // Colocar los datos en las etiquetas HTML
        document.querySelector('.text_usuario').textContent = nombreCompleto;
        document.querySelector('.email_usuario').textContent = correo;
        document.querySelector('.text_holadenuevo').textContent = `Hola de nuevo ${nombre}`;

        // Obtener la imagen de perfil del usuario
        const profilePicRef = ref(storage, `/profilePictures/${user.uid}`);
        getDownloadURL(profilePicRef)
            .then((url) => {
                document.querySelector('.img_perfil').src = url;
            })
            .catch((error) => {
                console.error("Error al obtener la imagen de perfil: ", error);
            });
    } else if (window.location.pathname !== '/index') {
        window.location.href = 'index';
    }
    // Ocultar el loader una vez que los datos se hayan cargado
    document.querySelector('.loader-background').classList.remove('visible');
});

document.querySelector('.btn_ver_estadisticas').addEventListener('click', function() {
    window.location.href = 'VerEstadisticas';
});

document.querySelector('.btn_nuevo_maestro').addEventListener('click', function() {
    window.location.href = 'NuevoMaestro';
});
document.querySelector('.btn_eliminar_grupo').addEventListener('click', function() {
    window.location.href = 'EliminarGrupo';
});
document.querySelector('.btn_eliminar_maestro').addEventListener('click', function() {
    window.location.href = 'AdministrarCiclosEscolares';
});
