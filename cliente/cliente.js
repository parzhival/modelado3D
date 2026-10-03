

const canal = new BroadcastChannel(
    "turnos_3d"
);



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




function generarTurno() {

    let turnos = obtenerTurnos();

    

    const esperando = turnos.filter(
        turno => turno.estado === "espera"
    );

    if (esperando.length >= 3) {

        mostrarMensaje(
            "La cola está llena. Hay 3 clientes esperando.",
            "error"
        );

        return;
    }

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

    const codigo =
        generarCodigo(turnos);

    const nuevoTurno = {

        id: Date.now(),

        numero: numeroTurno,

        codigo: codigo,

        estado: "espera",

        diseñadorId: null,

        pagado: false,

        fecha: new Date().toLocaleString()

    };


    turnos.push(nuevoTurno);



    localStorage.setItem(
        "turnos_3d",
        JSON.stringify(turnos)
    );


    canal.postMessage({

        tipo: "NUEVO_TURNO",

        turno: nuevoTurno

    });


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


    document
        .getElementById("btnAgendar")
        .disabled = false;


    mostrarMensaje(
        `Turno ${nuevoTurno.numero} generado correctamente.`,
        "exito"
    );


    actualizarPantalla();

}



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

                <div class="avatar"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><use href="#i-pen-tool"/></svg></div>

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
                    <strong>
                        ${turno.codigo}
                    </strong>

                </div>

            `;

        } else {

            tarjeta.innerHTML = `

                <div class="avatar"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><use href="#i-pen-tool"/></svg></div>

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


canal.onmessage = function(event) {

    console.log(
        "Mensaje recibido:",
        event.data
    );

    if (
        event.data.tipo ===
        "ACTUALIZAR"
        ||
        event.data.tipo ===
        "NUEVO_TURNO"
    ) {

        actualizarPantalla();

    }

};


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


document
    .getElementById("btnAgendar")
    .addEventListener(
        "click",
        generarTurno
    );

actualizarPantalla();


window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "turnos_3d" ||
            event.key === "diseñadores_3d"
        ) {

            actualizarPantalla();

        }

    }
);