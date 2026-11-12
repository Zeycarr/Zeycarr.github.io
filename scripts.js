const btnAgendarTurno = document.getElementById("btnAgendarTurno");
const btnVerTurnos = document.getElementById("btnVerTurnos");
const btnCatalogo = document.getElementById("btnCatalogo");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnImprimir = document.getElementById("btnImprimir");
const btnCerrar = document.getElementById("btnCerrar");
const btnInicio = document.getElementById("btnInicio");

const seccionFormulario = document.getElementById("seccionFormulario");
const seccionTurnos = document.getElementById("seccionTurnos");
const catalogo = document.getElementById("catalogo");
const formularioTurno = document.getElementById("FormularioTurno");

const inputFechaHora = document.getElementById("fechaHora");
const inputCliente = document.getElementById("cliente");
const selectServicio = document.getElementById("servicio");
const selectBarbero = document.getElementById("barbero");

const cuerpoTurnos = document.getElementById("cuerpoTurnos");
const cuerpoCatalogo = document.getElementById("cuerpoCatalogo");
const textoTotal = document.getElementById("textoTotal");
const mensajeError = document.getElementById("mensajeError");
const fechaReporte = document.getElementById("fechaReporte");

let turnos = JSON.parse(localStorage.getItem("turnosBarberia")) || [];

function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR");
}

function dosDigitos(n) {
    return String(n).padStart(2, "0");
}

function fechaLocalISO(fecha) {
    return fecha.getFullYear() + "-" + dosDigitos(fecha.getMonth() + 1) + "-" + dosDigitos(fecha.getDate());
}

function formatearFechaHora(valor) {
    const f = new Date(valor);
    return dosDigitos(f.getDate()) + "/" + dosDigitos(f.getMonth() + 1) + "/" + f.getFullYear() +
        " " + dosDigitos(f.getHours()) + ":" + dosDigitos(f.getMinutes());
}

btnInicio.addEventListener("click", () => {
    seccionFormulario.classList.add("oculto");
    seccionTurnos.classList.add("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

function configurarFecha() {
    const hoy = new Date();
    const iso = fechaLocalISO(hoy);
    inputFechaHora.min = iso + "T00:00";
    inputFechaHora.max = iso + "T23:59";
    fechaReporte.textContent = hoy.toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}
function cargarCatalogo() {
    cuerpoCatalogo.innerHTML = "";
    for (const opcion of selectServicio.options) {
        if (opcion.value === "") continue;
        const fila = document.createElement("tr");
        const tdNombre = document.createElement("td");
        const tdPrecio = document.createElement("td");
        tdNombre.textContent = opcion.value;
        tdPrecio.textContent = formatearPrecio(Number(opcion.dataset.precio));
        fila.append(tdNombre, tdPrecio);
        cuerpoCatalogo.appendChild(fila);
    }
}
function dibujarTurnos() {
    cuerpoTurnos.innerHTML = "";

    turnos.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

    if (turnos.length === 0) {
        const fila = document.createElement("tr");
        fila.className = "fila-vacia";
        const td = document.createElement("td");
        td.colSpan = 6;
        td.textContent = "Todavía no hay turnos registrados.";
        fila.appendChild(td);
        cuerpoTurnos.appendChild(fila);
    }

    let total = 0;

    turnos.forEach((turno, indice) => {
        total += turno.precio;

        const fila = document.createElement("tr");
        const datos = [
            formatearFechaHora(turno.fechaHora),
            turno.cliente,
            turno.servicio,
            turno.barbero,
            formatearPrecio(turno.precio)
        ];

        datos.forEach(texto => {
            const td = document.createElement("td");
            td.textContent = texto;
            fila.appendChild(td);
        });

        const tdAccion = document.createElement("td");
        tdAccion.className = "no-imprimir";
        const btn = document.createElement("button");
        btn.className = "btn-quitar";
        btn.textContent = "Quitar";
        btn.addEventListener("click", () => quitarTurno(indice));
        tdAccion.appendChild(btn);
        fila.appendChild(tdAccion);

        cuerpoTurnos.appendChild(fila);
    });

    textoTotal.textContent = "Total de turnos registrados: " + turnos.length +
        " | Monto total estimado a recaudar: " + formatearPrecio(total);
}

function guardar() {
    localStorage.setItem("turnosBarberia", JSON.stringify(turnos));
}

function quitarTurno(indice) {
    turnos.splice(indice, 1);
    guardar();
    dibujarTurnos();
}


function limpiarFormulario() {
    formularioTurno.reset();
    mensajeError.textContent = "";
}


btnAgendarTurno.addEventListener("click", () => {
    seccionFormulario.classList.toggle("oculto");
});

btnVerTurnos.addEventListener("click", () => {
    seccionTurnos.classList.toggle("oculto");
});

btnCatalogo.addEventListener("click", () => {
    catalogo.classList.toggle("oculto");
    btnCatalogo.textContent = catalogo.classList.contains("oculto") ? "Ver catálogo" : "Ocultar catálogo";
});

btnLimpiar.addEventListener("click", limpiarFormulario);

formularioTurno.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const fechaHora = inputFechaHora.value;
    const cliente = inputCliente.value.trim();
    const servicio = selectServicio.value;
    const barbero = selectBarbero.value;

    if (!fechaHora || !cliente || !servicio || !barbero) {
        mensajeError.textContent = "Completá todos los campos para registrar el turno.";
        return;
    }

    if (fechaHora.slice(0, 10) !== fechaLocalISO(new Date())) {
        mensajeError.textContent = "El turno debe ser para el día de hoy.";
        return;
    }

    const precio = Number(selectServicio.selectedOptions[0].dataset.precio);

    turnos.push({ fechaHora, cliente, servicio, barbero, precio });
    guardar();
    dibujarTurnos();
    limpiarFormulario();
    seccionTurnos.classList.remove("oculto");
});

btnImprimir.addEventListener("click", () => {
    window.print();
});

btnCerrar.addEventListener("click", () => {
    seccionTurnos.classList.add("oculto");
});

configurarFecha();
cargarCatalogo();
dibujarTurnos();
