import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Mostrar el loader
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
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(); // Obtener la instancia de autenticación
    const storage = getStorage(app); // Obtener la instancia de almacenamiento

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // El usuario está autenticado, se queda en la página actual
            console.log('Usuario autenticado:', user);

            // Obtener los datos del usuario de Firestore
            let docRef = doc(db, 'users', user.uid);
            await getDoc(docRef).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    let userData = docSnapshot.data();
                    document.querySelector('.etiqueta-nombre').textContent = userData.nombre;
                    document.querySelector('.etiqueta-apellido').textContent = userData.apellidos;
                } else {
                    console.log('No such document!');
                }
            }).catch((error) => {
                console.error(error);
            });

            // Mostrar el correo electrónico y la contraseña del usuario
            document.querySelector('.view-email').textContent = user.email;
            document.querySelector('.view-contraseña').textContent = '••••••••'; // No es posible obtener la contraseña del usuario

            // Cargar la foto del usuario
            let storageRef = ref(storage, 'profilePictures/' + user.uid);
            await getDownloadURL(storageRef).then((downloadURL) => {
                let divFoto = document.querySelector('.div-foto');
                divFoto.style.backgroundImage = `url(${downloadURL})`; // Reemplazar la imagen de fondo
                divFoto.style.backgroundSize = 'cover'; // Ajustar y recortar la imagen para que se adapte al contenedor
            }).catch((error) => {
                console.error(error);
            });

            // Ocultar el loader una vez que los datos se hayan cargado
            document.querySelector('.loader-background').classList.remove('visible');

            // Agregar evento de escucha al botón "btn-subir-foto"
            document.querySelector('.btn-subir-foto').addEventListener('click', (e) => {
                e.preventDefault();

                // Crear un input de tipo file
                let input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*'; // Aceptar solo imágenes

                // Escuchar cuando el usuario selecciona un archivo
                input.onchange = (e) => {
                    let file = e.target.files[0];

                    // Verificar si el archivo es una imagen
                    if (!file.type.startsWith('image/')) {
                        alert('Por favor, sube solo imágenes.');
                        return;
                    }

                    // Crear una referencia al archivo en el almacenamiento de Firebase
                    let storageRef = ref(storage, 'profilePictures/' + user.uid);

                    // Subir el archivo
                    let uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Progreso de la subida
                            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                        },
                        (error) => {
                            // Manejar errores
                            console.error(error);
                        },
                        () => {
                            // Subida completada, obtener URL de descarga y mostrar la imagen
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                console.log('File available at', downloadURL);
                                let divFoto = document.querySelector('.div-foto');
                                divFoto.style.backgroundImage = `url(${downloadURL})`; // Reemplazar la imagen de fondo
                                divFoto.style.backgroundSize = 'cover'; // Ajustar y recortar la imagen para que se adapte al contenedor
                            });
                        }
                    );
                };

                // Abrir el explorador de archivos
                input.click();
            });

            // Agregar evento de escucha al botón "btn-borrar-foto"
            document.querySelector('.btn-borrar-foto').addEventListener('click', (e) => {
                e.preventDefault();

                // Borrar la foto del usuario
                deleteObject(storageRef).then(() => {
                    console.log('File deleted successfully');
                    let divFoto = document.querySelector('.div-foto');
                    divFoto.style.backgroundImage = "url('../assets/placeholder-bg.png')"; // Mostrar la imagen por defecto
                    divFoto.style.backgroundSize = 'cover'; // Ajustar y recortar la imagen para que se adapte al contenedor
                }).catch((error) => {
                    console.error(error);
                });
            });
            // Agregar evento de escucha al botón "btn-cambiar-contraseña"
            document.querySelector('.btn-cambiar-contraseña').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'cambiar-contrasea.html';
            });

        } else {
            // El usuario no está autenticado, redirigir al índice
            window.location.href = 'index.html';
        }
    });
});
