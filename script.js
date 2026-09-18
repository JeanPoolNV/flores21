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

function limitar(valor,min,max){
    return Math.max(min,Math.min(max,valor));
}

function ajustarCanvas(){
    const dpr=Math.min(devicePixelRatio||1,2);

    ancho=innerWidth;
    alto=innerHeight;

    canvas.width=ancho*dpr;
    canvas.height=alto*dpr;

    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    crearEscena();

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
        this.radio=Math.random()*1.5+.2;
        this.velocidad=Math.random()*.08+.015;
        this.alpha=Math.random()*.7+.15;
        this.parpadeo=Math.random()*.012+.003;
        this.direccion=Math.random()>.5?1:-1;
        this.profundidad=Math.random();
    }

    actualizar(){
        this.y+=this.velocidad;
        this.alpha+=this.parpadeo*this.direccion;

        if(this.alpha>=1||this.alpha<=.15)this.direccion*=-1;
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
        this.radio=Math.random()*2+.4;
        this.velocidad=Math.random()*.28+.06;
        this.alpha=Math.random()*.35+.08;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(){
        this.y-=this.velocidad;
        this.fase+=.01;
        this.x+=Math.sin(this.fase)*.12;

        if(this.y<-20)this.reset();
    }

    dibujar(){
        ctx.save();
        ctx.shadowBlur=12;
        ctx.shadowColor="#ffd900";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,220,60,${this.alpha})`;
        ctx.fill();
        ctx.restore();
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
        this.tamano=Math.random()*6+4;
        this.velocidadY=Math.random()*.42+.13;
        this.velocidadX=Math.random()*.25-.125;
        this.rotacion=Math.random()*Math.PI*2;
        this.velocidadRotacion=Math.random()*.022-.011;
        this.fase=Math.random()*Math.PI*2;
        this.alpha=Math.random()*.4+.25;
        this.profundidad=Math.random()*.8+.2;
    }

    actualizar(){
        this.y+=this.velocidadY*this.profundidad;
        this.x+=this.velocidadX;
        this.fase+=.012;
        this.x+=Math.sin(this.fase)*.25;
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

        ctx.shadowBlur=9;
        ctx.shadowColor="rgba(255,210,0,.25)";
        ctx.fillStyle=g;
        ctx.fill();

        ctx.restore();
    }
}

class ParticulaGalaxia{
    constructor(){
        const maxRadio=Math.min(ancho,alto)*.43;

        this.radio=Math.pow(Math.random(),.65)*maxRadio+10;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.038+this.brazo+(Math.random()-.5)*.65;
        this.tamano=Math.random()*2+.25;
        this.alpha=Math.random()*.72+.08;
        this.velocidad=.25+Math.random()*.55;
        this.desfase=(Math.random()-.5)*28;
    }

    dibujar(cx,cy){
        const angulo=this.angulo+camara.rotacion+orbitaAutomatica*this.velocidad;
        const radio=this.radio*camara.zoom;
        const x=cx+Math.cos(angulo)*radio;
        const y=cy+Math.sin(angulo)*radio*.32+this.desfase*camara.zoom;

        ctx.save();
        ctx.globalAlpha=this.alpha;
        ctx.shadowBlur=8;
        ctx.shadowColor="rgba(255,215,0,.85)";
        ctx.beginPath();
        ctx.arc(x,y,this.tamano*camara.zoom,0,Math.PI*2);
        ctx.fillStyle=Math.random()>.3?"#ffe35c":"#fff7bf";
        ctx.fill();
        ctx.restore();
    }
}

class Explosion{
    constructor(x,y){
        this.particulas=[];

        for(let i=0;i<28;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*2.4+.6;

            this.particulas.push({
                x,
                y,
                vx:Math.cos(angulo)*velocidad,
                vy:Math.sin(angulo)*velocidad,
                vida:1,
                radio:Math.random()*3+1
            });
        }
    }

    actualizar(){
        this.particulas.forEach(p=>{
            p.x+=p.vx;
            p.y+=p.vy;
            p.vx*=.985;
            p.vy*=.985;
            p.vida-=.022;
        });

        this.particulas=this.particulas.filter(p=>p.vida>0);
    }

    dibujar(){
        this.particulas.forEach(p=>{
            ctx.save();
            ctx.globalAlpha=p.vida;
            ctx.shadowBlur=12;
            ctx.shadowColor="#ffd900";
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.radio,0,Math.PI*2);
            ctx.fillStyle="#ffe563";
            ctx.fill();
            ctx.restore();
        });
    }
}

class Rastro{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.radio=Math.random()*2.5+.5;
        this.vida=1;
    }

    actualizar(){
        this.vida-=.04;
        this.radio*=.985;
    }

    dibujar(){
        ctx.save();
        ctx.globalAlpha=this.vida;
        ctx.shadowBlur=8;
        ctx.shadowColor="#ffd900";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radio,0,Math.PI*2);
        ctx.fillStyle="#ffe875";
        ctx.fill();
        ctx.restore();
    }
}

function crearEscena(){
    estrellas=[];
    luces=[];
    petalos=[];
    particulasGalaxia=[];

    const totalEstrellas=Math.min(450,Math.floor(ancho*alto/3800));
    const totalLuces=Math.min(110,Math.floor(ancho*alto/12000));
    const totalPetalos=Math.min(55,Math.floor(ancho*alto/22000));
    const totalGalaxia=Math.min(1400,Math.floor(ancho*alto/750));

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
        boton.className="flor-orbita";

        const contenedor=document.createElement("span");
        contenedor.className="flor-contenedor";

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

        const etiqueta=document.createElement("span");

        etiqueta.className="flor-nombre";
        etiqueta.textContent=flor.etiqueta;

        boton.appendChild(contenedor);
        boton.appendChild(etiqueta);

        boton.addEventListener("click",e=>{
            e.stopPropagation();
            abrirTarjeta(flor);
        });

        orbitas.appendChild(boton);

        setTimeout(()=>{
            boton.classList.add("visible");
        },350+i*180);

        floresUI.push({
            el:boton,
            angulo:i/datos.length*Math.PI*2,
            radio:.65+(i%4)*.18,
            velocidad:.65+Math.random()*.55,
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
        },700+i*120);

        palabrasUI.push({
            el:elemento,
            angulo:Number(dato.dataset.angulo||0)*Math.PI/180,
            radio:Number(dato.dataset.radio||1),
            velocidad:Number(dato.dataset.velocidad||.2),
            fase:Math.random()*Math.PI*2
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
        x:ancho/2+camara.parallaxX*.35,
        y:alto*.49+camara.panY+camara.parallaxY*.28
    };
}

function actualizarDOM(){
    if(!modoGalaxia)return;

    const centro=centroEscena();

    const baseRX=Math.min(ancho*.31,430)*camara.zoom;
    const baseRY=Math.min(alto*.22,190)*camara.zoom;

    floresUI.forEach(flor=>{
        const angulo=flor.angulo+camara.rotacion+orbitaAutomatica*flor.velocidad;
        const ondulacion=Math.sin(tiempo*1.2+flor.fase)*10;
        const rx=baseRX*flor.radio+ondulacion;
        const ry=baseRY*flor.radio;

        const x=centro.x+Math.cos(angulo)*rx;
        const y=centro.y+Math.sin(angulo)*ry;

        const profundidad=.78+(Math.sin(angulo)+1)*.18;

        flor.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${profundidad})`;

        if(flor.el.classList.contains("visible")){
            flor.el.style.opacity=.68+profundidad*.28;
        }

        flor.el.style.zIndex=String(10+Math.round(profundidad*20));
    });

    palabrasUI.forEach(palabra=>{
        const angulo=palabra.angulo+camara.rotacion*.65+orbitaAutomatica*palabra.velocidad;

        const rx=Math.min(ancho*.41,670)*palabra.radio*camara.zoom;
        const ry=Math.min(alto*.32,300)*palabra.radio*camara.zoom;

        const x=centro.x+Math.cos(angulo)*rx;
        const y=centro.y+Math.sin(angulo)*ry+Math.sin(tiempo*1.5+palabra.fase)*9;

        const profundidad=(Math.sin(angulo)+1)/2;
        const escala=.72+profundidad*.42;
        const inclinacion=Math.cos(angulo)*9;

        palabra.el.style.transform=
            `translate(${x}px,${y}px) translate(-50%,-50%) perspective(700px) rotateY(${inclinacion}deg) scale(${escala})`;

        palabra.el.style.zIndex=String(5+Math.round(profundidad*20));

        palabra.el.style.filter=
            `blur(${(1-profundidad)*.45}px) drop-shadow(0 0 ${5+profundidad*8}px rgba(255,215,0,${.15+profundidad*.25}))`;

        if(palabra.el.classList.contains("visible")){
            palabra.el.style.opacity=.38+profundidad*.55;
        }
    });

    const corazonY=centro.y-175*camara.zoom;

    textoCorazon.style.left=`${centro.x}px`;
    textoCorazon.style.top=`${corazonY}px`;

    const nucleoY=centro.y+75*camara.zoom;

    centroVisual.style.left=`${centro.x}px`;
    centroVisual.style.top=`${nucleoY}px`;
    centroVisual.style.transform=`translate(-50%,-50%) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;
    textoCentro.style.top=`${nucleoY+90*camara.zoom}px`;
}

function dibujarGalaxia(){
    const centro=centroEscena();
    const nucleoY=centro.y+75*camara.zoom;
    const radioLuz=Math.max(ancho,alto)*.28*camara.zoom;

    const g=ctx.createRadialGradient(
        centro.x,
        nucleoY,
        0,
        centro.x,
        nucleoY,
        radioLuz
    );

    g.addColorStop(0,"rgba(255,235,120,.18)");
    g.addColorStop(.25,"rgba(255,210,0,.08)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;
    ctx.fillRect(0,0,ancho,alto);

    particulasGalaxia.forEach(particula=>{
        particula.dibujar(centro.x,nucleoY);
    });

    ctx.save();

    ctx.strokeStyle="rgba(255,245,175,.7)";
    ctx.lineWidth=1.4;
    ctx.shadowBlur=12;
    ctx.shadowColor="#ffd900";
    ctx.beginPath();

    for(let t=0;t<22*Math.PI;t+=.15){
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
    const cy=centro.y-175*camara.zoom;

    const escala=
        Math.min(ancho,alto)*
        .011*
        camara.zoom*
        (1+Math.sin(tiempo*2)*.02);

    ctx.save();

    for(let i=0;i<300;i++){
        const t=i/300*Math.PI*2;

        const x=16*Math.pow(Math.sin(t),3);

        const y=
            13*Math.cos(t)-
            5*Math.cos(2*t)-
            2*Math.cos(3*t)-
            Math.cos(4*t);

        const px=cx+x*escala;
        const py=cy-y*escala;

        ctx.beginPath();
        ctx.arc(px,py,1.2+Math.random(),0,Math.PI*2);

        ctx.fillStyle=
            Math.random()>.14
            ?"rgba(255,234,110,.92)"
            :"rgba(255,255,225,.96)";

        ctx.shadowBlur=10;
        ctx.shadowColor="#ffd900";
        ctx.fill();
    }

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

            musicaFondo.volume=volumenFinal*progreso;

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

function animar(){
    tiempo+=.01;

    if(modoGalaxia){
        orbitaAutomatica+=.002;
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

    rastros.forEach(r=>{
        r.actualizar();
        r.dibujar();
    });

    rastros=rastros.filter(r=>r.vida>0);

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click",iniciarExperiencia);

cerrarTarjeta.addEventListener("click",cerrarTarjetaFn);

tarjetaOverlay.addEventListener("click",e=>{
    if(e.target===tarjetaOverlay){
        cerrarTarjetaFn();
    }
});

window.addEventListener("mousemove",e=>{
    camara.parallaxX=(e.clientX-ancho/2)*.012;
    camara.parallaxY=(e.clientY-alto/2)*.008;

    if(modoGalaxia){
        rastros.push(new Rastro(e.clientX,e.clientY));

        if(rastros.length>80){
            rastros.shift();
        }
    }
});

window.addEventListener("pointerdown",e=>{
    if(!modoGalaxia)return;

    if(e.target.closest(".flor-orbita,.tarjeta")){
        return;
    }

    arrastrando=true;
    anteriorX=e.clientX;
    anteriorY=e.clientY;

    document.body.classList.add("arrastrando");
});

window.addEventListener("pointermove",e=>{
    if(!arrastrando)return;

    const dx=e.clientX-anteriorX;
    const dy=e.clientY-anteriorY;

    camara.rotacion+=dx*.006;
    camara.panY=limitar(camara.panY+dy*.45,-150,150);

    anteriorX=e.clientX;
    anteriorY=e.clientY;
});

window.addEventListener("pointerup",()=>{
    arrastrando=false;
    document.body.classList.remove("arrastrando");
});

window.addEventListener("wheel",e=>{
    if(!modoGalaxia)return;

    e.preventDefault();

    camara.zoom=limitar(
        camara.zoom-e.deltaY*.0007,
        .55,
        1.8
    );
},{
    passive:false
});

window.addEventListener("click",e=>{
    if(!modoGalaxia)return;

    if(e.target.closest(".flor-orbita,.tarjeta")){
        return;
    }

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

ajustarCanvas();
animar();