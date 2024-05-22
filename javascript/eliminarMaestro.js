import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth,deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc, Timestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Usuario autenticado:', user.uid); // Agregar mensaje de consola
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            console.log('Datos del usuario:', userDoc.data()); // Agregar mensaje de consola
            const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
            console.log('Datos del administrador:', adminDoc.data()); // Agregar mensaje de consola
            if (userDoc.exists() && adminDoc.exists()) {
                const userKey = userDoc.data().claveMaestro;
                const adminKey = adminDoc.data().claveAdmin;
                if (userKey === adminKey && window.location.pathname !== '/eliminarMaestro.html') {
                    window.location.href = 'eliminarMaestro.html';
                } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                    window.location.href = 'mitablero';
                }
            }
        } else if (window.location.pathname !== '/index') {
            window.location.href = 'index';
            console.log('Usuario no autenticado'); // Agregar mensaje de consola
        }
    });
    // Obtén todos los documentos de la colección de usuarios
    const usersSnapshot = await getDocs(collection(db, 'users'));

    usersSnapshot.forEach((userDoc) => {
        // Crea un RecyclerView para cada usuario
        const user = userDoc.data();
        const fullName = user.nombre + ' ' + user.apellidos;
        const recyclerView = document.createElement('div');
        recyclerView.className = 'recyle-view-eliminar-maestro';
        recyclerView.innerHTML = `
        <div class="text-maestro">
            Maestro(a):
        </div>
        <div class="div-txt-maestro">
            <span class="text-nombre-maestro">
                ${fullName}
            </span>
        </div>
        <button class="btn-eliminar-maestro">
            <span class="text-delete-maestro">
                Eliminar Maestro
            </span>
        </button>
    `;
        // Agrega el RecyclerView al contenedor
        document.querySelector('.contenedor-eliminar-maestro').appendChild(recyclerView);

        // Al hacer clic en el botón, elimina el usuario y el RecyclerView
        recyclerView.querySelector('.btn-eliminar-maestro').addEventListener('click', async () => {
            await deleteDoc(doc(db, 'users', userDoc.id)); // Elimina el documento de la base de datos
            recyclerView.remove(); // Elimina el RecyclerView
        });
    });
});
