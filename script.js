const canvas=document.getElementById("espacio");
const ctx=canvas.getContext("2d");

const inicio=document.getElementById("inicio");
const btnComenzar=document.getElementById("btnComenzar");
const escenaFecha=document.getElementById("escenaFecha");
const escenaMensaje=document.getElementById("escenaMensaje");

const entrada3d=document.getElementById("entrada3d");
const mundo3d=document.getElementById("mundo3d");
const mensajeFinal3d=document.getElementById("mensajeFinal3d");

const galaxiaInteractiva=document.getElementById("galaxiaInteractiva");
const orbitas=document.getElementById("orbitas");
const textoCorazon=document.getElementById("textoCorazon");
const textoCentro=document.getElementById("textoCentro");
const centroVisual=document.getElementById("centroVisual");
const imagenCentroVisible=document.getElementById("imagenCentroVisible");

const tarjetaOverlay=document.getElementById("tarjetaOverlay");
const cerrarTarjeta=document.getElementById("cerrarTarjeta");
const tarjetaImagen=document.getElementById("tarjetaImagen");
const tarjetaEmoji=document.getElementById("tarjetaEmoji");
const tarjetaTitulo=document.getElementById("tarjetaTitulo");
const tarjetaFrase=document.getElementById("tarjetaFrase");

const musicaFondo=document.getElementById("musicaFondo");

let ancho=innerWidth;
let alto=innerHeight;
let movil=false;

let estrellas=[];
let luces=[];
let petalos=[];
let polvoCosmico=[];
let particulasIntro=[];
let chispasCorazon=[];
let explosiones=[];
let floresUI=[];
let objetos3d=[];

let experienciaIniciada=false;
let intro3dActiva=false;
let introCerrando=false;
let modoGalaxia=false;
let arrastrandoMouse=false;

let tiempo=0;
let orbitaAutomatica=0;
let ultimoFrame=performance.now();
let fadeMusica=null;
let efectoCentroHasta=0;

let camara={
    zoom:1,
    rotacion:0,
    inclinacion:-.28
};

let mouseInicioX=0;
let mouseInicioY=0;
let mouseRotacionInicio=0;
let mouseInclinacionInicio=0;

let touchMode="";
let touchStartX=0;
let touchStartY=0;
let touchRotStart=0;
let touchTiltStart=0;
let pinchStartDistance=0;
let pinchStartZoom=1;

const frases3d=[
    "Qué bonito coincidir contigo",
    "Siempre tú ✨",
    "Gracias por existir 💛",
    "Mi persona favorita",
    "Me haces sonreír",
    "Eres mi sol 🌻",
    "Contigo todo es mejor",
    "Te elegiría una y mil veces",
    "Mi bonita casualidad ✨",
    "Mi paz",
    "Mi lugar favorito eres tú",
    "Eres pura luz",
    "Qué suerte encontrarte",
    "Tú haces bonito mis días",
    "Mi pequeño universo",
    "Te quiero muchísimo"
];

function limitar(valor,min,max){
    return Math.max(min,Math.min(max,valor));
}

function detectarMovil(){
    movil=innerWidth<=700||matchMedia("(pointer:coarse)").matches;
}

function distanciaTouches(t1,t2){
    return Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY);
}

function ajustarCanvas(){
    detectarMovil();

    const viewport=window.visualViewport;

    ancho=Math.round(viewport?.width||innerWidth);
    alto=Math.round(viewport?.height||innerHeight);

    const dpr=movil?1:Math.min(devicePixelRatio||1,1.5);

    canvas.width=Math.round(ancho*dpr);
    canvas.height=Math.round(alto*dpr);
    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    crearEscena();

    if(movil){
        camara.zoom=limitar(camara.zoom,.78,1.45);
    }
}
class Estrella{
    constructor(){
        this.reset();
        this.y=Math.random()*alto;
    }

    reset(){
        this.x=Math.random()*ancho;
        this.y=-10;
        this.radio=Math.random()*1.5+.2;
        this.velocidad=Math.random()*.045+.01;
        this.alpha=Math.random()*.65+.15;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y+=this.velocidad*dt*60;
        this.fase+=dt*.7;
        if(this.y>alto+10)this.reset();
    }

    dibujar(){
        const alpha=this.alpha*(.82+Math.sin(this.fase)*.18);

        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,240,${alpha})`;
        ctx.fill();
    }
}

class Luz{
    constructor(){
        this.reset();
        this.y=Math.random()*alto;
    }

    reset(){
        this.x=Math.random()*ancho;
        this.y=alto+15;
        this.radio=Math.random()*1.7+.35;
        this.velocidad=Math.random()*.17+.04;
        this.alpha=Math.random()*.25+.06;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y-=this.velocidad*dt*60;
        this.fase+=dt*.6;
        this.x+=Math.sin(this.fase)*.07*dt*60;
        if(this.y<-15)this.reset();
    }

    dibujar(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,220,70,${this.alpha})`;
        ctx.fill();
    }
}

class Petalo{
    constructor(){
        this.reset();
        this.y=Math.random()*alto;
    }

    reset(){
        this.x=Math.random()*ancho;
        this.y=-25;
        this.tamano=Math.random()*5+3;
        this.vy=Math.random()*.23+.07;
        this.vx=Math.random()*.14-.07;
        this.rotacion=Math.random()*Math.PI*2;
        this.vr=Math.random()*.014-.007;
        this.fase=Math.random()*Math.PI*2;
        this.alpha=Math.random()*.3+.15;
    }

    actualizar(dt){
        const f=dt*60;

        this.y+=this.vy*f;
        this.x+=this.vx*f;
        this.fase+=dt*.7;
        this.x+=Math.sin(this.fase)*.07*f;
        this.rotacion+=this.vr*f;

        if(this.y>alto+35||this.x<-35||this.x>ancho+35)this.reset();
    }

    dibujar(){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotacion);

        ctx.beginPath();
        ctx.moveTo(0,-this.tamano);
        ctx.bezierCurveTo(this.tamano*.8,-this.tamano*.4,this.tamano*.65,this.tamano*.65,0,this.tamano);
        ctx.bezierCurveTo(-this.tamano*.65,this.tamano*.65,-this.tamano*.8,-this.tamano*.4,0,-this.tamano);

        ctx.fillStyle=`rgba(255,215,40,${this.alpha})`;
        ctx.fill();

        ctx.restore();
    }
}

class ParticulaIntro{
    constructor(){
        this.reset(true);
    }

    reset(inicial=false){
        this.angulo=Math.random()*Math.PI*2;
        this.progreso=inicial?Math.random():0;
        this.velocidad=.09+Math.random()*.1;
        this.tamano=.5+Math.random()*1.8;
        this.desfaseX=(Math.random()-.5)*45;
        this.desfaseY=(Math.random()-.5)*45;
    }

    actualizar(dt){
        this.progreso+=this.velocidad*dt;

        if(this.progreso>1){
            this.reset();
        }
    }

    dibujar(){
        const p=Math.pow(this.progreso,1.75);
        const radio=p*Math.max(ancho,alto)*.72;

        const x=ancho/2+Math.cos(this.angulo)*radio+this.desfaseX;
        const y=alto*.52+Math.sin(this.angulo)*radio*.72+this.desfaseY;

        const alpha=Math.sin(this.progreso*Math.PI)*.55;
        const tamano=this.tamano*(.6+this.progreso*1.7);

        ctx.globalAlpha=alpha;

        ctx.beginPath();
        ctx.arc(x,y,tamano,0,Math.PI*2);
        ctx.fillStyle=Math.random()>.3?"#ffe36e":"#fff9d0";
        ctx.fill();

        ctx.globalAlpha=1;
    }
}

class PolvoCosmico{
    constructor(){
        this.radio=Math.random();
        this.angulo=Math.random()*Math.PI*2;
        this.altura=(Math.random()-.5)*90;
        this.velocidad=.06+Math.random()*.08;
        this.tamano=.4+Math.random()*1.5;
        this.alpha=.08+Math.random()*.35;
    }

    actualizar(dt){
        this.angulo+=this.velocidad*dt;
    }

    dibujar(centro){
        const radioMax=movil?Math.min(ancho*.47,205):Math.min(ancho*.35,600);
        const radio=(28+this.radio*radioMax)*camara.zoom;
        const z=Math.sin(this.angulo)*radio;
        const x3=Math.cos(this.angulo)*radio;
        const y3=this.altura*camara.zoom;

        const cosT=Math.cos(camara.inclinacion);
        const sinT=Math.sin(camara.inclinacion);

        const yRot=y3*cosT-z*sinT;
        const zRot=y3*sinT+z*cosT;

        const perspectiva=700/(700-zRot*.7);

        const x=centro.x+x3*perspectiva;
        const y=centro.y+yRot*perspectiva;

        const profundidad=limitar((zRot+250)/500,0,1);

        ctx.globalAlpha=this.alpha*(.5+profundidad*.5);

        ctx.beginPath();
        ctx.arc(x,y,this.tamano*(.7+profundidad),0,Math.PI*2);
        ctx.fillStyle=profundidad>.5?"#ffe45f":"#c9b65c";
        ctx.fill();

        ctx.globalAlpha=1;
    }
}

class ChispaCorazon{
    constructor(){
        this.fase=Math.random()*Math.PI*2;
        this.radioBase=(movil?42:56)+Math.random()*(movil?40:54);
        this.tamano=Math.random()*1.7+.6;
        this.velocidad=.3+Math.random()*.3;
        this.alpha=.25+Math.random()*.35;
    }

    dibujar(cx,cy,t){
        const angulo=this.fase+t*this.velocidad;

        const x=cx+Math.cos(angulo)*this.radioBase;
        const y=cy+Math.sin(angulo)*this.radioBase*.55;

        ctx.globalAlpha=this.alpha;

        ctx.beginPath();
        ctx.arc(x,y,this.tamano,0,Math.PI*2);
        ctx.fillStyle="#ffe97a";
        ctx.fill();

        ctx.globalAlpha=1;
    }
}

class Explosion{
    constructor(x,y){
        this.particulas=[];

        const cantidad=movil?15:24;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*2+.4;

            this.particulas.push({
                x,
                y,
                vx:Math.cos(angulo)*velocidad,
                vy:Math.sin(angulo)*velocidad,
                vida:1,
                radio:Math.random()*2.2+1
            });
        }
    }

    actualizar(dt){
        const f=dt*60;

        this.particulas.forEach(p=>{
            p.x+=p.vx*f;
            p.y+=p.vy*f;
            p.vx*=Math.pow(.98,f);
            p.vy*=Math.pow(.98,f);
            p.vida-=.025*f;
        });

        this.particulas=this.particulas.filter(p=>p.vida>0);
    }

    dibujar(){
        this.particulas.forEach(p=>{
            ctx.globalAlpha=p.vida;

            ctx.beginPath();
            ctx.arc(p.x,p.y,p.radio,0,Math.PI*2);
            ctx.fillStyle="#ffe563";
            ctx.fill();
        });

        ctx.globalAlpha=1;
    }
}
function crearEscena(){
    estrellas=[];
    luces=[];
    petalos=[];
    polvoCosmico=[];
    particulasIntro=[];
    chispasCorazon=[];

    const totalEstrellas=movil?145:320;
    const totalLuces=movil?55:90;
    const totalPetalos=movil?34:62;
    const totalPolvo=movil?150:400;
    const totalIntro=movil?65:120;
    const totalChispas=movil?14:22;

    for(let i=0;i<totalEstrellas;i++)estrellas.push(new Estrella());
    for(let i=0;i<totalLuces;i++)luces.push(new Luz());
    for(let i=0;i<totalPetalos;i++)petalos.push(new Petalo());
    for(let i=0;i<totalPolvo;i++)polvoCosmico.push(new PolvoCosmico());
    for(let i=0;i<totalIntro;i++)particulasIntro.push(new ParticulaIntro());
    for(let i=0;i<totalChispas;i++)chispasCorazon.push(new ChispaCorazon());
}

function obtenerFlores(){
    return [...document.querySelectorAll(".dato-flor")].map(elemento=>{
        const flor=elemento.querySelector(".imagen-flor");
        const tarjeta=elemento.querySelector(".imagen-tarjeta");

        return{
            titulo:elemento.dataset.titulo,
            etiqueta:elemento.dataset.etiqueta,
            emoji:elemento.dataset.emoji,
            frase:elemento.dataset.frase,
            imagenFlor:flor?.getAttribute("src")?.trim()||"",
            imagenTarjeta:tarjeta?.getAttribute("src")?.trim()||"",
            altFlor:flor?.getAttribute("alt")||"",
            altTarjeta:tarjeta?.getAttribute("alt")||""
        };
    });
}

function obtenerImagenesIntro(){
    return [...document.querySelectorAll(".dato-intro")].map(elemento=>({
        src:elemento.dataset.src?.trim()||"",
        emoji:elemento.dataset.emoji||"🌻"
    }));
}

function prepararCentro(){
    const src=imagenCentroVisible.getAttribute("src")?.trim();

    if(!src){
        imagenCentroVisible.style.display="none";
        return;
    }

    imagenCentroVisible.onload=()=>{
        imagenCentroVisible.style.display="block";
    };

    imagenCentroVisible.onerror=()=>{
        imagenCentroVisible.style.display="none";
    };

    if(imagenCentroVisible.complete&&imagenCentroVisible.naturalWidth>0){
        imagenCentroVisible.style.display="block";
    }
}

function crearEntrada3d(){
    mundo3d.innerHTML="";
    mundo3d.classList.remove("apagando");
    objetos3d=[];
    introCerrando=false;

    const imagenes=obtenerImagenesIntro();

    const cantidadFrases=movil?16:22;
    const cantidadFlores=movil?8:12;

    for(let i=0;i<cantidadFrases;i++){
        const el=document.createElement("span");

        el.className="item-3d frase";
        el.textContent=frases3d[i%frases3d.length];

        const grande=i%7===0;
        const medio=i%3===0;

        el.style.fontSize=`${
            grande
                ?(movil?21:34)
                :medio
                    ?(movil?15:22)
                    :(movil?10:14)
        }px`;

        const objeto={
            el,
            tipo:"frase",
            x:(Math.random()-.5)*ancho*.72,
            y:(Math.random()-.5)*alto*.68,
            z:-1750+Math.random()*1650,
            velocidad:190+Math.random()*100,
            rotacion:(Math.random()-.5)*7
        };

        mundo3d.appendChild(el);
        objetos3d.push(objeto);
    }

    for(let i=0;i<cantidadFlores;i++){
        const data=imagenes[i%imagenes.length]||{
            src:"",
            emoji:"🌻"
        };

        const el=document.createElement("div");
        const emoji=document.createElement("span");
        const img=document.createElement("img");

        const tamano=movil
            ?44+Math.random()*38
            :60+Math.random()*62;

        el.className="item-3d flor";
        el.style.width=`${tamano}px`;
        el.style.height=`${tamano}px`;

        emoji.className="flor-emoji-3d";
        emoji.textContent=data.emoji;

        el.appendChild(emoji);

        if(data.src){
            img.src=data.src;
            img.alt="";

            img.onload=()=>{
                emoji.style.display="none";
                el.appendChild(img);
            };
        }

        const objeto={
            el,
            tipo:"flor",
            x:(Math.random()-.5)*ancho*.75,
            y:(Math.random()-.5)*alto*.72,
            z:-1700+Math.random()*1600,
            velocidad:180+Math.random()*110,
            rotacion:(Math.random()-.5)*15
        };

        mundo3d.appendChild(el);
        objetos3d.push(objeto);
    }
}

function actualizarEntrada3d(dt){
    if(!intro3dActiva)return;

    particulasIntro.forEach(p=>{
        p.actualizar(dt);
        p.dibujar();
    });

    objetos3d.forEach(obj=>{
        const multiplicador=introCerrando?.2:1;

        obj.z+=obj.velocidad*dt*multiplicador;

        if(obj.z>360&&!introCerrando){
            obj.z=-1750-Math.random()*350;
            obj.x=(Math.random()-.5)*ancho*.72;
            obj.y=(Math.random()-.5)*alto*.68;
        }

        const entrada=limitar((obj.z+1750)/350,0,1);
        const salida=limitar((360-obj.z)/230,0,1);

        obj.el.style.opacity=entrada*salida;

        obj.el.style.transform=
            `translate3d(calc(-50% + ${obj.x}px),calc(-50% + ${obj.y}px),${obj.z}px) rotateZ(${obj.rotacion}deg)`;
    });
}

function iniciarEntrada3d(){
    crearEntrada3d();

    entrada3d.classList.remove("saliendo");
    entrada3d.classList.add("activa");

    intro3dActiva=true;

    setTimeout(()=>{
        introCerrando=true;
        mundo3d.classList.add("apagando");
        mensajeFinal3d.classList.add("activo");
    },5600);

    setTimeout(()=>{
        intro3dActiva=false;
        entrada3d.classList.add("saliendo");
    },7900);

    setTimeout(()=>{
        entrada3d.classList.remove("activa","saliendo");
        mensajeFinal3d.classList.remove("activo");
        mundo3d.innerHTML="";
        objetos3d=[];
        entrarGalaxia();
    },8500);
}
function crearFlores(){
    orbitas.innerHTML="";
    floresUI=[];

    const datos=obtenerFlores();
    const total=datos.length;

    datos.forEach((flor,i)=>{
        const boton=document.createElement("button");
        const contenedor=document.createElement("span");
        const etiqueta=document.createElement("span");

        boton.className="flor-orbita";
        contenedor.className="flor-contenedor";
        etiqueta.className="flor-nombre";

        etiqueta.textContent=flor.etiqueta;

        if(flor.imagenFlor){
            const img=document.createElement("img");

            img.className="flor-imagen";
            img.src=flor.imagenFlor;
            img.alt=flor.altFlor;

            img.onerror=()=>{
                contenedor.innerHTML=`<span class="flor-emoji">${flor.emoji}</span>`;
            };

            contenedor.appendChild(img);
        }else{
            contenedor.innerHTML=`<span class="flor-emoji">${flor.emoji}</span>`;
        }

        boton.appendChild(contenedor);
        boton.appendChild(etiqueta);

        boton.addEventListener("click",e=>{
            e.stopPropagation();
            abrirTarjeta(flor);
        });

        orbitas.appendChild(boton);

        boton.classList.add("visible");

        const proporcion=i/Math.max(total-1,1);

        floresUI.push({
            el:boton,
            base:(i/total)*Math.PI*2,
            radio:movil
                ?82+proporcion*68
                :125+proporcion*175,
            altura:movil
                ?22+((i*17)%30)
                :35+((i*23)%55),
            velocidad:.65+((i*13)%25)/100,
            fase:i*.87,
            giro:(i%2===0?1:-1)*(2+i*1.2)
        });
    });
}

function corazonPosicion(){
    return{
        x:ancho/2,
        y:alto*(movil?.18:.19)
    };
}

function ramoPosicion(){
    return{
        x:ancho/2,
        y:alto*(movil?.61:.62)
    };
}

function rotacionTotal(){
    return camara.rotacion+orbitaAutomatica;
}

function dibujarNebulosas(){
    const datos=[
        {
            x:ancho*.16+Math.sin(tiempo*.12)*18,
            y:alto*.24+Math.cos(tiempo*.14)*12,
            r:Math.max(ancho,alto)*(movil?.18:.21),
            color:"60,75,170",
            a:.07
        },
        {
            x:ancho*.82+Math.cos(tiempo*.1)*18,
            y:alto*.35+Math.sin(tiempo*.13)*13,
            r:Math.max(ancho,alto)*(movil?.15:.19),
            color:"110,55,135",
            a:.055
        },
        {
            x:ancho*.5+Math.sin(tiempo*.08)*18,
            y:alto*.72+Math.cos(tiempo*.1)*12,
            r:Math.max(ancho,alto)*(movil?.24:.27),
            color:"255,185,20",
            a:.075
        }
    ];

    datos.forEach(n=>{
        const g=ctx.createRadialGradient(
            n.x,
            n.y,
            0,
            n.x,
            n.y,
            n.r
        );

        g.addColorStop(0,`rgba(${n.color},${n.a})`);
        g.addColorStop(.45,`rgba(${n.color},${n.a*.35})`);
        g.addColorStop(1,`rgba(${n.color},0)`);

        ctx.fillStyle=g;
        ctx.fillRect(0,0,ancho,alto);
    });
}

function dibujarJardinCosmico(){
    const centro=ramoPosicion();

    polvoCosmico.forEach(p=>{
        p.actualizar(1/60);
        p.dibujar(centro);
    });

    const radioLuz=Math.max(ancho,alto)*(movil?.23:.28)*camara.zoom;

    const g=ctx.createRadialGradient(
        centro.x,
        centro.y,
        0,
        centro.x,
        centro.y,
        radioLuz
    );

    g.addColorStop(0,"rgba(255,236,125,.2)");
    g.addColorStop(.24,"rgba(255,205,0,.08)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;
    ctx.fillRect(0,0,ancho,alto);
}

function actualizarFlores3d(centro){
    const rotacion=rotacionTotal();

    floresUI.forEach(flor=>{
        const angulo=
            flor.base+
            rotacion*
            flor.velocidad;

        const radio=
            flor.radio*
            camara.zoom;

        const x3=
            Math.cos(angulo)*
            radio;

        const z3=
            Math.sin(angulo)*
            radio;

        const y3=
            Math.sin(
                angulo*.72+
                flor.fase
            )*
            flor.altura*
            camara.zoom;

        const cosT=
            Math.cos(
                camara.inclinacion
            );

        const sinT=
            Math.sin(
                camara.inclinacion
            );

        const yRot=
            y3*cosT-
            z3*sinT;

        const zRot=
            y3*sinT+
            z3*cosT;

        const perspectiva=
            limitar(
                700/
                (700-zRot),
                .65,
                1.48
            );

        const x=
            centro.x+
            x3*
            perspectiva;

        const y=
            centro.y+
            yRot*
            perspectiva;

        const profundidad=
            limitar(
                (zRot+240)/
                480,
                0,
                1
            );

        const escalaBase=
            movil?.64:.72;

        const escala=
            escalaBase*
            perspectiva;

        flor.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala}) rotate(${flor.giro}deg)`;

        flor.el.style.opacity=
            .48+
            profundidad*
            .5;

        flor.el.style.filter=
            `brightness(${.68+profundidad*.58}) saturate(${.82+profundidad*.3}) blur(${(1-profundidad)*.35}px)`;

        if(zRot>=0){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");

            flor.el.style.zIndex=
                String(
                    48+
                    Math.round(
                        profundidad*20
                    )
                );
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");

            flor.el.style.zIndex=
                String(
                    12+
                    Math.round(
                        profundidad*15
                    )
                );
        }
    });
}

function actualizarDOM(){
    if(!modoGalaxia)return;

    const corazon=corazonPosicion();
    const centro=ramoPosicion();

    textoCorazon.style.left=`${corazon.x}px`;
    textoCorazon.style.top=`${corazon.y}px`;

    centroVisual.style.left=`${centro.x}px`;
    centroVisual.style.top=`${centro.y}px`;

    centroVisual.style.transform=
        `translate3d(-50%,-50%,0) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;

    textoCentro.style.top=
        `${centro.y+(movil?105:125)*camara.zoom}px`;

    actualizarFlores3d(centro);
}
function dibujarCorazon(){
    const centro=corazonPosicion();

    const cx=centro.x;
    const cy=centro.y;

    const escala=
        Math.min(ancho,alto)*
        (movil?.0085:.0098)*
        (
            1+
            Math.sin(tiempo*2)*
            .02
        );

    ctx.save();

    const pasos=movil?110:150;

    ctx.beginPath();

    for(let i=0;i<=pasos;i++){
        const t=i/pasos*Math.PI*2;

        const x=
            16*
            Math.pow(
                Math.sin(t),
                3
            );

        const y=
            13*Math.cos(t)-
            5*Math.cos(2*t)-
            2*Math.cos(3*t)-
            Math.cos(4*t);

        const px=cx+x*escala;
        const py=cy-y*escala;

        if(i===0){
            ctx.moveTo(px,py);
        }else{
            ctx.lineTo(px,py);
        }
    }

    ctx.closePath();

    ctx.strokeStyle="rgba(255,231,96,.96)";
    ctx.lineWidth=movil?1.7:2.2;
    ctx.shadowBlur=13;
    ctx.shadowColor="#ffd700";
    ctx.stroke();

    ctx.beginPath();

    for(let i=0;i<=pasos;i++){
        const t=i/pasos*Math.PI*2;

        const x=
            16*
            Math.pow(
                Math.sin(t),
                3
            );

        const y=
            13*Math.cos(t)-
            5*Math.cos(2*t)-
            2*Math.cos(3*t)-
            Math.cos(4*t);

        const px=
            cx+
            x*
            escala*
            .93;

        const py=
            cy-
            y*
            escala*
            .93;

        if(i===0){
            ctx.moveTo(px,py);
        }else{
            ctx.lineTo(px,py);
        }
    }

    ctx.closePath();

    ctx.strokeStyle="rgba(255,248,195,.45)";
    ctx.lineWidth=1;
    ctx.shadowBlur=19;
    ctx.stroke();

    chispasCorazon.forEach(chispa=>{
        chispa.dibujar(
            cx,
            cy,
            tiempo
        );
    });

    ctx.restore();
}

function mostrarEscena(escena){
    document.querySelectorAll(".escena").forEach(e=>{
        e.classList.remove("activa");
    });

    if(escena){
        escena.classList.add("activa");
    }
}

function iniciarMusicaSuave(){
    if(fadeMusica){
        cancelAnimationFrame(
            fadeMusica
        );
    }

    musicaFondo.volume=0;

    const volumenFinal=.35;
    const duracion=4000;

    musicaFondo.play().then(()=>{
        const inicioFade=
            performance.now();

        function subirVolumen(ahora){
            const progreso=
                Math.min(
                    (ahora-inicioFade)/
                    duracion,
                    1
                );

            const suave=
                1-
                Math.pow(
                    1-progreso,
                    3
                );

            musicaFondo.volume=
                volumenFinal*
                suave;

            if(progreso<1){
                fadeMusica=
                    requestAnimationFrame(
                        subirVolumen
                    );
            }else{
                musicaFondo.volume=
                    volumenFinal;

                fadeMusica=null;
            }
        }

        fadeMusica=
            requestAnimationFrame(
                subirVolumen
            );
    }).catch(()=>{});
}

function iniciarExperiencia(){
    if(experienciaIniciada)return;

    experienciaIniciada=true;

    iniciarMusicaSuave();

    inicio.classList.add("oculto");

    setTimeout(()=>{
        mostrarEscena(
            escenaFecha
        );
    },700);

    setTimeout(()=>{
        mostrarEscena(
            escenaMensaje
        );
    },4100);

    setTimeout(()=>{
        mostrarEscena(null);
        iniciarEntrada3d();
    },7600);
}

function entrarGalaxia(){
    modoGalaxia=true;
    introCerrando=false;

    if(movil){
        camara.zoom=.94;
        camara.inclinacion=-.34;
    }

    galaxiaInteractiva.classList.add(
        "activa"
    );

    crearExplosion(
        ramoPosicion().x,
        ramoPosicion().y
    );
}

function abrirTarjeta(data){
    tarjetaTitulo.textContent=data.titulo;
    tarjetaFrase.textContent=data.frase;

    tarjetaImagen.style.display="none";
    tarjetaEmoji.style.display="none";
    tarjetaImagen.removeAttribute("src");

    if(data.imagenTarjeta){
        tarjetaImagen.src=data.imagenTarjeta;
        tarjetaImagen.alt=data.altTarjeta;

        tarjetaImagen.onload=()=>{
            tarjetaImagen.style.display="block";
            tarjetaEmoji.style.display="none";
        };

        tarjetaImagen.onerror=()=>{
            tarjetaImagen.style.display="none";
            tarjetaEmoji.style.display="block";
            tarjetaEmoji.textContent="💛";
        };
    }else{
        tarjetaEmoji.style.display="block";
        tarjetaEmoji.textContent="💛";
    }

    tarjetaOverlay.classList.add(
        "activa"
    );
}

function abrirTarjetaCentral(){
    tarjetaTitulo.textContent=
        "Nuestro pequeño universo";

    tarjetaFrase.textContent=
        "Si todo esto fuera un universo, tú serías ese punto de luz alrededor del cual nacen todos estos pequeños detalles.";

    tarjetaImagen.style.display="none";
    tarjetaEmoji.style.display="none";
    tarjetaImagen.removeAttribute("src");

    const src=
        imagenCentroVisible
            .getAttribute("src")
            ?.trim();

    if(src){
        tarjetaImagen.src=src;
        tarjetaImagen.alt="Ramo principal";

        tarjetaImagen.onload=()=>{
            tarjetaImagen.style.display="block";
        };

        tarjetaImagen.onerror=()=>{
            tarjetaEmoji.style.display="block";
            tarjetaEmoji.textContent="💛";
        };
    }else{
        tarjetaEmoji.style.display="block";
        tarjetaEmoji.textContent="💛";
    }

    tarjetaOverlay.classList.add(
        "activa"
    );
}

function activarCentroEspecial(){
    const centro=ramoPosicion();

    efectoCentroHasta=
        performance.now()+
        1800;

    centroVisual.classList.remove(
        "activa-especial"
    );

    void centroVisual.offsetWidth;

    centroVisual.classList.add(
        "activa-especial"
    );

    crearExplosion(
        centro.x,
        centro.y
    );

    setTimeout(()=>{
        crearExplosion(
            centro.x-34,
            centro.y-14
        );
    },100);

    setTimeout(()=>{
        crearExplosion(
            centro.x+36,
            centro.y+12
        );
    },200);

    setTimeout(()=>{
        crearExplosion(
            centro.x,
            centro.y-38
        );
    },300);

    setTimeout(()=>{
        abrirTarjetaCentral();
    },750);

    setTimeout(()=>{
        centroVisual.classList.remove(
            "activa-especial"
        );
    },1800);
}

function cerrarTarjetaFn(){
    tarjetaOverlay.classList.remove(
        "activa"
    );
}

function crearExplosion(x,y){
    if(!modoGalaxia)return;

    explosiones.push(
        new Explosion(
            x,
            y
        )
    );
}
function animar(ahora){
    const dt=
        Math.min(
            (ahora-ultimoFrame)/
            1000,
            .033
        );

    ultimoFrame=ahora;
    tiempo+=dt;

    const centroActivo=
        ahora<
        efectoCentroHasta;

    if(
        modoGalaxia&&
        touchMode===""&&
        !arrastrandoMouse
    ){
        orbitaAutomatica+=
            dt*
            (movil?.22:.26)*
            (centroActivo?.18:1);
    }

    ctx.clearRect(
        0,
        0,
        ancho,
        alto
    );

    dibujarNebulosas();

    estrellas.forEach(e=>{
        e.actualizar(dt);
        e.dibujar();
    });

    if(experienciaIniciada){
        luces.forEach(l=>{
            l.actualizar(dt);
            l.dibujar();
        });

        petalos.forEach(p=>{
            p.actualizar(dt);
            p.dibujar();
        });
    }

    actualizarEntrada3d(dt);

    if(modoGalaxia){
        dibujarJardinCosmico();
        dibujarCorazon();
        actualizarDOM();
    }

    explosiones.forEach(e=>{
        e.actualizar(dt);
        e.dibujar();
    });

    explosiones=
        explosiones.filter(
            e=>e.particulas.length
        );

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener(
    "click",
    iniciarExperiencia
);

cerrarTarjeta.addEventListener(
    "click",
    cerrarTarjetaFn
);

tarjetaOverlay.addEventListener(
    "click",
    e=>{
        if(e.target===tarjetaOverlay){
            cerrarTarjetaFn();
        }
    }
);

centroVisual.addEventListener(
    "click",
    e=>{
        e.stopPropagation();

        if(!modoGalaxia)return;

        activarCentroEspecial();
    }
);

galaxiaInteractiva.addEventListener(
    "mousedown",
    e=>{
        if(movil||!modoGalaxia)return;

        if(
            e.target.closest(
                ".flor-orbita,.tarjeta,#centroVisual"
            )
        )return;

        arrastrandoMouse=true;

        mouseInicioX=e.clientX;
        mouseInicioY=e.clientY;

        mouseRotacionInicio=
            camara.rotacion;

        mouseInclinacionInicio=
            camara.inclinacion;

        document.body.classList.add(
            "arrastrando"
        );
    }
);

window.addEventListener(
    "mousemove",
    e=>{
        if(!arrastrandoMouse)return;

        const dx=
            e.clientX-
            mouseInicioX;

        const dy=
            e.clientY-
            mouseInicioY;

        camara.rotacion=
            mouseRotacionInicio+
            dx*.008;

        camara.inclinacion=
            limitar(
                mouseInclinacionInicio+
                dy*.0035,
                -.65,
                .65
            );
    }
);

window.addEventListener(
    "mouseup",
    ()=>{
        arrastrandoMouse=false;

        document.body.classList.remove(
            "arrastrando"
        );
    }
);

galaxiaInteractiva.addEventListener(
    "touchstart",
    e=>{
        if(!modoGalaxia)return;

        if(e.touches.length>=2){
            const t1=e.touches[0];
            const t2=e.touches[1];

            touchMode="pinch";

            pinchStartDistance=
                distanciaTouches(
                    t1,
                    t2
                );

            pinchStartZoom=
                camara.zoom;

            e.preventDefault();

            return;
        }

        if(
            e.target.closest(
                ".flor-orbita,.tarjeta,#centroVisual"
            )
        )return;

        const t=e.touches[0];

        touchMode="drag";

        touchStartX=t.clientX;
        touchStartY=t.clientY;

        touchRotStart=
            camara.rotacion;

        touchTiltStart=
            camara.inclinacion;
    },
    {
        passive:false
    }
);

galaxiaInteractiva.addEventListener(
    "touchmove",
    e=>{
        if(!modoGalaxia)return;

        if(e.touches.length>=2){
            const t1=e.touches[0];
            const t2=e.touches[1];

            const dist=
                distanciaTouches(
                    t1,
                    t2
                );

            if(touchMode!=="pinch"){
                touchMode="pinch";
                pinchStartDistance=dist;
                pinchStartZoom=camara.zoom;
            }

            camara.zoom=
                limitar(
                    pinchStartZoom*
                    (
                        dist/
                        pinchStartDistance
                    ),
                    .76,
                    1.5
                );

            e.preventDefault();

            return;
        }

        if(
            touchMode==="drag"&&
            e.touches.length===1
        ){
            const t=e.touches[0];

            const dx=
                t.clientX-
                touchStartX;

            const dy=
                t.clientY-
                touchStartY;

            camara.rotacion=
                touchRotStart+
                dx*.01;

            camara.inclinacion=
                limitar(
                    touchTiltStart+
                    dy*.004,
                    -.65,
                    .65
                );

            e.preventDefault();
        }
    },
    {
        passive:false
    }
);

galaxiaInteractiva.addEventListener(
    "touchend",
    e=>{
        if(e.touches.length>=2){
            const t1=e.touches[0];
            const t2=e.touches[1];

            touchMode="pinch";

            pinchStartDistance=
                distanciaTouches(
                    t1,
                    t2
                );

            pinchStartZoom=
                camara.zoom;

            return;
        }

        if(e.touches.length===1){
            const t=e.touches[0];

            touchMode="drag";

            touchStartX=t.clientX;
            touchStartY=t.clientY;

            touchRotStart=
                camara.rotacion;

            touchTiltStart=
                camara.inclinacion;

            return;
        }

        touchMode="";
    }
);

galaxiaInteractiva.addEventListener(
    "touchcancel",
    ()=>{
        touchMode="";
    }
);

window.addEventListener(
    "wheel",
    e=>{
        if(!modoGalaxia||movil)return;

        e.preventDefault();

        camara.zoom=
            limitar(
                camara.zoom-
                e.deltaY*.0007,
                .7,
                1.65
            );
    },
    {
        passive:false
    }
);

galaxiaInteractiva.addEventListener(
    "click",
    e=>{
        if(!modoGalaxia)return;

        if(
            e.target.closest(
                ".flor-orbita,.tarjeta,#centroVisual"
            )
        )return;

        crearExplosion(
            e.clientX,
            e.clientY
        );
    }
);

window.addEventListener(
    "keydown",
    e=>{
        if(e.key==="Escape"){
            cerrarTarjetaFn();
        }
    }
);

window.addEventListener(
    "resize",
    ajustarCanvas
);

window.visualViewport?.addEventListener(
    "resize",
    ajustarCanvas
);

detectarMovil();
ajustarCanvas();
crearFlores();
prepararCentro();
requestAnimationFrame(animar);