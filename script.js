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
let petalos=[];
let luces=[];
let introParticulas=[];
let galaxiaPolvo=[];
let galaxiaEstrellas=[];
let chispasCorazon=[];
let explosiones=[];
let objetosIntro=[];
let floresUI=[];
let experienciaIniciada=false;
let introActiva=false;
let introCerrando=false;
let universoActivo=false;
let arrastrandoMouse=false;
let tiempo=0;
let ultimoFrame=performance.now();
let rotacionAutomatica=0;
let velocidadInercial=0;
let fadeMusica=null;
let efectoCentroHasta=0;

const camara={zoom:1,rotacion:0,inclinacion:-.42};

let mouseInicioX=0;
let mouseInicioY=0;
let mouseRotacionInicio=0;
let mouseInclinacionInicio=0;
let mouseUltimoX=0;
let mouseUltimoTiempo=0;
let touchMode="";
let touchStartX=0;
let touchStartY=0;
let touchRotStart=0;
let touchTiltStart=0;
let touchUltimoX=0;
let touchUltimoTiempo=0;
let pinchStartDistance=0;
let pinchStartZoom=1;

const frases3d=[
    "Flores para ti 🌻",
    "Eres especial",
    "Siempre tú ✨",
    "Mi persona favorita",
    "Qué bonito coincidir contigo",
    "Me haces sonreír",
    "Contigo todo es mejor",
    "Eres mi sol 🌻",
    "Mi paz",
    "Te elegiría una y mil veces",
    "Gracias por existir 💛",
    "Mi bonito lugar",
    "Mi pequeño universo",
    "Qué suerte encontrarte",
    "Eres pura luz",
    "Te quiero muchísimo"
];

const limitar=(valor,min,max)=>Math.max(min,Math.min(max,valor));

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
    const dpr=Math.min(devicePixelRatio||1,movil?1.25:1.5);
    canvas.width=Math.round(ancho*dpr);
    canvas.height=Math.round(alto*dpr);
    canvas.style.width=`${ancho}px`;
    canvas.style.height=`${alto}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    crearEscenaCanvas();
    if(movil)camara.zoom=limitar(camara.zoom,.78,1.5);
}

class Estrella{
    constructor(){this.reset();this.y=Math.random()*alto}
    reset(){
        this.x=Math.random()*ancho;
        this.y=-8;
        this.r=.25+Math.random()*1.35;
        this.v=.008+Math.random()*.035;
        this.a=.12+Math.random()*.68;
        this.f=Math.random()*Math.PI*2;
    }
    update(dt){
        this.y+=this.v*dt*60;
        this.f+=dt*.7;
        if(this.y>alto+8)this.reset();
    }
    draw(){
        ctx.globalAlpha=this.a*(.78+Math.sin(this.f)*.22);
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle="#fffdf0";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class Petalo{
    constructor(){this.reset();this.y=Math.random()*alto}
    reset(){
        this.x=Math.random()*ancho;
        this.y=-22;
        this.s=3+Math.random()*5;
        this.vy=.05+Math.random()*.16;
        this.vx=(Math.random()-.5)*.12;
        this.rot=Math.random()*Math.PI*2;
        this.vr=(Math.random()-.5)*.012;
        this.f=Math.random()*Math.PI*2;
        this.a=.12+Math.random()*.28;
    }
    update(dt){
        const f=dt*60;
        this.y+=this.vy*f;
        this.x+=this.vx*f+Math.sin(this.f)*.055*f;
        this.f+=dt*.55;
        this.rot+=this.vr*f;
        if(this.y>alto+30||this.x<-30||this.x>ancho+30)this.reset();
    }
    draw(){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rot);
        ctx.beginPath();
        ctx.moveTo(0,-this.s);
        ctx.bezierCurveTo(this.s*.75,-this.s*.35,this.s*.65,this.s*.62,0,this.s);
        ctx.bezierCurveTo(-this.s*.65,this.s*.62,-this.s*.75,-this.s*.35,0,-this.s);
        ctx.fillStyle=`rgba(255,214,45,${this.a})`;
        ctx.fill();
        ctx.restore();
    }
}

class Luz{
    constructor(){this.x=Math.random()*ancho;this.y=Math.random()*alto;this.r=.5+Math.random()*1.8;this.f=Math.random()*Math.PI*2;this.v=.15+Math.random()*.3}
    update(dt){this.f+=dt*this.v}
    draw(){
        const a=.05+(Math.sin(this.f)+1)*.045;
        ctx.globalAlpha=a;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle="#ffe36a";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class IntroParticula{
    constructor(){this.reset(true)}
    reset(inicial=false){
        const ang=Math.random()*Math.PI*2;
        const radio=80+Math.random()*Math.max(ancho,alto)*.65;
        this.x=Math.cos(ang)*radio;
        this.y=Math.sin(ang)*radio*.82;
        this.z=inicial?-1800+Math.random()*2100:-1800;
        this.v=220+Math.random()*220;
        this.r=.45+Math.random()*1.6;
        this.a=.2+Math.random()*.6;
        this.dorado=Math.random()>.28;
    }
    update(dt){
        this.z+=this.v*dt;
        if(this.z>520)this.reset();
    }
    draw(){
        const focal=720;
        const p=focal/(focal-this.z);
        if(p<=0)return;
        const x=ancho/2+this.x*p;
        const y=alto*.5+this.y*p;
        if(x<-40||x>ancho+40||y<-40||y>alto+40)return;
        const entrada=limitar((this.z+1800)/420,0,1);
        const salida=limitar((520-this.z)/290,0,1);
        ctx.globalAlpha=this.a*entrada*salida;
        ctx.beginPath();
        ctx.arc(x,y,this.r*Math.max(.4,p*1.55),0,Math.PI*2);
        ctx.fillStyle=this.dorado?"#ffe16a":"#fff9d8";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class GalaxiaPolvo{
    constructor(){
        this.arm=Math.floor(Math.random()*4);
        this.u=Math.pow(Math.random(),.7);
        this.core=Math.random()<.16;
        this.spread=(Math.random()-.5)*(this.core?1.9:.5);
        this.height=(Math.random()-.5)*(this.core?55:18+this.u*34);
        this.size=this.core?.7+Math.random()*2.1:.35+Math.random()*1.4;
        this.alpha=this.core?.34+Math.random()*.5:.11+Math.random()*.5;
        this.phase=Math.random()*Math.PI*2;
        this.twinkle=.7+Math.random()*1.4;
        const r=Math.random();
        this.color=r>.74?"#fff9dc":r>.18?"#ffe262":"#ffbd32";
    }
    update(dt){this.phase+=dt*this.twinkle*.15}
    draw(center){
        const rx=(movil?Math.min(ancho*.47,220):Math.min(ancho*.43,690))*camara.zoom;
        const rz=rx*.92;
        const theta=this.arm*(Math.PI/2)+this.u*Math.PI*5.4+this.spread+rotacionTotal()*.38+tiempo*.035;
        const x3=Math.cos(theta)*this.u*rx;
        const z3=Math.sin(theta)*this.u*rz;
        const y3=this.height*camara.zoom;
        const tilt=camara.inclinacion;
        const cosT=Math.cos(tilt);
        const sinT=Math.sin(tilt);
        const yRot=y3*cosT-z3*sinT;
        const zRot=y3*sinT+z3*cosT;
        const focal=900;
        const p=limitar(focal/(focal-zRot*.75),.68,1.42);
        const x=center.x+x3*p;
        const y=center.y+yRot*p;
        const d=limitar((zRot+rx)/(rx*2),0,1);
        ctx.globalAlpha=this.alpha*(.65+d*.35)*(.86+Math.sin(this.phase)*.14);
        ctx.beginPath();
        ctx.arc(x,y,this.size*(.72+d*.6),0,Math.PI*2);
        ctx.fillStyle=this.color;
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class GalaxiaEstrella{
    constructor(){
        this.angle=Math.random()*Math.PI*2;
        this.radius=.5+Math.random()*.5;
        this.depth=Math.random();
        this.size=.5+Math.random()*1.7;
        this.phase=Math.random()*Math.PI*2;
    }
    draw(center){
        const rx=(movil?Math.min(ancho*.49,230):Math.min(ancho*.47,760))*camara.zoom;
        const x=center.x+Math.cos(this.angle+rotacionTotal()*.08)*rx*this.radius;
        const y=center.y+Math.sin(this.angle+rotacionTotal()*.06)*rx*.68*this.radius;
        ctx.globalAlpha=.12+this.depth*.26+Math.sin(tiempo*.5+this.phase)*.05;
        ctx.beginPath();
        ctx.arc(x,y,this.size,0,Math.PI*2);
        ctx.fillStyle=this.depth>.55?"#fffceb":"#d8cc81";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class ChispaCorazon{
    constructor(){
        this.f=Math.random()*Math.PI*2;
        this.r=(movil?42:56)+Math.random()*(movil?44:58);
        this.s=.6+Math.random()*1.7;
        this.v=.25+Math.random()*.35;
        this.a=.22+Math.random()*.38;
    }
    draw(cx,cy){
        const ang=this.f+tiempo*this.v;
        ctx.globalAlpha=this.a;
        ctx.beginPath();
        ctx.arc(cx+Math.cos(ang)*this.r,cy+Math.sin(ang)*this.r*.55,this.s,0,Math.PI*2);
        ctx.fillStyle="#ffe97a";
        ctx.fill();
        ctx.globalAlpha=1;
    }
}

class Explosion{
    constructor(x,y){
        this.p=[];
        const total=movil?16:26;
        for(let i=0;i<total;i++){
            const a=Math.random()*Math.PI*2;
            const v=.5+Math.random()*2.2;
            this.p.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,r:1+Math.random()*2.3});
        }
    }
    update(dt){
        const f=dt*60;
        this.p.forEach(p=>{p.x+=p.vx*f;p.y+=p.vy*f;p.vx*=Math.pow(.98,f);p.vy*=Math.pow(.98,f);p.life-=.025*f});
        this.p=this.p.filter(p=>p.life>0);
    }
    draw(){
        this.p.forEach(p=>{ctx.globalAlpha=p.life;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="#ffe76a";ctx.fill()});
        ctx.globalAlpha=1;
    }
}

function crearEscenaCanvas(){
    estrellas=[];
    petalos=[];
    luces=[];
    introParticulas=[];
    galaxiaPolvo=[];
    galaxiaEstrellas=[];
    chispasCorazon=[];
    const nEst=movil?120:260;
    const nPet=movil?30:56;
    const nLuz=movil?45:80;
    const nIntro=movil?170:340;
    const nPolvo=movil?420:1050;
    const nGalEst=movil?90:180;
    const nCh=movil?14:24;
    for(let i=0;i<nEst;i++)estrellas.push(new Estrella());
    for(let i=0;i<nPet;i++)petalos.push(new Petalo());
    for(let i=0;i<nLuz;i++)luces.push(new Luz());
    for(let i=0;i<nIntro;i++)introParticulas.push(new IntroParticula());
    for(let i=0;i<nPolvo;i++)galaxiaPolvo.push(new GalaxiaPolvo());
    for(let i=0;i<nGalEst;i++)galaxiaEstrellas.push(new GalaxiaEstrella());
    for(let i=0;i<nCh;i++)chispasCorazon.push(new ChispaCorazon());
}

function obtenerFlores(){
    return [...document.querySelectorAll(".dato-flor")].map(el=>{
        const flor=el.querySelector(".imagen-flor");
        const tarjeta=el.querySelector(".imagen-tarjeta");
        return{
            titulo:el.dataset.titulo,
            etiqueta:el.dataset.etiqueta,
            emoji:el.dataset.emoji,
            frase:el.dataset.frase,
            imagenFlor:flor?.getAttribute("src")?.trim()||"",
            imagenTarjeta:tarjeta?.getAttribute("src")?.trim()||"",
            altFlor:flor?.getAttribute("alt")||"",
            altTarjeta:tarjeta?.getAttribute("alt")||""
        };
    });
}

function obtenerImagenesIntro(){
    return [...document.querySelectorAll(".dato-intro")].map(el=>({src:el.dataset.src?.trim()||"",emoji:el.dataset.emoji||"🌻"}));
}

function prepararCentro(){
    const src=imagenCentroVisible.getAttribute("src")?.trim();
    if(!src){imagenCentroVisible.style.display="none";return}
    imagenCentroVisible.onload=()=>imagenCentroVisible.style.display="block";
    imagenCentroVisible.onerror=()=>imagenCentroVisible.style.display="none";
    if(imagenCentroVisible.complete&&imagenCentroVisible.naturalWidth>0)imagenCentroVisible.style.display="block";
}

function crearEntrada3d(){
    mundo3d.innerHTML="";
    mundo3d.classList.remove("apagando");
    objetosIntro=[];
    introCerrando=false;
    const imgs=obtenerImagenesIntro();
    const frases=movil?20:30;
    const imagenes=movil?10:15;

    const crearObjeto=(tipo,i,data)=>{
        const el=document.createElement(tipo==="frase"?"span":"div");
        el.className=`item-3d ${tipo}`;
        if(tipo==="frase"){
            el.textContent=frases3d[i%frases3d.length];
            const nivel=i%10===0?2:i%4===0?1:0;
            el.style.fontSize=`${nivel===2?(movil?25:42):nivel===1?(movil?16:24):(movil?10:15)}px`;
        }else{
            const emoji=document.createElement("span");
            emoji.className="flor-emoji-3d";
            emoji.textContent=data.emoji;
            el.appendChild(emoji);
            const tam=movil?54+Math.random()*48:72+Math.random()*78;
            el.style.width=`${tam}px`;
            el.style.height=`${tam}px`;
            if(data.src){
                const img=document.createElement("img");
                img.src=data.src;
                img.alt="";
                img.onload=()=>emoji.style.display="none";
                img.onerror=()=>img.remove();
                el.appendChild(img);
            }
        }
        const ang=Math.random()*Math.PI*2;
        const radio=(.16+Math.random()*.82)*Math.max(ancho,alto)*.72;
        objetosIntro.push({
            el,
            tipo,
            x:Math.cos(ang)*radio,
            y:Math.sin(ang)*radio*.78,
            z:-1650+Math.random()*1650,
            v:(tipo==="frase"?150:135)+Math.random()*110,
            rot:(Math.random()-.5)*(tipo==="frase"?5:12)
        });
        mundo3d.appendChild(el);
    };

    for(let i=0;i<frases;i++)crearObjeto("frase",i,null);
    for(let i=0;i<imagenes;i++)crearObjeto("flor",i,imgs[i%Math.max(imgs.length,1)]||{src:"",emoji:"🌻"});
}

function actualizarEntrada3d(dt){
    if(!introActiva)return;
    introParticulas.forEach(p=>{p.update(dt);p.draw()});
    objetosIntro.forEach(obj=>{
        obj.z+=obj.v*dt*(introCerrando?.18:1);
        if(obj.z>500&&!introCerrando){
            const ang=Math.random()*Math.PI*2;
            const radio=(.18+Math.random()*.82)*Math.max(ancho,alto)*.72;
            obj.z=-1650-Math.random()*220;
            obj.x=Math.cos(ang)*radio;
            obj.y=Math.sin(ang)*radio*.78;
        }
        const focal=700;
        const p=focal/(focal-obj.z);
        if(p<=0)return;
        const sx=ancho/2+obj.x*p;
        const sy=alto*.5+obj.y*p;
        const entrada=limitar((obj.z+1650)/300,0,1);
        const salida=limitar((500-obj.z)/280,0,1);
        const op=entrada*salida;
        const scale=limitar(p*.95,.28,3.2);
        const blur=limitar((.7-scale)*1.2,0,1.1);
        obj.el.style.opacity=op;
        obj.el.style.filter=`blur(${blur}px)`;
        obj.el.style.transform=`translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) scale(${scale}) rotate(${obj.rot}deg)`;
    });
}

function iniciarEntrada3d(){
    crearEntrada3d();
    entrada3d.classList.remove("saliendo");
    entrada3d.classList.add("activa");
    introActiva=true;

    setTimeout(()=>{
        introCerrando=true;
        mundo3d.classList.add("apagando");
        mensajeFinal3d.classList.add("activo");
    },6500);

    setTimeout(()=>{
        introActiva=false;
        entrada3d.classList.add("saliendo");
    },8600);

    setTimeout(()=>{
        entrada3d.classList.remove("activa","saliendo");
        mensajeFinal3d.classList.remove("activo");
        mundo3d.innerHTML="";
        objetosIntro=[];
        requestAnimationFrame(()=>setTimeout(entrarUniverso,40));
    },9350);
}

function crearFlores(){
    orbitas.innerHTML="";
    floresUI=[];
    const datos=obtenerFlores();
    const total=datos.length;
    const radios=[.48,.66,.84,.58,.94,.76,.88];
    const elev=[-.22,.18,-.08,.3,-.3,.08,.26];
    const speed=[.72,.61,.83,.67,.77,.58,.7];

    datos.forEach((flor,i)=>{
        const btn=document.createElement("button");
        const cont=document.createElement("span");
        const label=document.createElement("span");
        btn.className="flor-orbita";
        cont.className="flor-contenedor";
        label.className="flor-nombre";
        label.textContent=flor.etiqueta;

        if(flor.imagenFlor){
            const img=document.createElement("img");
            img.className="flor-imagen";
            img.src=flor.imagenFlor;
            img.alt=flor.altFlor;
            img.onerror=()=>cont.innerHTML=`<span class="flor-emoji">${flor.emoji}</span>`;
            cont.appendChild(img);
        }else{
            cont.innerHTML=`<span class="flor-emoji">${flor.emoji}</span>`;
        }

        btn.appendChild(cont);
        btn.appendChild(label);
        btn.addEventListener("click",e=>{e.stopPropagation();abrirTarjeta(flor)});
        orbitas.appendChild(btn);
        requestAnimationFrame(()=>btn.classList.add("visible"));

        floresUI.push({
            el:btn,
            base:i*(Math.PI*2/Math.max(total,1))+.38*i,
            radius:radios[i%radios.length],
            elev:elev[i%elev.length],
            speed:speed[i%speed.length],
            wave:.5+i*.77
        });
    });
}

function corazonPosicion(){
    return{x:ancho/2,y:alto*(movil?.17:.18)};
}

function ramoPosicion(){
    return{x:ancho/2,y:alto*(movil?.56:.58)};
}

function rotacionTotal(){
    return camara.rotacion+rotacionAutomatica;
}

function dibujarNebulosas(){
    const n=[
        [ancho*.13+Math.sin(tiempo*.11)*18,alto*.24,Math.max(ancho,alto)*(movil?.19:.22),"68,76,190",.065],
        [ancho*.84+Math.cos(tiempo*.09)*20,alto*.34,Math.max(ancho,alto)*(movil?.17:.2),"116,48,140",.05],
        [ancho*.5,alto*.72+Math.cos(tiempo*.08)*14,Math.max(ancho,alto)*(movil?.26:.3),"255,182,20",.075]
    ];
    n.forEach(([x,y,r,c,a])=>{
        const g=ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,`rgba(${c},${a})`);
        g.addColorStop(.45,`rgba(${c},${a*.34})`);
        g.addColorStop(1,`rgba(${c},0)`);
        ctx.fillStyle=g;
        ctx.fillRect(0,0,ancho,alto);
    });
}

function dibujarUniverso(dt){
    const c=ramoPosicion();
    const haloR=(movil?Math.min(ancho*.72,300):Math.min(ancho*.36,620))*camara.zoom;
    const halo=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,haloR);
    halo.addColorStop(0,"rgba(255,250,215,.24)");
    halo.addColorStop(.1,"rgba(255,224,75,.17)");
    halo.addColorStop(.3,"rgba(255,194,18,.065)");
    halo.addColorStop(.64,"rgba(255,190,0,.015)");
    halo.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=halo;
    ctx.fillRect(0,0,ancho,alto);

    galaxiaEstrellas.forEach(s=>s.draw(c));

    ctx.save();
    ctx.globalCompositeOperation="lighter";
    galaxiaPolvo.forEach(p=>{p.update(dt);p.draw(c)});
    ctx.restore();

    const core=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,movil?125:190);
    core.addColorStop(0,"rgba(255,255,235,.24)");
    core.addColorStop(.18,"rgba(255,230,100,.18)");
    core.addColorStop(.55,"rgba(255,198,0,.045)");
    core.addColorStop(1,"rgba(255,190,0,0)");
    ctx.fillStyle=core;
    ctx.beginPath();
    ctx.arc(c.x,c.y,movil?130:200,0,Math.PI*2);
    ctx.fill();
}

function proyectarFlor(flor,center){
    const ang=flor.base+rotacionTotal()*flor.speed;
    const rx=(movil?Math.min(ancho*.44,205):Math.min(ancho*.4,650))*flor.radius*camara.zoom;
    const rz=rx*.95;
    const x3=Math.cos(ang)*rx;
    const z3=Math.sin(ang)*rz;
    const y3=(flor.elev*(movil?170:260)+Math.sin(ang*1.25+flor.wave)*(movil?26:40))*camara.zoom;
    const tilt=camara.inclinacion;
    const cosT=Math.cos(tilt);
    const sinT=Math.sin(tilt);
    const yRot=y3*cosT-z3*sinT;
    const zRot=y3*sinT+z3*cosT;
    const focal=880;
    const p=limitar(focal/(focal-zRot*.8),.62,1.5);
    const x=center.x+x3*p;
    const y=center.y+yRot*p;
    const d=limitar((zRot+rx)/(rx*2),0,1);
    return{x,y,p,d,z:zRot};
}

function actualizarFlores(){
    const c=ramoPosicion();
    floresUI.forEach(flor=>{
        const q=proyectarFlor(flor,c);
        const scale=(movil?.78:.82)*q.p;
        flor.el.style.transform=`translate3d(${q.x}px,${q.y}px,0) translate(-50%,-50%) scale(${scale})`;
        flor.el.style.opacity=.5+q.d*.5;
        flor.el.style.filter=`brightness(${.68+q.d*.55}) saturate(${.9+q.d*.2})`;
        flor.el.style.zIndex=String(q.z>=0?58+Math.round(q.d*26):18+Math.round(q.d*14));
        flor.el.classList.toggle("atras",q.z<0);
        flor.el.classList.toggle("frente",q.z>=0);
    });
}

function actualizarDOM(){
    if(!universoActivo)return;
    const h=corazonPosicion();
    const c=ramoPosicion();
    textoCorazon.style.left=`${h.x}px`;
    textoCorazon.style.top=`${h.y}px`;
    centroVisual.style.left=`${c.x}px`;
    centroVisual.style.top=`${c.y}px`;
    centroVisual.style.transform=`translate3d(-50%,-50%,0) scale(${camara.zoom})`;
    textoCentro.style.left=`${c.x}px`;
    textoCentro.style.top=`${c.y+(movil?112:138)*camara.zoom}px`;
    actualizarFlores();
}

function dibujarCorazon(){
    const c=corazonPosicion();
    const scale=Math.min(ancho,alto)*(movil?.0087:.0102)*(1+Math.sin(tiempo*2)*.02);
    const draw=(factor,color,width,blur)=>{
        ctx.beginPath();
        const pasos=movil?110:150;
        for(let i=0;i<=pasos;i++){
            const t=i/pasos*Math.PI*2;
            const x=16*Math.pow(Math.sin(t),3);
            const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
            const px=c.x+x*scale*factor;
            const py=c.y-y*scale*factor;
            if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.strokeStyle=color;
        ctx.lineWidth=width;
        ctx.shadowBlur=blur;
        ctx.shadowColor="#ffd700";
        ctx.stroke();
    };
    ctx.save();
    draw(1,"rgba(255,231,96,.96)",movil?1.8:2.3,14);
    draw(.92,"rgba(255,249,202,.42)",1,22);
    chispasCorazon.forEach(s=>s.draw(c.x,c.y));
    ctx.restore();
}

function mostrarEscena(escena){
    document.querySelectorAll(".escena").forEach(e=>e.classList.remove("activa"));
    if(escena)escena.classList.add("activa");
}

function iniciarMusicaSuave(){
    if(fadeMusica)cancelAnimationFrame(fadeMusica);
    musicaFondo.volume=0;
    const fin=.35;
    const duracion=4000;
    musicaFondo.play().then(()=>{
        const t0=performance.now();
        const subir=ahora=>{
            const p=Math.min((ahora-t0)/duracion,1);
            musicaFondo.volume=fin*(1-Math.pow(1-p,3));
            if(p<1)fadeMusica=requestAnimationFrame(subir);else fadeMusica=null;
        };
        fadeMusica=requestAnimationFrame(subir);
    }).catch(()=>{});
}

function iniciarExperiencia(){
    if(experienciaIniciada)return;
    experienciaIniciada=true;
    iniciarMusicaSuave();
    inicio.classList.add("oculto");
    setTimeout(()=>mostrarEscena(escenaFecha),700);
    setTimeout(()=>mostrarEscena(escenaMensaje),4100);
    setTimeout(()=>{mostrarEscena(null);iniciarEntrada3d()},7600);
}

function entrarUniverso(){
    universoActivo=true;
    introCerrando=false;
    if(movil){camara.zoom=.96;camara.inclinacion=-.46}
    galaxiaInteractiva.classList.add("activa");
    const c=ramoPosicion();
    crearExplosion(c.x,c.y);
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
        tarjetaImagen.onload=()=>{tarjetaImagen.style.display="block";tarjetaEmoji.style.display="none"};
        tarjetaImagen.onerror=()=>{tarjetaImagen.style.display="none";tarjetaEmoji.style.display="block";tarjetaEmoji.textContent="💛"};
    }else{
        tarjetaEmoji.style.display="block";
        tarjetaEmoji.textContent="💛";
    }
    tarjetaOverlay.classList.add("activa");
}

function abrirTarjetaCentral(){
    tarjetaTitulo.textContent="Nuestro pequeño universo";
    tarjetaFrase.textContent="Si todo esto fuera un universo, tú serías ese punto de luz alrededor del cual nacen todos estos pequeños detalles.";
    tarjetaImagen.style.display="none";
    tarjetaEmoji.style.display="none";
    tarjetaImagen.removeAttribute("src");
    const src=imagenCentroVisible.getAttribute("src")?.trim();
    if(src){
        tarjetaImagen.src=src;
        tarjetaImagen.alt="Ramo principal";
        tarjetaImagen.onload=()=>tarjetaImagen.style.display="block";
        tarjetaImagen.onerror=()=>{tarjetaEmoji.style.display="block";tarjetaEmoji.textContent="💛"};
    }else{
        tarjetaEmoji.style.display="block";
        tarjetaEmoji.textContent="💛";
    }
    tarjetaOverlay.classList.add("activa");
}

function activarCentroEspecial(){
    const c=ramoPosicion();
    efectoCentroHasta=performance.now()+1800;
    centroVisual.classList.remove("activa-especial");
    void centroVisual.offsetWidth;
    centroVisual.classList.add("activa-especial");
    crearExplosion(c.x,c.y);
    setTimeout(()=>crearExplosion(c.x-36,c.y-16),100);
    setTimeout(()=>crearExplosion(c.x+38,c.y+12),200);
    setTimeout(()=>crearExplosion(c.x,c.y-42),300);
    setTimeout(abrirTarjetaCentral,720);
    setTimeout(()=>centroVisual.classList.remove("activa-especial"),1800);
}

function cerrarTarjetaFn(){tarjetaOverlay.classList.remove("activa")}
function crearExplosion(x,y){if(universoActivo)explosiones.push(new Explosion(x,y))}

function animar(ahora){
    const dt=Math.min((ahora-ultimoFrame)/1000,.033);
    ultimoFrame=ahora;
    tiempo+=dt;

    if(universoActivo&&touchMode===""&&!arrastrandoMouse){
        rotacionAutomatica+=dt*(movil?.16:.2)*(ahora<efectoCentroHasta?.2:1);
        if(Math.abs(velocidadInercial)>.0001){
            camara.rotacion+=velocidadInercial*dt*60;
            velocidadInercial*=Math.pow(.92,dt*60);
        }
    }

    ctx.clearRect(0,0,ancho,alto);
    dibujarNebulosas();
    estrellas.forEach(e=>{e.update(dt);e.draw()});
    luces.forEach(l=>{l.update(dt);l.draw()});
    if(experienciaIniciada)petalos.forEach(p=>{p.update(dt);p.draw()});
    actualizarEntrada3d(dt);

    if(universoActivo){
        dibujarUniverso(dt);
        dibujarCorazon();
        actualizarDOM();
    }

    explosiones.forEach(e=>{e.update(dt);e.draw()});
    explosiones=explosiones.filter(e=>e.p.length);
    requestAnimationFrame(animar);
}

btnComenzar.addEventListener("click",iniciarExperiencia);
cerrarTarjeta.addEventListener("click",cerrarTarjetaFn);
tarjetaOverlay.addEventListener("click",e=>{if(e.target===tarjetaOverlay)cerrarTarjetaFn()});
centroVisual.addEventListener("click",e=>{e.stopPropagation();if(universoActivo)activarCentroEspecial()});

galaxiaInteractiva.addEventListener("mousedown",e=>{
    if(movil||!universoActivo)return;
    if(e.target.closest(".flor-orbita,.tarjeta,#centroVisual"))return;
    arrastrandoMouse=true;
    mouseInicioX=e.clientX;
    mouseInicioY=e.clientY;
    mouseUltimoX=e.clientX;
    mouseUltimoTiempo=performance.now();
    mouseRotacionInicio=camara.rotacion;
    mouseInclinacionInicio=camara.inclinacion;
    velocidadInercial=0;
    document.body.classList.add("arrastrando");
});

window.addEventListener("mousemove",e=>{
    if(!arrastrandoMouse)return;
    const dx=e.clientX-mouseInicioX;
    const dy=e.clientY-mouseInicioY;
    camara.rotacion=mouseRotacionInicio+dx*.009;
    camara.inclinacion=limitar(mouseInclinacionInicio+dy*.0038,-.7,.15);
    const ahora=performance.now();
    const dt=Math.max(ahora-mouseUltimoTiempo,1);
    velocidadInercial=(e.clientX-mouseUltimoX)/dt*.08;
    mouseUltimoX=e.clientX;
    mouseUltimoTiempo=ahora;
});

window.addEventListener("mouseup",()=>{
    arrastrandoMouse=false;
    document.body.classList.remove("arrastrando");
});

galaxiaInteractiva.addEventListener("touchstart",e=>{
    if(!universoActivo)return;
    if(e.touches.length>=2){
        const [t1,t2]=e.touches;
        touchMode="pinch";
        pinchStartDistance=distanciaTouches(t1,t2);
        pinchStartZoom=camara.zoom;
        velocidadInercial=0;
        e.preventDefault();
        return;
    }
    if(e.target.closest(".flor-orbita,.tarjeta,#centroVisual"))return;
    const t=e.touches[0];
    touchMode="drag";
    touchStartX=t.clientX;
    touchStartY=t.clientY;
    touchUltimoX=t.clientX;
    touchUltimoTiempo=performance.now();
    touchRotStart=camara.rotacion;
    touchTiltStart=camara.inclinacion;
    velocidadInercial=0;
},{passive:false});

galaxiaInteractiva.addEventListener("touchmove",e=>{
    if(!universoActivo)return;
    if(e.touches.length>=2){
        const [t1,t2]=e.touches;
        const dist=distanciaTouches(t1,t2);
        if(touchMode!=="pinch"){
            touchMode="pinch";
            pinchStartDistance=dist;
            pinchStartZoom=camara.zoom;
        }
        camara.zoom=limitar(pinchStartZoom*(dist/pinchStartDistance),.72,1.55);
        e.preventDefault();
        return;
    }
    if(touchMode==="drag"&&e.touches.length===1){
        const t=e.touches[0];
        const dx=t.clientX-touchStartX;
        const dy=t.clientY-touchStartY;
        camara.rotacion=touchRotStart+dx*.011;
        camara.inclinacion=limitar(touchTiltStart+dy*.004,-.7,.15);
        const ahora=performance.now();
        const dt=Math.max(ahora-touchUltimoTiempo,1);
        velocidadInercial=(t.clientX-touchUltimoX)/dt*.1;
        touchUltimoX=t.clientX;
        touchUltimoTiempo=ahora;
        e.preventDefault();
    }
},{passive:false});

galaxiaInteractiva.addEventListener("touchend",e=>{
    if(e.touches.length>=2){
        const [t1,t2]=e.touches;
        touchMode="pinch";
        pinchStartDistance=distanciaTouches(t1,t2);
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

galaxiaInteractiva.addEventListener("touchcancel",()=>touchMode="");
window.addEventListener("wheel",e=>{
    if(!universoActivo||movil)return;
    e.preventDefault();
    camara.zoom=limitar(camara.zoom-e.deltaY*.00075,.7,1.65);
},{passive:false});

galaxiaInteractiva.addEventListener("click",e=>{
    if(!universoActivo)return;
    if(e.target.closest(".flor-orbita,.tarjeta,#centroVisual"))return;
    crearExplosion(e.clientX,e.clientY);
});

window.addEventListener("keydown",e=>{if(e.key==="Escape")cerrarTarjetaFn()});
window.addEventListener("resize",ajustarCanvas);
window.visualViewport?.addEventListener("resize",ajustarCanvas);

detectarMovil();
ajustarCanvas();
crearFlores();
prepararCentro();
requestAnimationFrame(animar);
