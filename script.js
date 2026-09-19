const canvas = document.getElementById("espacio");
const ctx = canvas.getContext("2d");

const inicio = document.getElementById("inicio");
const btnComenzar = document.getElementById("btnComenzar");
const escenaFecha = document.getElementById("escenaFecha");
const escenaMensaje = document.getElementById("escenaMensaje");

const entrada3d = document.getElementById("entrada3d");
const mundo3d = document.getElementById("mundo3d");
const mensajeFinal3d = document.getElementById("mensajeFinal3d");

const galaxiaInteractiva = document.getElementById("galaxiaInteractiva");
const mundoFlores = document.getElementById("mundoFlores");

const tarjetaOverlay = document.getElementById("tarjetaOverlay");
const cerrarTarjeta = document.getElementById("cerrarTarjeta");
const tarjetaImagen = document.getElementById("tarjetaImagen");
const tarjetaEmoji = document.getElementById("tarjetaEmoji");
const tarjetaTitulo = document.getElementById("tarjetaTitulo");
const tarjetaFrase = document.getElementById("tarjetaFrase");

const musicaFondo = document.getElementById("musicaFondo");

let ancho = innerWidth;
let alto = innerHeight;
let movil = false;

let estrellas = [];
let luces = [];
let petalos = [];
let nebulas = [];
let introParticulas = [];
let explosiones = [];
let introObjetos = [];
let floresObjetos = [];

let experienciaIniciada = false;
let introPreparada = false;
let dimensionPreparada = false;
let intro3dActiva = false;
let intro3dCerrando = false;
let dimensionActiva = false;
let arrastrandoMouse = false;

let tiempo = 0;
let ultimoFrame = performance.now();
let fadeMusica = null;

const mundoProfundidad = 3200;

const camara = {
    x: 0,
    y: 0,
    z: 0,
    zoom: 1
};

const camaraObjetivo = {
    x: 0,
    y: 0,
    z: 0,
    zoom: 1
};

let mouseInicioX = 0;
let mouseInicioY = 0;
let objetivoInicioX = 0;
let objetivoInicioY = 0;
let touchMode = "";
let touchStartX = 0;
let touchStartY = 0;
let pinchStartDistance = 0;
let pinchStartZ = 0;
let bloquearClickHasta = 0;

const frasesPool = [
    "Flores para ti 🌻",
    "Siempre tú ✨",
    "Qué bonito coincidir contigo",
    "Me haces sonreír",
    "Mi persona favorita",
    "Contigo todo es mejor",
    "Te quiero muchísimo",
    "Eres mi sol 🌻",
    "Mi paz",
    "Mi lugar favorito eres tú",
    "Te elegiría una y mil veces",
    "Gracias por existir 💛",
    "Mi bonita casualidad ✨",
    "Me haces bien",
    "Contigo todo florece 🌼",
    "Eres única",
    "Me gustas en todos mis días",
    "Tú haces bonito mis días",
    "Qué suerte encontrarte",
    "Mi pensamiento favorito eres tú",
    "Siempre quiero verte sonreír",
    "Mi pequeño universo",
    "Eres increíble",
    "Qué bonito tenerte",
    "Mi corazón te eligió 💛",
    "Coincidir contigo fue precioso",
    "Me haces sonreír sin esfuerzo",
    "A tu lado 💛",
    "Eres un regalo bonito",
    "Contigo todo tiene más luz",
    "Por más momentos contigo 💛",
    "Tu compañía es mi paz",
    "Mi pedacito favorito del universo",
    "Quiero muchos 21 contigo 💛",
    "Contigo hasta las estrellas ✨",
    "Tu sonrisa ilumina mis días",
    "Siempre valdrá la pena coincidir contigo",
    "Mi lugar seguro 💛",
    "Eres mi alegría",
    "Eres pura luz",
    "Donde estés tú, quiero estar yo",
    "Mi parte favorita del día",
    "Tú y yo ✨",
    "Mi corazón se queda contigo",
    "Un detalle para alguien especial",
    "Mi amor",
    "Eres mi detalle favorito",
    "Siempre juntos ✨",
    "Para ti",
    "Mi todo",
    "Tu presencia me hace feliz",
    "Conmigo siempre tú",
    "Mi vida bonita",
    "Me encanta coincidir contigo",
    "Contigo se siente bonito",
    "Tus detalles me alegran",
    "Mi rincón favorito",
    "Mi flor favorita eres tú"
];

const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));
const aleatorio = (min, max) => min + Math.random() * (max - min);

function detectarMovil(){
    movil = innerWidth <= 700 || matchMedia("(pointer:coarse)").matches;
}

function distanciaTouches(t1, t2){
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function limitesCamara(){
    return movil ? {
        x: 250,
        y: 360
    } : {
        x: 420,
        y: 300
    };
}

function limitarObjetivoCamara(){
    const limites = limitesCamara();
    camaraObjetivo.x = limitar(camaraObjetivo.x, -limites.x, limites.x);
    camaraObjetivo.y = limitar(camaraObjetivo.y, -limites.y, limites.y);
}

function ajustarCanvas(){
    detectarMovil();

    const viewport = window.visualViewport;
    ancho = Math.round(viewport?.width || innerWidth);
    alto = Math.round(viewport?.height || innerHeight);

    const dpr = Math.min(devicePixelRatio || 1, movil ? 1.1 : 1.5);

    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    canvas.style.width = `${ancho}px`;
    canvas.style.height = `${alto}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    crearEscenaCanvas();
    limitarObjetivoCamara();
}

class Estrella{
    constructor(){
        this.reset();
        this.y = Math.random() * alto;
    }

    reset(){
        this.x = Math.random() * ancho;
        this.y = -10;
        this.r = aleatorio(0.2, 1.7);
        this.v = aleatorio(0.01, 0.05);
        this.a = aleatorio(0.2, 0.8);
        this.f = Math.random() * Math.PI * 2;
    }

    actualizar(dt){
        this.y += this.v * dt * 60;
        this.f += dt * 0.75;
        if(this.y > alto + 10){
            this.reset();
        }
    }

    dibujar(){
        ctx.globalAlpha = this.a * (0.82 + Math.sin(this.f) * 0.18);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fffdf0";
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Luz{
    constructor(){
        this.x = Math.random() * ancho;
        this.y = Math.random() * alto;
        this.r = aleatorio(0.5, 2.1);
        this.f = Math.random() * Math.PI * 2;
        this.v = aleatorio(0.12, 0.3);
    }

    actualizar(dt){
        this.f += dt * this.v;
    }

    dibujar(){
        const a = 0.04 + (Math.sin(this.f) + 1) * 0.045;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffe36a";
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Petalo{
    constructor(){
        this.reset();
        this.y = Math.random() * alto;
    }

    reset(){
        this.x = Math.random() * ancho;
        this.y = -24;
        this.s = aleatorio(3, 8);
        this.vy = aleatorio(0.05, 0.17);
        this.vx = aleatorio(-0.08, 0.08);
        this.rot = Math.random() * Math.PI * 2;
        this.vr = aleatorio(-0.01, 0.01);
        this.f = Math.random() * Math.PI * 2;
        this.a = aleatorio(0.12, 0.28);
    }

    actualizar(dt){
        const f = dt * 60;
        this.y += this.vy * f;
        this.x += this.vx * f + Math.sin(this.f) * 0.06 * f;
        this.rot += this.vr * f;
        this.f += dt * 0.55;

        if(this.y > alto + 30 || this.x < -30 || this.x > ancho + 30){
            this.reset();
        }
    }

    dibujar(){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.beginPath();
        ctx.moveTo(0, -this.s);
        ctx.bezierCurveTo(this.s * 0.75, -this.s * 0.35, this.s * 0.65, this.s * 0.62, 0, this.s);
        ctx.bezierCurveTo(-this.s * 0.65, this.s * 0.62, -this.s * 0.75, -this.s * 0.35, 0, -this.s);
        ctx.fillStyle = `rgba(255, 214, 45, ${this.a})`;
        ctx.fill();
        ctx.restore();
    }
}

class Nebula{
    constructor(x, y, r, color, alpha){
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.alpha = alpha;
        this.fx = Math.random() * Math.PI * 2;
        this.fy = Math.random() * Math.PI * 2;
    }

    dibujar(){
        const x = this.x + Math.sin(tiempo * 0.09 + this.fx) * 18;
        const y = this.y + Math.cos(tiempo * 0.08 + this.fy) * 16;
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.r);
        g.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
        g.addColorStop(0.45, `rgba(${this.color}, ${this.alpha * 0.35})`);
        g.addColorStop(1, `rgba(${this.color}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, ancho, alto);
    }
}

class IntroParticula{
    constructor(){
        this.reset(true);
    }

    reset(inicial = false){
        const ang = Math.random() * Math.PI * 2;
        const radio = 80 + Math.random() * Math.max(ancho, alto) * 0.7;
        this.x = Math.cos(ang) * radio;
        this.y = Math.sin(ang) * radio * 0.82;
        this.z = inicial ? aleatorio(-2450, 700) : -2450;
        this.v = aleatorio(170, 330);
        this.r = aleatorio(0.4, 1.8);
        this.a = aleatorio(0.18, 0.58);
        this.color = Math.random() > 0.28 ? "#ffe16a" : "#fff9d8";
    }

    actualizar(dt){
        this.z += this.v * dt;
        if(this.z > 720){
            this.reset();
        }
    }

    dibujar(){
        const focal = 760;
        const p = focal / (focal - this.z);
        if(p <= 0){
            return;
        }

        const x = ancho / 2 + this.x * p;
        const y = alto / 2 + this.y * p;

        if(x < -50 || x > ancho + 50 || y < -50 || y > alto + 50){
            return;
        }

        const entrada = limitar((this.z + 2450) / 500, 0, 1);
        const salida = limitar((720 - this.z) / 300, 0, 1);
        ctx.globalAlpha = this.a * entrada * salida;
        ctx.beginPath();
        ctx.arc(x, y, this.r * Math.max(0.4, p * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Explosion{
    constructor(x, y){
        this.p = [];
        const total = movil ? 12 : 20;

        for(let i = 0; i < total; i++){
            const a = Math.random() * Math.PI * 2;
            const v = aleatorio(0.5, 2.1);
            this.p.push({
                x,
                y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v,
                life: 1,
                r: aleatorio(1, 2.3)
            });
        }
    }

    actualizar(dt){
        const f = dt * 60;
        this.p.forEach(p => {
            p.x += p.vx * f;
            p.y += p.vy * f;
            p.vx *= Math.pow(0.98, f);
            p.vy *= Math.pow(0.98, f);
            p.life -= 0.026 * f;
        });
        this.p = this.p.filter(p => p.life > 0);
    }

    dibujar(){
        this.p.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "#ffe76a";
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
}

function crearEscenaCanvas(){
    estrellas = [];
    luces = [];
    petalos = [];
    nebulas = [];
    introParticulas = [];

    const totalEstrellas = movil ? 170 : 330;
    const totalLuces = movil ? 58 : 100;
    const totalPetalos = movil ? 28 : 54;
    const totalIntro = movil ? 220 : 390;

    for(let i = 0; i < totalEstrellas; i++){
        estrellas.push(new Estrella());
    }

    for(let i = 0; i < totalLuces; i++){
        luces.push(new Luz());
    }

    for(let i = 0; i < totalPetalos; i++){
        petalos.push(new Petalo());
    }

    for(let i = 0; i < totalIntro; i++){
        introParticulas.push(new IntroParticula());
    }

    nebulas.push(new Nebula(ancho * 0.18, alto * 0.2, Math.max(ancho, alto) * (movil ? 0.18 : 0.22), "60,80,180", 0.065));
    nebulas.push(new Nebula(ancho * 0.83, alto * 0.3, Math.max(ancho, alto) * (movil ? 0.16 : 0.19), "110,60,135", 0.05));
    nebulas.push(new Nebula(ancho * 0.5, alto * 0.72, Math.max(ancho, alto) * (movil ? 0.22 : 0.26), "255,185,20", 0.065));
}

function obtenerFloresBase(){
    return [...document.querySelectorAll(".dato-flor")].map(el => ({
        titulo: el.dataset.titulo,
        etiqueta: el.dataset.etiqueta,
        emoji: el.dataset.emoji,
        frase: el.dataset.frase,
        imagenFlor: el.querySelector(".imagen-flor")?.getAttribute("src")?.trim() || "",
        imagenTarjeta: el.querySelector(".imagen-tarjeta")?.getAttribute("src")?.trim() || "",
        altFlor: el.querySelector(".imagen-flor")?.getAttribute("alt") || "",
        altTarjeta: el.querySelector(".imagen-tarjeta")?.getAttribute("alt") || ""
    }));
}

function obtenerImagenesIntro(){
    return [...document.querySelectorAll(".dato-intro")].map(el => ({
        src: el.dataset.src?.trim() || "",
        emoji: el.dataset.emoji || "🌻"
    }));
}

function crearPosicionIntro(slot, total, z){
    const columnas = movil ? 5 : 8;
    const filas = Math.ceil(total / columnas);
    const columna = slot % columnas;
    const fila = Math.floor(slot / columnas) % filas;
    const nx = columnas === 1 ? 0 : (columna / (columnas - 1)) * 2 - 1;
    const ny = filas === 1 ? 0 : (fila / (filas - 1)) * 2 - 1;
    const objetivoX = ancho / 2 + nx * ancho * 0.42 + aleatorio(-ancho * 0.02, ancho * 0.02);
    const objetivoY = alto / 2 + ny * alto * 0.43 + aleatorio(-alto * 0.02, alto * 0.02);
    const focal = 760;
    const p = focal / (focal - z);

    return {
        x: (objetivoX - ancho / 2) / p,
        y: (objetivoY - alto / 2) / p
    };
}

function crearIntro3d(){
    mundo3d.innerHTML = "";
    introObjetos = [];

    const imagenes = obtenerImagenesIntro();
    const totalFrases = movil ? 128 : 196;
    const totalFlores = movil ? 22 : 34;

    for(let i = 0; i < totalFrases; i++){
        const el = document.createElement("span");
        const frase = frasesPool[i % frasesPool.length];
        const tipoGrande = i % 14 === 0;
        const tipoMedio = i % 4 === 0;
        const progreso = i / Math.max(1, totalFrases - 1);
        const z = -2640 + progreso * 3160 + aleatorio(-70, 70);
        const posicion = crearPosicionIntro(i, totalFrases, z);

        el.className = "item-3d frase";
        if(tipoGrande){
            el.classList.add("frase-grande");
        }else if(tipoMedio){
            el.classList.add("frase-media");
        }
        el.textContent = frase;
        el.style.fontSize = `${tipoGrande ? (movil ? 24 : 38) : tipoMedio ? (movil ? 16 : 24) : (movil ? 11.5 : 16)}px`;

        introObjetos.push({
            el,
            tipo: "frase",
            slot: i,
            total: totalFrases,
            x: posicion.x,
            y: posicion.y,
            z,
            v: aleatorio(110, 178),
            rot: aleatorio(-4, 4)
        });

        mundo3d.appendChild(el);
    }

    for(let i = 0; i < totalFlores; i++){
        const info = imagenes[i % imagenes.length] || { src: "", emoji: "🌻" };
        const el = document.createElement("div");
        const emoji = document.createElement("span");
        const tamano = movil ? aleatorio(56, 108) : aleatorio(74, 138);
        const progreso = i / Math.max(1, totalFlores - 1);
        const z = -2480 + progreso * 3000 + aleatorio(-80, 80);
        const posicion = crearPosicionIntro((i * 5 + 3) % totalFrases, totalFrases, z);

        el.className = "item-3d flor";
        el.style.width = `${tamano}px`;
        el.style.height = `${tamano}px`;

        emoji.className = "flor-emoji-3d";
        emoji.textContent = info.emoji;
        el.appendChild(emoji);

        if(info.src){
            const img = document.createElement("img");
            img.src = info.src;
            img.alt = "";
            img.onload = () => {
                emoji.style.display = "none";
            };
            img.onerror = () => img.remove();
            el.appendChild(img);
        }

        introObjetos.push({
            el,
            tipo: "flor",
            slot: (i * 5 + 3) % totalFrases,
            total: totalFrases,
            x: posicion.x,
            y: posicion.y,
            z,
            v: aleatorio(104, 166),
            rot: aleatorio(-8, 8)
        });

        mundo3d.appendChild(el);
    }

    introPreparada = true;
}

function actualizarIntro3d(dt){
    if(!intro3dActiva){
        return;
    }

    introParticulas.forEach(p => {
        p.actualizar(dt);
        p.dibujar();
    });

    introObjetos.forEach(obj => {
        obj.z += obj.v * dt * (intro3dCerrando ? 0.78 : 1);

        if(obj.z > 720){
            obj.z = -2450 - aleatorio(0, 240);
            obj.slot = (obj.slot + (movil ? 11 : 17)) % obj.total;
            const posicion = crearPosicionIntro(obj.slot, obj.total, obj.z);
            obj.x = posicion.x;
            obj.y = posicion.y;
        }

        const focal = 760;
        const p = focal / (focal - obj.z);
        const x = ancho / 2 + obj.x * p;
        const y = alto / 2 + obj.y * p;
        const entrada = limitar((obj.z + 2450) / 420, 0, 1);
        const salida = limitar((720 - obj.z) / 260, 0, 1);
        const op = entrada * salida;

        obj.el.style.opacity = op;
        obj.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${p}) rotate(${obj.rot}deg)`;
    });
}

function mostrarEscena(escena){
    document.querySelectorAll(".escena").forEach(el => el.classList.remove("activa"));
    if(escena){
        escena.classList.add("activa");
    }
}

function iniciarMusicaSuave(){
    if(fadeMusica){
        cancelAnimationFrame(fadeMusica);
    }

    musicaFondo.volume = 0;

    musicaFondo.play().then(() => {
        const inicioFade = performance.now();
        const duracion = 4000;
        const volumenFinal = 0.35;

        function subir(ahora){
            const progreso = Math.min((ahora - inicioFade) / duracion, 1);
            const suavizado = 1 - Math.pow(1 - progreso, 3);
            musicaFondo.volume = volumenFinal * suavizado;

            if(progreso < 1){
                fadeMusica = requestAnimationFrame(subir);
            }else{
                fadeMusica = null;
            }
        }

        fadeMusica = requestAnimationFrame(subir);
    }).catch(() => {});
}

function prepararIntroEnSegundoPlano(){
    const preparar = () => {
        if(!introPreparada){
            crearIntro3d();
        }
    };

    if("requestIdleCallback" in window){
        requestIdleCallback(preparar, { timeout: 1300 });
    }else{
        setTimeout(preparar, 800);
    }
}

function prepararDimensionEnSegundoPlano(){
    const preparar = () => {
        if(!dimensionPreparada){
            crearDimensionFlores();
        }
    };

    if("requestIdleCallback" in window){
        requestIdleCallback(preparar, { timeout: 1800 });
    }else{
        setTimeout(preparar, 900);
    }
}

function iniciarExperiencia(){
    if(experienciaIniciada){
        return;
    }

    experienciaIniciada = true;
    iniciarMusicaSuave();
    inicio.classList.add("oculto");
    prepararIntroEnSegundoPlano();

    setTimeout(() => mostrarEscena(escenaFecha), 650);
    setTimeout(() => mostrarEscena(escenaMensaje), 4200);
    setTimeout(() => {
        iniciarSecuencia3d();
    }, 7600);
    setTimeout(() => {
        mostrarEscena(null);
    }, 8600);
}

function iniciarSecuencia3d(){
    if(!introPreparada){
        crearIntro3d();
    }

    intro3dActiva = true;
    intro3dCerrando = false;
    entrada3d.classList.remove("saliendo");
    entrada3d.classList.add("activa");
    mundo3d.classList.remove("apagando", "suave");

    setTimeout(() => {
        prepararDimensionEnSegundoPlano();
    }, 3200);

    setTimeout(() => {
        intro3dCerrando = true;
        mundo3d.classList.add("suave");
        mensajeFinal3d.classList.add("activo");
    }, 13800);

    setTimeout(() => {
        entrarDimensionFlores();
    }, 17600);

    setTimeout(() => {
        entrada3d.classList.add("saliendo");
    }, 18300);

    setTimeout(() => {
        intro3dActiva = false;
        entrada3d.classList.remove("activa", "saliendo");
        mundo3d.classList.remove("suave");
        mensajeFinal3d.classList.remove("activo");
    }, 19600);
}

function crearFlorVisual(data){
    const boton = document.createElement("button");
    const contenedor = document.createElement("span");
    let inicioTap = null;

    boton.className = "dimension-flor";
    contenedor.className = "flor-contenedor";

    if(data.imagenFlor){
        const img = document.createElement("img");
        img.className = "flor-imagen";
        img.src = data.imagenFlor;
        img.alt = data.altFlor;
        img.onerror = () => {
            contenedor.innerHTML = `<span class="flor-emoji">${data.emoji}</span>`;
        };
        contenedor.appendChild(img);
    }else{
        contenedor.innerHTML = `<span class="flor-emoji">${data.emoji}</span>`;
    }

    boton.appendChild(contenedor);

    boton.addEventListener("pointerdown", e => {
        inicioTap = {
            x: e.clientX,
            y: e.clientY,
            t: performance.now()
        };
        e.stopPropagation();
    });

    boton.addEventListener("pointerup", e => {
        e.stopPropagation();
        if(!inicioTap){
            return;
        }

        const recorrido = Math.hypot(e.clientX - inicioTap.x, e.clientY - inicioTap.y);
        const duracion = performance.now() - inicioTap.t;
        if(recorrido < 12 && duracion < 350 && performance.now() >= bloquearClickHasta){
            abrirTarjeta(data);
        }
        inicioTap = null;
    });

    boton.addEventListener("pointercancel", () => {
        inicioTap = null;
    });

    boton.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
    });

    return boton;
}

function crearDimensionFlores(){
    mundoFlores.innerHTML = "";
    floresObjetos = [];

    const bases = obtenerFloresBase();
    const capas = movil ? 10 : 12;
    const porCapa = movil ? 11 : 12;
    const totalFlores = capas * porCapa;
    const limiteX = movil ? 620 : 950;
    const limiteY = movil ? 1050 : 760;
    const spanX = limiteX * 2.6;
    const spanY = limiteY * 2.3;

    for(let i = 0; i < totalFlores; i++){
        const data = bases[i % bases.length];
        const el = crearFlorVisual(data);
        const capa = Math.floor(i / porCapa);
        const pos = i % porCapa;
        const angulo = pos / porCapa * Math.PI * 2 + capa * 0.36;
        const radio = 0.15 + (pos / Math.max(1, porCapa - 1)) * 0.95;
        const zBase = 180 + capa * ((mundoProfundidad - 320) / Math.max(1, capas - 1));
        const size = capa < 2 ? aleatorio(0.98, 1.24) : aleatorio(0.76, 1.06);

        floresObjetos.push({
            tipo: "flor",
            el,
            data,
            x: Math.cos(angulo) * limiteX * radio + aleatorio(-120, 120),
            y: Math.sin(angulo) * limiteY * radio + aleatorio(-150, 150),
            z: zBase + aleatorio(-140, 140),
            baseScale: size,
            sway: Math.random() * Math.PI * 2,
            rot: aleatorio(-7, 7),
            spanX,
            spanY
        });

        mundoFlores.appendChild(el);
    }

    camara.x = 0;
    camara.y = 0;
    camara.z = 0;
    camara.zoom = 1;
    camaraObjetivo.x = 0;
    camaraObjetivo.y = 0;
    camaraObjetivo.z = 0;
    camaraObjetivo.zoom = 1;
    dimensionPreparada = true;
}

function entrarDimensionFlores(){
    if(!dimensionPreparada){
        crearDimensionFlores();
    }

    dimensionActiva = true;
    galaxiaInteractiva.classList.add("activa");
    crearExplosion(ancho / 2, alto / 2);
}

function normalizarProfundidad(){
    while(camaraObjetivo.z < 0){
        camaraObjetivo.z += mundoProfundidad;
        camara.z += mundoProfundidad;
    }

    while(camaraObjetivo.z >= mundoProfundidad){
        camaraObjetivo.z -= mundoProfundidad;
        camara.z -= mundoProfundidad;
    }
}

function actualizarCamara(dt){
    limitarObjetivoCamara();
    normalizarProfundidad();

    const suavidad = 1 - Math.exp(-10 * dt);
    camara.x += (camaraObjetivo.x - camara.x) * suavidad;
    camara.y += (camaraObjetivo.y - camara.y) * suavidad;
    camara.z += (camaraObjetivo.z - camara.z) * suavidad;
    camara.zoom += (camaraObjetivo.zoom - camara.zoom) * suavidad;
}

function envolverObjetoEnPlano(obj){
    if(obj.spanX){
        while(obj.x - camara.x > obj.spanX / 2){
            obj.x -= obj.spanX;
        }
        while(obj.x - camara.x < -obj.spanX / 2){
            obj.x += obj.spanX;
        }
    }

    if(obj.spanY){
        while(obj.y - camara.y > obj.spanY / 2){
            obj.y -= obj.spanY;
        }
        while(obj.y - camara.y < -obj.spanY / 2){
            obj.y += obj.spanY;
        }
    }
}

function proyectar(obj){
    envolverObjetoEnPlano(obj);
    let profundidad = obj.z - camara.z;

    while(profundidad < 65){
        obj.z += mundoProfundidad;
        profundidad = obj.z - camara.z;
    }

    while(profundidad > mundoProfundidad + 180){
        obj.z -= mundoProfundidad;
        profundidad = obj.z - camara.z;
    }

    const focal = movil ? 600 : 760;
    const p = focal / profundidad * camara.zoom;
    const balanceX = (obj.x - camara.x) * p;
    const balanceY = (obj.y - camara.y + Math.sin(tiempo * 0.8 + obj.sway) * 15) * p;

    return {
        x: ancho / 2 + balanceX,
        y: alto / 2 + balanceY,
        p,
        profundidad
    };
}

function renderDimension(dt){
    actualizarCamara(dt);

    floresObjetos.forEach(obj => {
        const pro = proyectar(obj);
        const visible = pro.profundidad > 45 && pro.profundidad < mundoProfundidad + 260 && pro.x > -320 && pro.x < ancho + 320 && pro.y > -320 && pro.y < alto + 320;

        if(!visible){
            obj.el.style.opacity = "0";
            return;
        }

        const fadeNear = limitar((pro.profundidad - 45) / 100, 0, 1);
        const fadeFar = 1 - limitar((pro.profundidad - (mundoProfundidad - 420)) / 560, 0, 1);
        const opacity = limitar(fadeNear * fadeFar, 0, 1);
        const scale = Math.min(obj.baseScale * pro.p, 4.6);
        const zIndex = Math.round(100000 - pro.profundidad);

        obj.el.style.opacity = String(opacity);
        obj.el.style.zIndex = String(zIndex);
        obj.el.style.transform = `translate3d(${pro.x}px, ${pro.y}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${obj.rot}deg)`;
        obj.el.style.filter = `brightness(${0.82 + Math.min(pro.p, 2.4) * 0.2}) saturate(${1 + Math.min(pro.p, 2.4) * 0.08})`;
    });
}

function abrirTarjeta(data){
    tarjetaTitulo.textContent = data.titulo;
    tarjetaFrase.textContent = data.frase;

    tarjetaImagen.style.display = "none";
    tarjetaEmoji.style.display = "none";
    tarjetaImagen.removeAttribute("src");

    if(data.imagenTarjeta){
        tarjetaImagen.src = data.imagenTarjeta;
        tarjetaImagen.alt = data.altTarjeta;

        tarjetaImagen.onload = () => {
            tarjetaImagen.style.display = "block";
            tarjetaEmoji.style.display = "none";
        };

        tarjetaImagen.onerror = () => {
            tarjetaImagen.style.display = "none";
            tarjetaEmoji.style.display = "block";
            tarjetaEmoji.textContent = "💛";
        };
    }else{
        tarjetaEmoji.style.display = "block";
        tarjetaEmoji.textContent = "💛";
    }

    tarjetaOverlay.classList.add("activa");
}

function cerrarTarjetaFn(){
    tarjetaOverlay.classList.remove("activa");
}

function crearExplosion(x, y){
    explosiones.push(new Explosion(x, y));
}

function animar(ahora){
    const dt = Math.min((ahora - ultimoFrame) / 1000, 0.033);
    ultimoFrame = ahora;
    tiempo += dt;

    ctx.clearRect(0, 0, ancho, alto);

    nebulas.forEach(n => n.dibujar());

    estrellas.forEach(e => {
        e.actualizar(dt);
        e.dibujar();
    });

    luces.forEach(l => {
        l.actualizar(dt);
        l.dibujar();
    });

    petalos.forEach(p => {
        p.actualizar(dt);
        p.dibujar();
    });

    actualizarIntro3d(dt);

    if(dimensionActiva){
        renderDimension(dt);
    }

    explosiones.forEach(ex => {
        ex.actualizar(dt);
        ex.dibujar();
    });

    explosiones = explosiones.filter(ex => ex.p.length);

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click", iniciarExperiencia);

cerrarTarjeta.addEventListener("click", cerrarTarjetaFn);

tarjetaOverlay.addEventListener("click", e => {
    if(e.target === tarjetaOverlay){
        cerrarTarjetaFn();
    }
});

galaxiaInteractiva.addEventListener("mousedown", e => {
    if(movil || !dimensionActiva){
        return;
    }

    if(e.target.closest(".tarjeta") || e.target.closest(".dimension-flor")){
        return;
    }

    arrastrandoMouse = true;
    document.body.classList.add("arrastrando");
    mouseInicioX = e.clientX;
    mouseInicioY = e.clientY;
    objetivoInicioX = camaraObjetivo.x;
    objetivoInicioY = camaraObjetivo.y;
});

window.addEventListener("mousemove", e => {
    if(!arrastrandoMouse){
        return;
    }

    const dx = e.clientX - mouseInicioX;
    const dy = e.clientY - mouseInicioY;
    if(Math.hypot(dx, dy) > 7){
        bloquearClickHasta = performance.now() + 250;
    }
    camaraObjetivo.x = objetivoInicioX - dx * 1.55;
    camaraObjetivo.y = objetivoInicioY - dy * 1.55;
    limitarObjetivoCamara();
});

window.addEventListener("mouseup", () => {
    arrastrandoMouse = false;
    document.body.classList.remove("arrastrando");
});

galaxiaInteractiva.addEventListener("touchstart", e => {
    if(!dimensionActiva){
        return;
    }

    if(e.target.closest(".dimension-flor")){
        touchMode = "";
        return;
    }

    if(e.touches.length >= 2){
        touchMode = "pinch";
        pinchStartDistance = distanciaTouches(e.touches[0], e.touches[1]);
        pinchStartZ = camaraObjetivo.z;
        e.preventDefault();
        return;
    }

    if(e.target.closest(".tarjeta")){
        return;
    }

    touchMode = "drag";
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    objetivoInicioX = camaraObjetivo.x;
    objetivoInicioY = camaraObjetivo.y;
}, { passive: false });

galaxiaInteractiva.addEventListener("touchmove", e => {
    if(!dimensionActiva){
        return;
    }

    if(e.touches.length >= 2){
        const distancia = distanciaTouches(e.touches[0], e.touches[1]);

        if(touchMode !== "pinch"){
            touchMode = "pinch";
            pinchStartDistance = distancia;
            pinchStartZ = camaraObjetivo.z;
        }

        const delta = distancia - pinchStartDistance;
        camaraObjetivo.z = pinchStartZ + delta * 5.2;
        e.preventDefault();
        return;
    }

    if(touchMode === "drag" && e.touches.length === 1){
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if(Math.hypot(dx, dy) > 7){
            bloquearClickHasta = performance.now() + 300;
        }
        camaraObjetivo.x = objetivoInicioX - dx * 1.7;
        camaraObjetivo.y = objetivoInicioY - dy * 1.7;
        limitarObjetivoCamara();
        e.preventDefault();
    }
}, { passive: false });

galaxiaInteractiva.addEventListener("touchend", e => {
    if(e.touches.length >= 2){
        touchMode = "pinch";
        pinchStartDistance = distanciaTouches(e.touches[0], e.touches[1]);
        pinchStartZ = camaraObjetivo.z;
        return;
    }

    if(e.touches.length === 1){
        touchMode = "drag";
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        objetivoInicioX = camaraObjetivo.x;
        objetivoInicioY = camaraObjetivo.y;
        return;
    }

    touchMode = "";
});

galaxiaInteractiva.addEventListener("touchcancel", () => {
    touchMode = "";
});

window.addEventListener("wheel", e => {
    if(!dimensionActiva || movil){
        return;
    }

    e.preventDefault();
    camaraObjetivo.z -= e.deltaY * 1.45;
}, { passive: false });

galaxiaInteractiva.addEventListener("click", e => {
    if(!dimensionActiva){
        return;
    }

    if(e.target.closest(".dimension-flor, .tarjeta")){
        return;
    }

    if(performance.now() < bloquearClickHasta){
        return;
    }

    crearExplosion(e.clientX, e.clientY);
});

galaxiaInteractiva.addEventListener("dblclick", () => {
    camaraObjetivo.x = 0;
    camaraObjetivo.y = 0;
});

window.addEventListener("keydown", e => {
    if(e.key === "Escape"){
        cerrarTarjetaFn();
    }

    if(e.key === "+"){
        camaraObjetivo.z += 220;
    }

    if(e.key === "-"){
        camaraObjetivo.z -= 220;
    }
});

window.addEventListener("resize", ajustarCanvas);
window.visualViewport?.addEventListener("resize", ajustarCanvas);

ajustarCanvas();
requestAnimationFrame(animar);
