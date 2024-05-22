import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async (event) => {
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

    await cargarCodigos();
    //crearRecycleView();
    // Generar un código aleatorio de 6 dígitos
    function generarCodigo() {
        let codigo = '';
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return codigo;
    }

    // Actualizar los botones con el código generado
    function actualizarBotones(codigo, recycleView) {
        const botones = recycleView.querySelectorAll('.codigo button');
        for (let i = 0; i < botones.length; i++) {
            botones[i].textContent = codigo[i];
        }
    }

// Cambiar el botón Generar Clave
    function cambiarBotonGenerarClave(boton) {
        boton.style.backgroundColor = '#FA5252';
        boton.style.color = 'white';
        boton.style.fontFamily = 'Montserrat';
        boton.textContent = 'Eliminar Clave';

        boton.onmouseover = function() {
            this.style.backgroundColor = '#ff7878';
        }

        boton.onmouseout = function() {
            this.style.backgroundColor = '#FA5252';
        }
    }

    // Guardar el código en la base de datos
    async function guardarCodigo(codigo) {
        const docRef = doc(db, 'claveMaestro', 'generarClaves');
        await updateDoc(docRef, {
            claveMaestro: arrayUnion(codigo)
        });
    }

    // Eliminar el código de la base de datos
    async function eliminarCodigo(codigo) {
        const docRef = doc(db, 'claveMaestro', 'generarClaves');
        await updateDoc(docRef, {
            claveMaestro: arrayRemove(codigo)
        });
    }
    // Cargar los códigos existentes en la base de datos
    async function cargarCodigos() {
        const docRef = doc(db, 'claveMaestro', 'generarClaves');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.claveMaestro && data.claveMaestro.length > 0) {
                for (let i = 0; i < data.claveMaestro.length; i++) {
                    const recycleView = crearRecycleView(data.claveMaestro[i]);
                    const boton = recycleView.querySelector('.btn-generar-clave');
                    cambiarBotonGenerarClave(boton);
                }
            }
        }
        // Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    }

// Crear un nuevo recycle view
    function crearRecycleView(codigoInicial) {
        const recycleView = document.createElement('div');
        recycleView.innerHTML = `
    <div class="recycle-view-clave-maestro">
        <div class="text-clave-maestro">
        Clave Maestro:
        </div>
        <div class="contenedor-codigo-boton">
            <div class="codigo">
                <button class="text-digito-6"></button>
                <button class="text-digito-5"></button>
                <button class="text-digito-4"></button>
                <button class="text-digito-3"></button>
                <button class="text-digito-2"></button>
                <button class="text-digito-1"></button>
            </div>
            <button class="btn-generar-clave">
                <span class="generar-clave">
                Generar Clave
                </span>
            </button>
        </div>
    </div>
    `;
        const contenedor = document.querySelector('.contenedor-nuevo-maestro');
        contenedor.appendChild(recycleView);
        const boton = recycleView.querySelector('.btn-generar-clave');
        let codigoGenerado = false;
        let codigoActual = '';
        if (codigoInicial) {
            actualizarBotones(codigoInicial, recycleView);
            cambiarBotonGenerarClave(boton);
            codigoActual = codigoInicial;
            codigoGenerado = true;
        }
        boton.addEventListener('click', async () => {
            if (!codigoGenerado) {
                console.log('El botón btn-generar-clave fue presionado');
                const codigo = generarCodigo();
                codigoActual = codigo;
                actualizarBotones(codigo, recycleView);
                cambiarBotonGenerarClave(boton);
                await guardarCodigo(codigo);
                codigoGenerado = true;
                crearRecycleView();
            } else {
                recycleView.remove();
                await eliminarCodigo(codigoActual);
                if (contenedor.children.length === 1) { // Si solo queda un recycle view, crear uno nuevo
                    crearRecycleView();
                }
            }
        });
        return recycleView;
    }
// Manejar el evento click del botón Generar Clave
    const botonInicial = document.querySelector('.btn-generar-clave');
    let codigoGeneradoInicial = false;
    let codigoActualInicial = '';
    botonInicial.addEventListener('click', async () => {
        if (!codigoGeneradoInicial) {
            console.log('El botón btn-generar-clave fue presionado');
            const codigo = generarCodigo();
            actualizarBotones(codigo, document.querySelector('.recycle-view-clave-maestro'));
            cambiarBotonGenerarClave(botonInicial);
            await guardarCodigo(codigo);
            codigoActualInicial = codigo;
            codigoGeneradoInicial = true;
            crearRecycleView();
        } else {
            document.querySelector('.recycle-view-clave-maestro').remove();
            await eliminarCodigo(codigoActualInicial);
            if (document.querySelector('.contenedor-nuevo-maestro').children.length === 0) { // Si no queda ningún recycle view, crear uno nuevo
                crearRecycleView();
            }
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
            if (userDoc.exists() && adminDoc.exists()) {
                const userKey = userDoc.data().claveMaestro;
                const adminKey = adminDoc.data().claveAdmin;
                if (userKey === adminKey && window.location.pathname !== '/nuevoMaestro.html') {
                    window.location.href = 'nuevoMaestro.html';
                } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                    window.location.href = 'mitablero';
                }
            }
        } else if (window.location.pathname !== '/index') {
            window.location.href = 'index';
        }
    });
});
