import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc, Timestamp, deleteDoc, limit, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

    async function deleteDocumentAndSubcollections(db, docPath) {
        // Aquí puedes agregar las subcolecciones que quieres eliminar
        const subcollections = ['lista', 'fechas', 'lista+grado+grupo'];

        for (const subcollection of subcollections) {
            await deleteCollection(db, `${docPath}/${subcollection}`, 10);
        }

        await deleteDoc(doc(db, docPath));
    }

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
                if (userKey === adminKey && window.location.pathname !== '/eliminarGrupo.html') {
                    window.location.href = 'eliminarGrupo.html';
                } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                    window.location.href = 'mitablero';
                }
            }
        } else if (window.location.pathname !== '/index') {
            window.location.href = 'index';
            console.log('Usuario no autenticado'); // Agregar mensaje de consola
        }
    });

    // Nueva funcionalidad para crear recycleview por cada documento en la colección grupos
    const gruposCollection = collection(db, 'grupos');
    const gruposSnapshot = await getDocs(gruposCollection);
    console.log('Datos de los grupos:', gruposSnapshot.docs.map(doc => doc.data())); // Agregar mensaje de consola
    gruposSnapshot.forEach(async (grupoDoc) => {
        const grupoData = grupoDoc.data();
        const grado = grupoData.grado;
        const grupo = grupoData.grupo;
        const nombresAlumnos = grupoData.nombresAlumnos;
        const userID = grupoData.userID;

        const textGB = `${grado}°${grupo}`;
        const textNoAlumnos = nombresAlumnos.length;

        const userDoc = await getDoc(doc(db, 'users', userID));
        const userData = userDoc.data();
        const textNombreMaestro = `${userData.nombre} ${userData.apellidos}`;

        const recycleView = document.createElement('div');
        recycleView.className = 'recyle-view-eliminar-grupo';
        recycleView.innerHTML = `
            <div class="text-grado-grupo">
                Grado y Grupo:
            </div>
            <div class="div-GB">
            <span class="text-GB">
                ${textGB}
            </span>
            </div>

            <div class="text-alumnos">
                No. de Alumnos:
            </div>
            <div class="div-alumnos">
            <span class="text-no-alumnos">
                ${textNoAlumnos}
            </span>
            </div>

            <div class="text-maestro">
                Maestra(o):
            </div>
            <div class="div-name-maestro">
            <span class="text-nombre-maestro">
                ${textNombreMaestro}
            </span>
            </div>

            <button class="btn-eliminar-grupo">
            <span class="text-delete-group">
            Eliminar Grupo
            </span>
            </button>
        `;

        recycleView.querySelector('.btn-eliminar-grupo').addEventListener('click', async () => {
            await deleteDocumentAndSubcollections(db, 'grupos/' + grupoDoc.id);
            recycleView.remove();
        });

        document.querySelector('.contenedor-eliminar-grupo').appendChild(recycleView);
    });

    // Ocultar el loader una vez que los datos se hayan cargado
    document.querySelector('.loader-background').classList.remove('visible');
});
