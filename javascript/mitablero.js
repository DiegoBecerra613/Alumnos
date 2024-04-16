import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBYaOFfj9umpzsfWWTtYD7KhOak2gUMwtM",
    authDomain: "alumassist.firebaseapp.com",
    projectId: "alumassist",
    storageBucket: "alumassist.appspot.com",
    messagingSenderId: "1080021803308",
    appId: "1:1080021803308:web:57a41937424d7b81decc89"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de autenticación de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

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
        } else {
            console.log("No se encontró el documento del usuario en Firestore");
        }
    }
    // Agregar evento click al botón para redirigir al usuario a la página crear-grupo.html
    document.querySelector('.btn_crear_grupo').addEventListener('click', function() {
        window.location.href = 'crear-grupo';
    });

    // Agregar evento click al botón para redirigir al usuario a la página crear-grupo.html
    document.querySelector('.btn_tomar_asistencia').addEventListener('click', function() {
        window.location.href = 'EditarLista';
    });

    document.querySelector('.btn_editar_lista').addEventListener('click', function(){
        window.location.href = 'EditarLista';
    })
});
