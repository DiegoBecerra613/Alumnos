import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
            window.location.href = 'index';
        }
    });

    document.querySelector('.m_miperfil').addEventListener('click', function() {
        window.top.location.href = 'MiPerfil';
    });

    document.querySelector('.m_mitablero').addEventListener('click', async function() {
        const docRefAdmin = doc(db, 'claveMaestro', 'generarClaves');
        const docSnapAdmin = await getDoc(docRefAdmin);
        const claveAdmin = docSnapAdmin.data().claveAdmin;

        const docRefUser = doc(db, 'users', auth.currentUser.uid);
        const docSnapUser = await getDoc(docRefUser);
        const claveMaestro = docSnapUser.data().claveMaestro;

        if (claveMaestro === claveAdmin) {
            window.top.location.href = 'Tablero';
        } else {
            window.top.location.href = 'mitablero';
        }
    });

    document.querySelector('.m_cerrarsesion').addEventListener('click', function() {
        signOut(auth).then(() => {
            // Sesión cerrada, redirigir al índice
            window.location.href = 'index';
        }).catch((error) => {
            // Error al cerrar sesión
            console.error('Error al cerrar sesión:', error);
        });
    });
});
