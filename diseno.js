
const canal = new BroadcastChannel(
    "turnos_modelos_3d"
);


/* =========================================
   TURNOS
========================================= */

let turnos =
    JSON.parse(
        localStorage.getItem("turnos")
    ) || [];


/* =========================================
   DISEÑADORES
========================================= */

let diseñadores =
    JSON.parse(
        localStorage.getItem("diseñadores")
    ) || {

        1: {
            nombre: "Diseñador 1",
            turnoId: null
        },

        2: {
            nombre: "Diseñador 2",
            turnoId: null
        }

    };


/* =========================================
   GENERAR NÚMERO DE TURNO
========================================= */

function generarNumeroTurno() {

    /*
        Buscamos el número más alto
        para evitar repetir turnos.
    */

    let mayor = 0;


    turnos.forEach(turno => {

        const numero =
            parseInt(
                turno.numero.replace("T-", "")
            );


        if (numero > mayor) {

            mayor = numero;

        }

    });


    return "T-" +
        String(mayor + 1).padStart(3, "0");

}


/* =========================================
   GENERAR CÓDIGO
========================================= */

function generarCodigo() {

    const caracteres =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let codigo = "";


    do {

        codigo = "";


        for (let i = 0; i < 5; i++) {

            codigo += caracteres[
                Math.floor(
                    Math.random() *
                    caracteres.length
                )
            ];

        }

    } while (
        turnos.some(
            turno =>
                turno.codigo === codigo
        )
    );


    return codigo;

}


/* =========================================
   GENERAR TURNO
========================================= */

function generarTurno() {

    /*
        Revisamos cuántos clientes
        están esperando.
    */

    const esperando =
        turnos.filter(
            turno =>
                turno.estado === "espera"
        );


    /*
        Máximo 3 clientes en espera.
    */

    if (esperando.length >= 3) {

        mostrarMensaje(
            "La cola está llena. Máximo 3 clientes esperando.",
            "error"
        );

        return;

    }


    const nuevoTurno = {

        id: Date.now(),

        numero:
            generarNumeroTurno(),

        codigo:
            generarCodigo(),

        estado:
            "espera",

        diseñadorId:
            null,

        pagado:
            false,

        fecha:
            new Date().toLocaleString()

    };


    turnos.push(nuevoTurno);


    guardarDatos();

    enviarActualizacion();


    /*
        Mostrar información
        al cliente.
    */

    document
        .getElementById(
            "turnoGenerado"
        )
        .classList.remove("oculto");


    document
        .getElementById(
            "numeroTurno"
        )
        .textContent =
        nuevoTurno.numero;


    document
        .getElementById(
            "codigoAutenticacion"
        )
        .textContent =
        nuevoTurno.codigo;

}


/* =========================================
   TOMAR SIGUIENTE TURNO
========================================= */

function tomarSiguienteTurno(
    diseñadorId
) {

    /*
        Revisamos si el diseñador
        ya está ocupado.
    */

    if (
        diseñadores[diseñadorId]
            .turnoId !== null
    ) {

        mostrarMensaje(
            `El Diseñador ${diseñadorId} ya está atendiendo a un cliente.`,
            "error"
        );

        return;

    }


    /*
        Buscamos el primer cliente
        de la cola.
    */

    const siguiente =
        turnos.find(
            turno =>
                turno.estado === "espera"
        );


    if (!siguiente) {

        mostrarMensaje(
            "No hay clientes esperando.",
            "error"
        );

        return;

    }


    /*
        Cambiamos el estado.
    */

    siguiente.estado =
        "atencion";


    siguiente.diseñadorId =
        diseñadorId;


    /*
        Ocupamos al diseñador.
    */

    diseñadores[diseñadorId]
        .turnoId =
        siguiente.id;


    guardarDatos();

    enviarActualizacion();


    mostrarMensaje(
        `El Diseñador ${diseñadorId} ahora atiende el turno ${siguiente.numero}.`,
        "exito"
    );

}


/* =========================================
   VERIFICAR PAGO
========================================= */

function verificarPago() {

    const input =
        document.getElementById(
            "codigoPago"
        );


    const codigo =
        input.value
            .trim()
            .toUpperCase();


    if (!codigo) {

        mostrarMensaje(
            "Introduce un código.",
            "error"
        );

        return;

    }


    /*
        Buscamos el turno
        utilizando el código.
    */

    const turno =
        turnos.find(
            turno =>
                turno.codigo === codigo
        );


    if (!turno) {

        mostrarMensaje(
            "El código no existe.",
            "error"
        );

        return;

    }


    /*
        El turno debe estar
        siendo atendido.
    */

    if (
        turno.estado !==
        "atencion"
    ) {

        mostrarMensaje(
            "Este cliente no está actualmente en atención.",
            "error"
        );

        return;

    }


    /*
        Guardamos quién es
        el diseñador.
    */

    const diseñadorId =
        turno.diseñadorId;


    /*
        Registramos el pago.
    */

    turno.pagado =
        true;


    turno.estado =
        "finalizado";


    /*
        Liberamos el diseñador.
    */

    if (
        diseñadorId !== null
    ) {

        diseñadores[diseñadorId]
            .turnoId = null;

    }


    turno.diseñadorId =
        null;


    guardarDatos();

    enviarActualizacion();


    input.value = "";


    mostrarMensaje(
        `✓ Pago confirmado para ${turno.numero}. Diseñador ${diseñadorId} liberado.`,
        "exito"
    );

}


/* =========================================
   GUARDAR DATOS
========================================= */

function guardarDatos() {

    localStorage.setItem(
        "turnos",
        JSON.stringify(turnos)
    );


    localStorage.setItem(
        "diseñadores",
        JSON.stringify(diseñadores)
    );


    actualizarPantalla();

}


/* =========================================
   BROADCAST
========================================= */

function enviarActualizacion() {

    canal.postMessage({

        tipo:
            "ACTUALIZAR",

        turnos:
            turnos,

        diseñadores:
            diseñadores

    });

}


/* =========================================
   RECIBIR CAMBIOS
========================================= */

canal.onmessage =
    function(event) {

        if (
            event.data.tipo ===
            "ACTUALIZAR"
        ) {

            turnos =
                event.data.turnos;


            diseñadores =
                event.data.diseñadores;


            actualizarPantalla();

        }

    };


/* =========================================
   ACTUALIZAR TODA LA INTERFAZ
========================================= */

function actualizarPantalla() {

    actualizarCola();

    actualizarDiseñadores();

    actualizarAtencion();

    actualizarPantallaPublica();

    actualizarEstadisticas();

}


/* =========================================
   ACTUALIZAR COLA
========================================= */

function actualizarCola() {

    const contenedor =
        document.getElementById(
            "colaEspera"
        );


    const espera =
        turnos.filter(
            turno =>
                turno.estado === "espera"
        );


    contenedor.innerHTML = "";


    if (
        espera.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="vacio">

                No hay clientes esperando.

            </div>

        `;

        return;

    }


    espera.forEach(turno => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "turno";


        elemento.innerHTML = `

            <div class="informacion-turno">

                <strong>
                    ${turno.numero}
                </strong>

                <span class="codigo-turno">

                    🔐 Código:
                    ${turno.codigo}

                </span>

                <span class="diseñador-turno">

                    ${turno.fecha}

                </span>

            </div>


            <span class="estado espera">

                EN ESPERA

            </span>

        `;


        contenedor.appendChild(
            elemento
        );

    });

}


/* =========================================
   ACTUALIZAR DISEÑADORES
========================================= */

function actualizarDiseñadores() {

    actualizarDiseñador(1);

    actualizarDiseñador(2);

}


/* =========================================
   ACTUALIZAR UN DISEÑADOR
========================================= */

function actualizarDiseñador(
    diseñadorId
) {

    const diseñador =
        diseñadores[diseñadorId];


    const estado =
        document.getElementById(
            `estadoDiseñador${diseñadorId}`
        );


    const cliente =
        document.getElementById(
            `clienteDiseñador${diseñadorId}`
        );


    const boton =
        document.getElementById(
            `btnDiseñador${diseñadorId}`
        );


    /*
        Si no tiene cliente.
    */

    if (
        diseñador.turnoId === null
    ) {

        estado.textContent =
            "DISPONIBLE";


        estado.className =
            "estado disponible";


        cliente.innerHTML = `

            <p>
                Sin cliente asignado
            </p>

        `;


        boton.disabled =
            false;


        boton.textContent =
            "Atender siguiente";


        return;

    }


    /*
        Buscar cliente.
    */

    const turno =
        turnos.find(
            turno =>
                turno.id ===
                diseñador.turnoId
        );


    if (!turno) {

        diseñador.turnoId =
            null;

        return;

    }


    estado.textContent =
        "OCUPADO";


    estado.className =
        "estado ocupado";


    cliente.innerHTML = `

        <div>

            <strong>
                ${turno.numero}
            </strong>

            <br>

            <span class="codigo">
                🔐 ${turno.codigo}
            </span>

        </div>

    `;


    boton.disabled =
        true;


    boton.textContent =
        "Cliente en atención";

}


/* =========================================
   TURNOS EN ATENCIÓN
========================================= */

function actualizarAtencion() {

    const contenedor =
        document.getElementById(
            "turnosAtencion"
        );


    const atencion =
        turnos.filter(
            turno =>
                turno.estado ===
                "atencion"
        );


    contenedor.innerHTML = "";


    if (
        atencion.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="vacio">

                No hay clientes en atención.

            </div>

        `;

        return;

    }


    atencion.forEach(turno => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "turno";


        elemento.innerHTML = `

            <div class="informacion-turno">

                <strong>
                    ${turno.numero}
                </strong>

                <span class="codigo-turno">

                    🔐 Código:
                    ${turno.codigo}

                </span>

                <span class="diseñador-turno">

                    👨‍💻
                    Diseñador
                    ${turno.diseñadorId}

                </span>

            </div>


            <span class="estado atencion">

                EN ATENCIÓN

            </span>

        `;


        contenedor.appendChild(
            elemento
        );

    });

}


/* =========================================
   PANTALLA PÚBLICA
========================================= */

function actualizarPantallaPublica() {

    const contenedor =
        document.getElementById(
            "pantallaPublica"
        );


    const atencion =
        turnos.filter(
            turno =>
                turno.estado ===
                "atencion"
        );


    contenedor.innerHTML = "";


    if (
        atencion.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="vacio">

                No hay clientes en atención.

            </div>

        `;

        return;

    }


    atencion.forEach(turno => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "turno";


        elemento.innerHTML = `

            <strong>
                ${turno.numero}
            </strong>

            <span class="codigo-turno">

                Código:
                ${turno.codigo}

            </span>

            <p>

                👨‍💻 Diseñador
                ${turno.diseñadorId}

            </p>

        `;


        contenedor.appendChild(
            elemento
        );

    });

}


/* =========================================
   ESTADÍSTICAS
========================================= */

function actualizarEstadisticas() {

    const espera =
        turnos.filter(
            turno =>
                turno.estado ===
                "espera"
        ).length;


    const atencion =
        turnos.filter(
            turno =>
                turno.estado ===
                "atencion"
        ).length;


    const finalizados =
        turnos.filter(
            turno =>
                turno.estado ===
                "finalizado"
        ).length;


    document.getElementById(
        "totalEspera"
    ).textContent =
        espera;


    document.getElementById(
        "totalAtencion"
    ).textContent =
        atencion;


    document.getElementById(
        "totalFinalizados"
    ).textContent =
        finalizados;

}


/* =========================================
   MENSAJES
========================================= */

function mostrarMensaje(
    texto,
    tipo
) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    mensaje.textContent =
        texto;


    mensaje.className =
        "mensaje " + tipo;


    setTimeout(() => {

        mensaje.className =
            "mensaje";

    }, 4000);

}


/* =========================================
   INICIAR SISTEMA
========================================= */

actualizarPantalla();

