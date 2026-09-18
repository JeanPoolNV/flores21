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
let revealTimers=[];

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

function limpiarTimersPalabras(){
    revealTimers.forEach(id=>clearTimeout(id));
    revealTimers=[];
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
        this.radio=Math.random()*1.6+.2;
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
        this.tamano=Math.random()*5.3+3;
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
        const maxRadio=Math.min(ancho,alto)*(movil?.44:.52);
        this.radio=Math.pow(Math.random(),.62)*maxRadio+10;
        this.brazo=Math.floor(Math.random()*3)*(Math.PI*2/3);
        this.angulo=this.radio*.05+this.brazo+(Math.random()-.5)*.85;
        this.tamano=Math.random()*1.9+.26;
        this.alpha=Math.random()*.55+.08;
        this.desfase=(Math.random()-.5)*(movil?22:34);
        this.color=Math.random()>.28?"#ffe35c":"#fff8c8";
    }

    dibujar(cx,cy,rotacion){
        const angulo=this.angulo+rotacion*.3;
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
        const cantidad=movil?16:24;

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

    const totalEstrellas=movil?165:360;
    const totalLuces=movil?80:120;
    const totalPetalos=movil?52:92;
    const totalGalaxia=movil?420:1150;
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
        },180+i*100);

        floresUI.push({
            el:boton,
            orden:i,
            base:i*2.05,
            fase:Math.random()*Math.PI*2
        });
    });
}

function obtenerSlotsPalabras(total){
    const posiciones=[];

    if(movil){
        const columnas=[.14,.5,.86];
        let fila=0;
        let columna=0;

        while(posiciones.length<total){
            let x=columnas[columna];
            let y=.07+fila*.055;

            const zonaCorazon=y>.15&&y<.36&&x>.22&&x<.78;
            const zonaRamo=y>.42&&y<.82&&x>.2&&x<.8;

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

        const zonaCorazon=y>.14&&y<.38&&x>.25&&x<.75;
        const zonaRamo=y>.42&&y<.83&&x>.2&&x<.8;

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
    limpiarTimersPalabras();
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

        elemento.className="palabra-flotante suave";
        elemento.textContent=dato.dataset.texto;
        palabras.appendChild(elemento);

        palabrasUI.push({
            el:elemento,
            xNorm:posicion.x,
            yNorm:posicion.y,
            ampX:movil?8+((i*11)%8):15+((i*13)%10),
            ampY:movil?6+((i*9)%6):10+((i*11)%8),
            velX:.18+((i%6)*.022),
            velY:.14+((i%5)*.022),
            fase:i*.77,
            ancho:0,
            alto:0
        });
    });

    requestAnimationFrame(()=>{
        palabrasUI.forEach(item=>{
            item.ancho=item.el.offsetWidth;
            item.alto=item.el.offsetHeight;
        });
    });

    palabrasUI.forEach((item,i)=>{
        const delay=350+i*(movil?180:140);
        const id=setTimeout(()=>{
            item.el.classList.add("visible");
            item.el.classList.remove("suave");
        },delay);
        revealTimers.push(id);
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
        y:alto*(movil?.61:.63)
    };
}

function rotacionTotal(){
    return camara.rotacion+orbitaAutomatica;
}

function dibujarNebulosas(){
    const nebulosas=[
        {
            x:ancho*.18+Math.sin(tiempo*.18)*18,
            y:alto*.28+Math.cos(tiempo*.2)*10,
            r:Math.max(ancho,alto)*(movil?.14:.16),
            color:"90,120,255",
            alpha:.1
        },
        {
            x:ancho*.82+Math.cos(tiempo*.16)*14,
            y:alto*.22+Math.sin(tiempo*.18)*12,
            r:Math.max(ancho,alto)*(movil?.12:.15),
            color:"255,200,50",
            alpha:.08
        },
        {
            x:ancho*.52+Math.sin(tiempo*.12)*20,
            y:alto*.84+Math.cos(tiempo*.14)*14,
            r:Math.max(ancho,alto)*(movil?.18:.2),
            color:"255,180,80",
            alpha:.07
        }
    ];

    nebulosas.forEach(n=>{
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
        g.addColorStop(0,`rgba(${n.color},${n.alpha})`);
        g.addColorStop(.45,`rgba(${n.color},${n.alpha*.45})`);
        g.addColorStop(1,`rgba(${n.color},0)`);
        ctx.fillStyle=g;
        ctx.fillRect(0,0,ancho,alto);
    });
}

function actualizarFlores(centro){
    const rotacion=rotacionTotal();
    const baseRadio=(movil?70:90)*camara.zoom;
    const paso=(movil?34:46)*camara.zoom;

    floresUI.forEach(flor=>{
        const radio=baseRadio+flor.orden*paso;
        const angulo=flor.base+rotacion*.92;
        const profundidad=(Math.sin(angulo)+1)/2;
        const delante=Math.sin(angulo)>=0;

        const x=centro.x+Math.cos(angulo)*radio;
        const y=centro.y+Math.sin(angulo)*(radio*.42)+Math.sin(tiempo*1.1+flor.fase)*1.5;

        const escalaBase=movil?.58:.68;
        const escala=escalaBase+profundidad*.18-(flor.orden*.01);

        flor.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;
        flor.el.style.opacity=delante?.98:.56;

        if(delante){
            flor.el.classList.add("frente");
            flor.el.classList.remove("atras");
            flor.el.style.zIndex=String(22+Math.round(profundidad*10));
        }else{
            flor.el.classList.add("atras");
            flor.el.classList.remove("frente");
            flor.el.style.zIndex=String(10+Math.round(profundidad*4));
        }
    });
}

function actualizarPalabras(){
    palabrasUI.forEach(item=>{
        const movimientoX=Math.sin(tiempo*item.velX+item.fase)*item.ampX;
        const movimientoY=Math.cos(tiempo*item.velY+item.fase)*item.ampY;

        let x=ancho*item.xNorm+movimientoX;
        let y=alto*item.yNorm+movimientoY;

        const escala=.96+Math.sin(tiempo*.4+item.fase)*.04;

        const mitadAncho=Math.max((item.ancho||70)*escala/2,22);
        const mitadAlto=Math.max((item.alto||12)*escala/2,7);

        x=limitar(x,mitadAncho+12,ancho-mitadAncho-12);
        y=limitar(y,mitadAlto+10,alto-mitadAlto-10);

        item.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${escala})`;
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
    textoCentro.style.top=`${centro.y+(movil?112:130)*camara.zoom}px`;

    actualizarFlores(centro);
    actualizarPalabras();
}

function dibujarGalaxia(){
    const centro=ramoPosicion();
    const rotacion=rotacionTotal();
    const radioLuz=Math.max(ancho,alto)*(movil?.24:.3)*camara.zoom;

    const g=ctx.createRadialGradient(centro.x,centro.y,0,centro.x,centro.y,radioLuz);
    g.addColorStop(0,"rgba(255,238,140,.28)");
    g.addColorStop(.22,"rgba(255,210,0,.12)");
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

function abrirTarjetaCentral(){
    tarjetaTitulo.textContent="Nuestro pequeño universo";
    tarjetaFrase.textContent="Tú eres el centro bonito de todo esto. Gracias por existir, por llenar mis días de luz y por hacer florecer hasta mis pensamientos más simples.";

    tarjetaEmoji.style.display="none";
    tarjetaImagen.style.display="none";
    tarjetaImagen.removeAttribute("src");

    const src=imagenCentroVisible.getAttribute("src")?.trim();

    if(src){
        tarjetaImagen.src=src;
        tarjetaImagen.alt="Ramo central";

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

function activarEspecialCentro(){
    const centro=ramoPosicion();

    centroVisual.classList.remove("activa-especial");
    void centroVisual.offsetWidth;
    centroVisual.classList.add("activa-especial");

    crearExplosion(centro.x,centro.y);
    setTimeout(()=>crearExplosion(centro.x-40,centro.y-10),90);
    setTimeout(()=>crearExplosion(centro.x+40,centro.y+10),180);
    setTimeout(()=>crearExplosion(centro.x,centro.y-45),270);

    abrirTarjetaCentral();

    setTimeout(()=>{
        centroVisual.classList.remove("activa-especial");
    },1800);
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
        orbitaAutomatica+=dt*(movil?.07:.09);
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

    if(modoGalaxia){
        dibujarGalaxia();
        dibujarCorazon();
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

centroVisual.addEventListener("click",e=>{
    e.stopPropagation();
    if(!modoGalaxia)return;
    activarEspecialCentro();
});

galaxiaInteractiva.addEventListener("mousedown",e=>{
    if(movil||!modoGalaxia)return;
    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta,#centroVisual"))return;

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

    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta,#centroVisual"))return;

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
    if(e.target.closest(".flor-orbita,.palabra-flotante,.tarjeta,#centroVisual"))return;
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