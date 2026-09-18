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
let modoMovil=false;

let estrellas=[];
let luces=[];
let petalos=[];
let particulasGalaxia=[];
let explosiones=[];
let rastros=[];
let floresUI=[];
let palabrasUI=[];

let experienciaIniciada=false;
let modoGalaxia=false;
let tiempo=0;
let orbitaAutomatica=0;
let direccionOrbita=1;
let fadeMusica=null;

let camara={
    zoom:1,
    rotacion:0,
    panY:0,
    parallaxX:0,
    parallaxY:0
};

let arrastrando=false;
let anteriorX=0;
let anteriorY=0;
let deltaX=0;
let deltaY=0;

function limitar(valor,min,max){
    return Math.max(min,Math.min(max,valor));
}

function detectarMovil(){
    modoMovil=innerWidth<=700||matchMedia("(pointer:coarse)").matches;
}

function ajustarCanvas(){
    detectarMovil();

    ancho=innerWidth;
    alto=innerHeight;

    const dpr=modoMovil
        ?Math.min(devicePixelRatio||1,1.25)
        :Math.min(devicePixelRatio||1,1.6);

    canvas.width=Math.round(ancho*dpr);
    canvas.height=Math.round(alto*dpr);
    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    crearEscena();

    if(modoGalaxia){
        crearFlores();
        crearPalabras();
        prepararCentro();

        if(modoMovil){
            camara.zoom=.9;
            camara.panY=0;
        }
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
        this.radio=Math.random()*1.4+.2;
        this.velocidad=Math.random()*.07+.012;
        this.alpha=Math.random()*.68+.12;
        this.parpadeo=Math.random()*.01+.002;
        this.direccion=Math.random()>.5?1:-1;
        this.profundidad=Math.random();
    }

    actualizar(){
        this.y+=this.velocidad;
        this.alpha+=this.parpadeo*this.direccion;

        if(this.alpha>=1||this.alpha<=.12)this.direccion*=-1;
        if(this.y>alto+10)this.reset();
    }

    dibujar(){
        const dx=camara.parallaxX*this.profundidad;
        const dy=camara.parallaxY*this.profundidad;

        ctx.beginPath();
        ctx.arc(this.x+dx,this.y+dy,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,235,${this.alpha})`;
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
        this.y=alto+20;
        this.radio=Math.random()*1.8+.4;
        this.velocidad=Math.random()*.25+.05;
        this.alpha=Math.random()*.3+.07;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(){
        this.y-=this.velocidad;
        this.fase+=.01;
        this.x+=Math.sin(this.fase)*.1;

        if(this.y<-20)this.reset();
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
        this.y=-30;
        this.tamano=Math.random()*5+3;
        this.velocidadY=Math.random()*.35+.12;
        this.velocidadX=Math.random()*.2-.1;
        this.rotacion=Math.random()*Math.PI*2;
        this.velocidadRotacion=Math.random()*.018-.009;
        this.fase=Math.random()*Math.PI*2;
        this.alpha=Math.random()*.35+.2;
        this.profundidad=Math.random()*.8+.2;
    }

    actualizar(){
        this.y+=this.velocidadY*this.profundidad;
        this.x+=this.velocidadX;
        this.fase+=.012;
        this.x+=Math.sin(this.fase)*.2;
        this.rotacion+=this.velocidadRotacion;

        if(this.y>alto+40||this.x<-50||this.x>ancho+50)this.reset();
    }

    dibujar(){
        ctx.save();

        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotacion);
        ctx.scale(1,this.profundidad*.45+.55);

        ctx.beginPath();
        ctx.moveTo(0,-this.tamano);

        ctx.bezierCurveTo(
            this.tamano*.8,
            -this.tamano*.45,
            this.tamano*.7,
            this.tamano*.65,
            0,
            this.tamano
        );

        ctx.bezierCurveTo(
            -this.tamano*.7,
            this.tamano*.65,
            -this.tamano*.8,
            -this.tamano*.45,
            0,
            -this.tamano
        );

        const g=ctx.createLinearGradient(0,-this.tamano,0,this.tamano);

        g.addColorStop(0,`rgba(255,245,130,${this.alpha})`);
        g.addColorStop(.5,`rgba(255,215,30,${this.alpha})`);
        g.addColorStop(1,`rgba(205,145,0,${this.alpha*.65})`);

        ctx.fillStyle=g;
        ctx.fill();

        ctx.restore();
    }
}

class ParticulaGalaxia{
    constructor(){
        const maxRadio=Math.min(ancho,alto)*(modoMovil?.36:.43);

        this.radio=Math.pow(Math.random(),.65)*maxRadio+8;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.038+this.brazo+(Math.random()-.5)*.65;
        this.tamano=Math.random()*1.8+.25;
        this.alpha=Math.random()*.65+.08;
        this.velocidad=.25+Math.random()*.5;
        this.desfase=(Math.random()-.5)*(modoMovil?18:28);
        this.brilla=Math.random()<.12;
        this.color=Math.random()>.3?"#ffe35c":"#fff7bf";
    }

    dibujar(cx,cy){
        const angulo=this.angulo+camara.rotacion+orbitaAutomatica*this.velocidad;
        const radio=this.radio*camara.zoom;

        const x=cx+Math.cos(angulo)*radio;
        const y=cy+Math.sin(angulo)*radio*.32+this.desfase*camara.zoom;

        ctx.globalAlpha=this.alpha;
        ctx.shadowBlur=this.brilla?(modoMovil?3:7):0;
        ctx.shadowColor="#ffd900";

        ctx.beginPath();
        ctx.arc(x,y,this.tamano*camara.zoom,0,Math.PI*2);
        ctx.fillStyle=this.color;
        ctx.fill();

        ctx.globalAlpha=1;
        ctx.shadowBlur=0;
    }
}

class Explosion{
    constructor(x,y){
        this.particulas=[];

        const cantidad=modoMovil?16:28;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*2.2+.5;

            this.particulas.push({
                x,
                y,
                vx:Math.cos(angulo)*velocidad,
                vy:Math.sin(angulo)*velocidad,
                vida:1,
                radio:Math.random()*2.5+1
            });
        }
    }

    actualizar(){
        this.particulas.forEach(p=>{
            p.x+=p.vx;
            p.y+=p.vy;
            p.vx*=.985;
            p.vy*=.985;
            p.vida-=.025;
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

class Rastro{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.radio=Math.random()*2+.5;
        this.vida=1;
    }

    actualizar(){
        this.vida-=.05;
        this.radio*=.98;
    }

    dibujar(){
        ctx.globalAlpha=this.vida;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle="#ffe875";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

function crearEscena(){
    estrellas=[];
    luces=[];
    petalos=[];
    particulasGalaxia=[];

    const totalEstrellas=modoMovil
        ?Math.min(170,Math.floor(ancho*alto/5000))
        :Math.min(380,Math.floor(ancho*alto/4200));

    const totalLuces=modoMovil
        ?Math.min(38,Math.floor(ancho*alto/16000))
        :Math.min(80,Math.floor(ancho*alto/13000));

    const totalPetalos=modoMovil
        ?Math.min(24,Math.floor(ancho*alto/25000))
        :Math.min(45,Math.floor(ancho*alto/23000));

    const totalGalaxia=modoMovil
        ?Math.min(430,Math.floor(ancho*alto/950))
        :Math.min(1050,Math.floor(ancho*alto/900));

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
            angulo:i/datos.length*Math.PI*2,
            radio:.68+(i%4)*.15,
            velocidad:.58+Math.random()*.38,
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
        },500+i*85);

        palabrasUI.push({
            el:elemento,
            angulo:Number(dato.dataset.angulo||0)*Math.PI/180,
            radio:Number(dato.dataset.radio||1),
            velocidad:Number(dato.dataset.velocidad||.2),
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
        x:ancho/2+(modoMovil?0:camara.parallaxX*.35),
        y:alto*(modoMovil?.47:.49)+camara.panY+(modoMovil?0:camara.parallaxY*.28)
    };
}

function actualizarDOM(){
    if(!modoGalaxia)return;

    const centro=centroEscena();

    const baseRX=modoMovil
        ?Math.min(ancho*.285,120)*camara.zoom
        :Math.min(ancho*.31,430)*camara.zoom;

    const baseRY=modoMovil
        ?Math.min(alto*.17,145)*camara.zoom
        :Math.min(alto*.22,190)*camara.zoom;

    floresUI.forEach(flor=>{
        const angulo=flor.angulo+camara.rotacion+orbitaAutomatica*flor.velocidad;
        const ondulacion=Math.sin(tiempo*1.2+flor.fase)*(modoMovil?4:10);

        const rx=baseRX*flor.radio+ondulacion;
        const ry=baseRY*flor.radio;

        let x=centro.x+Math.cos(angulo)*rx;
        let y=centro.y+Math.sin(angulo)*ry;

        const profundidad=.8+(Math.sin(angulo)+1)*.15;
        const escala=modoMovil?profundidad*.92:profundidad;

        if(modoMovil){
            x=limitar(x,32,ancho-32);
            y=limitar(y,85,alto-80);
        }

        flor.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        if(flor.el.classList.contains("visible")){
            flor.el.style.opacity=.72+profundidad*.23;
        }

        flor.el.style.zIndex=String(10+Math.round(profundidad*20));
    });

    palabrasUI.forEach(palabra=>{
        const angulo=
            palabra.angulo+
            camara.rotacion*.65+
            orbitaAutomatica*palabra.velocidad;

        const radio=modoMovil
            ?.62+(limitar(palabra.radio,.75,1.92)-.75)*.36
            :palabra.radio;

        const rx=modoMovil
            ?Math.min(ancho*.30,115)*radio*camara.zoom
            :Math.min(ancho*.41,670)*radio*camara.zoom;

        const ry=modoMovil
            ?Math.min(alto*.32,245)*radio*camara.zoom
            :Math.min(alto*.32,300)*radio*camara.zoom;

        let x=centro.x+Math.cos(angulo)*rx;

        let y=
            centro.y+
            Math.sin(angulo)*ry+
            Math.sin(tiempo*1.35+palabra.fase)*(modoMovil?4:9);

        const profundidad=(Math.sin(angulo)+1)/2;

        const escala=modoMovil
            ?.76+profundidad*.24
            :.72+profundidad*.42;

        const inclinacion=modoMovil
            ?Math.cos(angulo)*4
            :Math.cos(angulo)*9;

        if(modoMovil){
            const mitad=Math.min((palabra.ancho*escala)/2,70);

            x=limitar(
                x,
                mitad+8,
                ancho-mitad-8
            );

            y=limitar(
                y,
                55,
                alto-45
            );
        }

        palabra.el.style.transform=
            `translate3d(${x}px,${y}px,0) translate(-50%,-50%) perspective(700px) rotateY(${inclinacion}deg) scale(${escala})`;

        palabra.el.style.zIndex=
            String(5+Math.round(profundidad*20));

        if(palabra.el.classList.contains("visible")){
            palabra.el.style.opacity=.4+profundidad*.5;
        }
    });

    const distanciaCorazon=modoMovil
        ?Math.min(alto*.19,145)*camara.zoom
        :175*camara.zoom;

    const corazonY=centro.y-distanciaCorazon;

    textoCorazon.style.left=`${centro.x}px`;
    textoCorazon.style.top=`${corazonY}px`;

    const nucleoY=
        centro.y+
        (modoMovil?95:75)*
        camara.zoom;

    centroVisual.style.left=`${centro.x}px`;
    centroVisual.style.top=`${nucleoY}px`;
    centroVisual.style.transform=`translate3d(-50%,-50%,0) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;
    textoCentro.style.top=`${nucleoY+(modoMovil?76:90)*camara.zoom}px`;
}

function dibujarGalaxia(){
    const centro=centroEscena();

    const nucleoY=
        centro.y+
        (modoMovil?95:75)*
        camara.zoom;

    const radioLuz=
        Math.max(ancho,alto)*
        (modoMovil?.22:.28)*
        camara.zoom;

    const g=ctx.createRadialGradient(
        centro.x,
        nucleoY,
        0,
        centro.x,
        nucleoY,
        radioLuz
    );

    g.addColorStop(0,"rgba(255,235,120,.17)");
    g.addColorStop(.25,"rgba(255,210,0,.07)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;
    ctx.fillRect(0,0,ancho,alto);

    particulasGalaxia.forEach(particula=>{
        particula.dibujar(centro.x,nucleoY);
    });

    ctx.save();

    ctx.strokeStyle="rgba(255,245,175,.62)";
    ctx.lineWidth=modoMovil?1:1.4;
    ctx.shadowBlur=modoMovil?5:10;
    ctx.shadowColor="#ffd900";
    ctx.beginPath();

    const limite=modoMovil?17*Math.PI:22*Math.PI;

    for(let t=0;t<limite;t+=modoMovil?.22:.15){
        const radio=t*.9*camara.zoom;
        const angulo=t+camara.rotacion+orbitaAutomatica*.5;

        const x=centro.x+Math.cos(angulo)*radio*.82;
        const y=nucleoY+Math.sin(angulo)*radio*.29;

        if(t===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }

    ctx.stroke();
    ctx.restore();
}

function dibujarCorazon(){
    const centro=centroEscena();

    const cx=centro.x;

    const distancia=modoMovil
        ?Math.min(alto*.19,145)*camara.zoom
        :175*camara.zoom;

    const cy=centro.y-distancia;

    const escala=
        Math.min(ancho,alto)*
        (modoMovil?.0095:.011)*
        camara.zoom*
        (1+Math.sin(tiempo*2)*.018);

    const pasos=modoMovil?120:180;

    ctx.save();

    ctx.beginPath();

    for(let i=0;i<=pasos;i++){
        const t=i/pasos*Math.PI*2;
        const x=16*Math.pow(Math.sin(t),3);
        const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);

        const px=cx+x*escala;
        const py=cy-y*escala;

        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
    }

    ctx.closePath();
    ctx.strokeStyle="rgba(255,232,90,.88)";
    ctx.lineWidth=modoMovil?1.5:2;
    ctx.shadowBlur=modoMovil?9:15;
    ctx.shadowColor="#ffd900";
    ctx.stroke();

    ctx.shadowBlur=0;

    const puntos=modoMovil?80:130;

    for(let i=0;i<puntos;i++){
        const t=i/puntos*Math.PI*2;
        const x=16*Math.pow(Math.sin(t),3);
        const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);

        ctx.beginPath();
        ctx.arc(
            cx+x*escala,
            cy-y*escala,
            modoMovil?1.1:1.35,
            0,
            Math.PI*2
        );

        ctx.fillStyle=i%7===0?"#fffbd6":"#ffe766";
        ctx.fill();
    }

    ctx.restore();
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

    if(modoMovil){
        camara.zoom=.9;
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

    explosiones.push(new Explosion(x,y));
}

function aplicarMovimiento(){
    if(!arrastrando)return;

    const sensibilidad=modoMovil?.009:.006;

    camara.rotacion-=deltaX*sensibilidad;

    camara.panY=limitar(
        camara.panY+deltaY*(modoMovil?.18:.32),
        modoMovil?-65:-150,
        modoMovil?65:150
    );

    if(Math.abs(deltaX)>1){
        direccionOrbita=deltaX>0?-1:1;
    }

    deltaX=0;
    deltaY=0;
}

function animar(){
    tiempo+=.01;

    aplicarMovimiento();

    if(modoGalaxia&&!arrastrando){
        orbitaAutomatica+=
            (modoMovil?.0007:.0015)*
            direccionOrbita;
    }

    ctx.clearRect(0,0,ancho,alto);

    estrellas.forEach(e=>{
        e.actualizar();
        e.dibujar();
    });

    if(experienciaIniciada){
        luces.forEach(l=>{
            l.actualizar();
            l.dibujar();
        });

        petalos.forEach(p=>{
            p.actualizar();
            p.dibujar();
        });
    }

    if(modoGalaxia){
        dibujarGalaxia();
        dibujarCorazon();
        actualizarDOM();
    }

    explosiones.forEach(e=>{
        e.actualizar();
        e.dibujar();
    });

    explosiones=explosiones.filter(e=>e.particulas.length);

    if(!modoMovil){
        rastros.forEach(r=>{
            r.actualizar();
            r.dibujar();
        });

        rastros=rastros.filter(r=>r.vida>0);
    }

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click",iniciarExperiencia);

cerrarTarjeta.addEventListener("click",cerrarTarjetaFn);

tarjetaOverlay.addEventListener("click",e=>{
    if(e.target===tarjetaOverlay)cerrarTarjetaFn();
});

window.addEventListener("mousemove",e=>{
    if(modoMovil)return;

    camara.parallaxX=(e.clientX-ancho/2)*.012;
    camara.parallaxY=(e.clientY-alto/2)*.008;

    if(modoGalaxia&&!arrastrando){
        rastros.push(new Rastro(e.clientX,e.clientY));

        if(rastros.length>45)rastros.shift();
    }
});

galaxiaInteractiva.addEventListener("pointerdown",e=>{
    if(!modoGalaxia)return;

    if(e.target.closest(".flor-orbita,.palabra-flotante"))return;

    arrastrando=true;

    anteriorX=e.clientX;
    anteriorY=e.clientY;

    deltaX=0;
    deltaY=0;

    galaxiaInteractiva.setPointerCapture?.(e.pointerId);

    document.body.classList.add("arrastrando");
});

galaxiaInteractiva.addEventListener("pointermove",e=>{
    if(!arrastrando)return;

    const dx=e.clientX-anteriorX;
    const dy=e.clientY-anteriorY;

    deltaX+=dx;
    deltaY+=dy;

    anteriorX=e.clientX;
    anteriorY=e.clientY;
});

function terminarArrastre(e){
    if(!arrastrando)return;

    arrastrando=false;
    deltaX=0;
    deltaY=0;

    galaxiaInteractiva.releasePointerCapture?.(e.pointerId);

    document.body.classList.remove("arrastrando");
}

galaxiaInteractiva.addEventListener("pointerup",terminarArrastre);
galaxiaInteractiva.addEventListener("pointercancel",terminarArrastre);

window.addEventListener("wheel",e=>{
    if(!modoGalaxia||modoMovil)return;

    e.preventDefault();

    camara.zoom=limitar(
        camara.zoom-e.deltaY*.0007,
        .55,
        1.8
    );
},{
    passive:false
});

galaxiaInteractiva.addEventListener("click",e=>{
    if(!modoGalaxia)return;

    if(e.target.closest(".flor-orbita,.palabra-flotante"))return;

    crearExplosion(e.clientX,e.clientY);
});

window.addEventListener("keydown",e=>{
    if(e.key==="Escape")cerrarTarjetaFn();
});

window.addEventListener("resize",ajustarCanvas);

detectarMovil();
ajustarCanvas();
animar();