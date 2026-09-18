const canvas=document.getElementById("espacio");
const ctx=canvas.getContext("2d");

const inicio=document.getElementById("inicio");
const btnComenzar=document.getElementById("btnComenzar");
const escenaFecha=document.getElementById("escenaFecha");
const escenaMensaje=document.getElementById("escenaMensaje");
const galaxiaInteractiva=document.getElementById("galaxiaInteractiva");

const orbitas=document.getElementById("orbitas");
const palabras=document.getElementById("palabras");
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
let explosiones=[];
let floresUI=[];
let palabrasUI=[];

let experienciaIniciada=false;
let modoGalaxia=false;
let arrastrando=false;

let tiempo=0;
let orbitaAutomatica=0;
let ultimoFrame=performance.now();
let fadeMusica=null;

let inicioArrastreX=0;
let inicioArrastreY=0;
let rotacionInicio=0;
let panInicio=0;

let camara={
    zoom:1,
    rotacion:0,
    panY:0
};

function limitar(valor,min,max){
    return Math.max(min,Math.min(max,valor));
}

function detectarMovil(){
    movil=innerWidth<=700||matchMedia("(pointer:coarse)").matches;
}

function ajustarCanvas(){
    detectarMovil();

    ancho=innerWidth;
    alto=innerHeight;

    const dpr=movil?1:Math.min(devicePixelRatio||1,1.5);

    canvas.width=Math.round(ancho*dpr);
    canvas.height=Math.round(alto*dpr);

    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    crearEscena();

    if(movil){
        camara.zoom=.88;
        camara.panY=0;
    }

    if(modoGalaxia){
        crearFlores();
        crearPalabras();
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
        this.radio=Math.random()*1.3+.2;
        this.velocidad=Math.random()*.05+.015;
        this.alpha=Math.random()*.65+.15;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y+=this.velocidad*dt*60;
        this.fase+=dt*.8;

        if(this.y>alto+10)this.reset();
    }

    dibujar(){
        const alpha=this.alpha*(.75+Math.sin(this.fase)*.25);

        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,235,${alpha})`;
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
        this.radio=Math.random()*1.6+.3;
        this.velocidad=Math.random()*.17+.04;
        this.alpha=Math.random()*.28+.05;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y-=this.velocidad*dt*60;
        this.fase+=dt*.7;
        this.x+=Math.sin(this.fase)*.06*dt*60;

        if(this.y<-15)this.reset();
    }

    dibujar(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,220,60,${this.alpha})`;
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
        this.y=-20;
        this.tamano=Math.random()*4+3;
        this.vy=Math.random()*.22+.08;
        this.vx=Math.random()*.12-.06;
        this.rotacion=Math.random()*Math.PI*2;
        this.vr=Math.random()*.012-.006;
        this.fase=Math.random()*Math.PI*2;
        this.alpha=Math.random()*.32+.18;
    }

    actualizar(dt){
        const factor=dt*60;

        this.y+=this.vy*factor;
        this.x+=this.vx*factor;
        this.fase+=dt*.7;
        this.x+=Math.sin(this.fase)*.08*factor;
        this.rotacion+=this.vr*factor;

        if(this.y>alto+30||this.x<-30||this.x>ancho+30)this.reset();
    }

    dibujar(){
        ctx.save();

        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotacion);

        ctx.beginPath();
        ctx.moveTo(0,-this.tamano);

        ctx.bezierCurveTo(
            this.tamano*.8,
            -this.tamano*.4,
            this.tamano*.65,
            this.tamano*.65,
            0,
            this.tamano
        );

        ctx.bezierCurveTo(
            -this.tamano*.65,
            this.tamano*.65,
            -this.tamano*.8,
            -this.tamano*.4,
            0,
            -this.tamano
        );

        ctx.fillStyle=`rgba(255,215,35,${this.alpha})`;
        ctx.fill();

        ctx.restore();
    }
}

class ParticulaGalaxia{
    constructor(){
        const maxRadio=Math.min(ancho,alto)*(movil?.38:.45);

        this.radio=Math.pow(Math.random(),.62)*maxRadio+5;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.045+this.brazo+(Math.random()-.5)*.55;
        this.tamano=Math.random()*1.5+.25;
        this.alpha=Math.random()*.62+.08;
        this.desfase=(Math.random()-.5)*(movil?14:22);
        this.color=Math.random()>.25?"#ffe35c":"#fff9cc";
    }

    dibujar(cx,cy,rotacion){
        const angulo=this.angulo+rotacion;
        const radio=this.radio*camara.zoom;

        const x=cx+Math.cos(angulo)*radio;
        const y=cy+Math.sin(angulo)*radio*.31+this.desfase*camara.zoom;

        ctx.globalAlpha=this.alpha;

        ctx.beginPath();
        ctx.arc(x,y,this.tamano*camara.zoom,0,Math.PI*2);
        ctx.fillStyle=this.color;
        ctx.fill();

        ctx.globalAlpha=1;
    }
}

class Explosion{
    constructor(x,y){
        this.particulas=[];

        const cantidad=movil?12:22;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*1.8+.5;

            this.particulas.push({
                x,
                y,
                vx:Math.cos(angulo)*velocidad,
                vy:Math.sin(angulo)*velocidad,
                vida:1,
                radio:Math.random()*2+1
            });
        }
    }

    actualizar(dt){
        const factor=dt*60;

        this.particulas.forEach(p=>{
            p.x+=p.vx*factor;
            p.y+=p.vy*factor;
            p.vx*=Math.pow(.98,factor);
            p.vy*=Math.pow(.98,factor);
            p.vida-=.025*factor;
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

    const totalEstrellas=movil?110:300;
    const totalLuces=movil?25:60;
    const totalPetalos=movil?15:35;
    const totalGalaxia=movil?280:850;

    for(let i=0;i<totalEstrellas;i++)estrellas.push(new Estrella());
    for(let i=0;i<totalLuces;i++)luces.push(new Luz());
    for(let i=0;i<totalPetalos;i++)petalos.push(new Petalo());
    for(let i=0;i<totalGalaxia;i++)particulasGalaxia.push(new ParticulaGalaxia());
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

function crearFlores(){
    orbitas.innerHTML="";
    floresUI=[];

    const datos=obtenerFlores();
    const anguloDorado=2.399963229728653;

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
        },180+i*90);

        floresUI.push({
            el:boton,
            angulo:i*anguloDorado,
            radio:.58+i*.07,
            fase:Math.random()*Math.PI*2
        });
    });
}

function crearPalabras(){
    palabras.innerHTML="";
    palabrasUI=[];

    const datos=[...document.querySelectorAll(".dato-palabra")];

    datos.forEach((dato,i)=>{
        const elemento=document.createElement("span");

        elemento.className="palabra-flotante";
        elemento.textContent=dato.dataset.texto;

        palabras.appendChild(elemento);

        setTimeout(()=>{
            elemento.classList.add("visible");
        },400+i*55);

        palabrasUI.push({
            el:elemento,
            angulo:Number(dato.dataset.angulo||0)*Math.PI/180,
            radio:Number(dato.dataset.radio||1),
            fase:Math.random()*Math.PI*2,
            ancho:elemento.offsetWidth
        });

        elemento.addEventListener("click",e=>{
            e.stopPropagation();

            const rect=elemento.getBoundingClientRect();

            crearExplosion(
                rect.left+rect.width/2,
                rect.top+rect.height/2
            );
        });
    });
}

function centroEscena(){
    return{
        x:ancho/2,
        y:alto*(movil?.47:.49)+camara.panY
    };
}

function rotacionTotal(){
    return camara.rotacion+orbitaAutomatica;
}

function actualizarDOM(){
    if(!modoGalaxia)return;

    const centro=centroEscena();
    const rotacion=rotacionTotal();

    const baseRX=movil
        ?Math.min(ancho*.33,135)*camara.zoom
        :Math.min(ancho*.32,440)*camara.zoom;

    const baseRY=movil
        ?Math.min(alto*.20,165)*camara.zoom
        :Math.min(alto*.23,205)*camara.zoom;

    floresUI.forEach(flor=>{
        const angulo=flor.angulo+rotacion;
        const radio=flor.radio;

        let x=
            centro.x+
            Math.cos(angulo)*
            baseRX*
            radio;

        let y=
            centro.y+
            Math.sin(angulo)*
            baseRY*
            radio;

        y+=Math.sin(tiempo*1.2+flor.fase)*(movil?2:5);

        const profundidad=(Math.sin(angulo)+1)/2;
        const escala=movil
            ?.72+profundidad*.28
            :.72+profundidad*.42;

        if(movil){
            x=limitar(x,30,ancho-30);
            y=limitar(y,75,alto-65);
        }

        flor.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        if(flor.el.classList.contains("visible")){
            flor.el.style.opacity=.62+profundidad*.38;
        }

        flor.el.style.zIndex=String(10+Math.round(profundidad*25));
    });

    palabrasUI.forEach(palabra=>{
        const angulo=palabra.angulo+rotacion*.82;

        const radio=movil
            ?.62+(limitar(palabra.radio,.75,1.95)-.75)*.34
            :palabra.radio;

        const rx=movil
            ?Math.min(ancho*.37,145)*radio*camara.zoom
            :Math.min(ancho*.42,680)*radio*camara.zoom;

        const ry=movil
            ?Math.min(alto*.34,260)*radio*camara.zoom
            :Math.min(alto*.33,310)*radio*camara.zoom;

        let x=centro.x+Math.cos(angulo)*rx;
        let y=centro.y+Math.sin(angulo)*ry;

        y+=Math.sin(tiempo+palabra.fase)*(movil?2.5:6);

        const profundidad=(Math.sin(angulo)+1)/2;
        const escala=movil
            ?.72+profundidad*.2
            :.75+profundidad*.32;

        if(movil){
            const margen=Math.min(palabra.ancho*escala/2,60);

            x=limitar(x,margen+6,ancho-margen-6);
            y=limitar(y,40,alto-35);
        }

        palabra.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        palabra.el.style.zIndex=String(4+Math.round(profundidad*18));

        if(palabra.el.classList.contains("visible")){
            palabra.el.style.opacity=.35+profundidad*.48;
        }
    });

    const distanciaCorazon=movil
        ?Math.min(alto*.19,145)*camara.zoom
        :180*camara.zoom;

    const corazonY=centro.y-distanciaCorazon;

    textoCorazon.style.left=`${centro.x}px`;
    textoCorazon.style.top=`${corazonY}px`;

    const nucleoY=
        centro.y+
        (movil?95:80)*
        camara.zoom;

    centroVisual.style.left=`${centro.x}px`;
    centroVisual.style.top=`${nucleoY}px`;
    centroVisual.style.transform=
        `translate3d(-50%,-50%,0) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;
    textoCentro.style.top=
        `${nucleoY+(movil?72:92)*camara.zoom}px`;
}

function dibujarGalaxia(){
    const centro=centroEscena();

    const nucleoY=
        centro.y+
        (movil?95:80)*
        camara.zoom;

    const rotacion=rotacionTotal();

    const radioLuz=
        Math.max(ancho,alto)*
        (movil?.20:.27)*
        camara.zoom;

    const g=ctx.createRadialGradient(
        centro.x,
        nucleoY,
        0,
        centro.x,
        nucleoY,
        radioLuz
    );

    g.addColorStop(0,"rgba(255,235,120,.16)");
    g.addColorStop(.28,"rgba(255,210,0,.065)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;
    ctx.fillRect(0,0,ancho,alto);

    particulasGalaxia.forEach(particula=>{
        particula.dibujar(
            centro.x,
            nucleoY,
            rotacion
        );
    });

    ctx.beginPath();

    const limite=movil?15*Math.PI:21*Math.PI;
    const salto=movil?.26:.18;

    for(let t=0;t<limite;t+=salto){
        const radio=t*.9*camara.zoom;
        const angulo=t+rotacion;

        const x=
            centro.x+
            Math.cos(angulo)*
            radio*.82;

        const y=
            nucleoY+
            Math.sin(angulo)*
            radio*.29;

        if(t===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }

    ctx.strokeStyle="rgba(255,245,175,.58)";
    ctx.lineWidth=movil?1:1.3;
    ctx.stroke();
}

function dibujarCorazon(){
    const centro=centroEscena();

    const distancia=movil
        ?Math.min(alto*.19,145)*camara.zoom
        :180*camara.zoom;

    const cx=centro.x;
    const cy=centro.y-distancia;

    const escala=
        Math.min(ancho,alto)*
        (movil?.0093:.011)*
        camara.zoom*
        (1+Math.sin(tiempo*2)*.014);

    ctx.beginPath();

    const pasos=movil?90:140;

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

        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
    }

    ctx.closePath();

    ctx.strokeStyle="#ffe85e";
    ctx.lineWidth=movil?1.5:2;
    ctx.shadowBlur=movil?7:11;
    ctx.shadowColor="#ffd900";
    ctx.stroke();

    ctx.shadowBlur=0;
}

function mostrarEscena(escena){
    document.querySelectorAll(".escena").forEach(e=>{
        e.classList.remove("activa");
    });

    if(escena)escena.classList.add("activa");
}

function iniciarMusicaSuave(){
    if(fadeMusica)cancelAnimationFrame(fadeMusica);

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
    },4300);

    setTimeout(()=>{
        mostrarEscena(null);
        entrarGalaxia();
    },8200);
}

function entrarGalaxia(){
    modoGalaxia=true;

    if(movil){
        camara.zoom=.88;
        camara.panY=0;
    }

    galaxiaInteractiva.classList.add("activa");

    crearFlores();
    crearPalabras();
    prepararCentro();

    crearExplosion(ancho/2,alto/2);
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

    if(modoGalaxia&&!arrastrando){
        orbitaAutomatica+=dt*(movil?.035:.055);
    }

    ctx.clearRect(0,0,ancho,alto);

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

    if(modoGalaxia){
        dibujarGalaxia();
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

galaxiaInteractiva.addEventListener(
    "pointerdown",
    e=>{
        if(!modoGalaxia)return;

        if(
            e.target.closest(
                ".flor-orbita,.palabra-flotante"
            )
        )return;

        arrastrando=true;

        inicioArrastreX=e.clientX;
        inicioArrastreY=e.clientY;

        rotacionInicio=camara.rotacion;
        panInicio=camara.panY;

        galaxiaInteractiva.setPointerCapture?.(
            e.pointerId
        );

        document.body
            .classList
            .add("arrastrando");
    }
);

galaxiaInteractiva.addEventListener(
    "pointermove",
    e=>{
        if(!arrastrando)return;

        const dx=
            e.clientX-
            inicioArrastreX;

        const dy=
            e.clientY-
            inicioArrastreY;

        const sensibilidad=
            movil
            ?.009
            :.006;

        camara.rotacion=
            rotacionInicio+
            dx*
            sensibilidad;

        camara.panY=
            limitar(
                panInicio+
                dy*
                (movil?.18:.28),
                movil?-55:-140,
                movil?55:140
            );
    }
);

function terminarArrastre(e){
    if(!arrastrando)return;

    arrastrando=false;

    galaxiaInteractiva
        .releasePointerCapture?.(
            e.pointerId
        );

    document.body
        .classList
        .remove("arrastrando");
}

galaxiaInteractiva.addEventListener(
    "pointerup",
    terminarArrastre
);

galaxiaInteractiva.addEventListener(
    "pointercancel",
    terminarArrastre
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
                .55,
                1.8
            );
    },
    {passive:false}
);

galaxiaInteractiva.addEventListener(
    "click",
    e=>{
        if(!modoGalaxia)return;

        if(
            e.target.closest(
                ".flor-orbita,.palabra-flotante"
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

detectarMovil();
ajustarCanvas();
requestAnimationFrame(animar);