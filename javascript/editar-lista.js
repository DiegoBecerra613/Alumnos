import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Mostrar el loader al principio
    document.querySelector('.loader-background').classList.add('visible');
    // Tu configuración de Firebase y código de inicialización aquí...
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
    const cuerpo = document.querySelector('body');
    const btnRegistrar = document.querySelector('.btnRegistrar');


    onAuthStateChanged(auth, async function (user) {
        if (user) {
            const userId = user.uid;
            const querySnapshot = await getDocs(collection(db, 'grupos'));
            querySnapshot.forEach((doc) => {
                const grupoData = doc.data();
                if (grupoData.userID === userId) {
                    llenarTabla(grupoData.nombresAlumnos, userId, db);
                }
            });
            btnRegistrar.addEventListener('click', () => registrar(userId, db));
        } else {
            console.log("Usuario no autenticado.");
        }
// Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    });
});

async function registrar(userId, db) {
    console.log('Funciona');
    var apellidosInput = document.querySelector('.div-apellidos-alumno input[name="apellidos"]');
    var apellidos = apellidosInput.value;
    var nombreInput = document.querySelector('input[name="nombre"]');
    var nombre = nombreInput.value;
    var nuevoNombre = apellidos + " " + nombre;
    var grupo = "";
    const querySnapshot = await getDocs(collection(db, 'grupos'));
    querySnapshot.forEach(async (doc) => {
        const grupoData = doc.data();
        if (grupoData.userID === userId) {
            grupo = grupoData.grado + grupoData.grupo;
            grupoData.nombresAlumnos.push(nuevoNombre);
            await updateDoc(doc.ref, { nombresAlumnos: grupoData.nombresAlumnos });
        }
    });
    const listaDocRef = doc(db, 'grupos', grupo, 'lista', `lista${grupo}`);
    const listaDoc = await getDoc(listaDocRef);
    const data = listaDoc.data();

    if (data) {
        Object.keys(data).forEach(key => {
            console.log(`Valores en nivel ${key}:`);
            if (typeof data[key] === 'object' && data[key] !== null) {
                Object.keys(data[key]).forEach(subKey => {
                    // Inicializa el nuevo array con ceros
                    data[key][nuevoNombre] = Array(data[key][subKey].length).fill(0);
                });
            } else {
                console.log(`   ${data[key]}`);
            }
        });
        await setDoc(listaDocRef, data);
    } else {
        console.log('No hay datos disponibles en el nivel especificado.');
    }
    location.reload();
}

function llenarTabla(datos, userId, db) {
    const tbody = document.querySelector('.tabla-alumnos tbody');
    tbody.innerHTML = '';
    const nombresOrdenados = datos.sort();
    nombresOrdenados.forEach((nombre, index) => {
        const row = document.createElement('tr');
        const numeroRegistro = document.createElement('td');
        numeroRegistro.textContent = index + 1;
        row.appendChild(numeroRegistro);
        const nombreCell = document.createElement('td');
        nombreCell.textContent = nombre; // Unir los nombres separados por un espacio
        row.appendChild(nombreCell);
        const opcionesCell = document.createElement('td');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btnEditar');
        opcionesCell.appendChild(btnEditar);
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('btnEliminar');
        opcionesCell.appendChild(btnEliminar);
        row.appendChild(opcionesCell);
        tbody.appendChild(row);

        btnEditar.addEventListener('click', () => editarFila(row, userId, db));
        btnEliminar.addEventListener('click', () => eliminarValor(row,userId, db));
    });
}

function editarFila(fila, userId, db) {
    const celdaNombre = fila.querySelector('td:nth-child(2)');
    const anteriorValor = celdaNombre.textContent;

    const inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.value = celdaNombre.textContent;

    celdaNombre.innerHTML = '';

    celdaNombre.appendChild(inputNombre);

    // Ocultar botones de editar y eliminar
    fila.querySelector('.btnEditar').style.display = 'none';
    fila.querySelector('.btnEliminar').style.display = 'none';

    // Crear botón de aceptar cambios
    const btnAceptarCambios = document.createElement('button');
    btnAceptarCambios.textContent = 'Aceptar';
    btnAceptarCambios.classList.add('btnAceptarCambios');
    fila.querySelector('td:last-child').appendChild(btnAceptarCambios);
    btnAceptarCambios.addEventListener('click', () => aceptarCambios(fila, userId, anteriorValor, db));
}

function aceptarCambios(fila, userId, anteriorValor, db) {
    const celdaNombre = fila.querySelector('td:nth-child(2) input');

    fila.querySelector('td:nth-child(2)').textContent = celdaNombre.value;

    const nuevoValor = celdaNombre.value;
    // Mostrar botones de editar y eliminar
    fila.querySelector('.btnEditar').style.display = 'inline-block';
    fila.querySelector('.btnEliminar').style.display = 'inline-block';

    // Eliminar botón de aceptar cambios
    fila.querySelector('.btnAceptarCambios').remove();
    editarValorEnTabla(db, userId, anteriorValor, nuevoValor)
}

async function editarValorEnTabla(db, userId, anteriorValor, nuevoValor) {
    const querySnapshot = await getDocs(collection(db, 'grupos'));
    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        if (data.userID === userId) {
            data.nombresAlumnos.forEach(async (nombre, index) => {
                if (nombre === anteriorValor) {
                    // Actualizar el valor
                    data.nombresAlumnos[index] = nuevoValor;
                    // Actualizar el documento en Firebase
                    await updateDoc(doc.ref, { nombresAlumnos: data.nombresAlumnos });
                    console.log(data.grado + "" + data.grupo);
                    const grupo = data.grado + "" + data.grupo;
                    // Solo llama a editarValorEnMap si el valor ha cambiado
                    if (anteriorValor !== nuevoValor) {
                        editarValorEnMap(db, anteriorValor, nuevoValor, grupo);
                    }
                }
            });
        }
    });
}


async function editarValorEnMap(db, anteriorValor, nuevoValor, grupo) {
    const listaDocRef = doc(db, 'grupos', grupo, 'lista', `lista${grupo}`);
    const listaDoc = await getDoc(listaDocRef);
    const data = listaDoc.data();

    if (data) {
        let encontrado = false;

        Object.keys(data).forEach(key => {
            console.log(`Valores en nivel ${key}:`);

            // Verifica si el valor en este nivel es un objeto
            if (typeof data[key] === 'object' && data[key] !== null) {
                // Itera sobre las propiedades del objeto
                Object.keys(data[key]).forEach(subKey => {
                    console.log(`${subKey}: ${data[key][subKey]}`);
                    if (subKey === anteriorValor) {
                        console.log('Valor encontrado');
                        encontrado = true;
                        data[key][nuevoValor] = data[key][subKey]; // Agrega la nueva clave con el mismo valor
                        delete data[key][subKey]; // Elimina la clave antigua
                    }

                });
            } else {
                console.log(`   ${data[key]}`);
            }
        });

        if (encontrado) {
            // Guarda los cambios en la base de datos
            await setDoc(listaDocRef, data);
            console.log('Valor modificado correctamente.');
        } else {
            console.log('El valor especificado no fue encontrado.');
        }
    } else {
        console.log('No hay datos disponibles en el nivel especificado.');
    }
}

async function eliminarValor(fila, userId, db) {
    const celdaNombre = fila.querySelector('td:nth-child(2)');
    const anteriorValor = celdaNombre.textContent;
    const querySnapshot = await getDocs(collection(db, 'grupos'));
    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        if (data.userID === userId) {
            data.nombresAlumnos = data.nombresAlumnos.filter(nombre => nombre !== anteriorValor);
            await updateDoc(doc.ref, { nombresAlumnos: data.nombresAlumnos });
            console.log('Valor eliminado correctamente de la lista de alumnos.');
            const grupo = data.grado + "" + data.grupo;
            await eliminarValorEnMap(anteriorValor, grupo, db);
            location.reload();
        }
    });
}

async function eliminarValorEnMap(anteriorValor, grupo, db) {
    const listaDocRef = doc(db, 'grupos', grupo, 'lista', `lista${grupo}`);
    const listaDoc =     await getDoc(listaDocRef);
    const data = listaDoc.data();

    if (data) {
        let encontrado = false;

        Object.keys(data).forEach(key => {
            // Verifica si el valor en este nivel es un objeto
            if (typeof data[key] === 'object' && data[key] !== null) {
                // Itera sobre las propiedades del objeto
                Object.keys(data[key]).forEach(subKey => {
                    if (subKey === anteriorValor) {
                        encontrado = true;
                        delete data[key][subKey]; // Elimina la clave antigua
                    }
                });
            }
        });

        if (encontrado) {
            // Guarda los cambios en la base de datos
            await setDoc(listaDocRef, data);
            console.log('Valor eliminado correctamente del mapa.');
        } else {
            console.log('El valor especificado no fue encontrado en el mapa.');
        }
    } else {
        console.log('No hay datos disponibles en el nivel especificado.');
    }
}
