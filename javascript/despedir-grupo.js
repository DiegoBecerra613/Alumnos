import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, deleteDoc, limit, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    // Mostrar el loader
    document.querySelector('.loader-background').classList.add('visible');

    async function deleteCollection(db, collectionPath, batchSize) {
        const collectionRef = collection(db, collectionPath);
        const q = query(collectionRef, limit(batchSize)); // Aplicar el límite a la consulta

        return new Promise((resolve, reject) => {
            deleteQueryBatch(db, q, batchSize, resolve, reject);
        });
    }

    async function deleteQueryBatch(db, query, batchSize, resolve, reject) {
        const snapshot = await getDocs(query);

        if (snapshot.size == 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        setTimeout(() => {
            deleteQueryBatch(db, query, batchSize, resolve, reject);
        }, 0);
    }

    async function updateUI(user) {
        const q = query(collection(db, 'grupos'), where('userID', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const docData = querySnapshot.docs[0];
        const textoDatosGrupo = document.querySelector('.texto-datos-grupo');
        const btnEliminar = document.querySelector('.btn-eliminar');

        if (docData) {
            // Document exists
            let grado = docData.data().grado;
            let grupo = docData.data().grupo;
            textoDatosGrupo.textContent = `${grado}°${grupo}`;
            btnEliminar.style.display = 'block'; // Show the button

            btnEliminar.addEventListener('click', async () => {
                // Delete the 'lista' subcollection
                await deleteCollection(db, `grupos/${docData.id}/lista`, 10);

                // Delete the document
                const docRef = doc(db, 'grupos', docData.id);
                await deleteDoc(docRef);

                // Update the UI again after deletion
                updateUI(user);
            });
        } else {
            // No document found
            textoDatosGrupo.textContent = 'Ninguno';
            btnEliminar.style.display = 'none'; // Hide the button
        }

        // Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // El usuario está autenticado, se queda en la página actual
            console.log('Usuario autenticado:', user);
            updateUI(user);
        } else {
            // El usuario no está autenticado, redirigir al índice
            window.location.href = 'index';
        }
    });
});
