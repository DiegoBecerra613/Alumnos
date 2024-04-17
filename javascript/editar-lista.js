import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Tu configuración de Firebase y código de inicialización aquí...
    const firebaseConfig = {
        apiKey: "AIzaSyBYaOFfj9umpzsfWWTtYD7KhOak2gUMwtM",
        authDomain: "alumassist.firebaseapp.com",
        projectId: "alumassist",
        storageBucket: "alumassist.appspot.com",
        messagingSenderId: "1080021803308",
        appId: "1:1080021803308:web:57a41937424d7b81decc89"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(); // Obtener la instancia de autenticación
    const cuerpo = document.querySelector('body');


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
        } else {
            console.log("Usuario no autenticado.");
        }
    });
});

function llenarTabla(datos, userId, db) {
    const tbody = document.querySelector('.tabla-alumnos tbody');
    tbody.innerHTML = '';
    const nombresOrdenados = datos.sort();
    nombresOrdenados.forEach((nombre, index) => {
        const [apellidos, ...nombres] = nombre.split(' ');
        const row = document.createElement('tr');
        const numeroRegistro = document.createElement('td');
        numeroRegistro.textContent = index + 1;
        row.appendChild(numeroRegistro);
        const apellidosCell = document.createElement('td');
        apellidosCell.textContent = apellidos;
        row.appendChild(apellidosCell);
        const nombresCell = document.createElement('td');
        nombresCell.textContent = nombres.join(' '); // Unir los nombres separados por un espacio
        row.appendChild(nombresCell);
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
        btnEliminar.addEventListener('click', () => eliminarFila(row));
    });
}

function editarFila(fila, userId, db) {
    const celdaApellidos = fila.querySelector('td:nth-child(2)');
    const celdaNombre = fila.querySelector('td:nth-child(3)');
    const anteriorValor = celdaApellidos.textContent + " " + celdaNombre.textContent;

    const inputApellidos = document.createElement('input');
    inputApellidos.type = 'text';
    inputApellidos.value = celdaApellidos.textContent;

    const inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.value = celdaNombre.textContent;

    celdaApellidos.innerHTML = '';
    celdaNombre.innerHTML = '';

    celdaApellidos.appendChild(inputApellidos);
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
    const celdaApellidos = fila.querySelector('td:nth-child(2) input');
    const celdaNombre = fila.querySelector('td:nth-child(3) input');

    fila.querySelector('td:nth-child(2)').textContent = celdaApellidos.value;
    fila.querySelector('td:nth-child(3)').textContent = celdaNombre.value;

    const nuevoValor = celdaApellidos.value + " " + celdaNombre.value;
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
                    const grupo=data.grado + "" + data.grupo;
                    editarValorEnMap(db,anteriorValor,nuevoValor,grupo);
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
                        // Modifica el valor encontrado
                        data[key] = nuevoValor;
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





