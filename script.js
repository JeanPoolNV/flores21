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
        this.x=(Math.random()-.5)*ancho*1.7;
        this.y=(Math.random()-.5)*alto*1.6;
        this.z=inicial?-1500+Math.random()*1900:-1500;
        this.velocidad=180+Math.random()*190;
        this.tamano=.45+Math.random()*1.7;
        this.alpha=.25+Math.random()*.55;
        this.color=Math.random()>.25?"255,225,95":"255,252,220";
    }

    actualizar(dt){
        this.z+=this.velocidad*dt;
        if(this.z>430){
            this.reset();
        }
    }

    dibujar(){
        const perspectiva=720/(720-this.z);
        if(perspectiva<=0)return;

        const x=ancho/2+this.x*perspectiva;
        const y=alto*.52+this.y*perspectiva;

        if(x<-20||x>ancho+20||y<-20||y>alto+20)return;

        const tamano=this.tamano*Math.max(.35,perspectiva*1.45);
        const entrada=limitar((this.z+1500)/380,0,1);
        const salida=limitar((430-this.z)/250,0,1);

        ctx.globalAlpha=this.alpha*entrada*salida;
        ctx.beginPath();
        ctx.arc(x,y,tamano,0,Math.PI*2);
        ctx.fillStyle=`rgb(${this.color})`;
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class PolvoCosmico{
    constructor(){
        this.brazo=Math.floor(Math.random()*3);
        this.nucleo=Math.random()<.2;

        if(this.nucleo){
            this.distancia=Math.pow(Math.random(),2.2)*.23;
            this.dispersion=(Math.random()-.5)*1.9;
            this.altura=(Math.random()-.5)*42;
        }else{
            this.distancia=.1+Math.pow(Math.random(),.72)*.9;
            this.dispersion=(Math.random()-.5)*.62;
            this.altura=(Math.random()-.5)*(12+this.distancia*32);
        }

        this.tamano=this.nucleo?.6+Math.random()*2:.35+Math.random()*1.35;
        this.alpha=this.nucleo?.35+Math.random()*.5:.12+Math.random()*.5;
        this.velocidad=.035+Math.random()*.025;
        this.fase=Math.random()*Math.PI*2;

        const r=Math.random();
        this.color=r>.72?"255,250,215":r>.18?"255,225,80":"255,190,45";
    }

    actualizar(dt){
        this.fase+=this.velocidad*dt;
    }

    dibujar(centro){
        const radioMax=movil?Math.min(ancho*.49,225):Math.min(ancho*.34,610);
        const radio=this.distancia*radioMax*camara.zoom;

        const angulo=
            this.brazo*(Math.PI*2/3)+
            this.distancia*Math.PI*5.3+
            this.dispersion+
            rotacionTotal()*.24+
            this.fase;

        const x3=Math.cos(angulo)*radio;
        const z3=Math.sin(angulo)*radio;
        const y3=this.altura*camara.zoom;

        const cosT=Math.cos(camara.inclinacion);
        const sinT=Math.sin(camara.inclinacion);

        const yRot=y3*cosT-z3*sinT;
        const zRot=y3*sinT+z3*cosT;

        const perspectiva=limitar(820/(820-zRot*.7),.72,1.36);
        const x=centro.x+x3*perspectiva;
        const y=centro.y+yRot*perspectiva;
        const profundidad=limitar((zRot+radioMax)/(radioMax*2),0,1);

        ctx.globalAlpha=this.alpha*(.6+profundidad*.4);
        ctx.beginPath();
        ctx.arc(x,y,this.tamano*(.7+profundidad*.65),0,Math.PI*2);
        ctx.fillStyle=`rgb(${this.color})`;
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
    const totalLuces=movil?50:85;
    const totalPetalos=movil?32:58;
    const totalPolvo=movil?360:850;
    const totalIntro=movil?150:320;
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
    const cantidadFrases=movil?18:25;
    const cantidadFlores=movil?9:14;

    for(let i=0;i<cantidadFrases;i++){
        const el=document.createElement("span");

        el.className="item-3d frase";
        el.textContent=frases3d[i%frases3d.length];

        const categoria=i%9===0?2:i%4===0?1:0;

        el.style.fontSize=`${
            categoria===2
                ?(movil?24:40)
                :categoria===1
                    ?(movil?15:23)
                    :(movil?9:14)
        }px`;

        const objeto={
            el,
            tipo:"frase",
            x:(Math.random()-.5)*ancho*.82,
            y:(Math.random()-.5)*alto*.76,
            z:-1500+Math.random()*1500,
            velocidad:155+Math.random()*100,
            rotacion:(Math.random()-.5)*5
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

        el.className="item-3d flor";

        emoji.className="flor-emoji-3d";
        emoji.textContent=data.emoji;

        el.appendChild(emoji);

        const tamano=movil?50+Math.random()*46:65+Math.random()*72;

        el.style.width=`${tamano}px`;
        el.style.height=`${tamano}px`;

        if(data.src){
            const img=document.createElement("img");

            img.src=data.src;
            img.alt="";

            img.onload=()=>{
                emoji.style.display="none";
            };

            img.onerror=()=>{
                img.remove();
            };

            el.appendChild(img);
        }

        const objeto={
            el,
            tipo:"flor",
            x:(Math.random()-.5)*ancho*.82,
            y:(Math.random()-.5)*alto*.76,
            z:-1450+Math.random()*1450,
            velocidad:145+Math.random()*95,
            rotacion:(Math.random()-.5)*12
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
        obj.z+=obj.velocidad*dt*(introCerrando?.25:1);

        if(obj.z>430&&!introCerrando){
            obj.z=-1500-Math.random()*250;
            obj.x=(Math.random()-.5)*ancho*.82;
            obj.y=(Math.random()-.5)*alto*.76;
        }

        const entrada=limitar((obj.z+1500)/280,0,1);
        const salida=limitar((430-obj.z)/260,0,1);

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
    },6000);

    setTimeout(()=>{
        intro3dActiva=false;
        entrada3d.classList.add("saliendo");
    },8200);

    setTimeout(()=>{
        entrada3d.classList.remove("activa","saliendo");
        mensajeFinal3d.classList.remove("activo");
        mundo3d.innerHTML="";
        objetos3d=[];

        requestAnimationFrame(()=>{
            entrarGalaxia();
        });
    },9000);
}

function crearFlores(){
    orbitas.innerHTML="";
    floresUI=[];

    const datos=obtenerFlores();
    const total=datos.length;

    const radiosMovil=[86,138,184,112,202,157,219];
    const alturasMovil=[-24,17,-9,31,-22,9,25];

    const radiosPC=[150,245,355,195,430,300,485];
    const alturasPC=[-42,32,-18,55,-38,14,42];

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

        floresUI.push({
            el:boton,
            base:(i/total)*Math.PI*2+i*.24,
            radio:movil?radiosMovil[i%radiosMovil.length]:radiosPC[i%radiosPC.length],
            altura:movil?alturasMovil[i%alturasMovil.length]:alturasPC[i%alturasPC.length],
            velocidad:.62+(i%4)*.075,
            fase:i*.84
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
        y:alto*(movil?.57:.59)
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
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);

        g.addColorStop(0,`rgba(${n.color},${n.a})`);
        g.addColorStop(.45,`rgba(${n.color},${n.a*.35})`);
        g.addColorStop(1,`rgba(${n.color},0)`);

        ctx.fillStyle=g;
        ctx.fillRect(0,0,ancho,alto);
    });
}

function dibujarJardinCosmico(dt){
    const centro=ramoPosicion();

    const radioGrande=Math.max(ancho,alto)*(movil?.34:.38)*camara.zoom;

    const halo=ctx.createRadialGradient(
        centro.x,
        centro.y,
        0,
        centro.x,
        centro.y,
        radioGrande
    );

    halo.addColorStop(0,"rgba(255,250,205,.25)");
    halo.addColorStop(.08,"rgba(255,222,65,.2)");
    halo.addColorStop(.25,"rgba(255,195,15,.075)");
    halo.addColorStop(.58,"rgba(255,190,0,.018)");
    halo.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=halo;
    ctx.fillRect(0,0,ancho,alto);

    ctx.save();
    ctx.globalCompositeOperation="lighter";

    polvoCosmico.forEach(p=>{
        p.actualizar(dt);
        p.dibujar(centro);
    });

    ctx.restore();

    const nucleo=ctx.createRadialGradient(
        centro.x,
        centro.y,
        0,
        centro.x,
        centro.y,
        movil?95:150
    );

    nucleo.addColorStop(0,"rgba(255,255,230,.23)");
    nucleo.addColorStop(.25,"rgba(255,225,80,.18)");
    nucleo.addColorStop(.62,"rgba(255,195,0,.055)");
    nucleo.addColorStop(1,"rgba(255,190,0,0)");

    ctx.fillStyle=nucleo;
    ctx.beginPath();
    ctx.arc(centro.x,centro.y,movil?100:155,0,Math.PI*2);
    ctx.fill();
}

function actualizarFlores3d(centro){
    const rotacion=rotacionTotal();

    floresUI.forEach(flor=>{
        const angulo=flor.base+rotacion*flor.velocidad;
        const radio=flor.radio*camara.zoom;

        const x3=Math.cos(angulo)*radio;
        const z3=Math.sin(angulo)*radio;

        const y3=
            flor.altura*camara.zoom+
            Math.sin(angulo*1.35+flor.fase)*18*camara.zoom;

        const cosT=Math.cos(camara.inclinacion);
        const sinT=Math.sin(camara.inclinacion);

        const yRot=y3*cosT-z3*sinT;
        const zRot=y3*sinT+z3*cosT;

        const perspectiva=limitar(850/(850-zRot*.78),.63,1.45);

        const x=centro.x+x3*perspectiva;
        const y=centro.y+yRot*perspectiva;

        const profundidad=limitar((zRot+flor.radio)/(flor.radio*2),0,1);
        const escala=(movil?.7:.76)*perspectiva;

        flor.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        flor.el.style.opacity=.46+profundidad*.54;
        flor.el.style.filter=
            `brightness(${.62+profundidad*.7}) saturate(${.8+profundidad*.35})`;

        if(zRot>=0){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");
            flor.el.style.zIndex=String(55+Math.round(profundidad*25));
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");
            flor.el.style.zIndex=String(15+Math.round(profundidad*18));
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
    textoCentro.style.top=`${centro.y+(movil?105:125)*camara.zoom}px`;

    actualizarFlores3d(centro);
}

function dibujarCorazon(){
    const centro=corazonPosicion();

    const cx=centro.x;
    const cy=centro.y;

    const escala=
        Math.min(ancho,alto)*
        (movil?.0085:.0098)*
        (1+Math.sin(tiempo*2)*.02);

    ctx.save();

    const pasos=movil?110:150;

    ctx.beginPath();

    for(let i=0;i<=pasos;i++){
        const t=i/pasos*Math.PI*2;
        const x=16*Math.pow(Math.sin(t),3);
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
        const x=16*Math.pow(Math.sin(t),3);
        const y=
            13*Math.cos(t)-
            5*Math.cos(2*t)-
            2*Math.cos(3*t)-
            Math.cos(4*t);

        const px=cx+x*escala*.93;
        const py=cy-y*escala*.93;

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
        chispa.dibujar(cx,cy,tiempo);
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
        cancelAnimationFrame(fadeMusica);
    }

    musicaFondo.volume=0;

    const volumenFinal=.35;
    const duracion=4000;

    musicaFondo.play().then(()=>{
        const inicioFade=performance.now();

        function subirVolumen(ahora){
            const progreso=Math.min((ahora-inicioFade)/duracion,1);
            const suave=1-Math.pow(1-progreso,3);

            musicaFondo.volume=volumenFinal*suave;

            if(progreso<1){
                fadeMusica=requestAnimationFrame(subirVolumen);
            }else{
                musicaFondo.volume=volumenFinal;
                fadeMusica=null;
            }
        }

        fadeMusica=requestAnimationFrame(subirVolumen);
    }).catch(()=>{});
}

function iniciarExperiencia(){
    if(experienciaIniciada)return;

    experienciaIniciada=true;
    iniciarMusicaSuave();
    inicio.classList.add("oculto");

    setTimeout(()=>{
        mostrarEscena(escenaFecha);
    },700);

    setTimeout(()=>{
        mostrarEscena(escenaMensaje);
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

    galaxiaInteractiva.classList.add("activa");

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

    tarjetaOverlay.classList.add("activa");
}

function abrirTarjetaCentral(){
    tarjetaTitulo.textContent="Nuestro pequeño universo";

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

    tarjetaOverlay.classList.add("activa");
}

function activarCentroEspecial(){
    const centro=ramoPosicion();

    efectoCentroHasta=performance.now()+1800;

    centroVisual.classList.remove("activa-especial");
    void centroVisual.offsetWidth;
    centroVisual.classList.add("activa-especial");

    crearExplosion(centro.x,centro.y);

    setTimeout(()=>{
        crearExplosion(centro.x-34,centro.y-14);
    },100);

    setTimeout(()=>{
        crearExplosion(centro.x+36,centro.y+12);
    },200);

    setTimeout(()=>{
        crearExplosion(centro.x,centro.y-38);
    },300);

    setTimeout(()=>{
        abrirTarjetaCentral();
    },750);

    setTimeout(()=>{
        centroVisual.classList.remove("activa-especial");
    },1800);
}

function cerrarTarjetaFn(){
    tarjetaOverlay.classList.remove("activa");
}

function crearExplosion(x,y){
    if(!modoGalaxia)return;

    explosiones.push(
        new Explosion(x,y)
    );
}

function animar(ahora){
    const dt=Math.min((ahora-ultimoFrame)/1000,.033);

    ultimoFrame=ahora;
    tiempo+=dt;

    const centroActivo=ahora<efectoCentroHasta;

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

    ctx.clearRect(0,0,ancho,alto);

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
        dibujarJardinCosmico(dt);
        dibujarCorazon();
        actualizarDOM();
    }

    explosiones.forEach(e=>{
        e.actualizar(dt);
        e.dibujar();
    });

    explosiones=explosiones.filter(
        e=>e.particulas.length
    );

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click",iniciarExperiencia);
cerrarTarjeta.addEventListener("click",cerrarTarjetaFn);

tarjetaOverlay.addEventListener("click",e=>{
    if(e.target===tarjetaOverlay){
        cerrarTarjetaFn();
    }
});

centroVisual.addEventListener("click",e=>{
    e.stopPropagation();

    if(!modoGalaxia)return;

    activarCentroEspecial();
});

galaxiaInteractiva.addEventListener("mousedown",e=>{
    if(movil||!modoGalaxia)return;

    if(
        e.target.closest(
            ".flor-orbita,.tarjeta,#centroVisual"
        )
    )return;

    arrastrandoMouse=true;

    mouseInicioX=e.clientX;
    mouseInicioY=e.clientY;

    mouseRotacionInicio=camara.rotacion;
    mouseInclinacionInicio=camara.inclinacion;

    document.body.classList.add("arrastrando");
});

window.addEventListener("mousemove",e=>{
    if(!arrastrandoMouse)return;

    const dx=e.clientX-mouseInicioX;
    const dy=e.clientY-mouseInicioY;

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
});

window.addEventListener("mouseup",()=>{
    arrastrandoMouse=false;
    document.body.classList.remove("arrastrando");
});

galaxiaInteractiva.addEventListener("touchstart",e=>{
    if(!modoGalaxia)return;

    if(e.touches.length>=2){
        const t1=e.touches[0];
        const t2=e.touches[1];

        touchMode="pinch";

        pinchStartDistance=
            distanciaTouches(t1,t2);

        pinchStartZoom=camara.zoom;

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

    touchRotStart=camara.rotacion;
    touchTiltStart=camara.inclinacion;
},{passive:false});

galaxiaInteractiva.addEventListener("touchmove",e=>{
    if(!modoGalaxia)return;

    if(e.touches.length>=2){
        const t1=e.touches[0];
        const t2=e.touches[1];

        const dist=distanciaTouches(t1,t2);

        if(touchMode!=="pinch"){
            touchMode="pinch";
            pinchStartDistance=dist;
            pinchStartZoom=camara.zoom;
        }

        camara.zoom=
            limitar(
                pinchStartZoom*
                (dist/pinchStartDistance),
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

        const dx=t.clientX-touchStartX;
        const dy=t.clientY-touchStartY;

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
},{passive:false});

galaxiaInteractiva.addEventListener("touchend",e=>{
    if(e.touches.length>=2){
        const t1=e.touches[0];
        const t2=e.touches[1];

        touchMode="pinch";

        pinchStartDistance=
            distanciaTouches(t1,t2);

        pinchStartZoom=camara.zoom;

        return;
    }

    if(e.touches.length===1){
        const t=e.touches[0];

        touchMode="drag";

        touchStartX=t.clientX;
        touchStartY=t.clientY;

        touchRotStart=camara.rotacion;
        touchTiltStart=camara.inclinacion;

        return;
    }

    touchMode="";
});

galaxiaInteractiva.addEventListener("touchcancel",()=>{
    touchMode="";
});

window.addEventListener("wheel",e=>{
    if(!modoGalaxia||movil)return;

    e.preventDefault();

    camara.zoom=
        limitar(
            camara.zoom-
            e.deltaY*.0007,
            .7,
            1.65
        );
},{passive:false});

galaxiaInteractiva.addEventListener("click",e=>{
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
});

window.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
        cerrarTarjetaFn();
    }
});

window.addEventListener("resize",ajustarCanvas);
window.visualViewport?.addEventListener("resize",ajustarCanvas);

detectarMovil();
ajustarCanvas();
crearFlores();
prepararCentro();
requestAnimationFrame(animar);
