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
let arrastrandoMouse=false;

let tiempo=0;
let orbitaAutomatica=0;
let ultimoFrame=performance.now();
let fadeMusica=null;

let camara={
    zoom:1,
    rotacion:0,
    panY:0
};

let mouseInicioX=0;
let mouseInicioY=0;
let mouseRotacionInicio=0;
let mousePanInicio=0;

let touchMode="";
let touchStartX=0;
let touchStartY=0;
let touchRotStart=0;
let touchPanStart=0;
let pinchStartDistance=0;
let pinchStartZoom=1;
let pinchStartMidY=0;
let pinchStartPan=0;

function limitar(valor,min,max){
    return Math.max(min,Math.min(max,valor));
}

function detectarMovil(){
    movil=innerWidth<=700||matchMedia("(pointer:coarse)").matches;
}

function distanciaTouches(t1,t2){
    return Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY);
}

function midpointTouches(t1,t2){
    return{
        x:(t1.clientX+t2.clientX)/2,
        y:(t1.clientY+t2.clientY)/2
    };
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
        camara.zoom=limitar(camara.zoom,.65,1.55);
        camara.panY=limitar(camara.panY,-100,100);
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
        this.velocidad=Math.random()*.05+.012;
        this.alpha=Math.random()*.65+.15;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y+=this.velocidad*dt*60;
        this.fase+=dt*.9;

        if(this.y>alto+10)this.reset();
    }

    dibujar(){
        const alpha=this.alpha*(.78+Math.sin(this.fase)*.22);

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
        this.radio=Math.random()*1.7+.3;
        this.velocidad=Math.random()*.18+.04;
        this.alpha=Math.random()*.3+.06;
        this.fase=Math.random()*Math.PI*2;
    }

    actualizar(dt){
        this.y-=this.velocidad*dt*60;
        this.fase+=dt*.75;
        this.x+=Math.sin(this.fase)*.05*dt*60;

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
        this.tamano=Math.random()*5+3;
        this.vy=Math.random()*.25+.08;
        this.vx=Math.random()*.14-.07;
        this.rotacion=Math.random()*Math.PI*2;
        this.vr=Math.random()*.014-.007;
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
        const maxRadio=Math.min(ancho,alto)*(movil?.39:.45);

        this.radio=Math.pow(Math.random(),.62)*maxRadio+5;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.045+this.brazo+(Math.random()-.5)*.55;
        this.tamano=Math.random()*1.5+.22;
        this.alpha=Math.random()*.62+.08;
        this.desfase=(Math.random()-.5)*(movil?16:24);
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

        const cantidad=movil?14:22;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*1.8+.45;

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

    const totalEstrellas=movil?150:340;
    const totalLuces=movil?55:95;
    const totalPetalos=movil?34:60;
    const totalGalaxia=movil?320:900;

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
        },180+i*90);

        floresUI.push({
            el:boton,
            base:(i/total)*Math.PI*2-Math.PI/2,
            fase:Math.random()*Math.PI*2
        });
    });
}

function obtenerSlotsPalabras(total){
    const posiciones=[];

    if(movil){
        const columnas=[.09,.50,.91];
        let fila=0;
        let columna=0;

        while(posiciones.length<total){
            let x=columnas[columna];
            let y=.04+fila*.058;

            const centroX=x>.25&&x<.75;
            const zonaCorazon=y>.13&&y<.39&&centroX;
            const zonaRamo=y>.43&&y<.76&&centroX;

            if(!zonaCorazon&&!zonaRamo&&y<.97){
                if(fila%2===1){
                    if(columna===0)x+=.018;
                    if(columna===2)x-=.018;
                }

                posiciones.push({
                    x:limitar(x,.055,.945),
                    y:limitar(y,.035,.97)
                });
            }

            columna++;

            if(columna===columnas.length){
                columna=0;
                fila++;
            }

            if(fila>50)break;
        }

        return posiciones;
    }

    const columnas=[.055,.23,.39,.61,.77,.945];
    let fila=0;
    let columna=0;

    while(posiciones.length<total){
        let x=columnas[columna];
        let y=.045+fila*.09;

        const centroX=x>.28&&x<.72;
        const zonaCorazon=y>.15&&y<.42&&centroX;
        const zonaRamo=y>.43&&y<.75&&centroX;

        if(!zonaCorazon&&!zonaRamo&&y<.97){
            if(fila%2===1){
                if(columna%2===0)x+=.01;
                else x-=.01;
            }

            posiciones.push({
                x:limitar(x,.04,.96),
                y:limitar(y,.04,.97)
            });
        }

        columna++;

        if(columna===columnas.length){
            columna=0;
            fila++;
        }

        if(fila>30)break;
    }

    return posiciones;
}

function crearPalabras(){
    palabras.innerHTML="";
    palabrasUI=[];

    const datos=[...document.querySelectorAll(".dato-palabra")];
    const posiciones=obtenerSlotsPalabras(datos.length);

    datos.forEach((dato,i)=>{
        const elemento=document.createElement("span");
        const posicion=posiciones[i]||{
            x:.1+Math.random()*.8,
            y:.05+Math.random()*.9
        };

        elemento.className="palabra-flotante";
        elemento.textContent=dato.dataset.texto;

        palabras.appendChild(elemento);

        setTimeout(()=>{
            elemento.classList.add("visible");
        },220+i*28);

        palabrasUI.push({
            el:elemento,
            xNorm:posicion.x,
            yNorm:posicion.y,
            ampX:movil?6+((i*9)%6):12+((i*11)%10),
            ampY:movil?4+((i*7)%5):8+((i*9)%7),
            velX:.16+((i%6)*.02),
            velY:.14+((i%5)*.02),
            fase:i*.73,
            ancho:0,
            alto:0
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

    requestAnimationFrame(()=>{
        palabrasUI.forEach(item=>{
            item.ancho=item.el.offsetWidth;
            item.alto=item.el.offsetHeight;
        });
    });
}

function centroEscena(){
    return{
        x:ancho/2,
        y:alto*(movil?.47:.50)+camara.panY
    };
}

function rotacionTotal(){
    return camara.rotacion+orbitaAutomatica;
}

function actualizarFlores(centro,nucleoY){
    const rotacion=rotacionTotal();

    const rx=(movil?Math.min(ancho*.34,128):Math.min(ancho*.21,230))*camara.zoom;
    const ry=(movil?Math.min(alto*.078,52):Math.min(alto*.095,86))*camara.zoom;
    const centroAroY=nucleoY+(movil?8:10);

    floresUI.forEach(flor=>{
        const angulo=flor.base+rotacion;
        const profundidad=(Math.sin(angulo)+1)/2;
        const delante=Math.sin(angulo)>=0;

        const escala=movil
            ?.68+profundidad*.30
            :.74+profundidad*.35;

        let x=centro.x+Math.cos(angulo)*rx;
        let y=centroAroY+Math.sin(angulo)*ry;

        y+=Math.sin(tiempo*1.15+flor.fase)*(movil?1.3:2.2);

        if(movil){
            x=limitar(x,34,ancho-34);
            y=limitar(y,138,alto-128);
        }

        flor.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;
        flor.el.style.opacity=.62+profundidad*.32;

        if(delante){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");
            flor.el.style.zIndex=String(20+Math.round(profundidad*8));
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");
            flor.el.style.zIndex=String(8+Math.round(profundidad*4));
        }
    });
}

function actualizarPalabras(){
    palabrasUI.forEach(item=>{
        const movimientoX=Math.sin(tiempo*item.velX+item.fase)*item.ampX;
        const movimientoY=Math.cos(tiempo*item.velY+item.fase)*item.ampY;

        let x=ancho*item.xNorm+movimientoX;
        let y=alto*item.yNorm+movimientoY;

        const escala=.96+Math.sin(tiempo*.3+item.fase)*.035;

        const mitadAncho=Math.max((item.ancho||70)*escala/2,20);
        const mitadAlto=Math.max((item.alto||12)*escala/2,6);

        x=limitar(x,mitadAncho+5,ancho-mitadAncho-5);
        y=limitar(y,mitadAlto+5,alto-mitadAlto-5);

        item.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;

        item.el.style.opacity=
            .62+
            .28*
            (.5+.5*Math.sin(tiempo*.42+item.fase));
    });
}

function actualizarDOM(){
    if(!modoGalaxia)return;

    const centro=centroEscena();

    const corazonY=
        centro.y-
        (movil?145:182)*
        camara.zoom;

    const nucleoY=
        centro.y+
        (movil?82:92)*
        camara.zoom;

    textoCorazon.style.left=`${centro.x}px`;
    textoCorazon.style.top=`${corazonY}px`;

    centroVisual.style.left=`${centro.x}px`;
    centroVisual.style.top=`${nucleoY}px`;
    centroVisual.style.transform=`translate3d(-50%,-50%,0) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;
    textoCentro.style.top=`${nucleoY+(movil?78:102)*camara.zoom}px`;

    actualizarFlores(centro,nucleoY);
    actualizarPalabras();
}

function dibujarGalaxia(){
    const centro=centroEscena();

    const nucleoY=
        centro.y+
        (movil?82:92)*
        camara.zoom;

    const rotacion=rotacionTotal();

    const radioLuz=
        Math.max(ancho,alto)*
        (movil?.20:.26)*
        camara.zoom;

    const g=ctx.createRadialGradient(
        centro.x,
        nucleoY,
        0,
        centro.x,
        nucleoY,
        radioLuz
    );

    g.addColorStop(0,"rgba(255,235,120,.18)");
    g.addColorStop(.3,"rgba(255,210,0,.07)");
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
}

function dibujarCorazon(){
    const centro=centroEscena();

    const cx=centro.x;

    const cy=
        centro.y-
        (movil?145:182)*
        camara.zoom;

    const escala=
        Math.min(ancho,alto)*
        (movil?.0094:.011)*
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
    ctx.lineWidth=movil?1.6:2;
    ctx.shadowBlur=movil?7:11;
    ctx.shadowColor="#ffd900";

    ctx.stroke();

    ctx.shadowBlur=0;
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

    crearExplosion(
        ancho/2,
        alto/2
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

    if(modoGalaxia&&touchMode===""&&!arrastrandoMouse){
        orbitaAutomatica+=dt*(movil?.045:.06);
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
    "mousedown",
    e=>{
        if(movil||!modoGalaxia)return;

        if(
            e.target.closest(
                ".flor-orbita,.palabra-flotante,.tarjeta"
            )
        )return;

        arrastrandoMouse=true;

        mouseInicioX=e.clientX;
        mouseInicioY=e.clientY;
        mouseRotacionInicio=camara.rotacion;
        mousePanInicio=camara.panY;

        document.body
            .classList
            .add("arrastrando");
    }
);

window.addEventListener(
    "mousemove",
    e=>{
        if(!arrastrandoMouse)return;

        const dx=e.clientX-mouseInicioX;
        const dy=e.clientY-mouseInicioY;

        camara.rotacion=
            mouseRotacionInicio+
            dx*.006;

        camara.panY=
            limitar(
                mousePanInicio+
                dy*.28,
                -160,
                160
            );
    }
);

window.addEventListener(
    "mouseup",
    ()=>{
        arrastrandoMouse=false;

        document.body
            .classList
            .remove("arrastrando");
    }
);

galaxiaInteractiva.addEventListener(
    "touchstart",
    e=>{
        if(!modoGalaxia)return;

        if(e.touches.length>=2){
            const t1=e.touches[0];
            const t2=e.touches[1];
            const mid=midpointTouches(t1,t2);

            touchMode="pinch";
            pinchStartDistance=distanciaTouches(t1,t2);
            pinchStartZoom=camara.zoom;
            pinchStartMidY=mid.y;
            pinchStartPan=camara.panY;

            e.preventDefault();

            return;
        }

        if(
            e.target.closest(
                ".flor-orbita,.palabra-flotante,.tarjeta"
            )
        )return;

        const t=e.touches[0];

        touchMode="drag";
        touchStartX=t.clientX;
        touchStartY=t.clientY;
        touchRotStart=camara.rotacion;
        touchPanStart=camara.panY;
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

            const mid=midpointTouches(t1,t2);
            const dist=distanciaTouches(t1,t2);

            if(touchMode!=="pinch"){
                touchMode="pinch";
                pinchStartDistance=dist;
                pinchStartZoom=camara.zoom;
                pinchStartMidY=mid.y;
                pinchStartPan=camara.panY;
            }

            camara.zoom=
                limitar(
                    pinchStartZoom*
                    (dist/pinchStartDistance),
                    .65,
                    1.55
                );

            camara.panY=
                limitar(
                    pinchStartPan+
                    (mid.y-pinchStartMidY)*.14,
                    -100,
                    100
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
                dx*.009;

            camara.panY=
                limitar(
                    touchPanStart+
                    dy*.18,
                    -95,
                    95
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
            const mid=midpointTouches(t1,t2);

            touchMode="pinch";
            pinchStartDistance=distanciaTouches(t1,t2);
            pinchStartZoom=camara.zoom;
            pinchStartMidY=mid.y;
            pinchStartPan=camara.panY;

            return;
        }

        if(e.touches.length===1){
            const t=e.touches[0];

            touchMode="drag";
            touchStartX=t.clientX;
            touchStartY=t.clientY;
            touchRotStart=camara.rotacion;
            touchPanStart=camara.panY;

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
                .55,
                1.8
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
                ".flor-orbita,.palabra-flotante,.tarjeta"
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
requestAnimationFrame(animar);