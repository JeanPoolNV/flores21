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
let particulasGalaxia=[];
let chispasCorazon=[];
let explosiones=[];
let floresUI=[];
let objetos3d=[];

let experienciaIniciada=false;
let intro3dActiva=false;
let modoGalaxia=false;
let arrastrandoMouse=false;

let tiempo=0;
let orbitaAutomatica=0;
let ultimoFrame=performance.now();
let fadeMusica=null;

let camara={
    zoom:1,
    rotacion:0
};

let mouseInicioX=0;
let mouseRotacionInicio=0;

let touchMode="";
let touchStartX=0;
let touchRotStart=0;
let pinchStartDistance=0;
let pinchStartZoom=1;

const frases3d=[
    "Eres mi sol 🌻",
    "Siempre tú ✨",
    "Gracias por existir 💛",
    "Mi persona favorita",
    "Contigo todo es mejor",
    "Eres pura luz",
    "Qué bonito coincidir contigo",
    "Mi lugar favorito eres tú",
    "Te elegiría una y mil veces",
    "Mi bonita casualidad ✨",
    "Me haces sonreír",
    "Contigo todo florece 🌻",
    "Mi paz",
    "Qué suerte encontrarte",
    "Tú haces bonito mis días",
    "Mi pequeño universo",
    "Para ti 🌻",
    "Eres increíble",
    "Siempre juntos ✨",
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

    ancho=Math.round(viewport?.width||window.innerWidth);
    alto=Math.round(viewport?.height||window.innerHeight);

    const dpr=movil?1:Math.min(devicePixelRatio||1,1.5);

    canvas.width=Math.round(ancho*dpr);
    canvas.height=Math.round(alto*dpr);
    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    crearEscena();

    if(movil){
        camara.zoom=limitar(camara.zoom,.78,1.5);
    }

    if(modoGalaxia){
        crearFlores();
        prepararCentro();
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
        this.velocidad=Math.random()*.05+.012;
        this.alpha=Math.random()*.65+.14;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y+=this.velocidad*dt*60;
        this.fase+=dt*.8;
        if(this.y>alto+10)this.reset();
    }

    dibujar(){
        const alpha=this.alpha*(.8+Math.sin(this.fase)*.2);
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,238,${alpha})`;
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
        this.radio=Math.random()*1.9+.35;
        this.velocidad=Math.random()*.2+.05;
        this.alpha=Math.random()*.32+.07;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y-=this.velocidad*dt*60;
        this.fase+=dt*.7;
        this.x+=Math.sin(this.fase)*.08*dt*60;
        if(this.y<-15)this.reset();
    }

    dibujar(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,219,55,${this.alpha})`;
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
        this.y=-24;
        this.tamano=Math.random()*5+3;
        this.vy=Math.random()*.27+.08;
        this.vx=Math.random()*.15-.075;
        this.rotacion=Math.random()*Math.PI*2;
        this.vr=Math.random()*.015-.0075;
        this.fase=Math.random()*Math.PI*2;
        this.alpha=Math.random()*.35+.18;
    }

    actualizar(dt){
        const f=dt*60;

        this.y+=this.vy*f;
        this.x+=this.vx*f;
        this.fase+=dt*.7;
        this.x+=Math.sin(this.fase)*.08*f;
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
        ctx.fillStyle=`rgba(255,215,35,${this.alpha})`;
        ctx.fill();

        ctx.restore();
    }
}

class ParticulaGalaxia{
    constructor(){
        const maxRadio=Math.min(ancho,alto)*(movil?.45:.52);

        this.radio=Math.pow(Math.random(),.62)*maxRadio+8;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.05+this.brazo+(Math.random()-.5)*.72;
        this.tamano=Math.random()*1.8+.24;
        this.alpha=Math.random()*.58+.08;
        this.desfase=(Math.random()-.5)*(movil?20:30);
        this.color=Math.random()>.26?"#ffe35c":"#fff8c8";
    }

    dibujar(cx,cy,rotacion){
        const angulo=this.angulo+rotacion*.28;
        const radio=this.radio*camara.zoom;

        const x=cx+Math.cos(angulo)*radio;
        const y=cy+Math.sin(angulo)*radio*.27+this.desfase*camara.zoom;

        ctx.globalAlpha=this.alpha;

        ctx.beginPath();
        ctx.arc(x,y,this.tamano*camara.zoom,0,Math.PI*2);
        ctx.fillStyle=this.color;
        ctx.fill();

        ctx.globalAlpha=1;
    }
}

class ChispaCorazon{
    constructor(){
        this.fase=Math.random()*Math.PI*2;
        this.radioBase=(movil?44:58)+Math.random()*(movil?42:56);
        this.tamano=Math.random()*1.8+.7;
        this.velocidad=.35+Math.random()*.35;
        this.alpha=.3+Math.random()*.35;
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

        const cantidad=movil?16:26;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*2.2+.45;

            this.particulas.push({
                x,
                y,
                vx:Math.cos(angulo)*velocidad,
                vy:Math.sin(angulo)*velocidad,
                vida:1,
                radio:Math.random()*2.4+1
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
    particulasGalaxia=[];
    chispasCorazon=[];

    const totalEstrellas=movil?160:350;
    const totalLuces=movil?72:110;
    const totalPetalos=movil?44:75;
    const totalGalaxia=movil?390:1050;
    const totalChispas=movil?16:24;

    for(let i=0;i<totalEstrellas;i++)estrellas.push(new Estrella());
    for(let i=0;i<totalLuces;i++)luces.push(new Luz());
    for(let i=0;i<totalPetalos;i++)petalos.push(new Petalo());
    for(let i=0;i<totalGalaxia;i++)particulasGalaxia.push(new ParticulaGalaxia());
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
            imagenFlor:flor.getAttribute("src")?.trim()||"",
            imagenTarjeta:tarjeta.getAttribute("src")?.trim()||"",
            altFlor:flor.getAttribute("alt")||"",
            altTarjeta:tarjeta.getAttribute("alt")||""
        };
    });
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
    objetos3d=[];

    const flores=obtenerFlores();
    const cantidadFrases=movil?26:36;
    const cantidadFlores=movil?18:28;

    for(let i=0;i<cantidadFrases;i++){
        const el=document.createElement("span");
        const grande=i%8===0;
        const medio=i%4===0;

        el.className="item-3d frase";
        el.textContent=frases3d[i%frases3d.length];

        const objeto={
            el,
            tipo:"frase",
            x:(Math.random()-.5)*(movil?520:1350),
            y:(Math.random()-.5)*(movil?1000:750),
            z:-2200-Math.random()*4200,
            velocidad:movil?370+Math.random()*100:430+Math.random()*130,
            rot:(Math.random()-.5)*9,
            tamano:grande?(movil?30:52):medio?(movil?18:28):(movil?11:16)
        };

        el.style.fontSize=`${objeto.tamano}px`;

        mundo3d.appendChild(el);
        objetos3d.push(objeto);
    }

    for(let i=0;i<cantidadFlores;i++){
        const data=flores[i%flores.length];
        const el=document.createElement("div");
        const img=document.createElement("img");

        el.className="item-3d flor";

        img.src=data.imagenFlor;
        img.alt="";

        el.appendChild(img);

        const tamano=movil
            ?50+Math.random()*65
            :65+Math.random()*110;

        el.style.width=`${tamano}px`;
        el.style.height=`${tamano}px`;

        const objeto={
            el,
            tipo:"flor",
            x:(Math.random()-.5)*(movil?500:1300),
            y:(Math.random()-.5)*(movil?1050:750),
            z:-1900-Math.random()*4500,
            velocidad:movil?350+Math.random()*120:420+Math.random()*145,
            rot:(Math.random()-.5)*20,
            tamano
        };

        mundo3d.appendChild(el);
        objetos3d.push(objeto);
    }

    const rayos=movil?26:42;

    for(let i=0;i<rayos;i++){
        const rayo=document.createElement("span");

        rayo.className="rayo-3d";

        const angulo=Math.random()*360;
        const distancia=50+Math.random()*(movil?180:390);
        const altura=70+Math.random()*180;

        rayo.style.height=`${altura}px`;
        rayo.style.transform=`translate(${Math.cos(angulo*Math.PI/180)*distancia}px,${Math.sin(angulo*Math.PI/180)*distancia}px) rotate(${angulo+90}deg)`;

        mundo3d.appendChild(rayo);
    }
}

function actualizarEntrada3d(dt){
    if(!intro3dActiva)return;

    objetos3d.forEach(obj=>{
        obj.z+=obj.velocidad*dt;

        if(obj.z>620){
            obj.z=-5200-Math.random()*1800;
            obj.x=(Math.random()-.5)*(movil?520:1350);
            obj.y=(Math.random()-.5)*(movil?1000:750);
        }

        const profundidad=limitar((obj.z+5200)/5800,0,1);

        const escala=obj.tipo==="frase"
            ?.65+profundidad*.8
            :.7+profundidad*.55;

        const alpha=limitar((obj.z+5200)/900,0,1)*limitar((650-obj.z)/700,0,1);

        obj.el.style.opacity=alpha;

        obj.el.style.transform=
            `translate3d(calc(-50% + ${obj.x}px),calc(-50% + ${obj.y}px),${obj.z}px) rotate(${obj.rot}deg) scale(${escala})`;
    });
}

function iniciarEntrada3d(){
    crearEntrada3d();

    entrada3d.classList.add("activa");
    intro3dActiva=true;

    setTimeout(()=>{
        mensajeFinal3d.classList.add("activo");
    },6500);

    setTimeout(()=>{
        intro3dActiva=false;
        entrarGalaxia();
    },9000);

    setTimeout(()=>{
        entrada3d.classList.remove("activa");
        mensajeFinal3d.classList.remove("activo");
        mundo3d.innerHTML="";
        objetos3d=[];
    },10300);
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

        setTimeout(()=>{
            boton.classList.add("visible");
        },250+i*120);

        floresUI.push({
            el:boton,
            orden:i,
            total,
            base:(i/total)*Math.PI*5.3,
            fase:Math.random()*Math.PI*2
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
        y:alto*(movil?.6:.62)
    };
}

function rotacionTotal(){
    return camara.rotacion+orbitaAutomatica;
}

function dibujarNebulosas(){
    const datos=[
        {
            x:ancho*.14+Math.sin(tiempo*.16)*15,
            y:alto*.22+Math.cos(tiempo*.18)*12,
            r:Math.max(ancho,alto)*(movil?.17:.2),
            color:"65,85,190",
            a:.08
        },
        {
            x:ancho*.84+Math.cos(tiempo*.13)*18,
            y:alto*.32+Math.sin(tiempo*.15)*14,
            r:Math.max(ancho,alto)*(movil?.14:.18),
            color:"100,45,130",
            a:.065
        },
        {
            x:ancho*.5+Math.sin(tiempo*.1)*16,
            y:alto*.76+Math.cos(tiempo*.12)*12,
            r:Math.max(ancho,alto)*(movil?.2:.24),
            color:"255,187,25",
            a:.07
        }
    ];

    datos.forEach(n=>{
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);

        g.addColorStop(0,`rgba(${n.color},${n.a})`);
        g.addColorStop(.45,`rgba(${n.color},${n.a*.35})`);
        g.addColorStop(1,`rgba(${n.color},0)`);

        ctx.fillStyle=g;
        ctx.fillRect(0,0,ancho,alto);
    });
}

function dibujarEspiral(centro){
    const rotacion=rotacionTotal();

    ctx.save();
    ctx.beginPath();

    const vueltas=4.7;
    const pasos=movil?230:380;

    for(let i=0;i<=pasos;i++){
        const p=i/pasos;
        const a=p*vueltas*Math.PI*2+rotacion;
        const radio=(12+p*(movil?Math.min(ancho*.44,190):Math.min(ancho*.34,570)))*camara.zoom;

        const x=centro.x+Math.cos(a)*radio;
        const y=centro.y+Math.sin(a)*radio*(movil?.31:.27);

        if(i===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }

    ctx.strokeStyle="rgba(255,221,80,.18)";
    ctx.lineWidth=movil?1:1.3;
    ctx.shadowBlur=13;
    ctx.shadowColor="rgba(255,211,0,.38)";
    ctx.stroke();

    ctx.beginPath();

    for(let i=0;i<=pasos;i+=2){
        const p=i/pasos;
        const a=p*vueltas*Math.PI*2+rotacion;
        const radio=(12+p*(movil?Math.min(ancho*.44,190):Math.min(ancho*.34,570)))*camara.zoom;

        const x=centro.x+Math.cos(a)*radio;
        const y=centro.y+Math.sin(a)*radio*(movil?.31:.27);

        if(i===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }

    ctx.strokeStyle="rgba(255,245,180,.07)";
    ctx.lineWidth=3;
    ctx.shadowBlur=23;
    ctx.stroke();

    ctx.restore();
}

function actualizarFlores(centro){
    const rotacion=rotacionTotal();

    floresUI.forEach(flor=>{
        const progreso=(flor.orden+1)/(flor.total+1);

        const radio=(
            (movil?48:65)+
            progreso*
            (movil?Math.min(ancho*.37,150):Math.min(ancho*.29,470))
        )*camara.zoom;

        const angulo=flor.base+rotacion*(.82+progreso*.18);

        const profundidad=(Math.sin(angulo)+1)/2;
        const delante=Math.sin(angulo)>=0;

        const x=centro.x+Math.cos(angulo)*radio;

        const y=
            centro.y+
            Math.sin(angulo)*
            radio*
            (movil?.32:.28)+
            Math.sin(tiempo*1.2+flor.fase)*1.5;

        const escala=
            (movil?.64:.7)+
            profundidad*.2-
            progreso*.06;

        flor.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        flor.el.style.opacity=
            delante?.98:.58;

        if(delante){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");
            flor.el.style.zIndex=String(32+Math.round(profundidad*8));
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");
            flor.el.style.zIndex=String(18+Math.round(profundidad*4));
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

    textoCentro.style.left=`${ce