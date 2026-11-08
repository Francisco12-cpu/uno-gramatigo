/* =====================================================================
   "Como jogar" — vídeo animado em HTML5 (sem arquivo de vídeo: leve e offline)
   Tudo é função do tempo t: dá pra pausar, arrastar, pular capítulos
   e até gravar quadro a quadro em MP4 (window.__video.seek).
   ===================================================================== */
(function(){
'use strict';
const U = window.__uno, P = window.UnoCore.PARES;
if(!U || !document.getElementById('video-palco')) return;
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const GRAVAR = params.has('gravar');

/* ---------------- roteiro ---------------- */
const W = 1000, H = 625;
const MESA = { x:560, y:300 }, MONTE = { x:420, y:300 };
const LUGAR = { voce:{ x:500, y:585, nome:'Você', bicho:'raposa' }, coruja:{ x:92, y:280, nome:'Coruja', bicho:'coruja' }, sapo:{ x:500, y:66, nome:'Sapo', bicho:'sapo' }, panda:{ x:908, y:280, nome:'Panda', bicho:'panda' } };
const T = 66;
const CAPITULOS = [[0,'Início'],[6,'UNO normal'],[14,'Perguntas e respostas'],[22,'⚡ Relâmpago'],[34,'Bônus e combo'],[44,'Contestar'],[54,'UNO!']];
const LEGENDAS = [
  [0, 'É um <b>UNO normal</b>… com um segredo de <b>gramática</b>.'],
  [6, 'Na sua vez, jogue uma carta da <b>mesma cor</b>, do <b>mesmo número</b> ou com o <b>mesmo símbolo</b>.'],
  [10, 'Não sabe gramática? <b>Joga numa boa</b>, como num UNO de sempre.'],
  [14, 'As cartas de número têm <b>perguntas (?)</b> e <b>respostas (!)</b>.'],
  [18, 'Cor e número são <b>sorteados a cada partida</b>: só acha o par quem <b>lê e sabe</b>.'],
  [22, 'Caiu uma pergunta na mesa… e você tem a <b>resposta</b> dela?'],
  [25.4, 'Toque <b>✋ Bater</b>: a mesa congela e ninguém joga por cima enquanto você escolhe.'],
  [28, '<b>⚡ Relâmpago!</b> Vale até <b>fora da sua vez</b>.'],
  [30.5, 'Os outros têm alguns segundos pra <b>contestar</b>. Ninguém contestou: valeu!'],
  [34, 'Acertou? <b>Bônus!</b> Jogue em sequência tudo que combinar com a mesa.'],
  [37.4, 'Terminou numa pergunta… e a coruja tem a resposta!'],
  [39.2, 'Relâmpago em cima de Relâmpago: <b>COMBO!</b> Quem sabe mais, joga mais.'],
  [42, 'Depois, a vez volta pra quem estava jogando. Ninguém é pulado.'],
  [44, 'E se alguém <b>chutar</b>?'],
  [46.6, 'Quem perceber o erro aperta <b>Contestar</b>…'],
  [48, '…a carta volta, quem chutou <b>compra 2</b> e quem contestou ganha a vez.'],
  [50.2, 'E o jogo mostra o <b>par certo</b>: todo mundo aprende.'],
  [54, 'Ficou com 2 cartas? Grite <b>UNO!</b>'],
  [57.6, 'Joga normal quem não sabe. Mas quem sabe gramática… <b>vence mais vezes!</b>'],
  [61, 'Agora é com você. <b>Bora jogar?</b>']
];
const BALOES = [
  ['voce', 0.8, 3.4, 'Oi!'], ['coruja', 1.3, 3.8, 'Bora!'], ['sapo', 1.8, 4.2, 'Uhul!'], ['panda', 2.3, 4.6, 'Eba!'],
  ['voce', 24.4, 26.6, 'Essa eu sei!'], ['panda', 26.2, 28, 'Ih, congelou!'], ['voce', 28.1, 30, '⚡ Relâmpago!'],
  ['coruja', 38.2, 39.4, 'MODO!'], ['sapo', 40, 41.6, 'Que combo!'],
  ['panda', 44, 45.2, 'Vou chutar…'], ['sapo', 46.9, 48.4, 'Contesto!'], ['panda', 48.4, 50, 'Ai, +2…'],
  ['voce', 54.4, 56, 'UNO!'], ['voce', 57.8, 60.4, 'Ganhei! 🎉'], ['coruja', 58.2, 60.4, 'Boa!']
];
// efeitos com tempo marcado
const RAIOS = [28, 39.2, 45];
const SONS = [[1,'vez'],[7,'carta'],[9.5,'carta'],[11.8,'carta'],[23,'carta'],[25.5,'bater'],[28,'raio'],[33.2,'certo'],[35.2,'carta'],[36.4,'carta'],[39.2,'raio'],[39.7,'uno'],[45,'raio'],[47,'clique'],[48,'errado'],[48.6,'compra'],[54.4,'uno'],[55.5,'carta'],[57.2,'carta'],[57.7,'vitoria']];

const cartas = [];
function carta(dados, kf){ cartas.push({ dados, kf }); return kf; }
const pq = (i, cor, num) => ({ cor, tipo:'numero', numero:num, texto:P[i].qt, papel:'pergunta' });
const pr = (i, cor, num) => ({ cor, tipo:'numero', numero:num, texto:P[i].at, papel:'resposta' });
let ordem = 1;
const naMesa = () => { const o = ordem++; return { x: MESA.x + ((o * 13) % 9 - 4), y: MESA.y + ((o * 7) % 7 - 3), r: ((o * 37) % 21 - 10) * .5, s:1, f:1, z:o }; };
// slots da sua mão (6 cartas)
const SLOT = i => ({ x: 318 + i * 73, y: 512, r: (i - 2.5) * 5, s: .6, f:1, z: 100 + i });
function deOutro(quem, t){ const l = LUGAR[quem]; return { t, x:l.x, y:l.y, r:0, s:.35, f:0, z:200 }; }
function jogada(dados, quem, t){ const m = naMesa(); carta(dados, [Object.assign(deOutro(quem, t - .05), { o:0 }), deOutro(quem, t), Object.assign({ t: t + .6 }, m)]); return m; }
function daMao(dados, i, tJoga, extra){
  const kf = [Object.assign({ t:0 }, SLOT(i))];
  (extra || []).forEach(e => kf.push(Object.assign({}, kf[kf.length - 1], e)));
  kf.push(Object.assign({}, kf[kf.length - 1], { t:tJoga, z:300 }));
  kf.push(Object.assign({ t:tJoga + .6 }, naMesa()));
  carta(dados, kf);
}

// mesa inicial
carta(pq(4, 'azul', 3), [Object.assign({ t:0 }, naMesa())]);
// cena 2: UNO normal
jogada(pr(17, 'azul', 8), 'panda', 7);
daMao(pq(30, 'verde', 8), 0, 9.5);
const topoP = jogada(pq(22, 'verde', 5), 'sapo', 11.8);
// cena 3: zoom na carta da mesa
cartas[cartas.length - 1].kf.push(Object.assign({}, topoP, { t:14.4 }), { t:15.2, x:500, y:300, r:0, s:2.3, f:1, z:400 }, { t:20.8, x:500, y:300, r:0, s:2.3, f:1, z:400 }, Object.assign({}, topoP, { t:21.6 }));
// cena 4: Relâmpago
jogada(pq(23, 'amarelo', 7), 'sapo', 23);
daMao(pr(23, 'vermelho', 2), 1, 28, [{ t:24.4 }, { t:24.9, y:470, s:.72, z:150 }]);
// cena 5: bônus em sequência e combo
daMao(pr(13, 'vermelho', 9), 2, 35.2);
daMao(pq(15, 'amarelo', 9), 3, 36.4);
jogada(pr(15, 'azul', 1), 'coruja', 39.2);
// cena 6: chute contestado
const chute = jogada(pq(11, 'verde', 6), 'panda', 45);
cartas[cartas.length - 1].kf.push(Object.assign({}, chute, { t:47.9 }), deOutro('panda', 48.6), Object.assign(deOutro('panda', 48.7), { o:0 }));
[48.6, 49.1].forEach(t => carta(null, [{ t:0, x:MONTE.x, y:MONTE.y, r:0, s:.62, f:0, z:1, o:0 }, { t:t - .01, x:MONTE.x, y:MONTE.y, r:0, s:.62, f:0, z:250, o:1 }, Object.assign(deOutro('panda', t + .5), { o:1 }), Object.assign(deOutro('panda', t + .6), { o:0 })]));
// cena 7: UNO e vitória
daMao(pr(26, 'azul', 4), 4, 55.5);
daMao({ cor:'preto', tipo:'coringa' }, 5, 57.2);

/* ---------------- montagem do palco ---------------- */
const palco = $('#video-palco');
palco.innerHTML = '';
const mundo = document.createElement('div'); mundo.className = 'vp-mundo'; palco.append(mundo);
mundo.innerHTML = '<div class="vp-feltro"></div><div class="vp-monte"></div>';
const monte = mundo.querySelector('.vp-monte');
for(let i = 0; i < 3; i++){ const c = U.criarCarta(null, 'g', true); c.style.setProperty('--w', '76px'); c.style.transform = 'translate(' + (i * 2) + 'px,' + (i * 2) + 'px)'; monte.append(c); }
const avs = {};
Object.keys(LUGAR).forEach(k => {
  const l = LUGAR[k], a = document.createElement('div'); a.className = 'vp-av vp-' + k;
  a.style.left = l.x + 'px'; a.style.top = l.y + 'px';
  a.innerHTML = '<span class="vp-cara">' + U.bichoSVG(l.bicho) + '</span><span class="vp-nome">' + l.nome + '</span><span class="vp-balao"></span>';
  if(k !== 'voce'){ const leque = document.createElement('div'); leque.className = 'vp-leque'; for(let i = 0; i < 5; i++){ const c = U.criarCarta(null, 'p', true); c.style.transform = 'translateX(-50%) rotate(' + ((i - 2) * 10) + 'deg)'; leque.append(c); } a.append(leque); }
  mundo.append(a); avs[k] = a;
});
cartas.forEach(c => {
  const e = U.criarCarta(c.dados ? Object.assign({ id: -1 }, c.dados) : null, 'g', !c.dados);
  e.classList.add('vp-carta'); e.style.setProperty('--w', '120px');
  const v = U.criarCarta(null, 'g', true); v.classList.add('vp-verso'); v.style.setProperty('--w', '120px');
  const box = document.createElement('div'); box.className = 'vp-cx'; box.append(e, v);
  mundo.append(box); c.el = box;
});
const camadas = {};
[['titulo', '<div class="vp-logo"><img src="icons/icone.svg" alt=""><div><b>UNO Gramática</b><span>como jogar</span></div></div>'],
 ['anel', ''], ['bater', '<span>✋ Bater</span>'], ['raioFx', '<svg viewBox="0 0 1000 625"><path d="M560 -10 L520 120 L585 150 L530 300"/></svg>'], ['clarao', ''],
 ['tempo', '<i></i>'], ['contest', '<b>⚡ Panda soltou uma Relâmpago!</b><div><span class="vp-btn vermelho">Contestar!</span><span class="vp-btn">Deixar passar</span></div>'],
 ['combo', 'COMBO <b>×2</b>'], ['licao', '📚 <b>Artigos:</b> “Quais são os artigos indefinidos?” → “um, uma, uns, umas”'],
 ['uno', 'UNO!'], ['vitoria', '<div class="vp-trofeu">🏆</div><b>Você venceu!</b><span>mandou bem na gramática</span>'],
 ['fim', '<div class="vp-logo"><img src="icons/icone.svg" alt=""><div><b>Bora jogar?</b><span>joga normal quem não sabe · quem sabe dispara</span></div></div>']
].forEach(([k, html]) => { const d = document.createElement('div'); d.className = 'vp-' + k; d.innerHTML = html; mundo.append(d); camadas[k] = d; });
const confete = document.createElement('canvas'); confete.className = 'vp-confete'; confete.width = W; confete.height = H; mundo.append(confete);
const cctx = confete.getContext('2d');
const PEDACOS = Array.from({ length:120 }, (_, i) => ({ x: 500 + Math.sin(i * 12.9) * 60, vx: Math.sin(i * 7.3) * 7, vy: -6 - (i % 9), c: ['#ffcc1a','#1f74d6','#22a45a','#e2382c','#fff'][i % 5], r: 5 + i % 5, g: i * .7 }));

/* ---------------- desenho de um instante t ---------------- */
const suave = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
function amostra(kf, t){
  if(t <= kf[0].t) return Object.assign({ o:1 }, kf[0], { sx:1 });
  for(let i = 0; i < kf.length - 1; i++){
    const a = kf[i], b = kf[i + 1];
    if(t < b.t){
      const p = suave((t - a.t) / Math.max(.001, b.t - a.t)), m = (x, y) => x + (y - x) * p;
      const vira = a.f !== b.f;
      return { x:m(a.x, b.x), y:m(a.y, b.y) - (vira ? Math.sin(p * Math.PI) * 60 : 0), r:m(a.r, b.r), s:m(a.s, b.s), z: p < .5 ? a.z : b.z,
        f: vira ? (p < .5 ? a.f : b.f) : a.f, sx: vira ? Math.abs(1 - 2 * p) : 1, o: m(a.o == null ? 1 : a.o, b.o == null ? 1 : b.o) };
    }
  }
  return Object.assign({ o:1 }, kf[kf.length - 1], { sx:1 });
}
const janela = (t, a, b, f) => { f = f || .3; if(t < a - f || t > b + f) return 0; if(t < a) return 1 - (a - t) / f; if(t > b) return 1 - (t - b) / f; return 1; };
function mostrar(el, op, extra){ el.style.opacity = op; el.style.visibility = op > 0.01 ? 'visible' : 'hidden'; if(extra) Object.assign(el.style, extra); }

let ultimaLegenda = -1;
function desenhar(t){
  cartas.forEach(c => {
    const s = amostra(c.kf, t);
    c.el.style.transform = 'translate(' + (s.x - 60) + 'px,' + (s.y - 87.6) + 'px) rotate(' + s.r + 'deg) scale(' + (s.s * s.sx) + ',' + s.s + ')';
    c.el.style.zIndex = s.z; c.el.style.opacity = s.o;
    c.el.classList.toggle('virada', !s.f);
  });
  // bichinhos: balões, quem está feliz/triste
  Object.keys(avs).forEach(k => { const b = avs[k].querySelector('.vp-balao'); const fala = BALOES.find(x => x[0] === k && t >= x[1] && t <= x[2]); b.textContent = fala ? fala[3] : ''; b.classList.toggle('on', !!fala); });
  avs.voce.classList.toggle('feliz', (t > 28 && t < 29.6) || (t > 57.8 && t < 61) || (t > .8 && t < 2));
  avs.coruja.classList.toggle('feliz', (t > 39.2 && t < 41) || (t > 1.3 && t < 2.5));
  avs.panda.classList.toggle('triste', t > 48 && t < 50.5);
  avs.panda.classList.toggle('feliz', t > 2.3 && t < 3.5);
  avs.sapo.classList.toggle('feliz', (t > 47 && t < 48.4) || (t > 1.8 && t < 3));
  avs.voce.classList.toggle('pensa', t > 25.5 && t < 28);
  const vez = t < 7 ? 'panda' : t < 9.5 ? 'voce' : t < 11.8 ? 'sapo' : t < 23 ? 'sapo' : t < 44 ? 'panda' : t < 48 ? 'panda' : t < 54 ? 'sapo' : 'voce';
  Object.keys(avs).forEach(k => avs[k].classList.toggle('na-vez', k === vez && t > 5));
  // camadas
  mostrar(camadas.titulo, janela(t, 0, 4.8, .5), { transform: 'translate(-50%,-50%) scale(' + (1 + Math.max(0, 1 - t) * .3) + ')' });
  mostrar(camadas.anel, janela(t, 25.5, 28, .15));
  mostrar(camadas.bater, janela(t, 24.2, 26.4, .25)); camadas.bater.classList.toggle('apertado', t > 25.4 && t < 25.8);
  const raio = RAIOS.find(r => t >= r && t < r + .55);
  mostrar(camadas.raioFx, raio != null ? 1 - (t - raio) / .55 : 0);
  mostrar(camadas.clarao, raio != null ? Math.max(0, 1 - (t - raio) / .45) : 0);
  const tempo1 = janela(t, 29, 33, .2), tempo2 = janela(t, 45.7, 47, .2);
  mostrar(camadas.tempo, Math.max(tempo1, tempo2));
  camadas.tempo.firstChild.style.width = (t < 40 ? Math.max(0, 1 - (t - 29) / 4) : Math.max(0, 1 - (t - 45.7) / 4)) * 100 + '%';
  mostrar(camadas.contest, janela(t, 45.8, 47.8, .25));
  camadas.contest.classList.toggle('apertado', t > 46.9 && t < 47.3);
  mostrar(camadas.combo, janela(t, 39.6, 41.2, .2), { transform: 'translate(-50%,-50%) scale(' + (t < 39.9 ? .5 + (t - 39.4) * 1.6 : 1) + ') rotate(-4deg)' });
  mostrar(camadas.licao, janela(t, 50.2, 53.6, .3));
  mostrar(camadas.uno, janela(t, 54.3, 55.6, .2));
  mostrar(camadas.vitoria, janela(t, 57.8, 60.6, .3));
  mostrar(camadas.fim, t >= 60.6 ? Math.min(1, (t - 60.6) / .5) : 0);
  // confete
  cctx.clearRect(0, 0, W, H);
  if(t > 57.7 && t < 61){
    const d = (t - 57.7) * 30;
    PEDACOS.forEach(p => { const x = p.x + p.vx * d, y = 260 + p.vy * d + .25 * d * d * .5; cctx.save(); cctx.translate(x, y); cctx.rotate(p.g + d * .1); cctx.fillStyle = p.c; cctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cctx.restore(); });
  }
  // legenda
  let li = 0; for(let i = 0; i < LEGENDAS.length; i++) if(t >= LEGENDAS[i][0]) li = i;
  if(li !== ultimaLegenda){ ultimaLegenda = li; $('#video-legenda').innerHTML = LEGENDAS[li][1]; }
  // controles
  $('#video-progresso').style.width = (t / T * 100) + '%';
  const mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  $('#video-tempo').textContent = mm(t) + ' / ' + mm(T);
  let ci = 0; CAPITULOS.forEach((c, i) => { if(t >= c[0]) ci = i; });
  document.querySelectorAll('#video-capitulos button').forEach((b, i) => b.classList.toggle('on', i === ci));
}

/* ---------------- tocador ---------------- */
let t = 0, tocando = false, ultimoQuadro = 0;
function ajustar(){ const r = palco.getBoundingClientRect(); const e = Math.min(r.width / W, r.height / H); mundo.style.transform = 'translate(' + ((r.width - W * e) / 2) + 'px,' + ((r.height - H * e) / 2) + 'px) scale(' + e + ')'; }
function quadro(agora){
  if(!tocando) return;
  const dt = Math.min(.1, (agora - ultimoQuadro) / 1000); ultimoQuadro = agora;
  const antes = t; t = Math.min(T, t + dt);
  SONS.forEach(([ts, som]) => { if(ts > antes && ts <= t) U.Som && U.Som.tocar(som); });
  desenhar(t);
  if(t >= T){ pausar(); return; }
  if(!$('#tela-video').classList.contains('ativa')){ pausar(); return; }
  requestAnimationFrame(quadro);
}
function tocar(){ if(t >= T) t = 0; tocando = true; ultimoQuadro = performance.now(); $('#video-play').textContent = '❚❚'; $('#video-play').setAttribute('aria-label', 'Pausar'); U.Som && U.Som.iniciar(); requestAnimationFrame(quadro); }
function pausar(){ tocando = false; $('#video-play').textContent = t >= T ? '↻' : '▶'; $('#video-play').setAttribute('aria-label', 'Tocar'); }
function irPara(s){ t = Math.max(0, Math.min(T, s)); desenhar(t); }
$('#video-play').onclick = () => tocando ? pausar() : tocar();
palco.onclick = () => tocando ? pausar() : tocar();
const trilho = $('#video-trilho');
const arrastar = e => { const r = trilho.getBoundingClientRect(); irPara((e.clientX - r.left) / r.width * T); };
trilho.addEventListener('pointerdown', e => { trilho.setPointerCapture(e.pointerId); arrastar(e); trilho.onpointermove = arrastar; });
trilho.addEventListener('pointerup', () => { trilho.onpointermove = null; });
$('#video-marcas').innerHTML = CAPITULOS.slice(1).map(c => '<span style="left:' + (c[0] / T * 100) + '%"></span>').join('');
$('#video-capitulos').innerHTML = CAPITULOS.map((c, i) => '<button data-i="' + i + '">' + c[1] + '</button>').join('');
$('#video-capitulos').onclick = e => { const b = e.target.closest('button'); if(!b) return; irPara(CAPITULOS[+b.dataset.i][0]); if(!tocando) tocar(); };
$('#btn-video-jogar').onclick = () => { pausar(); U.ir('tela-solo'); };
addEventListener('resize', ajustar);
// começa sozinho ao abrir a tela
new MutationObserver(() => { if($('#tela-video').classList.contains('ativa')){ ajustar(); if(!tocando && !GRAVAR){ if(t >= T) t = 0; tocar(); } } else pausar(); })
  .observe($('#tela-video'), { attributes:true, attributeFilter:['class'] });
ajustar(); desenhar(0);

// gravação em MP4: o palco ocupa a janela e a legenda vai pra dentro dele
if(GRAVAR){
  document.body.classList.add('gravando');
  palco.append($('#video-legenda'));
  U.ir('tela-video'); setTimeout(ajustar, 50);
}
window.__video = { seek: s => { irPara(s); }, T, ajustar };
})();
