/* =========================================
   CANAL DE COMUNICACIÓN
========================================= */

const canal = new BroadcastChannel(
    "turnos_3d"
);


/* =========================================
   OBTENER DATOS
========================================= */

function obtenerTurnos() {

    return JSON.parse(
        localStorage.getItem("turnos_3d")
    ) || [];

}


function obtenerDiseñadores() {

    return JSON.parse(
        localStorage.getItem("diseñadores_3d")
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

}


/* =========================================
   GENERAR TURNO
========================================= */

function generarTurno() {

    let turnos = obtenerTurnos();

    /* =========================================
       CONTAR CLIENTES EN ESPERA
    ========================================= */

    const esperando = turnos.filter(
        turno => turno.estado === "espera"
    );


    /*
        Solo permitimos máximo
        3 clientes esperando.
    */

    if (esperando.length >= 3) {

        mostrarMensaje(
            "La cola está llena. Hay 3 clientes esperando.",
            "error"
        );

        return;
    }


    /* =========================================
       GENERAR NÚMERO DE TURNO
    ========================================= */

    let ultimoNumero = 0;


    turnos.forEach(turno => {

        const numero = parseInt(
            turno.numero.replace("T-", "")
        );


        if (numero > ultimoNumero) {

            ultimoNumero = numero;

        }

    });


    const numeroTurno =
        "T-" +
        String(ultimoNumero + 1)
            .padStart(3, "0");


    /* =========================================
       GENERAR CÓDIGO
    ========================================= */

    const codigo =
        generarCodigo(turnos);


    /* =========================================
       CREAR NUEVO TURNO
    ========================================= */

    const nuevoTurno = {

        id: Date.now(),

        numero: numeroTurno,

        codigo: codigo,

        estado: "espera",

        diseñadorId: null,

        pagado: false,

        fecha: new Date().toLocaleString()

    };


    /* =========================================
       AGREGAR A LA LISTA
    ========================================= */

    turnos.push(nuevoTurno);


    /* =========================================
       GUARDAR EN LOCALSTORAGE
    ========================================= */

    localStorage.setItem(
        "turnos_3d",
        JSON.stringify(turnos)
    );


    /* =========================================
       AVISAR AL ADMINISTRADOR
    ========================================= */

    canal.postMessage({

        tipo: "NUEVO_TURNO",

        turno: nuevoTurno

    });


    /* =========================================
       MOSTRAR EL TURNO GENERADO
    ========================================= */

    document
        .getElementById("informacionTurno")
        .classList
        .remove("oculto");


    document
        .getElementById("numeroTurno")
        .textContent =
        nuevoTurno.numero;


    document
        .getElementById("codigoTurno")
        .textContent =
        nuevoTurno.codigo;


    /* =========================================
       IMPORTANTE:
       NO DESHABILITAMOS EL BOTÓN
    ========================================= */

    document
        .getElementById("btnAgendar")
        .disabled = false;


    mostrarMensaje(
        `Turno ${nuevoTurno.numero} generado correctamente.`,
        "exito"
    );


    /* =========================================
       ACTUALIZAR PANTALLA
    ========================================= */

    actualizarPantalla();

}


/* =========================================
   GENERAR CÓDIGO
========================================= */

function generarCodigo(turnos) {

    const caracteres =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let codigo;


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
            turno => turno.codigo === codigo
        )
    );


    return codigo;

}


/* =========================================
   ACTUALIZAR PANTALLA
========================================= */

function actualizarPantalla() {

    const turnos = obtenerTurnos();

    const diseñadores =
        obtenerDiseñadores();


    const espera = turnos.filter(
        turno => turno.estado === "espera"
    );


    const atencion = turnos.filter(
        turno => turno.estado === "atencion"
    );


    document
        .getElementById("clientesEspera")
        .textContent =
        espera.length;


    document
        .getElementById("clientesAtencion")
        .textContent =
        atencion.length;


    mostrarDiseñadores(diseñadores);

}


/* =========================================
   MOSTRAR DISEÑADORES
========================================= */

function mostrarDiseñadores(diseñadores) {

    const contenedor =
        document.getElementById("diseñadores");


    const turnos = obtenerTurnos();


    contenedor.innerHTML = "";


    Object.keys(diseñadores).forEach(id => {

        const diseñador =
            diseñadores[id];


        const turno =
            turnos.find(
                t => t.id === diseñador.turnoId
            );


        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "diseñador";


        if (turno) {

            tarjeta.innerHTML = `

                <div class="avatar">
                    🎨
                </div>

                <div>

                    <h3>
                        ${diseñador.nombre}
                    </h3>

                    <span class="ocupado">
                        EN ATENCIÓN
                    </span>

                    <strong>
                        ${turno.numero}
                    </strong>

                </div>

            `;

        } else {

            tarjeta.innerHTML = `

                <div class="avatar">
                    🎨
                </div>

                <div>

                    <h3>
                        ${diseñador.nombre}
                    </h3>

                    <span class="disponible">
                        DISPONIBLE
                    </span>

                </div>

            `;

        }


        contenedor.appendChild(tarjeta);

    });

}


/* =========================================
   RECIBIR MENSAJES
========================================= */

canal.onmessage = function(event) {

    console.log(
        "Mensaje recibido:",
        event.data
    );


    /*
        El administrador puede
        modificar los turnos.

        Cuando eso ocurre,
        actualizamos la pantalla.
    */

    if (
        event.data.tipo ===
        "ACTUALIZAR"
    ) {

        actualizarPantalla();

    }

};


/* =========================================
   MENSAJES
========================================= */

function mostrarMensaje(
    texto,
    tipo
) {

    const mensaje =
        document.getElementById("mensaje");


    mensaje.textContent = texto;


    mensaje.className =
        "mensaje " + tipo;


    setTimeout(() => {

        mensaje.className =
            "mensaje";

    }, 3500);

}


/* =========================================
   BOTÓN
========================================= */

document
    .getElementById("btnAgendar")
    .addEventListener(
        "click",
        generarTurno
    );


/* =========================================
   INICIO
========================================= */

actualizarPantalla();