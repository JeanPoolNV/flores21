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
let chispasCorazon=[];
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
    rotacion:0
};

let mouseInicioX=0;
let mouseRotacionInicio=0;

let touchMode="";
let touchStartX=0;
let touchRotStart=0;
let pinchStartDistance=0;
let pinchStartZoom=1;

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
        this.radio=Math.random()*1.8+.35;
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
        this.vy=Math.random()*.28+.08;
        this.vx=Math.random()*.16-.08;
        this.rotacion=Math.random()*Math.PI*2;
        this.vr=Math.random()*.016-.008;
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
        const maxRadio=Math.min(ancho,alto)*(movil?.44:.5);
        this.radio=Math.pow(Math.random(),.63)*maxRadio+5;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.045+this.brazo+(Math.random()-.5)*.7;
        this.tamano=Math.random()*1.7+.22;
        this.alpha=Math.random()*.6+.08;
        this.desfase=(Math.random()-.5)*(movil?22:30);
        this.color=Math.random()>.25?"#ffe35c":"#fff8c8";
    }

    dibujar(cx,cy,rotacion){
        const angulo=this.angulo+rotacion*.24;
        const radio=this.radio*camara.zoom;
        const x=cx+Math.cos(angulo)*radio;
        const y=cy+Math.sin(angulo)*radio*.26+this.desfase*camara.zoom;

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
        const cantidad=movil?14:22;

        for(let i=0;i<cantidad;i++){
            const angulo=Math.random()*Math.PI*2;
            const velocidad=Math.random()*1.9+.45;

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
    chispasCorazon=[];

    const totalEstrellas=movil?155:340;
    const totalLuces=movil?70:110;
    const totalPetalos=movil?46:78;
    const totalGalaxia=movil?380:1020;
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

        const anillo=i%2===0?0:1;
        const totalAnillo=anillo===0?Math.ceil(total/2):Math.floor(total/2);
        const indiceAnillo=Math.floor(i/2);

        floresUI.push({
            el:boton,
            anillo,
            base:(indiceAnillo/Math.max(totalAnillo,1))*Math.PI*2-Math.PI/2,
            fase:Math.random()*Math.PI*2
        });
    });
}

function obtenerSlotsPalabras(total){
    const posiciones=[];

    if(movil){
        const columnas=[.14,.50,.86];
        let fila=0;
        let columna=0;

        while(posiciones.length<total){
            let x=columnas[columna];
            let y=.07+fila*.055;

            const zonaCorazon=y>.15&&y<.36&&x>.24&&x<.76;
            const zonaRamo=y>.42&&y<.8&&x>.2&&x<.8;

            if(!zonaCorazon&&!zonaRamo&&y<.96){
                if(fila%2===1){
                    if(columna===0)x+=.03;
                    if(columna===2)x-=.03;
                }else{
                    if(columna===0)x-=.015;
                    if(columna===2)x+=.015;
                }

                posiciones.push({
                    x:limitar(x,.11,.89),
                    y:limitar(y,.06,.95)
                });
            }

            columna++;

            if(columna===columnas.length){
                columna=0;
                fila++;
            }

            if(fila>55)break;
        }

        return posiciones;
    }

    const columnas=[.1,.28,.5,.72,.9];
    let fila=0;
    let columna=0;

    while(posiciones.length<total){
        let x=columnas[columna];
        let y=.08+fila*.075;

        const zonaCorazon=y>.14&&y<.38&&x>.27&&x<.73;
        const zonaRamo=y>.42&&y<.82&&x>.22&&x<.78;

        if(!zonaCorazon&&!zonaRamo&&y<.95){
            if(fila%2===1){
                if(columna===0)x+=.02;
                if(columna===4)x-=.02;
                if(columna===1)x+=.012;
                if(columna===3)x-=.012;
            }

            posiciones.push({
                x:limitar(x,.08,.92),
                y:limitar(y,.07,.94)
            });
        }

        columna++;

        if(columna===columnas.length){
            columna=0;
            fila++;
        }

        if(fila>35)break;
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
            x:.12+Math.random()*.76,
            y:.08+Math.random()*.84
        };

        elemento.className="palabra-flotante";
        elemento.textContent=dato.dataset.texto;
        palabras.appendChild(elemento);

        setTimeout(()=>{
            elemento.classList.add("visible");
        },220+i*26);

        palabrasUI.push({
            el:elemento,
            xNorm:posicion.x,
            yNorm:posicion.y,
            ampX:movil?10+((i*11)%10):18+((i*13)%14),
            ampY:movil?7+((i*9)%8):12+((i*11)%10),
            velX:.22+((i%6)*.025),
            velY:.18+((i%5)*.03),
            fase:i*.77,
            ancho:0,
            alto:0
        });

        elemento.addEventListener("click",e=>{
            e.stopPropagation();
            const rect=elemento.getBoundingClientRect();
            crearExplosion(rect.left+rect.width/2,rect.top+rect.height/2);
        });
    });

    requestAnimationFrame(()=>{
        palabrasUI.forEach(item=>{
            item.ancho=item.el.offsetWidth;
            item.alto=item.el.offsetHeight;
        });
    });
}

function corazonPosicion(){
    return{
        x:ancho/2,
        y:alto*(movil?.19:.2)
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

function dibujarElipseLuminosa(cx,cy,rx,ry,alpha,lineWidth){
    ctx.save();

    ctx.beginPath();
    ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,220,95,${alpha})`;
    ctx.lineWidth=lineWidth;
    ctx.shadowBlur=18;
    ctx.shadowColor="rgba(255,215,0,.42)";
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,244,190,${alpha*.65})`;
    ctx.lineWidth=Math.max(.6,lineWidth*.35);
    ctx.shadowBlur=28;
    ctx.shadowColor="rgba(255,230,140,.58)";
    ctx.stroke();

    ctx.restore();
}

function dibujarOrbitasDecorativas(centro){
    const orbitasSistema=movil
        ?[
            {
                rx:ancho*.24*camara.zoom,
                ry:alto*.06*camara.zoom,
                alpha:.2,
                lineWidth:1.2
            },
            {
                rx:ancho*.38*camara.zoom,
                ry:alto*.105*camara.zoom,
                alpha:.15,
                lineWidth:1
            }
        ]
        :[
            {
                rx:ancho*.17*camara.zoom,
                ry:alto*.08*camara.zoom,
                alpha:.2,
                lineWidth:1.2
            },
            {
                rx:ancho*.34*camara.zoom,
                ry:alto*.145*camara.zoom,
                alpha:.15,
                lineWidth:1
            }
        ];

    orbitasSistema.forEach(orbita=>{
        dibujarElipseLuminosa(centro.x,centro.y,orbita.rx,orbita.ry,orbita.alpha,orbita.lineWidth);
    });
}

function actualizarFlores(centro){
    const rotacion=rotacionTotal();

    floresUI.forEach(flor=>{
        const interna=flor.anillo===0;
        const velocidad=interna?1:.76;
        const angulo=flor.base+rotacion*velocidad;

        const rx=(
            interna
                ?(movil?ancho*.24:ancho*.17)
                :(movil?ancho*.38:ancho*.34)
        )*camara.zoom;

        const ry=(
            interna
                ?(movil?alto*.06:alto*.08)
                :(movil?alto*.105:alto*.145)
        )*camara.zoom;

        const profundidad=(Math.sin(angulo)+1)/2;
        const delante=Math.sin(angulo)>=0;

        const escalaBase=interna?(movil?.66:.72):(movil?.54:.6);
        const escala=escalaBase+profundidad*(interna?.18:.22);

        let x=centro.x+Math.cos(angulo)*rx;
        let y=centro.y+Math.sin(angulo)*ry;

        y+=Math.sin(tiempo*1.2+flor.fase)*(interna?1.1:1.7);

        if(movil){
            x=limitar(x,40,ancho-40);
            y=limitar(y,alto*.38,alto*.88);
        }

        flor.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;
        flor.el.style.opacity=delante?.98:.55;

        if(delante){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");
            flor.el.style.zIndex=String(22+Math.round(profundidad*12));
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");
            flor.el.style.zIndex=String(12+Math.round(profundidad*4));
        }
    });
}

function actualizarPalabras(){
    palabrasUI.forEach(item=>{
        const movimientoX=Math.sin(tiempo*item.velX+item.fase)*item.ampX;
        const movimientoY=Math.cos(tiempo*item.velY+item.fase)*item.ampY;

        let x=ancho*item.xNorm+movimientoX;
        let y=alto*item.yNorm+movimientoY;

        const escala=.96+Math.sin(tiempo*.42+item.fase)*.05;

        const mitadAncho=Math.max((item.ancho||70)*escala/2,22);
        const mitadAlto=Math.max((item.alto||12)*escala/2,7);

        x=limitar(x,mitadAncho+12,ancho-mitadAncho-12);
        y=limitar(y,mitadAlto+10,alto-mitadAlto-10);

        item.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;
        item.el.style.opacity=.64+.28*(.5+.5*Math.sin(tiempo*.52+item.fase));
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
    centroVisual.style.transform=`translate3d(-50%,-50%,0) scale(${camara.zoom})`;

    textoCentro.style.left=`${centro.x}px`;
    textoCentro.style.top=`${centro.y+(movil?126:150)*camara.zoom}px`;

    actualizarFlores(centro);
    actualizarPalabras();
}

function dibujarGalaxia(){
    const centro=ramoPosicion();
    const rotacion=rotacionTotal();
    const radioLuz=Math.max(ancho,alto)*(movil?.25:.3)*camara.zoom;

    const g=ctx.createRadialGradient(centro.x,centro.y,0,centro.x,centro.y,radioLuz);
    g.addColorStop(0,"rgba(255,238,140,.3)");
    g.addColorStop(.24,"rgba(255,210,0,.13)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;
    ctx.fillRect(0,0,ancho,alto);

    particulasGalaxia.forEach(particula=>{
        particula.dibujar(centro.x,centro.y,rotacion);
    });
}

function dibujarCorazon(){
    const centro=corazonPosicion();
    const cx=centro.x;
    const cy=centro.y;
    const escala=Math.min(ancho,alto)*(movil?.0088:.0104)*(1+Math.sin(tiempo*2)*.02);

    ctx.save();

    ctx.beginPath();
    const pasos=movil?110:150;

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
    ctx.strokeStyle="rgba(255,231,96,.96)";
    ctx.lineWidth=movil?1.8:2.3;
    ctx.shadowBlur=12;
    ctx.shadowColor="#ffd700";
    ctx.stroke();

    ctx.beginPath();
    for(let i=0;i<=pasos;i++){
        const t=i/pasos*Math.PI*2;
        const x=16*Math.pow(Math.sin(t),3);
        const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
        const px=cx+x*escala*.94;
        const py=cy-y*escala*.94;

        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
    }

    ctx.closePath();
    ctx.strokeStyle="rgba(255,245,180,.55)";
    ctx.lineWidth=1;
    ctx.shadowBlur=18;
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
        camara.zoom=.92;
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

function animar(ahora){
    const dt=Math.min((ahora-ultimoFrame)/1000,.033);
    ultimoFrame=ahora;
    tiempo+=dt;

    if(modoGalaxia&&touchMode===""&&!arrastrandoMouse){
        orbitaAutomatica+=dt*(movil?.065:.085);
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
        dibujarOrbitasDecorativas(ramoPosicion());
        actualizarDOM();
    }

    explosiones.forEach(e=>{
        e.actualizar(dt);
        e.dibujar();
    });

    explosiones=explosiones.filter(e=>e.particulas.length);

    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click",iniciarExperiencia);
cerrarTarjeta.addEventListener("click",cerrarTarjetaFn);

tarjetaOverlay.addEventListener("click",e=>{
    if(e.target===tarjetaOverlay)cerrarTarjetaFn();
});

galaxiaInteractiva.addEventListener("mousedown",e=>{
    if(movil||!modoGalaxia)return;
    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta"))return;

    arrastrandoMouse=true;
    mouseInicioX=e.clientX;
    mouseRotacionInicio=camara.rotacion;
    document.body.classList.add("arrastrando");
});

window.addEventListener("mousemove",e=>{
    if(!arrastrandoMouse)return;
    const dx=e.clientX-mouseInicioX;
    camara.rotacion=mouseRotacionInicio+dx*.0075;
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
        pinchStartDistance=distanciaTouches(t1,t2);
        pinchStartZoom=camara.zoom;
        e.preventDefault();
        return;
    }

    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta"))return;

    const t=e.touches[0];
    touchMode="drag";
    touchStartX=t.clientX;
    touchRotStart=camara.rotacion;
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

        camara.zoom=limitar(pinchStartZoom*(dist/pinchStartDistance),.78,1.5);
        e.preventDefault();
        return;
    }

    if(touchMode==="drag"&&e.touches.length===1){
        const t=e.touches[0];
        const dx=t.clientX-touchStartX;
        camara.rotacion=touchRotStart+dx*.01;
        e.preventDefault();
    }
},{passive:false});

galaxiaInteractiva.addEventListener("touchend",e=>{
    if(e.touches.length>=2){
        const t1=e.touches[0];
        const t2=e.touches[1];
        touchMode="pinch";
        pinchStartDistance=distanciaTouches(t1,t2);
        pinchStartZoom=camara.zoom;
        return;
    }

    if(e.touches.length===1){
        const t=e.touches[0];
        touchMode="drag";
        touchStartX=t.clientX;
        touchRotStart=camara.rotacion;
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
    camara.zoom=limitar(camara.zoom-e.deltaY*.0007,.7,1.75);
},{passive:false});

galaxiaInteractiva.addEventListener("click",e=>{
    if(!modoGalaxia)return;
    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta"))return;
    crearExplosion(e.clientX,e.clientY);
});

window.addEventListener("keydown",e=>{
    if(e.key==="Escape")cerrarTarjetaFn();
});

window.addEventListener("resize",ajustarCanvas);
window.visualViewport?.addEventListener("resize",ajustarCanvas);

detectarMovil();
ajustarCanvas();
requestAnimationFrame(animar);