let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const botonIniciar = document.getElementById("iniciar");
botonIniciar.addEventListener("click", iniciar);
let reiniciarBoton = document.getElementById("reiniciar");
reiniciarBoton.addEventListener("click", reiniciar);

let iniciado = false;

let personas = [];
let num_personas = 100;
let fps = 60;

let tiempo_vida = 5;
let radio_infeccion = 5;
let radio_busqueda = 50;
let velocidad_infectado = 2;

let numPersonas = document.getElementById("numPersonas");
numPersonas.addEventListener("change", (e) => {
  num_personas = parseInt(e.target.value);
});
let tiempoInfectado = document.getElementById("tiempoInfectado");
tiempoInfectado.addEventListener("change", (e) => {
  tiempo_vida = parseInt(e.target.value);
});
let radioInfeccion = document.getElementById("radioInfeccion");
radioInfeccion.addEventListener("change", (e) => {
  radio_infeccion = parseInt(e.target.value);
});
let radioBusqueda = document.getElementById("radioBusqueda");
radioBusqueda.addEventListener("change", (e) => {
  radio_busqueda = parseInt(e.target.value);
});
let velocidadInfectado = document.getElementById("velocidadInfectado");
velocidadInfectado.addEventListener("change", (e) => {
  velocidad_infectado = parseInt(e.target.value);
});

let iconoIniciar = document.querySelector(".fa-solid.fa-play");

class Persona {
  constructor(x, y, vx, vy, estado, radio) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.estado = estado; // sano, enfermo o muerto
    this.tiempo_enfermo = 0; // tiempo que lleva enfermo
    this.radio = radio;
    this.objetivo = null;
  }

  actualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.rebotar();
    if (this.estado === "enfermo") {
      this.tiempo_enfermo++;
      if (this.tiempo_enfermo >= tiempo_vida * fps) {
        // Si está enfermo por más de *tiempo_vida* segundos
        this.estado = "muerto";
      }
    }

    if (this.estado === "muerto") {
      this.radio = 0;
    }
  }

  rebotar() {
    if (this.x - this.radio < 0 || this.x + this.radio > canvas.width) {
      this.vx *= -1;
    }
    if (this.y - this.radio < 0 || this.y + this.radio > canvas.height) {
      this.vy *= -1;
    }
  }

  dibujar() {
    if (this.estado === "sano") {
      ctx.fillStyle = "green";
    } else if (this.estado === "enfermo") {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fill();
  }
}

function iniciar() {
  if (iniciado) {
    // iniciado = false;
    // iconoIniciar.classList.replace("fa-stop", "fa-play");
    window.location.reload();
    return;
  }

  iniciado = true;
  personas = [];
  toggleInputs();
  reiniciar();

  iconoIniciar.classList.replace("fa-play", "fa-stop");

  function dibujarPersonas() {
    for (let i = 0; i < personas.length; i++) {
      let persona = personas[i];
      ctx.beginPath();
      ctx.arc(persona.x, persona.y, persona.radio, 0, 2 * Math.PI);
      if (persona.estado === "sano") {
        ctx.fillStyle = "white";
      } else if (persona.estado === "enfermo") {
        ctx.fillStyle = "green";
      }
      ctx.fill();
    }
  }

  function distancia(persona1, persona2) {
    let dx = persona1.x - persona2.x;
    let dy = persona1.y - persona2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function actualizarPersonas() {
    if (!iniciado) return;
    let infectados_cercanos = [];
    for (let i = 0; i < personas.length; i++) {
      if (personas[i].estado === "enfermo") {
        infectados_cercanos.push(personas[i]);
      }
    }

    for (let i = 0; i < personas.length; i++) {
      personas[i].actualizar();

      if (personas[i].estado === "enfermo") {
        for (let j = 0; j < personas.length; j++) {
          if (i !== j) {
            if (
              distancia(personas[i], personas[j]) < radio_infeccion &&
              personas[j].estado === "sano"
            ) {
              personas[j].estado = "enfermo";
            } else if (
              distancia(personas[i], personas[j]) < radio_busqueda &&
              personas[j].estado === "sano"
            ) {
              if (
                personas[i].objetivo == null ||
                personas[i].objetivo.estado !== "sano"
              ) {
                // buscar nuevo objetivo
                let objetivos_posibles = personas.filter(
                  (p) =>
                    p.estado === "sano" &&
                    distancia(personas[i], p) < radio_busqueda
                );
                if (objetivos_posibles.length > 0) {
                  let indice_objetivo = Math.floor(
                    Math.random() * objetivos_posibles.length
                  );
                  personas[i].objetivo = objetivos_posibles[indice_objetivo];
                }
              }
              if (personas[i].objetivo != null) {
                let direccion_x = personas[i].objetivo.x - personas[i].x;
                let direccion_y = personas[i].objetivo.y - personas[i].y;
                let distancia_total = Math.sqrt(
                  direccion_x * direccion_x + direccion_y * direccion_y
                );
                direccion_x /= distancia_total;
                direccion_y /= distancia_total;
                personas[i].vx = direccion_x * velocidad_infectado;
                personas[i].vy = direccion_y * velocidad_infectado;
              }
            }
          }
        }
      }
      if (
        personas[i].estado === "enfermo" &&
        personas[i].tiempo_enfermo >= 10 * fps
      ) {
        personas[i].estado = "muerto";
      }
    }
  }

  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actualizarPersonas();
    dibujarPersonas();
    requestAnimationFrame(animar);
  }

  animar();
}

function reiniciar() {
  personas = [];
  for (let i = 0; i < num_personas; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let vx = Math.random() * 4 - 2;
    let vy = Math.random() * 4 - 2;
    let estado = "sano";
    let radio = radio_infeccion;
    personas.push(new Persona(x, y, vx, vy, estado, radio));
  }

  let x_inicial = Math.random() * canvas.width;
  let y_inicial = Math.random() * canvas.height;
  let vx_inicial = Math.random() * 4 - 2;
  let vy_inicial = Math.random() * 4 - 2;
  let radio_inicial = radio_infeccion;
  let persona_enferma = new Persona(
    x_inicial,
    y_inicial,
    vx_inicial,
    vy_inicial,
    "enfermo",
    radio_inicial
  );

  personas.push(persona_enferma);
}

function toggleInputs() {
  if (iniciado) {
    numPersonas = document.getElementById("numPersonas").disabled = true;
    tiempoInfectado = document.getElementById(
      "tiempoInfectado"
    ).disabled = true;
    radioInfeccion = document.getElementById("radioInfeccion").disabled = true;
    radioBusqueda = document.getElementById("radioBusqueda").disabled = true;
    velocidadInfectado = document.getElementById(
      "velocidadInfectado"
    ).disabled = true;
  } else {
    numPersonas = document.getElementById("numPersonas").disabled = false;
    tiempoInfectado = document.getElementById(
      "tiempoInfectado"
    ).disabled = false;
    radioInfeccion = document.getElementById("radioInfeccion").disabled = false;
    radioBusqueda = document.getElementById("radioBusqueda").disabled = false;
    velocidadInfectado = document.getElementById(
      "velocidadInfectado"
    ).disabled = false;
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth / 1.5;
  canvas.height = window.innerHeight / 1.5;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
