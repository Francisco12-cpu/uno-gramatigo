(function(){
'use strict';
const { Game, PARES, CORES, REGRAS_PADRAO, ehPerguntaResposta, formamPar, textoDoPar, mesmoTipo } = window.UnoCore;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const params = new URLSearchParams(location.search);
const TESTE = params.has('teste');
const reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEX = { amarelo:'#ffcc1a', azul:'#1f74d6', verde:'#22a45a', vermelho:'#e2382c', preto:'#9aa0b4' };
const NOME_COR = { amarelo:'amarelo', azul:'azul', verde:'verde', vermelho:'vermelho' };
const AVATARES = ['#e2382c','#1f74d6','#22a45a','#d99a00','#8e44ad','#e67e22','#16a085','#c0392b','#2c3e50','#d35400'];
const NOMES_ROBOS = ['Vírgula','Crase','Hífen','Til','Cedilha','Acento','Ponto','Trema','Aspas'];

/* ---------------- bichinhos (avatares em SVG, animados por CSS) ---------------- */
const OLHOS = (y, cor) => '<g class="olhos"><circle cx="38" cy="' + y + '" r="6" fill="' + (cor || '#1b1b22') + '"/><circle cx="62" cy="' + y + '" r="6" fill="' + (cor || '#1b1b22') + '"/><circle cx="40" cy="' + (y - 2) + '" r="2.2" fill="#fff"/><circle cx="64" cy="' + (y - 2) + '" r="2.2" fill="#fff"/></g>';
const BOCA = y => '<path class="boca" d="M43 ' + y + ' Q50 ' + (y + 7) + ' 57 ' + y + '" fill="none" stroke="#1b1b22" stroke-width="3" stroke-linecap="round"/>';
const BOCHECHAS = y => '<circle cx="27" cy="' + y + '" r="5" fill="#ff7a8a" opacity=".45"/><circle cx="73" cy="' + y + '" r="5" fill="#ff7a8a" opacity=".45"/>';
const BICHOS = {
  raposa:{ nome:'Raposa', svg:'<path d="M16 12 L42 34 L20 48Z" fill="#e8742c"/><path d="M84 12 L58 34 L80 48Z" fill="#e8742c"/><path d="M21 21 L34 34 L24 41Z" fill="#40261a"/><path d="M79 21 L66 34 L76 41Z" fill="#40261a"/><ellipse cx="50" cy="57" rx="35" ry="30" fill="#f08a3c"/><path d="M15 58 Q50 100 85 58 Q72 82 50 82 Q28 82 15 58Z" fill="#fff4e6"/>' + OLHOS(52) + '<ellipse cx="50" cy="69" rx="5.5" ry="4" fill="#2a1a12"/>' + BOCA(74) },
  gato:{ nome:'Gato', svg:'<path d="M18 16 L40 36 L18 50Z" fill="#8f9bb0"/><path d="M82 16 L60 36 L82 50Z" fill="#8f9bb0"/><path d="M22 25 L33 36 L22 43Z" fill="#ffb3c1"/><path d="M78 25 L67 36 L78 43Z" fill="#ffb3c1"/><circle cx="50" cy="58" r="34" fill="#a4afc3"/><path d="M38 30 Q50 40 62 30" fill="none" stroke="#7d889c" stroke-width="4" stroke-linecap="round"/>' + OLHOS(54, '#2e6b2e') + '<path d="M46 66 L54 66 L50 71Z" fill="#ff8fa3"/>' + BOCA(73) + '<path d="M14 64 L32 67 M14 72 L32 71 M86 64 L68 67 M86 72 L68 71" stroke="#4b5366" stroke-width="2" stroke-linecap="round"/>' },
  coruja:{ nome:'Coruja', svg:'<path d="M20 18 L34 36 L18 40Z" fill="#6e4528"/><path d="M80 18 L66 36 L82 40Z" fill="#6e4528"/><ellipse cx="50" cy="58" rx="36" ry="34" fill="#8a5a36"/><ellipse cx="50" cy="70" rx="22" ry="20" fill="#d9b48a"/><circle cx="36" cy="50" r="14" fill="#fff6e0"/><circle cx="64" cy="50" r="14" fill="#fff6e0"/><g class="olhos"><circle cx="36" cy="50" r="7" fill="#1b1b22"/><circle cx="64" cy="50" r="7" fill="#1b1b22"/><circle cx="38" cy="47" r="2.4" fill="#fff"/><circle cx="66" cy="47" r="2.4" fill="#fff"/></g><path d="M44 60 L56 60 L50 70Z" fill="#f2a52b"/>' },
  sapo:{ nome:'Sapo', svg:'<circle cx="32" cy="34" r="15" fill="#4fb35a"/><circle cx="68" cy="34" r="15" fill="#4fb35a"/><ellipse cx="50" cy="62" rx="40" ry="28" fill="#5cc466"/><circle cx="32" cy="34" r="9" fill="#fff"/><circle cx="68" cy="34" r="9" fill="#fff"/><g class="olhos"><circle cx="32" cy="35" r="5" fill="#1b1b22"/><circle cx="68" cy="35" r="5" fill="#1b1b22"/><circle cx="33.5" cy="33" r="1.8" fill="#fff"/><circle cx="69.5" cy="33" r="1.8" fill="#fff"/></g><path class="boca" d="M28 66 Q50 84 72 66" fill="none" stroke="#1d5b25" stroke-width="3.5" stroke-linecap="round"/>' + BOCHECHAS(64) },
  panda:{ nome:'Panda', svg:'<circle cx="22" cy="26" r="13" fill="#1f2128"/><circle cx="78" cy="26" r="13" fill="#1f2128"/><circle cx="50" cy="56" r="36" fill="#fbfbf7"/><ellipse cx="36" cy="52" rx="10" ry="12" fill="#1f2128" transform="rotate(-25 36 52)"/><ellipse cx="64" cy="52" rx="10" ry="12" fill="#1f2128" transform="rotate(25 64 52)"/>' + OLHOS(52, '#fbfbf7').replace(/#fff"/g, '#1f2128"') + '<ellipse cx="50" cy="66" rx="6" ry="4.5" fill="#1f2128"/>' + BOCA(72) + BOCHECHAS(68) },
  coelho:{ nome:'Coelho', svg:'<ellipse cx="34" cy="20" rx="9" ry="22" fill="#f4f1ec"/><ellipse cx="66" cy="20" rx="9" ry="22" fill="#f4f1ec"/><ellipse cx="34" cy="21" rx="4.5" ry="16" fill="#ffb3c1"/><ellipse cx="66" cy="21" rx="4.5" ry="16" fill="#ffb3c1"/><circle cx="50" cy="62" r="32" fill="#f4f1ec"/>' + OLHOS(58) + '<ellipse cx="50" cy="69" rx="4.5" ry="3.5" fill="#ff8fa3"/><rect x="46" y="74" width="8" height="7" rx="2" fill="#fff" stroke="#c9c2b8" stroke-width="1.5"/>' + BOCHECHAS(70) },
  urso:{ nome:'Urso', svg:'<circle cx="24" cy="28" r="13" fill="#8b5a33"/><circle cx="76" cy="28" r="13" fill="#8b5a33"/><circle cx="24" cy="28" r="6.5" fill="#d9a36f"/><circle cx="76" cy="28" r="6.5" fill="#d9a36f"/><circle cx="50" cy="58" r="35" fill="#a06a3d"/><ellipse cx="50" cy="70" rx="15" ry="11" fill="#e3b88a"/>' + OLHOS(52) + '<ellipse cx="50" cy="65" rx="6" ry="4.5" fill="#2a1a12"/>' + BOCA(72) },
  pinguim:{ nome:'Pinguim', svg:'<ellipse cx="50" cy="56" rx="36" ry="36" fill="#2b3445"/><path d="M50 40 Q30 26 22 52 Q22 82 50 86 Q78 82 78 52 Q70 26 50 40Z" fill="#fbfbf7"/>' + OLHOS(54) + '<path d="M42 64 L58 64 L50 74Z" fill="#f59b23"/>' + BOCHECHAS(66) },
  leao:{ nome:'Leão', svg:'<circle cx="50" cy="54" r="44" fill="#c4682a"/><g fill="#a9541e"><circle cx="50" cy="12" r="9"/><circle cx="84" cy="30" r="9"/><circle cx="92" cy="62" r="9"/><circle cx="16" cy="30" r="9"/><circle cx="8" cy="62" r="9"/><circle cx="74" cy="90" r="9"/><circle cx="26" cy="90" r="9"/></g><circle cx="50" cy="56" r="30" fill="#f6c14b"/><circle cx="30" cy="34" r="7" fill="#f6c14b"/><circle cx="70" cy="34" r="7" fill="#f6c14b"/>' + OLHOS(52) + '<path d="M44 63 L56 63 L50 70Z" fill="#6b3a1c"/>' + BOCA(72) },
  porco:{ nome:'Porquinho', svg:'<path d="M18 22 L38 30 L24 46Z" fill="#f08aa2"/><path d="M82 22 L62 30 L76 46Z" fill="#f08aa2"/><circle cx="50" cy="58" r="35" fill="#f7a8ba"/>' + OLHOS(50) + '<ellipse cx="50" cy="67" rx="13" ry="9" fill="#f58aa3"/><ellipse cx="45" cy="67" rx="2.6" ry="3.6" fill="#b2506a"/><ellipse cx="55" cy="67" rx="2.6" ry="3.6" fill="#b2506a"/>' + BOCHECHAS(62) }
};
const LISTA_BICHOS = Object.keys(BICHOS);
function bichoSVG(id){ return '<svg class="bicho" viewBox="0 0 100 100" aria-hidden="true">' + (BICHOS[id] || BICHOS.raposa).svg + '</svg>'; }
function bichoDe(v, j){ const a = v.avatares && v.avatares[j]; return BICHOS[a] ? a : LISTA_BICHOS[j % LISTA_BICHOS.length]; }
// sorteia bichinhos diferentes do seu para os robôs
function bichosPara(meu, qtd){
  const a = LISTA_BICHOS.filter(b => b !== meu);
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return Array.from({length:qtd}, (_, i) => a[i % a.length]);
}
function montarEscolhaBicho(sel){
  const box = $(sel); if(!box) return;
  const atual = Pref.ler('bicho', 'raposa');
  box.innerHTML = LISTA_BICHOS.map(b => '<button type="button" data-b="' + b + '" class="' + (b === atual ? 'on' : '') + '" aria-label="' + BICHOS[b].nome + '" aria-pressed="' + (b === atual) + '">' + bichoSVG(b) + '</button>').join('');
  box.onclick = e => {
    const b = e.target.closest('button'); if(!b) return;
    Pref.gravar('bicho', b.dataset.b); Som.tocar('clique');
    $$('.escolha-bicho button').forEach(x => { const on = x.dataset.b === b.dataset.b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    b.classList.remove('pula'); void b.offsetWidth; b.classList.add('pula');
  };
}

/* ---------------- preferências ---------------- */
const Pref = {
  ler(k, d){ try{ const v = localStorage.getItem('unogram:' + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  gravar(k, v){ try{ localStorage.setItem('unogram:' + k, JSON.stringify(v)); }catch(e){} }
};

/* ---------------- som (sintetizado, sem arquivos) ---------------- */
const Som = {
  ctx:null, ligado: Pref.ler('som', true),
  iniciar(){ if(this.ctx) return; try{ this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} },
  nota(freq, dur, tipo, vol, quando){
    const c = this.ctx; if(!c) return;
    const t = c.currentTime + (quando || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .18, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02);
    return o;
  },
  ruido(dur, freq, vol, quando){
    const c = this.ctx; if(!c) return;
    const t = c.currentTime + (quando || 0);
    // o ruído de cada duração é gerado uma vez só e reaproveitado
    this.buffers = this.buffers || {};
    let buf = this.buffers[dur];
    if(!buf){
      buf = this.buffers[dur] = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const d = buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
    }
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = .8;
    const g = c.createGain(); g.gain.value = vol || .25;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  },
  tocar(nome){
    if(!this.ligado || !this.ctx) return;
    if(this.ctx.state === 'suspended') this.ctx.resume();
    switch(nome){
      case 'carta': this.ruido(.09, 2400, .3); this.nota(220, .08, 'triangle', .1); break;
      case 'compra': this.ruido(.14, 1200, .18); break;
      case 'vez': this.nota(660, .12, 'sine', .14); this.nota(880, .18, 'sine', .12, .1); break;
      case 'uno': [523,659,784,1047].forEach((f,i)=>this.nota(f, .2, 'square', .07, i*.06)); break;
      case 'raio': this.ruido(.5, 4200, .4); { const o = this.nota(1400, .45, 'sawtooth', .08); if(o) o.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + .45); } break;
      case 'certo': this.nota(523, .12, 'triangle', .14); this.nota(784, .22, 'triangle', .14, .1); break;
      case 'errado': this.nota(200, .18, 'sawtooth', .1); this.nota(150, .28, 'sawtooth', .1, .12); break;
      case 'erro': this.nota(160, .12, 'square', .06); break;
      case 'pula': this.nota(420, .09, 'square', .07); this.nota(300, .12, 'square', .07, .08); break;
      case 'reverso': this.nota(300, .1, 'triangle', .1); this.nota(450, .1, 'triangle', .1, .08); this.nota(300, .12, 'triangle', .1, .16); break;
      case 'vitoria': [523,659,784,1047,784,1047,1319].forEach((f,i)=>this.nota(f, .26, 'triangle', .12, i*.11)); break;
      case 'derrota': [392,349,311,262].forEach((f,i)=>this.nota(f, .3, 'triangle', .1, i*.16)); break;
      case 'clique': this.nota(900, .04, 'sine', .06); break;
      case 'bater': this.ruido(.12, 600, .5); this.nota(130, .14, 'square', .1); this.ruido(.1, 500, .4, .1); break;
    }
  }
};
function vibrar(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }
document.addEventListener('pointerdown', () => Som.iniciar(), { once:true, capture:true });
function atualizarBotoesSom(){
  $('#btn-som-menu').textContent = 'Som: ' + (Som.ligado ? 'ligado' : 'desligado');
  $('#btn-som-jogo').textContent = Som.ligado ? '🔊' : '🔇';
}
function alternarSom(){ Som.ligado = !Som.ligado; Pref.gravar('som', Som.ligado); atualizarBotoesSom(); Som.iniciar(); Som.tocar('clique'); }
$('#btn-som-menu').onclick = alternarSom; $('#btn-som-jogo').onclick = alternarSom;
atualizarBotoesSom();

/* ---------------- modo daltônico ---------------- */
const SIMB = { amarelo:'▲', azul:'■', verde:'◆', vermelho:'●' };
let daltonico = Pref.ler('daltonico', false);
function aplicarDaltonico(){
  document.body.classList.toggle('daltonico', daltonico);
  $('#btn-daltonico').textContent = 'Daltônico: ' + (daltonico ? 'ligado' : 'desligado');
}
$('#btn-daltonico').onclick = () => { daltonico = !daltonico; Pref.gravar('daltonico', daltonico); aplicarDaltonico(); Som.tocar('clique'); };
aplicarDaltonico();

/* ---------------- fundo: lousa com giz ---------------- */
(function fundo(){
  const cv = $('#fundo'), ctx = cv.getContext && cv.getContext('2d');
  if(!ctx) return;
  const palavras = ['substantivo','adjetivo','verbo','pronome','advérbio','artigo','numeral','preposição','conjunção','interjeição','sujeito','predicado','crase','vírgula'];
  let W, H, dpr, itens = [], poeira = [], ultimo = 0, ativo = true, calmo = 1, gradiente = null, sujo = true;
  function tamanho(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    gradiente = ctx.createRadialGradient(W*.5, H*.35, 0, W*.5, H*.45, Math.max(W,H)*.8);
    gradiente.addColorStop(0, '#1d4439'); gradiente.addColorStop(.6, '#143229'); gradiente.addColorStop(1, '#0a1d19');
    sujo = true;
    const qtd = Math.round(Math.max(8, Math.min(18, W * H / 38000)));
    itens = Array.from({length:qtd}, (_, i) => novo(true, i));
    poeira = Array.from({length:40}, () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+.3, v:Math.random()*.15+.03, a:Math.random()*.25+.05 }));
  }
  function novo(espalhar, i){
    return { txt: palavras[(i != null ? i : Math.floor(Math.random()*palavras.length)) % palavras.length],
      x: Math.random()*W, y: espalhar ? Math.random()*H : H + 40, s: 20 + Math.random()*24, rot:(Math.random()-.5)*.5,
      v: .08 + Math.random()*.18, a: .05 + Math.random()*.08, dr:(Math.random()-.5)*.0006 };
  }
  function desenhar(t){
    requestAnimationFrame(desenhar);
    if(!ativo || t - ultimo < 33) return;
    // com movimento reduzido nada se mexe: só redesenha quando algo mudou
    if(reduzido && !sujo) return;
    sujo = false;
    const dt = Math.min(60, t - ultimo) / 16.7; ultimo = t;
    ctx.fillStyle = gradiente; ctx.fillRect(0,0,W,H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(const p of itens){
      if(!reduzido){ p.y -= p.v * dt * calmo; p.rot += p.dr * dt; }
      if(p.y < -40){ Object.assign(p, novo(false)); }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.font = '600 ' + p.s + 'px Caveat, cursive';
      ctx.fillStyle = 'rgba(238,242,230,' + (p.a * calmo) + ')'; ctx.fillText(p.txt, 0, 0);
      ctx.restore();
    }
    for(const d of poeira){
      if(!reduzido){ d.y += d.v * dt; d.x += Math.sin((t/1000) + d.y*.01) * .1; }
      if(d.y > H + 5){ d.y = -5; d.x = Math.random()*W; }
      ctx.fillStyle = 'rgba(238,242,230,' + d.a + ')'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }
  }
  addEventListener('resize', tamanho);
  document.addEventListener('visibilitychange', () => { ativo = !document.hidden; });
  window.__fundoCalmo = v => { calmo = v; sujo = true; };
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { sujo = true; });
  tamanho(); requestAnimationFrame(desenhar);
})();

/* ---------------- cartas ---------------- */
const ICONE = {
  pula:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width="13"/><path d="M27 73 L73 27" stroke="currentColor" stroke-width="13" stroke-linecap="round"/></svg>',
  reverso:'<svg viewBox="0 0 100 100"><path d="M22 58 L56 24" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M42 22 L60 20 L58 38" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/><path d="M78 42 L44 76" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M58 78 L40 80 L42 62" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  mais2:'<svg viewBox="0 0 100 100"><rect x="40" y="16" width="34" height="50" rx="6" fill="#fff" stroke="currentColor" stroke-width="8"/><rect x="26" y="34" width="34" height="50" rx="6" fill="#fff" stroke="currentColor" stroke-width="8"/></svg>',
  mais4:'<svg viewBox="0 0 100 100"><rect x="14" y="40" width="26" height="38" rx="5" fill="#22a45a" stroke="#111" stroke-width="5"/><rect x="34" y="26" width="26" height="38" rx="5" fill="#1f74d6" stroke="#111" stroke-width="5"/><rect x="46" y="44" width="26" height="38" rx="5" fill="#e2382c" stroke="#111" stroke-width="5"/><rect x="60" y="18" width="26" height="38" rx="5" fill="#ffcc1a" stroke="#111" stroke-width="5"/></svg>',
  coringa:'<svg viewBox="0 0 100 100"><g transform="rotate(-32 50 50)"><clipPath id="cl"><ellipse cx="50" cy="50" rx="44" ry="30"/></clipPath><g clip-path="url(#cl)"><rect x="0" y="0" width="50" height="50" fill="#e2382c"/><rect x="50" y="0" width="50" height="50" fill="#1f74d6"/><rect x="0" y="50" width="50" height="50" fill="#ffcc1a"/><rect x="50" y="50" width="50" height="50" fill="#22a45a"/></g><ellipse cx="50" cy="50" rx="44" ry="30" fill="none" stroke="#111" stroke-width="4"/></g></svg>'
};
const CANTO = { pula:ICONE.pula, reverso:ICONE.reverso, mais2:'+2', mais4:'+4', coringa:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#fff"/><path d="M50 10 A40 40 0 0 1 90 50 L50 50Z" fill="#1f74d6"/><path d="M90 50 A40 40 0 0 1 50 90 L50 50Z" fill="#22a45a"/><path d="M50 90 A40 40 0 0 1 10 50 L50 50Z" fill="#ffcc1a"/><path d="M10 50 A40 40 0 0 1 50 10 L50 50Z" fill="#e2382c"/></svg>' };
function nivelTexto(t){ const n = t.length; return n <= 12 ? 'l0' : n <= 32 ? 'l1' : n <= 80 ? 'l2' : 'l3'; }
function criarCarta(c, tam, verso, comTema){
  const d = document.createElement('div');
  if(verso || !c){ d.className = 'carta verso tam-' + (tam || 'm'); d.innerHTML = '<div class="rosto"><span>Aa</span></div>'; return d; }
  d.className = 'carta c-' + c.cor + ' tam-' + (tam || 'm');
  d.dataset.id = c.id;
  let rosto, canto;
  if(c.tipo === 'numero'){
    canto = String(c.numero);
    // o tema (Substantivo, Verbo…) só aparece no estudo: na partida ele entregaria o par
    const rotulo = c.papel === 'pergunta' ? 'Pergunta' : 'Resposta';
    rosto = c.texto ? '<p class="txt ' + nivelTexto(c.texto) + '">' + esc(c.texto) + '</p>' +
      '<span class="tema' + (comTema && c.topico && c.topico.length > 9 ? ' longo' : '') + '"><i>' + (c.papel === 'pergunta' ? '?' : '!') + '</i><b>' + esc(comTema && c.topico ? c.topico : rotulo) + '</b></span>' +
      '<span class="papel">' + (comTema && c.topico ? esc(c.topico) + ' · ' : '') + rotulo + '</span>'
      : '<b class="num">' + c.numero + '</b>';
    if(c.texto) d.classList.add(c.papel === 'pergunta' ? 'eh-p' : 'eh-r');
  } else {
    canto = CANTO[c.tipo]; rosto = '<span class="ico">' + ICONE[c.tipo] + '</span>';
  }
  d.innerHTML = '<span class="canto a">' + canto + '</span><div class="rosto">' + rosto + '</div><span class="canto b">' + canto + '</span>' +
    (c.cor !== 'preto' ? '<span class="simb" aria-hidden="true"></span>' : '');
  d.setAttribute('aria-label', descreverCarta(c));
  return d;
}
function descreverCarta(c){
  if(!c) return 'carta';
  const cor = c.cor === 'preto' ? '' : ' ' + NOME_COR[c.cor];
  if(c.tipo === 'numero') return (c.texto ? (c.papel === 'pergunta' ? 'Pergunta' : 'Resposta') + ' ' : 'Número ') + c.numero + cor + (c.texto ? ': ' + c.texto : '');
  return ({pula:'Pula', reverso:'Reverso', mais2:'+2', mais4:'Coringa +4', coringa:'Coringa'})[c.tipo] + cor;
}
// nome para o histórico (sem o tema, que daria pista do par)
function nomeLongo(c){
  if(c.texto) return (c.papel === 'pergunta' ? 'a pergunta ' : 'a resposta ') + c.numero + ' ' + NOME_COR[c.cor] + ' (“' + resumo(c.texto, 38) + '”)';
  return nomeCurto(c);
}
function resumo(t, n){ t = String(t); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; }
function nomeCurto(c){
  if(c.tipo === 'numero') return c.numero + ' ' + NOME_COR[c.cor];
  return ({pula:'Pula', reverso:'Reverso', mais2:'+2', mais4:'+4', coringa:'Coringa'})[c.tipo] + (c.cor !== 'preto' ? ' ' + NOME_COR[c.cor] : '');
}
(function heroCartas(){
  const h = $('#hero-cartas');
  const ex = [PARES[0], PARES[4], PARES[15]];
  h.append(criarCarta({id:-1, cor:'vermelho', tipo:'mais2'}, 'g'));
  h.append(criarCarta({id:-2, cor:ex[0].qc, tipo:'numero', numero:ex[0].qn, texto:ex[0].qt, papel:'pergunta'}, 'g'));
  h.append(criarCarta({id:-3, cor:'azul', tipo:'numero', numero:7}, 'g'));
})();

/* ---------------- navegação ---------------- */
let telaAtual = 'tela-menu';
const aoEntrar = {};   // tela -> função chamada ao abrir (preenchida mais abaixo)
function ir(id){
  if(!document.getElementById(id)) return;
  $$('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  telaAtual = id;
  window.__fundoCalmo && window.__fundoCalmo(id === 'tela-jogo' ? .55 : 1);
  if(aoEntrar[id]) aoEntrar[id]();
}
$$('[data-ir]').forEach(b => b.addEventListener('click', () => { Som.tocar('clique'); ir(b.dataset.ir); }));
function segmento(grupo, aoMudar){
  const box = document.querySelector('[data-grupo="' + grupo + '"]');
  const marcar = b => box.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  box.setAttribute('role', 'group');
  marcar(box.querySelector('button.on'));
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    marcar(b);
    Som.tocar('clique'); aoMudar && aoMudar(b.dataset.v);
  });
  const ler = () => box.querySelector('button.on').dataset.v;
  // permite restaurar a escolha salva
  ler.definir = v => { const b = box.querySelector('button[data-v="' + v + '"]'); if(b){ marcar(b); aoMudar && aoMudar(v); } };
  return ler;
}

/* ---------------- diálogo de confirmação (no lugar do confirm do navegador) ---------------- */
function confirmar(titulo, sim){
  return new Promise(ok => {
    const box = $('#dialogo');
    $('#dialogo-titulo').textContent = titulo;
    $('#dialogo-sim').textContent = sim || 'Sim';
    const fim = r => { box.classList.remove('on'); document.removeEventListener('keydown', tecla); Som.tocar('clique'); ok(r); };
    const tecla = e => { if(e.key === 'Escape') fim(false); };
    $('#dialogo-sim').onclick = () => fim(true);
    $('#dialogo-nao').onclick = () => fim(false);
    box.onclick = e => { if(e.target === box) fim(false); };
    document.addEventListener('keydown', tecla);
    box.classList.add('on');
    $('#dialogo-nao').focus();
  });
}

/* ---------------- avisos ---------------- */
function aviso(msg, tipo, ms){
  const a = document.createElement('div');
  a.className = 'aviso' + (tipo ? ' ' + tipo : '');
  a.textContent = msg;
  const box = $('#avisos');
  box.append(a);
  while(box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { a.classList.add('sai'); setTimeout(() => a.remove(), 320); }, ms || 2600);
}

/* =================================================================
   SESSÕES — local (solo), anfitrião (online) e convidado (online)
   ================================================================= */
let sessao = null;
const agora = () => performance.now();

class SessaoLocal {
  constructor(cfg){
    this.cfg = cfg; this.partida = 0; this.eu = 0;
    // relógio próprio da partida: enquanto pausado (tutorial, app em segundo plano) o tempo não anda
    this.desconto = 0; this.pausaDesde = null; this.pausas = new Set();
    this.novaPartida();
    this.relogio = setInterval(() => this.tick(), 100);
  }
  tempo(){ return (this.pausaDesde != null ? this.pausaDesde : agora()) - this.desconto; }
  pausar(motivo){ this.pausas.add(motivo); if(this.pausaDesde == null) this.pausaDesde = agora(); }
  retomar(motivo){
    this.pausas.delete(motivo);
    if(this.pausas.size || this.pausaDesde == null) return;
    this.desconto += agora() - this.pausaDesde; this.pausaDesde = null; this.tick();
  }
  criarJogo(){
    return new Game({ modo:this.cfg.modo, jogadores:this.cfg.jogadores, regras:this.cfg.regras,
      ritmoBots:this.cfg.ritmo, agora:this.tempo() });
  }
  novaPartida(){ this.partida++; this.g = this.criarJogo(); this.versaoVista = -1; this.tick(); }
  tick(){
    if(!this.g) return;
    if(this.pausaDesde == null) try{ this.g.update(this.tempo()); }catch(e){ console.error(e); }
    if(this.g.versao !== this.versaoVista){ this.versaoVista = this.g.versao; this.publicar(); }
  }
  publicar(){ Mesa.render(this.g.vista(this.eu), this.partida); }
  agir(a){ const r = this.g.act(this.eu, a); if(!r.ok) Mesa.erro(r.erro); this.tick(); }
  podeReiniciar(){ return true; }
  reiniciar(){ this.novaPartida(); }
  encerrar(){ clearInterval(this.relogio); this.g = null; }
}

class SessaoAnfitriao extends SessaoLocal {
  constructor(cfg, rede){ super(cfg); this.rede = rede; rede.aoDados = (conexao, msg) => this.receber(conexao, msg); rede.aoSair = conexao => this.saiu(conexao); this.publicar(); }
  novaPartida(){ if(this.rede) this.rede.convidados.forEach(c => c.seq = 0); super.novaPartida(); }
  publicar(){
    super.publicar();
    if(!this.rede) return;
    this.rede.convidados.forEach(c => {
      if(!c.aberta || c.indice == null) return;
      try{ c.conn.send({ tipo:'vista', partida:this.partida, v:this.g.vista(c.indice, c.seq) }); c.seq = this.g.seq; }catch(e){}
    });
  }
  receber(c, msg){
    if(msg && msg.tipo === 'acao' && c.indice != null && this.g){
      const r = this.g.act(c.indice, msg.a || {});
      if(!r.ok) try{ c.conn.send({ tipo:'erro', msg:r.erro }); }catch(e){}
      this.tick();
    }
  }
  saiu(c){
    if(c.indice == null || !this.g || c.saiuJa || c.substituido) return;
    c.saiuJa = true;
    const j = this.g.jogadores[c.indice];
    if(j && !j.bot){ j.bot = true; j.eraHumano = true; j.nivel = 'normal'; aviso(j.nome + ' caiu — um robô segura as cartas até a pessoa voltar.', '', 3200); this.g.versao++; this.tick(); }
  }
  voltou(c){
    if(!this.g || c.indice == null) return;
    const j = this.g.jogadores[c.indice];
    if(j && j.bot && j.eraHumano){ j.bot = false; aviso(j.nome + ' voltou pra mesa!', 'ouro', 2400); }
    c.seq = 0; this.g.versao++; this.tick();
  }
  encerrar(){ super.encerrar(); this.rede && this.rede.fechar(); }
}

class SessaoConvidado {
  constructor(rede){ this.rede = rede; this.partida = null; this.eu = null; }
  receber(msg){
    if(msg.tipo === 'vista'){ this.eu = msg.v.eu; this.partida = msg.partida; if(telaAtual !== 'tela-jogo') { Mesa.preparar(this); ir('tela-jogo'); } Mesa.render(msg.v, msg.partida); }
    else if(msg.tipo === 'erro') Mesa.erro(msg.msg);
  }
  agir(a){ try{ this.rede.conn.send({ tipo:'acao', a }); }catch(e){ Mesa.erro('Conexão perdida.'); } }
  podeReiniciar(){ return false; }
  encerrar(){ this.rede && this.rede.fechar(); }
}

/* =================================================================
   MESA — desenho do jogo, animações e interação
   ================================================================= */
const Mesa = {
  v:null, partida:null, ultimoSeq:0, sel:null, painelCarta:null, painelTopo:false,
  contestId:null, contestOculta:null, assentoEl:{}, corPendente:null, bloqueioToque:0,

  preparar(s){ this.sessao = s; this.partida = null; this.v = null; },
  nome(j){ return j === this.v.eu ? 'Você' : this.v.nomes[j]; },
  nomeDe(j){ return j === this.v.eu ? 'você' : this.v.nomes[j]; },

  render(v, partida){
    const novoJogo = partida !== this.partida;
    if(novoJogo){
      this.partida = partida; this.ultimoSeq = 0; this.sel = null; this.contestId = null; this.contestOculta = null; this.log = []; this.reacao = {};
      this.fecharLeitor(); $('#escolha-alvo').classList.remove('on');
      this.fecharPainel(); $('#vitoria').classList.remove('on'); $('#escolha-cor').classList.remove('on'); pararConfete();
    }
    const antes = this.medir();
    const anterior = novoJogo ? null : this.v;
    this.v = v;
    const novos = v.eventos.filter(e => e.seq > this.ultimoSeq);
    if(v.eventos.length) this.ultimoSeq = Math.max(this.ultimoSeq, v.eventos[v.eventos.length - 1].seq);
    novos.forEach(ev => { const l = this.textoEvento(ev, v); if(l) this.log.push(l); });
    if(this.log.length > 80) this.log.splice(0, this.log.length - 80);
    if(novos.length && $('#historico').classList.contains('on')) this.desenharHistorico();
    Stats.registrar(novos, v, this.sessao);

    document.documentElement.style.setProperty('--cor-ativa', HEX[v.cor]);
    $('#chip-cor').textContent = (daltonico ? SIMB[v.cor] + ' ' : '') + NOME_COR[v.cor];
    $('#chip-modo').textContent = v.modo === 'gramatica' ? 'Gramática' : 'Clássico';
    $('#meu-bicho').innerHTML = bichoSVG(bichoDe(v, v.eu));
    $('#meu-bicho').classList.toggle('na-vez', v.vez === v.eu && v.fase === 'jogar');
    this.desenharAssentos(v);
    this.desenharCentro(v);
    this.desenharMao(v, novoJogo, anterior);
    this.desenharControles(v);
    this.desenharStatus(v);
    this.desenharContestacao(v);
    this.desenharRaio(v);
    this.atualizarLeitor(v);
    this.agendarRespiro(v);
    this.desenharRelogio(v);
    this.atualizarPainel(v);
    this.animar(novos, antes, novoJogo);
    if(anterior && v.fase === 'jogar' && v.vez === v.eu && (anterior.vez !== v.eu || anterior.fase !== 'jogar')){ Som.tocar('vez'); vibrar(25); }
    if(v.fase === 'fim' && (!anterior || anterior.fase !== 'fim')) setTimeout(() => this.mostrarVitoria(), 650);
    if(!Tutorial.ativo) Dicas.checar(v);
  },

  /* ---------- histórico ---------- */
  log:[],
  textoEvento(ev, v){
    const N = j => this.nome(j), de = j => this.nomeDe(j);
    let t = null, cor = null;
    switch(ev.tipo){
      case 'inicio': t = 'A partida começou com ' + nomeLongo(ev.topo) + ' na mesa'; cor = ev.topo.cor; break;
      case 'jogou':
        t = N(ev.j) + ' jogou ' + nomeLongo(ev.carta) + (ev.carta.cor === 'preto' ? ' e escolheu ' + NOME_COR[ev.cor] : '') + (ev.bonus ? ' (bônus)' : '');
        cor = ev.cor; break;
      case 'relampago': t = '⚡ ' + N(ev.j) + ' soltou Relâmpago: ' + nomeLongo(ev.carta); cor = ev.carta.cor; break;
      case 'compra':
        if(!ev.qtd) break;
        t = N(ev.j) + ' comprou ' + (ev.qtd === 1 ? '1 carta' : ev.qtd + ' cartas') +
          ({ mais2:' (+2)', mais4:' (+4)', acumulado:' (acumulado)', esqueceuUno:' por esquecer o UNO', contestacao:' na contestação', bater:' (desistiu da Relâmpago)' }[ev.motivo] || '');
        break;
      case 'uno': t = N(ev.j) + ' gritou UNO!' + (ev.atrasado ? ' (atrasado)' : ''); break;
      case 'pegou': t = N(ev.j) + ' pegou ' + de(ev.alvo) + ' sem UNO'; break;
      case 'pulou': t = N(ev.j) + ' perdeu a vez'; break;
      case 'inverteu': t = 'O sentido do jogo inverteu'; break;
      case 'passou': t = N(ev.j) + ' passou a vez'; break;
      case 'reembaralhar': t = 'O monte foi reembaralhado'; break;
      case 'contestou': t = N(ev.j) + ' contestou e ' + (ev.acusadorCerto ? 'acertou: não era o par' : 'errou: era o par'); break;
      case 'semContestacao': t = 'Ninguém contestou: a Relâmpago de ' + de(ev.j) + ' valeu'; break;
      case 'bonusPulado': t = N(ev.j) + (ev.parou ? ' encerrou a sequência bônus' : ' pulou a carta bônus'); break;
      case 'bonus': t = '✔ A Relâmpago de ' + de(ev.j) + ' valeu' + (ev.combo > 1 ? ' — combo ×' + ev.combo + '!' : ''); break;
      case 'bateu': t = '✋ ' + N(ev.j) + ' bateu na mesa'; break;
      case 'desistiu': t = N(ev.j) + (ev.tempo ? ' não escolheu a tempo' : ' desistiu da Relâmpago'); break;
      case 'juiz': t = ev.certa ? '✔ O juiz confirmou: era o par' : '✘ O juiz derrubou: não era o par'; break;
      case 'acumulou': t = '+' + ev.total + ' acumulado para ' + de(ev.j); break;
      case 'trocou': t = N(ev.j) + ' trocou de mão com ' + de(ev.alvo); break;
      case 'girou': t = 'Todas as mãos giraram'; break;
      case 'tempoEsgotado': t = '⌛ Acabou o tempo de ' + de(ev.j); break;
      case 'vitoria': t = '🏆 ' + N(ev.j) + ' venceu!'; break;
    }
    return t && { t, cor, eu: ev.j === v.eu };
  },
  desenharHistorico(){
    $('#historico-lista').innerHTML = this.log.length
      ? this.log.slice().reverse().map(l => '<li class="' + (l.eu ? 'eu' : '') + '"><span class="ponto"' + (l.cor ? ' style="background:' + HEX[l.cor] + '"' : '') + '></span><span>' + esc(l.t) + '</span></li>').join('')
      : '<li class="vazio">Nada aconteceu ainda.</li>';
  },
  abrirHistorico(){ Som.tocar('clique'); this.fecharPainel(); this.desenharHistorico(); $('#historico').classList.add('on'); $('#historico-fechar').focus(); },
  fecharHistorico(){ $('#historico').classList.remove('on'); },

  medir(){
    const r = { mao:{}, assento:{}, monte:null, descarte:null };
    $$('#mao-trilho .carta').forEach(e => { r.mao[e.dataset.id] = e.getBoundingClientRect(); });
    Object.keys(this.assentoEl).forEach(k => { const a = this.assentoEl[k]; if(a && a.isConnected) r.assento[k] = a.querySelector('.avatar').getBoundingClientRect(); });
    return r;
  },

  /* ---------- assentos ---------- */
  desenharAssentos(v){
    const box = $('#assentos'); box.innerHTML = ''; this.assentoEl = {};
    const n = v.nomes.length, outros = [];
    for(let k = 1; k < n; k++) outros.push((v.eu + k) % n);
    const m = outros.length;
    outros.forEach((j, idx) => {
      const t = m === 1 ? .5 : idx / (m - 1);
      const ang = Math.PI * (1 - t);                       // da esquerda (π) para a direita (0)
      const x = 50 + Math.cos(ang) * (m <= 2 ? 30 : 40);
      const y = 58 - Math.sin(ang) * 52;
      const a = document.createElement('div');
      const re = this.reacao && this.reacao[j];
      a.className = 'assento' + (v.vez === j && v.fase !== 'fim' ? ' na-vez' : '') + (v.qtds[j] === 1 ? ' alerta' : '') + (re && re.ate > Date.now() ? ' ' + re.tipo : '');
      a.style.left = x + '%'; a.style.top = Math.max(0, y) + '%';
      a.style.setProperty('--av', AVATARES[j % AVATARES.length]);
      const leque = Math.min(v.qtds[j], 8);
      let cartas = '';
      for(let i = 0; i < leque; i++){
        const r = (i - (leque - 1) / 2) * 9;
        cartas += '<div class="carta verso tam-p" style="transform:translateX(-50%) rotate(' + r + 'deg)"><div class="rosto"></div></div>';
      }
      a.innerHTML = '<div class="avatar">' + bichoSVG(bichoDe(v, j)) + (v.bots[j] ? '<span class="robo" title="robô">🤖</span>' : '') + '</div>' +
        '<div class="nome">' + esc(v.nomes[j]) + '</div><div class="leque">' + cartas + '<span class="qtd">' + v.qtds[j] + '</span></div>';
      box.append(a);
      this.assentoEl[j] = a;
    });
    const s = $('#sentido');
    s.classList.toggle('anti', v.sentido === -1);
  },

  /* ---------- centro da mesa ---------- */
  desenharCentro(v){
    const monte = $('#monte');
    monte.innerHTML = '';
    const camadas = v.monte > 20 ? 3 : v.monte > 5 ? 2 : v.monte > 0 ? 1 : 0;
    for(let i = 0; i < camadas; i++) monte.append(criarCarta(null, 'm', true));
    const q = document.createElement('span'); q.className = 'qtd-monte'; q.textContent = v.monte + ' no monte'; monte.append(q);
    monte.classList.toggle('pode', v.fase === 'jogar' && v.vez === v.eu && !v.comprou);

    const d = $('#descarte'); d.innerHTML = '';
    const pilha = v.pilha;
    pilha.forEach((c, i) => {
      const e = criarCarta(c, 'g');
      const rot = ((c.id * 37) % 21) - 10, dx = ((c.id * 13) % 9) - 4, dy = ((c.id * 7) % 7) - 3;
      e.style.transform = i === pilha.length - 1 ? 'rotate(' + (rot * .4) + 'deg)' : 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)';
      if(i === pilha.length - 1){ e.classList.add('topo-mesa'); e.addEventListener('click', () => this.abrirTopo()); }
      d.append(e);
    });
    const anel = document.createElement('div'); anel.className = 'anel-cor'; d.append(anel);
    $('#descarte').classList.toggle('reservada', v.fase === 'reserva');
    $('#descarte').classList.toggle('lendo', v.respiro > 0 && v.fase === 'jogar');
    if(v.respiro > 0) $('#descarte').style.setProperty('--respiro', v.respiro + 'ms');
    const ac = $('#acumulado'); ac.textContent = v.acumulado ? '+' + v.acumulado : ''; ac.classList.toggle('on', !!v.acumulado);
  },

  /* ---------- mão ---------- */
  ordenar(mao){
    const ordemCor = { amarelo:0, azul:1, verde:2, vermelho:3, preto:4 };
    const ordemTipo = { numero:0, pula:1, reverso:2, mais2:3, coringa:4, mais4:5 };
    return mao.slice().sort((a, b) => ordemCor[a.cor] - ordemCor[b.cor] || ordemTipo[a.tipo] - ordemTipo[b.tipo] || (a.numero || 0) - (b.numero || 0) || a.id - b.id);
  },
  desenharMao(v, novoJogo, anterior){
    const trilho = $('#mao-trilho'), caixa = $('#mao');
    const antes = anterior ? new Set(anterior.mao.map(c => c.id)) : null;
    trilho.innerHTML = '';
    const cartas = this.ordenar(v.mao), n = cartas.length;
    const W = caixa.clientWidth || 360;
    const probe = criarCarta(cartas[0] || {cor:'azul', tipo:'numero', numero:0, id:0}, 'm');
    probe.style.visibility = 'hidden'; trilho.append(probe);
    const w = probe.getBoundingClientRect().width || 66; probe.remove();
    const legivel = w >= 100;
    const margem = Math.round(w * .32);
    let passo = n > 1 ? Math.min(w * .8, (W - w - 2 * margem) / (n - 1)) : 0;
    const rolar = n > 1 && passo < 24;
    if(rolar) passo = 26;
    const total = w + passo * Math.max(0, n - 1);
    const largura = Math.max(W, total + 2 * margem);
    trilho.style.width = largura + 'px';
    const x0 = (largura - total) / 2;
    const minhaVez = v.fase === 'jogar' && v.vez === v.eu;
    const meuBonus = v.fase === 'bonus' && v.bonus && v.bonus.j === v.eu;
    const jog = new Set(v.jogaveis);
    cartas.forEach((c, i) => {
      const e = criarCarta(c, 'm');
      e.classList.add('na-mao');
      if(legivel) e.classList.add('legivel');
      const off = i - (n - 1) / 2;
      const ang = rolar ? 0 : off * Math.min(4, 26 / Math.max(n, 1));
      const y = rolar ? 0 : Math.pow(Math.abs(off), 2) * Math.min(.9, 7 / Math.max(n, 1));
      e.style.left = (x0 + i * passo) + 'px';
      e.style.setProperty('--r', ang + 'deg'); e.style.setProperty('--y', y + 'px');
      e.style.zIndex = i + 1;
      if((minhaVez || meuBonus) && jog.has(c.id)) e.classList.add('jogavel');
      else if(minhaVez || meuBonus) e.classList.add('apagada');
      if(this.sel === c.id) e.classList.add('sel');
      if(novoJogo){ e.classList.add('distribuir'); e.style.animationDelay = (i * 70) + 'ms'; }
      else if(antes && !antes.has(c.id)) e.classList.add('chegando');
      e.addEventListener('click', ev => { ev.stopPropagation(); this.tocarCarta(c); });
      trilho.append(e);
    });

  },

  /* ---------- controles ---------- */
  desenharControles(v){
    const minhaVez = v.fase === 'jogar' && v.vez === v.eu;
    const meuBonus = v.fase === 'bonus' && v.bonus && v.bonus.j === v.eu;
    const bc = $('#btn-comprar'), bp = $('#btn-passar'), bb = $('#btn-pular-bonus');
    bc.style.display = meuBonus ? 'none' : ''; bp.style.display = meuBonus ? 'none' : ''; bb.style.display = meuBonus ? '' : 'none';
    document.querySelector('.zona-mao').classList.toggle('minha-vez', minhaVez || meuBonus);
    const lendo = this.respiroAte > performance.now() && !v.acumulado;
    bc.disabled = !(minhaVez && (!v.comprou || v.acumulado)) || lendo;
    bc.textContent = minhaVez && v.acumulado ? 'Comprar ' + v.acumulado : 'Comprar';
    bb.textContent = meuBonus && v.bonus.jogadas ? 'Parar sequência' : 'Pular bônus';
    bp.disabled = !(minhaVez && v.comprou);
    const nMao = v.mao.length;
    const uno = $('#btn-uno');
    const vul = v.vulneravel === v.eu;
    const mostraUno = v.fase !== 'fim' && (nMao === 2 || vul);
    uno.classList.toggle('on', mostraUno);
    uno.classList.toggle('urgente', vul);
    uno.classList.toggle('feito', nMao === 2 && v.gritou);
    uno.textContent = nMao === 2 && v.gritou ? 'UNO ✓' : 'UNO!';
    uno.disabled = nMao === 2 && v.gritou;
    const pg = $('#btn-pegar');
    const alvo = v.vulneravel;
    const mostraPegar = (v.fase === 'jogar' || v.fase === 'bonus') && alvo !== null && alvo !== v.eu;
    pg.classList.toggle('on', mostraPegar);
    if(mostraPegar) pg.textContent = 'Pegou ' + v.nomes[alvo] + '!';
  },

  desenharStatus(v){
    let s = '';
    const nv = v.nomes[v.vez];
    const lendo = this.respiroAte > performance.now();
    if(v.fase === 'contestacao') s = '⚡ Relâmpago de ' + this.nomeDe(v.contestacao.autor) + ' — alguém contesta?';
    else if(v.fase === 'reserva') s = v.reserva.autor === v.eu ? '✋ Mesa congelada — escolha sua Relâmpago' : '✋ ' + v.nomes[v.reserva.autor] + ' bateu na mesa! Esperando a Relâmpago…';
    else if(v.fase === 'bonus'){
      const b = v.bonus, rest = b.restam > 0 ? ' · falta' + (b.restam > 1 ? 'm ' : ' ') + b.restam : '';
      s = b.j === v.eu ? (b.jogadas ? 'Sequência! Mais uma que combine — ou pare' + rest : 'Bônus! Jogue carta da mesma cor ou número' + rest) : v.nomes[b.j] + ' está no bônus' + (b.jogadas ? ' (' + b.jogadas + ' na sequência)' : '') + '…';
    }
    else if(v.fase === 'jogar'){
      if(v.vez === v.eu){
        if(v.acumulado) s = v.jogaveis.length ? 'Tem +' + v.acumulado + ' pra você! Responda com +2/+4 ou compre' : 'Tem +' + v.acumulado + ' pra você — compre';
        else if(lendo) s = 'Sua vez — um segundinho pra todos lerem…';
        else if(v.comprou) s = v.jogaveis.length ? 'Jogue a carta que comprou ou passe a vez' : 'Não serviu — passe a vez';
        else s = v.jogaveis.length ? 'Sua vez! Toque numa carta' : 'Sua vez — nada serve, compre uma carta';
      } else s = v.acumulado ? 'Vez de ' + nv + ' (+' + v.acumulado + ' acumulado)' : 'Vez de ' + nv;
    }
    $('#status').textContent = s;
  },

  /* ---------- contestação ---------- */
  desenharContestacao(v){
    const box = $('#contest'), caixa = $('#contest-caixa');
    if(v.fase !== 'contestacao'){ box.classList.remove('on'); this.contestId = null; return; }
    const c = v.contestacao;
    if(this.contestOculta === c.id){ box.classList.remove('on'); return; }
    if(this.contestId === c.id) return;
    this.contestId = c.id;
    this.fecharPainel();
    const autor = c.autor === v.eu;
    caixa.innerHTML = '<h3>⚡ ' + (autor ? 'Você soltou' : esc(v.nomes[c.autor]) + ' soltou') + ' uma Relâmpago!</h3>' +
      '<div class="duo" id="contest-duo"></div><div class="tempo"><i id="contest-barra"></i></div>' +
      (autor ? '<div class="espera">Esperando alguém contestar…</div>' :
        '<div class="linha"><button class="btn vermelho" id="btn-contestar">Contestar!</button><button class="btn lousa" id="btn-deixar">Deixar passar</button></div><p class="risco">Não é o par? Contestando certo, você ganha a vez. Errou? Você compra 2.</p>');
    const duo = caixa.querySelector('#contest-duo');
    duo.append(criarCarta(c.contra, 'g'));
    const seta = document.createElement('span'); seta.className = 'seta'; seta.textContent = '⇄'; duo.append(seta);
    duo.append(criarCarta(c.carta, 'g'));
    box.classList.add('on');
    const barra = caixa.querySelector('#contest-barra');
    const frac = c.total ? c.restante / c.total : 1;
    barra.style.width = (frac * 100) + '%';
    requestAnimationFrame(() => requestAnimationFrame(() => { barra.style.transition = 'width ' + c.restante + 'ms linear'; barra.style.width = '0%'; }));
    if(!autor){
      caixa.querySelector('#btn-contestar').onclick = () => { Som.tocar('clique'); this.sessao.agir({ tipo:'contestar' }); };
      caixa.querySelector('#btn-deixar').onclick = () => { this.contestOculta = c.id; box.classList.remove('on'); };
    }
  },

  /* ---------- toque nas cartas ---------- */
  acoesDaCarta(c){
    const v = this.v, a = [];
    if(!v || v.fase === 'fim') return a;
    const noJog = v.jogaveis.indexOf(c.id) >= 0;
    if(v.fase === 'bonus' && v.bonus.j === v.eu){
      a.push({ id:'bonus', rotulo:'Jogar como bônus', ok:noJog, motivo:noJog ? '' : 'O bônus precisa ter a mesma cor ou o mesmo número.' });
    } else if(v.fase === 'jogar' && v.vez === v.eu){
      let motivo = '';
      if(!noJog){
        if(v.comprou && c.id !== v.compradaId) motivo = 'Depois de comprar, só a carta comprada pode ser jogada.';
        else if(c.tipo === 'mais4') motivo = '+4 só quando você não tem a cor da mesa.';
        else motivo = 'Não combina com a mesa (cor, número ou símbolo).';
      }
      if(!noJog && !motivo && v.acumulado) motivo = 'Tem +' + v.acumulado + ' acumulado: só +2/+4 ou comprar.';
      a.push({ id:'jogar', rotulo:'Jogar', ok:noJog, motivo });
      const irmas = v.regras && v.regras.varias && noJog && !v.comprou && !v.acumulado ? v.mao.filter(x => x.id !== c.id && mesmoTipo(c, x)).length : 0;
      if(irmas) a.push({ id:'varias', rotulo:'Jogar ' + (irmas + 1) + ' juntas', ok:true, motivo:'' });
    }
    const minhaReserva = v.fase === 'reserva' && v.reserva.autor === v.eu;
    if(v.modo === 'gramatica' && (v.fase === 'jogar' || minhaReserva) && ehPerguntaResposta(v.topo) && ehPerguntaResposta(c) && c.papel !== v.topo.papel){
      a.push({ id:'relampago', rotulo:'⚡ Relâmpago', ok:true, motivo:'' });
    }
    return a;
  },
  tocarCarta(c){
    if(Date.now() < this.bloqueioToque) return;
    Som.tocar('clique');
    if(this.sel === c.id && this.painelCarta){
      const prim = this.acoesDaCarta(c).find(x => x.ok && x.id !== 'relampago');
      if(prim){ this.executar(prim.id, c); return; }
    }
    this.sel = c.id;
    $$('#mao-trilho .na-mao').forEach(e => e.classList.toggle('sel', +e.dataset.id === c.id));
    const alvo = document.querySelector('#mao-trilho .na-mao[data-id="' + c.id + '"]'), caixa = $('#mao');
    if(alvo && caixa.scrollWidth > caixa.clientWidth + 2){
      const x = alvo.offsetLeft + alvo.offsetWidth / 2 - caixa.clientWidth / 2;
      caixa.scrollTo({ left: Math.max(0, x), behavior: reduzido ? 'auto' : 'smooth' });
    }
    this.abrirPainel(c);
  },
  posicionarPainel(){
    const z = document.querySelector('.zona-mao').getBoundingClientRect();
    $('#painel').style.setProperty('--painel-b', Math.max(120, innerHeight - z.top + 84) + 'px');
  },
  abrirPainel(c, recarga){
    this.painelCarta = c; this.painelTopo = false;
    this.posicionarPainel();
    const p = $('#painel'); p.innerHTML = '';
    p.classList.toggle('recarga', !!recarga);
    p.append(criarCarta(c, 'xg'));
    const acoes = this.acoesDaCarta(c);
    const box = document.createElement('div'); box.className = 'acoes';
    if(acoes.some(a => a.id === 'relampago')){
      const m = document.createElement('div'); m.className = 'mesa-agora';
      m.innerHTML = '<span>na mesa agora</span>';
      m.append(criarCarta(this.v.topo, 'g'));
      box.append(m);
    }
    acoes.forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn' + (a.id === 'relampago' ? ' azul' : '');
      b.textContent = a.rotulo; b.disabled = !a.ok;
      b.onclick = e => { e.stopPropagation(); this.executar(a.id, c); };
      box.append(b);
      if(a.motivo){ const m = document.createElement('div'); m.className = 'motivo'; m.textContent = a.motivo; box.append(m); }
    });
    if(!acoes.length){ const m = document.createElement('div'); m.className = 'legenda'; m.textContent = this.v.fase === 'contestacao' || this.v.fase === 'reserva' ? 'espere a Relâmpago terminar' : 'espere a sua vez'; box.append(m); }
    const f = document.createElement('button'); f.className = 'btn lousa'; f.textContent = 'Fechar';
    f.onclick = e => { e.stopPropagation(); this.fecharPainel(); };
    box.append(f); p.append(box);
    p.classList.add('on');
  },
  abrirTopo(recarga){
    const v = this.v; if(!v) return;
    if(!recarga) Som.tocar('clique');
    this.sel = null; this.painelCarta = null; this.painelTopo = true;
    $$('#mao-trilho .na-mao').forEach(e => e.classList.remove('sel'));
    this.posicionarPainel();
    const p = $('#painel'); p.innerHTML = '';
    p.classList.toggle('recarga', !!recarga);
    p.append(criarCarta(v.topo, 'xg'));
    const box = document.createElement('div'); box.className = 'acoes';
    const l = document.createElement('div'); l.className = 'legenda';
    l.textContent = v.modo === 'gramatica' && ehPerguntaResposta(v.topo)
      ? 'carta da mesa — tem ' + (v.topo.papel === 'pergunta' ? 'a resposta' : 'a pergunta') + ' dela? Use ⚡'
      : 'carta da mesa · cor ' + NOME_COR[v.cor];
    box.append(l);
    const f = document.createElement('button'); f.className = 'btn lousa'; f.textContent = 'Fechar'; f.onclick = e => { e.stopPropagation(); this.fecharPainel(); };
    box.append(f); p.append(box); p.classList.add('on');
  },
  fecharPainel(){
    $('#painel').classList.remove('on'); this.painelCarta = null; this.painelTopo = false;
    if(this.sel != null){ this.sel = null; $$('#mao-trilho .na-mao').forEach(e => e.classList.remove('sel')); }
  },
  atualizarPainel(v){
    if(this.painelTopo){ if(v.fase === 'contestacao' || v.fase === 'fim' || this.leitor) this.fecharPainel(); else this.abrirTopo(true); return; }
    if(!this.painelCarta) return;
    const aind = v.mao.find(c => c.id === this.painelCarta.id);
    if(!aind || v.fase === 'contestacao' || v.fase === 'fim' || this.leitor){ this.fecharPainel(); return; }
    this.abrirPainel(aind, true);
    const e = document.querySelector('#mao-trilho .na-mao[data-id="' + aind.id + '"]');
    if(e) e.classList.add('sel');
  },
  executar(acao, c){
    const s = this.sessao, v = this.v; if(!s || !v) return;
    if(acao === 'relampago'){ this.fecharPainel(); s.agir({ tipo:'relampago', id:c.id, contra:v.topo.id }); return; }
    const tipo = acao === 'bonus' ? 'bonusJogar' : 'jogar';
    let ids = [c.id];
    if(acao === 'varias') ids = ids.concat(this.ordenar(v.mao.filter(x => x.id !== c.id && mesmoTipo(c, x))).map(x => x.id));
    const ultima = v.mao.find(x => x.id === ids[ids.length - 1]) || c;
    const enviar = (cor, alvo) => { this.fecharPainel(); this.quandoLiberar(tipo, () => s.agir({ tipo, id:c.id, ids: ids.length > 1 ? ids : undefined, cor, alvo })); };
    const r = v.regras || {};
    const pedeAlvo = r.seteZero && ultima.tipo === 'numero' && ultima.numero === 7 && v.nomes.length > 2 && (tipo === 'jogar' || (v.bonus && v.bonus.eraVez));
    const comAlvo = cor => pedeAlvo ? this.escolherAlvo(alvo => enviar(cor, alvo)) : enviar(cor);
    if(ultima.cor === 'preto'){ this.escolherCor(cor => comAlvo(cor)); return; }
    comAlvo();
  },
  // durante o respiro a jogada fica guardada e sai sozinha quando todos tiverem lido
  quandoLiberar(tipo, fn){
    const falta = this.respiroAte - performance.now();
    if(tipo !== 'jogar' || falta <= 0 || (this.v && this.v.acumulado)) { fn(); return; }
    aviso('Já vai! Esperando todos lerem a carta…', '', Math.min(1600, falta + 200));
    const partida = this.partida;
    setTimeout(() => { if(this.partida === partida) fn(); }, falta + 160);
  },
  escolherAlvo(cb){
    const v = this.v, box = $('#escolha-alvo'), lista = $('#alvo-lista');
    lista.innerHTML = '';
    v.nomes.forEach((n, j) => {
      if(j === v.eu) return;
      const b = document.createElement('button'); b.className = 'alvo-item';
      b.innerHTML = '<span class="avatar">' + bichoSVG(bichoDe(v, j)) + '</span><span>' + esc(n) + '</span><small>' + v.qtds[j] + (v.qtds[j] === 1 ? ' carta' : ' cartas') + '</small>';
      b.onclick = () => { box.classList.remove('on'); Som.tocar('clique'); cb(j); };
      lista.append(b);
    });
    box.classList.add('on');
    box.onclick = e => { if(e.target === box) box.classList.remove('on'); };
  },

  /* ---------- Relâmpago: botões da mesa e leitor de cartas ---------- */
  leitor:null, respiroAte:0, reacao:{},
  candidatasRaio(v){ return this.ordenar(v.mao.filter(c => ehPerguntaResposta(c) && c.papel !== v.topo.papel)); },
  podeRaio(v){
    if(!v || v.modo !== 'gramatica' || !ehPerguntaResposta(v.topo)) return false;
    if(v.fase === 'reserva') return v.reserva.autor === v.eu;
    return v.fase === 'jogar' && this.candidatasRaio(v).length > 0;
  },
  desenharRaio(v){
    const on = v.modo === 'gramatica' && v.fase === 'jogar' && ehPerguntaResposta(v.topo) && this.candidatasRaio(v).length > 0;
    $('#raio-acoes').classList.toggle('on', on);
  },
  abrirLeitor(){
    const v = this.v; if(!this.podeRaio(v)) return;
    this.fecharPainel(); Som.tocar('clique');
    this.leitor = { sel:null, contra:v.topo.id, reservaId:null };
    $('#leitor').classList.add('on'); this.desenharLeitor(v);
  },
  fecharLeitor(){ this.leitor = null; $('#leitor').classList.remove('on'); },
  bater(){
    const v = this.v; if(!v || !this.podeRaio(v)) return;
    Som.tocar('bater'); vibrar(30);
    this.sessao.agir({ tipo:'bater', contra:v.topo.id });
  },
  atualizarLeitor(v){
    const minha = v.fase === 'reserva' && v.reserva.autor === v.eu;
    if(minha && (!this.leitor || this.leitor.reservaId !== v.reserva.id)){
      this.leitor = { sel:this.leitor ? this.leitor.sel : null, contra:v.topo.id, reservaId:v.reserva.id };
      this.fecharPainel(); $('#leitor').classList.add('on'); this.desenharLeitor(v); return;
    }
    if(!this.leitor) return;
    if(!this.podeRaio(v) || v.topo.id !== this.leitor.contra){
      if(v.fase === 'jogar' && v.topo.id !== this.leitor.contra) aviso('A carta da mesa mudou.', '', 1600);
      this.fecharLeitor(); return;
    }
    this.desenharLeitor(v);
  },
  desenharLeitor(v){
    const L = this.leitor; if(!L) return;
    const caixa = $('#leitor-caixa');
    const listaAntes = caixa.querySelector('.leitor-lista'), rolagem = listaAntes ? listaAntes.scrollTop : 0;
    const minha = v.fase === 'reserva' && v.reserva.autor === v.eu;
    const cand = this.candidatasRaio(v);
    if(L.sel != null && !cand.some(c => c.id === L.sel)) L.sel = null;
    const procura = v.topo.papel === 'pergunta' ? 'a resposta' : 'a pergunta';
    caixa.innerHTML =
      '<div class="leitor-cabeca"><h3>⚡ Relâmpago</h3>' + (minha ? '<span class="congelado">✋ mesa congelada</span>' : '') + '<button class="voltar" id="leitor-fechar" aria-label="' + (minha ? 'Desistir' : 'Fechar') + '">✕</button></div>' +
      (minha ? '<div class="tempo"><i id="leitor-barra"></i></div>' : '') +
      '<div class="leitor-mesa c-' + v.topo.cor + '"><span class="rot">Na mesa · ' + (v.topo.papel === 'pergunta' ? 'Pergunta' : 'Resposta') + '</span><p>' + esc(v.topo.texto) + '</p></div>' +
      '<p class="leitor-dica">Qual carta sua é ' + procura + ' certa? Acertou: joga fora da vez e ganha bônus. Errou: compra 2.</p>' +
      '<div class="leitor-lista">' + cand.map(c => '<button class="leitor-item' + (L.sel === c.id ? ' on' : '') + '" data-id="' + c.id + '"><span class="chip-carta c-' + c.cor + '">' + c.numero + '</span><span class="t">' + esc(c.texto) + '</span></button>').join('') + '</div>' +
      '<div class="linha">' + (minha ? '<button class="btn lousa" id="leitor-desistir">Desistir <small>(+1)</small></button>' : '<button class="btn lousa" id="leitor-bater">✋ Bater e pensar</button>') +
      '<button class="btn azul" id="leitor-soltar"' + (L.sel == null ? ' disabled' : '') + '>⚡ Soltar</button></div>';
    const lista = caixa.querySelector('.leitor-lista'); lista.scrollTop = rolagem;
    lista.onclick = e => {
      const b = e.target.closest('.leitor-item'); if(!b) return;
      L.sel = +b.dataset.id; Som.tocar('clique');
      lista.querySelectorAll('.leitor-item').forEach(x => x.classList.toggle('on', x === b));
      caixa.querySelector('#leitor-soltar').disabled = false;
    };
    caixa.querySelector('#leitor-soltar').onclick = () => { if(L.sel == null) return; this.sessao.agir({ tipo:'relampago', id:L.sel, contra:v.topo.id }); };
    const fechar = caixa.querySelector('#leitor-fechar');
    if(minha){
      caixa.querySelector('#leitor-desistir').onclick = fechar.onclick = () => { Som.tocar('clique'); this.sessao.agir({ tipo:'desistir' }); };
      const barra = caixa.querySelector('#leitor-barra'), r = v.reserva;
      barra.style.width = (r.total ? r.restante / r.total * 100 : 100) + '%';
      requestAnimationFrame(() => requestAnimationFrame(() => { barra.style.transition = 'width ' + r.restante + 'ms linear'; barra.style.width = '0%'; }));
    } else {
      fechar.onclick = () => { Som.tocar('clique'); this.fecharLeitor(); };
      caixa.querySelector('#leitor-bater').onclick = () => this.bater();
    }
  },
  agendarRespiro(v){
    clearTimeout(this.tRespiro);
    const zona = document.querySelector('.zona-mao');
    this.respiroAte = v.respiro > 0 && v.fase === 'jogar' ? performance.now() + v.respiro : 0;
    zona.classList.toggle('respirando', !!this.respiroAte && v.vez === v.eu && !v.acumulado);
    if(this.respiroAte) this.tRespiro = setTimeout(() => {
      if(this.v !== v) return;
      this.respiroAte = 0; zona.classList.remove('respirando'); $('#descarte').classList.remove('lendo');
      this.desenharStatus(v); this.desenharControles(v);
    }, v.respiro + 30);
  },
  desenharRelogio(v){
    const box = $('#relogio-vez'), barra = box.firstElementChild;
    const on = v.tempoVez != null && v.vez === v.eu && v.fase === 'jogar';
    box.classList.toggle('on', on);
    if(!on) return;
    const total = v.regras.tempoVez, espera = Math.max(0, v.tempoVez - total), resta = Math.min(total, v.tempoVez);
    barra.style.transition = 'none'; barra.style.width = (resta / total * 100) + '%'; void barra.offsetWidth;
    barra.style.transition = 'width ' + resta + 'ms linear ' + espera + 'ms'; barra.style.width = '0%';
  },
  reagir(j, tipo, ms){
    this.reacao[j] = { tipo, ate: Date.now() + (ms || 1400) };
    const a = this.assentoEl[j];
    if(a){ a.classList.remove('feliz', 'triste', 'pensa'); void a.offsetWidth; a.classList.add(tipo); }
    if(j === this.v.eu){ const m = $('#meu-bicho'); m.classList.remove('feliz', 'triste', 'pensa'); void m.offsetWidth; m.classList.add(tipo); setTimeout(() => m.classList.remove(tipo), ms || 1400); }
  },
  licao(contra){
    const par = textoDoPar(contra); if(!par) return;
    aviso('📚 ' + PARES[contra.par].t + ': “' + resumo(contra.texto, 60) + '” → “' + resumo(par, 90) + '”', 'licao', 6500);
  },
  combo(n){
    if(reduzido) return;
    const b = document.createElement('div'); b.className = 'combo'; b.innerHTML = 'COMBO <b>×' + n + '</b>';
    $('#fx').append(b); setTimeout(() => b.remove(), 1700);
  },
  escolherCor(cb){
    const box = $('#escolha-cor');
    box.classList.add('on');
    box.querySelectorAll('button').forEach(b => b.onclick = e => { e.stopPropagation(); box.classList.remove('on'); Som.tocar('clique'); cb(b.dataset.cor); });
    box.onclick = e => { if(e.target === box){ box.classList.remove('on'); } };
  },
  erro(msg){ aviso(msg, 'erro'); Som.tocar('erro'); vibrar(40); },

  /* ---------- animações dos eventos ---------- */
  rectAssento(j){
    if(j === this.v.eu){ const r = $('#mao').getBoundingClientRect(); return { left:r.left + r.width/2 - 30, top:r.top + 20, width:60, height:88 }; }
    const a = this.assentoEl[j]; if(!a) return null;
    return a.querySelector('.avatar').getBoundingClientRect();
  },
  voar(carta, de, para, atraso, opts){
    opts = opts || {};
    if(!de || !para || reduzido){ opts.fim && setTimeout(opts.fim, atraso || 0); return; }
    const e = criarCarta(carta, opts.tam || 'g', !carta);
    e.classList.add('voando');
    const w = para.width, h = para.height;
    e.style.left = para.left + 'px'; e.style.top = para.top + 'px';
    e.style.width = w + 'px'; e.style.height = h + 'px';
    if(opts.tam === 'm') e.style.setProperty('--w', w + 'px'); else e.style.setProperty('--w', w + 'px');
    e.style.opacity = '0';
    $('#fx').append(e);
    const dx = (de.left + de.width/2) - (para.left + w/2), dy = (de.top + de.height/2) - (para.top + h/2);
    const esc0 = Math.max(.25, Math.min(1.2, de.width / w));
    const giro = opts.giro != null ? opts.giro : (Math.random() * 40 - 20);
    setTimeout(() => {
      e.style.opacity = '1';
      const an = e.animate([
        { transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + esc0 + ') rotate(' + giro + 'deg)' },
        { transform:'translate(' + dx*.35 + 'px,' + (dy*.35 - 40) + 'px) scale(' + (esc0 + (1-esc0)*.8) + ') rotate(' + giro*.3 + 'deg)', offset:.6 },
        { transform:'translate(0,0) scale(1) rotate(0deg)' }
      ], { duration: opts.dur || 460, easing:'cubic-bezier(.25,.8,.25,1)' });
      an.onfinish = () => { e.remove(); opts.fim && opts.fim(); };
    }, atraso || 0);
  },
  bolha(j, texto, estilo){
    const r = this.rectAssento(j); if(!r) return;
    const b = document.createElement('div'); b.className = 'bolha' + (estilo ? ' ' + estilo : '');
    b.textContent = texto; b.style.left = Math.max(70, Math.min(innerWidth - 70, r.left + r.width/2)) + 'px'; b.style.top = (r.top + (j === this.v.eu ? -10 : r.height/2)) + 'px';
    $('#fx').append(b); setTimeout(() => b.remove(), 1400);
  },
  raio(){
    if(reduzido){ return; }
    const c = document.createElement('div'); c.className = 'clarao'; document.body.append(c); setTimeout(() => c.remove(), 700);
    const W = innerWidth, H = innerHeight;
    let x = W * (.3 + Math.random()*.4), y = -10, d = 'M' + x + ' ' + y;
    while(y < H * .6){ y += 40 + Math.random()*50; x += (Math.random() - .5) * 110; d += ' L' + x.toFixed(0) + ' ' + y.toFixed(0); }
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'raio'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    s.innerHTML = '<path d="' + d + '"/>'; document.body.append(s); setTimeout(() => s.remove(), 950);
    this.tremer();
  },
  tremer(){ const a = $('#arena'); a.classList.remove('tremer'); void a.offsetWidth; a.classList.add('tremer'); },

  animar(novos, antes, novoJogo){
    const v = this.v;
    const topoEl = document.querySelector('#descarte .topo-mesa');
    const rTopo = topoEl ? topoEl.getBoundingClientRect() : null;
    const rMonte = $('#monte').getBoundingClientRect();
    let atraso = 0;
    if(novoJogo){
      Som.tocar('compra');
      Object.keys(this.assentoEl).forEach((j, k) => {
        for(let i = 0; i < 3; i++) this.voar(null, rMonte, this.assentoEl[j].querySelector('.avatar').getBoundingClientRect(), k*60 + i*110, { tam:'m', dur:380 });
      });
      this.bloqueioToque = Date.now() + 500;
      return;
    }
    for(const ev of novos){
      switch(ev.tipo){
        case 'jogou': case 'relampago': {
          const de = ev.j === v.eu ? (antes.mao[ev.carta.id] || this.rectAssento(ev.j)) : (antes.assento[ev.j] || this.rectAssento(ev.j));
          const alvo = document.querySelector('#descarte .carta[data-id="' + ev.carta.id + '"]');
          const rAlvo = alvo ? alvo.getBoundingClientRect() : rTopo;
          if(alvo){ alvo.style.visibility = 'hidden'; }
          const a0 = atraso;
          if(ev.tipo === 'relampago'){ setTimeout(() => { this.raio(); Som.tocar('raio'); }, a0); }
          this.voar(ev.carta, de, rAlvo, a0, { fim:() => {
            if(alvo) alvo.style.visibility = '';
            if(ev.tipo === 'jogou') Som.tocar('carta');
            if(ev.carta.tipo === 'mais4'){ this.tremer(); }
            if(ev.carta.cor === 'preto') this.bolha(ev.j, 'cor ' + NOME_COR[ev.cor], 'suave');
          }});
          atraso += 170;
          break;
        }
        case 'compra': {
          const qtd = Math.min(ev.qtd, 6);
          if(ev.qtd >= 2 && ev.motivo !== 'compra') this.reagir(ev.j, 'triste');
          if(ev.j === v.eu){
            const ids = (ev.cartas || []).map(c => c.id);
            ids.forEach((id, i) => {
              const alvo = document.querySelector('#mao-trilho .na-mao[data-id="' + id + '"]');
              if(!alvo) return;
              const r = alvo.getBoundingClientRect();
              this.voar(null, rMonte, r, atraso + i * 110, { tam:'m', dur:420, fim:() => { alvo.classList.remove('chegando'); } });
              if(reduzido) alvo.classList.remove('chegando');
            });
            if(ev.motivo === 'mais2' || ev.motivo === 'mais4' || ev.motivo === 'acumulado'){ aviso('Você comprou ' + ev.qtd + '!', 'erro', 2000); vibrar([40,40,40]); }
            else if(ev.motivo === 'esqueceuUno'){ aviso('Pegaram você sem UNO: +2', 'erro', 2400); vibrar([60,40,60]); }
          } else {
            const r = antes.assento[ev.j] || this.rectAssento(ev.j);
            for(let i = 0; i < qtd; i++) this.voar(null, rMonte, r, atraso + i * 90, { tam:'m', dur:400 });
          }
          setTimeout(() => Som.tocar('compra'), atraso);
          atraso += 90 * qtd;
          break;
        }
        case 'uno': this.bolha(ev.j, 'UNO!'); Som.tocar('uno'); this.reagir(ev.j, 'feliz'); break;
        case 'bateu': this.bolha(ev.j, '✋ Bati!', 'ouro'); Som.tocar('bater'); this.tremer(); this.reagir(ev.j, 'pensa', 3000); break;
        case 'desistiu': this.bolha(ev.j, ev.tempo ? '⌛ tempo!' : 'desistiu', 'suave'); this.reagir(ev.j, 'triste'); break;
        case 'juiz':
          if(ev.certa){ Som.tocar('certo'); this.bolha(ev.j, '✔ era o par!', 'ouro'); }
          else {
            Som.tocar('errado'); this.bolha(ev.j, '✘ não era', ''); this.reagir(ev.j, 'triste');
            this.voar(ev.carta, rTopo, this.rectAssento(ev.j), atraso + 300, { dur:420 });
            this.licao(ev.contra);
          }
          break;
        case 'acumulou': setTimeout(() => { this.bolha(ev.j, '+' + ev.total + '!', ''); Som.tocar('pula'); }, atraso); if(ev.j === v.eu) vibrar([30,30,30]); break;
        case 'trocou': Som.tocar('reverso'); aviso(this.nome(ev.j) + ' trocou de mão com ' + this.nomeDe(ev.alvo) + '!', 'ouro', 2600); this.reagir(ev.alvo, 'triste'); break;
        case 'girou': Som.tocar('reverso'); aviso('0! Todas as mãos giraram.', 'ouro', 2400); break;
        case 'tempoEsgotado': if(ev.j === v.eu){ aviso('Seu tempo acabou: comprou 1 e passou.', 'erro', 2600); vibrar(60); } else this.bolha(ev.j, '⌛', 'suave'); break;
        case 'pegou':
          this.bolha(ev.alvo, 'Pego!', 'ouro'); Som.tocar('errado');
          if(ev.alvo !== v.eu) aviso(this.nome(ev.j) + ' pegou ' + this.nomeDe(ev.alvo) + ' sem UNO: +2', '', 2400);
          break;
        case 'pulou': setTimeout(() => { this.bolha(ev.j, '🚫 pulou', 'suave'); Som.tocar('pula'); }, atraso); break;
        case 'inverteu': setTimeout(() => { Som.tocar('reverso'); this.bolha(v.vez, '⇄ inverteu', 'suave'); }, atraso); break;
        case 'passou': if(ev.j !== v.eu) this.bolha(ev.j, 'passou', 'suave'); break;
        case 'reembaralhar': aviso('Monte reembaralhado', '', 1800); break;
        case 'contestou': {
          const quem = this.nome(ev.j), autor = this.nomeDe(ev.autor);
          if(ev.acusadorCerto){
            aviso(quem + ' contestou e acertou! ' + (ev.autor === v.eu ? 'Você compra' : autor.charAt(0).toUpperCase() + autor.slice(1) + ' compra') + ' 2 e a vez ' + (ev.j === v.eu ? 'é sua.' : 'é de ' + v.nomes[ev.j] + '.'), 'ouro', 3600);
            Som.tocar(ev.j === v.eu ? 'certo' : 'errado');
            const rEl = rTopo;
            this.voar(ev.carta, rEl, this.rectAssento(ev.autor), atraso, { dur:420 });
            this.reagir(ev.j, 'feliz'); this.reagir(ev.autor, 'triste');
            this.licao(ev.contra);
          } else {
            aviso(quem + ' contestou, mas a Relâmpago estava certa: ' + (ev.j === v.eu ? 'você compra' : quem + ' compra') + ' 2.', 'ouro', 3600);
            Som.tocar(ev.autor === v.eu ? 'certo' : 'errado');
            this.reagir(ev.autor, 'feliz'); this.reagir(ev.j, 'triste');
          }
          break;
        }
        case 'semContestacao': break;
        case 'bonus': {
          const seq = v.regras && v.regras.bonus === 0;
          if(ev.j === v.eu){ aviso('Valeu! ' + (seq ? 'Jogue quantas cartas combinarem, uma atrás da outra.' : 'Carta bônus: mesma cor ou número — ou pule.'), 'ouro', 3000); Som.tocar('certo'); }
          else this.bolha(ev.j, '⚡ valeu!', 'ouro');
          this.reagir(ev.j, 'feliz', 1800);
          if(ev.combo > 1){ this.combo(ev.combo); Som.tocar('uno'); }
          break;
        }
        case 'vezDe': break;
      }
    }
  },

  mostrarVitoria(){
    const v = this.v; if(!v || v.vencedor == null) return;
    const venci = v.vencedor === v.eu;
    const box = $('#vitoria');
    const podeReiniciar = this.sessao && this.sessao.podeReiniciar();
    box.innerHTML = '<div class="trofeu">' + (venci ? '🏆' : '<span class="avatar grande">' + bichoSVG(bichoDe(v, v.vencedor)) + '</span>') + '</div><h2>' + (venci ? 'Você venceu!' : esc(v.nomes[v.vencedor]) + ' venceu') + '</h2>' +
      '<div class="nota">' + (venci ? 'mandou bem na gramática' : 'a próxima é sua') + '</div>' +
      '<div class="resumo">' + Stats.d.vitorias + ' ' + (Stats.d.vitorias === 1 ? 'vitória' : 'vitórias') + ' em ' + Stats.d.partidas + ' ' + (Stats.d.partidas === 1 ? 'partida' : 'partidas') +
        (Stats.d.seq > 1 ? ' · ' + Stats.d.seq + ' seguidas! 🔥' : '') + '</div>' +
      '<ol class="placar">' + v.nomes.map((n, j) => j).sort((a, b) => v.qtds[a] - v.qtds[b]).map((j, k) =>
        '<li class="' + (j === v.vencedor ? 'ganhou' : '') + '" style="--av:' + AVATARES[j % AVATARES.length] + '"><span class="pos">' + (k + 1) + 'º</span><span class="avatar">' + bichoSVG(bichoDe(v, j)) + '</span>' +
        esc(j === v.eu ? 'Você' : v.nomes[j]) + '<span class="qtd">' + (v.qtds[j] === 0 ? 'sem cartas' : v.qtds[j] + (v.qtds[j] === 1 ? ' carta' : ' cartas')) + '</span></li>').join('') + '</ol>' +
      '<div class="pilha-btns">' + (podeReiniciar ? '<button class="btn" id="vit-denovo">Jogar de novo</button>' : '<p class="texto" style="text-align:center;">Esperando quem criou a sala começar outra.</p>') +
      '<button class="btn lousa" id="vit-menu">Voltar ao menu</button></div>';
    box.classList.add('on');
    if(venci){ Som.tocar('vitoria'); confete(); vibrar([80,60,80,60,160]); } else Som.tocar('derrota');
    box.querySelectorAll('.placar .avatar').forEach((a, k) => a.classList.toggle('feliz', k === 0));
    const d = $('#vit-denovo'); if(d) d.onclick = () => { box.classList.remove('on'); pararConfete(); this.sessao.reiniciar(); };
    $('#vit-menu').onclick = () => { box.classList.remove('on'); pararConfete(); sairDoJogo(); };
  }
};

/* interações fixas da mesa */
$('#monte').addEventListener('click', () => { const v = Mesa.v; if(v && v.fase === 'jogar' && v.vez === v.eu && !v.comprou) { Mesa.fecharPainel(); Mesa.sessao.agir({ tipo:'comprar' }); } });
$('#btn-comprar').onclick = () => { Mesa.fecharPainel(); Mesa.sessao.agir({ tipo:'comprar' }); };
$('#btn-passar').onclick = () => { Mesa.fecharPainel(); Mesa.sessao.agir({ tipo:'passar' }); };
$('#btn-pular-bonus').onclick = () => { Mesa.fecharPainel(); Mesa.sessao.agir({ tipo:'bonusPular' }); };
$('#btn-uno').onclick = () => { Mesa.sessao.agir({ tipo:'uno' }); };
$('#btn-bater').onclick = () => Mesa.bater();
$('#btn-ler').onclick = () => Mesa.abrirLeitor();
$('#leitor').addEventListener('click', e => { if(e.target.id === 'leitor' && Mesa.leitor && !Mesa.leitor.reservaId) Mesa.fecharLeitor(); });
$('#btn-pegar').onclick = () => { Mesa.sessao.agir({ tipo:'pegar' }); };
$('#painel').addEventListener('click', e => { if(e.target.id === 'painel') Mesa.fecharPainel(); });
$('#btn-historico').onclick = () => Mesa.abrirHistorico();
$('#historico-fechar').onclick = () => Mesa.fecharHistorico();
$('#historico').addEventListener('click', e => { if(e.target.id === 'historico') Mesa.fecharHistorico(); });
$('#jogo-sair').onclick = async () => { if(Mesa.v && Mesa.v.fase !== 'fim' && !(await confirmar('Sair da partida?', 'Sair'))) return; sairDoJogo(); };
// Esc fecha a camada que estiver aberta
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape' || $('#dialogo').classList.contains('on')) return;
  if(Tutorial.ativo){ Tutorial.fim(); return; }
  if($('#historico').classList.contains('on')){ Mesa.fecharHistorico(); return; }
  if($('#escolha-alvo').classList.contains('on')){ $('#escolha-alvo').classList.remove('on'); return; }
  if(Mesa.leitor && !Mesa.leitor.reservaId){ Mesa.fecharLeitor(); return; }
  if($('#escolha-cor').classList.contains('on')) $('#escolha-cor').classList.remove('on');
  else if($('#painel').classList.contains('on')) Mesa.fecharPainel();
});
function sairDoJogo(){
  if(Tutorial.ativo) Tutorial.esconder();
  Mesa.fecharHistorico();
  if(sessao){ sessao.encerrar(); sessao = null; }
  Mesa.fecharPainel(); Mesa.fecharLeitor(); $('#escolha-alvo').classList.remove('on'); $('#contest').classList.remove('on'); $('#vitoria').classList.remove('on'); pararConfete();
  ir('tela-menu');
}

/* ---------------- confete ---------------- */
let confeteRaf = null;
function confete(){
  const cv = $('#confete'), ctx = cv.getContext && cv.getContext('2d'); if(!ctx || reduzido) return;
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  const cores = ['#ffcc1a','#1f74d6','#22a45a','#e2382c','#ffffff'];
  const ps = Array.from({length:160}, () => ({ x:innerWidth/2 + (Math.random()-.5)*80, y:innerHeight*.35, vx:(Math.random()-.5)*14, vy:-Math.random()*14 - 4, r:Math.random()*6+4, c:cores[Math.floor(Math.random()*5)], a:Math.random()*6, va:(Math.random()-.5)*.3 }));
  const t0 = performance.now();
  (function passo(t){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r/2, -p.r/4, p.r, p.r/2); ctx.restore(); });
    if(t - t0 < 4500) confeteRaf = requestAnimationFrame(passo); else ctx.clearRect(0,0,innerWidth,innerHeight);
  })(t0);
}
function pararConfete(){ if(confeteRaf) cancelAnimationFrame(confeteRaf); confeteRaf = null; const cv = $('#confete'); const c = cv.getContext && cv.getContext('2d'); c && c.clearRect(0,0,cv.width,cv.height); }

/* =================================================================
   REGRAS CONFIGURÁVEIS (tela solo e sala online)
   ================================================================= */
const OPCOES_REGRAS = [
  { k:'juiz', gram:1, rot:'Quem confere a Relâmpago', ops:[['contestacao','Os jogadores'],['automatico','O app (juiz)']], ajuda:'Com contestação, quem perceber o erro aperta Contestar. Se ninguém contestar, vale até blefe.' },
  { k:'bonus', gram:1, rot:'Bônus da Relâmpago certa', ops:[[1,'1 carta'],[2,'2 cartas'],[0,'À vontade']], ajuda:'À vontade: você segue jogando enquanto tiver carta que combine. Vale o efeito da última.' },
  { k:'tempoContestacao', gram:1, rot:'Tempo pra contestar', ops:[[4000,'4 s'],[6000,'6 s'],[9000,'9 s']] },
  { k:'respiro', gram:1, rot:'Respiro de leitura', ops:[[0,'Sem'],[1500,'1,5 s'],[3000,'3 s']], ajuda:'Quando cai pergunta ou resposta, ninguém joga por cima nesse tempinho — dá tempo de ler.' },
  { k:'tempoBater', gram:1, rot:'Tempo depois de bater na mesa', ops:[[5000,'5 s'],[8000,'8 s'],[12000,'12 s']], ajuda:'Quem bate congela a mesa. Se não escolher a carta a tempo, compra 1.' },
  { k:'tempoVez', rot:'Tempo de cada vez', ops:[[0,'Livre'],[15000,'15 s'],[30000,'30 s']], ajuda:'Acabou o tempo: compra 1 e passa a vez.' },
  { k:'maoInicial', rot:'Cartas no começo', ops:[[5,'5'],[7,'7'],[10,'10']] },
  { k:'empilhar', rot:'Empilhar +2 e +4', bool:1, ajuda:'Recebeu +2? Jogue outro +2 (ou +4) e passe a conta adiante.' },
  { k:'varias', rot:'Jogar várias iguais de uma vez', bool:1, ajuda:'Cartas com o mesmo número ou símbolo saem juntas.' },
  { k:'seteZero', rot:'7 troca de mão · 0 gira as mãos', bool:1 },
  { k:'dicas', rot:'Dicas na tela', bool:1 },
  { k:'baralhoFixo', gram:1, rot:'Cores das cartas impressas', bool:1, ajuda:'Usa as mesmas cores e números do baralho de papel (o par fica mais fácil de adivinhar).' }
];
const REGRAS_UI = Object.assign({}, REGRAS_PADRAO, { dicas:true });
function mesclarRegras(r){
  const o = Object.assign({}, REGRAS_UI);
  if(r && typeof r === 'object') Object.keys(REGRAS_UI).forEach(k => { if(typeof r[k] === typeof REGRAS_UI[k]) o[k] = r[k]; });
  return o;
}
function lerRegras(){ return mesclarRegras(Pref.ler('regras', null)); }
function resumoRegras(r, modo){
  const t = [];
  if(modo !== 'classico'){
    t.push(r.juiz === 'automatico' ? 'juiz automático' : 'contestação');
    t.push('bônus ' + (r.bonus === 0 ? 'à vontade' : r.bonus));
    if(r.respiro) t.push('respiro ' + String(r.respiro / 1000).replace('.', ',') + ' s');
  }
  if(r.tempoVez) t.push(r.tempoVez / 1000 + ' s por vez');
  if(r.maoInicial !== 7) t.push(r.maoInicial + ' cartas');
  if(r.empilhar) t.push('empilhar');
  if(r.varias) t.push('várias juntas');
  if(r.seteZero) t.push('7-0');
  if(modo !== 'classico' && r.baralhoFixo) t.push('cores impressas');
  return t.join(' · ');
}
function montarRegras(sel, modo, aoMudar){
  const box = $(sel); if(!box) return null;
  let r = lerRegras();
  const desenhar = () => {
    const m = modo();
    box.innerHTML = '<summary><span class="cfg-tit">⚙️ Regras da partida</span><small>' + esc(resumoRegras(r, m)) + '</small></summary><div class="cfg-corpo">' +
      OPCOES_REGRAS.filter(o => !(o.gram && m === 'classico')).map(o => {
        const ajuda = o.ajuda ? '<div class="ajuda">' + o.ajuda + '</div>' : '';
        if(o.bool) return '<div class="cfg-linha"><button type="button" class="chave' + (r[o.k] ? ' on' : '') + '" role="switch" aria-checked="' + !!r[o.k] + '" data-k="' + o.k + '"><span class="rot">' + o.rot + '</span><i></i></button>' + ajuda + '</div>';
        return '<div class="cfg-linha"><label>' + o.rot + '</label><div class="segmento">' + o.ops.map(([v, t]) => '<button type="button" data-k="' + o.k + '" data-v="' + v + '" class="' + (String(r[o.k]) === String(v) ? 'on' : '') + '" aria-pressed="' + (String(r[o.k]) === String(v)) + '">' + t + '</button>').join('') + '</div>' + ajuda + '</div>';
      }).join('') + '<button type="button" class="btn lousa" data-padrao>Voltar ao padrão</button></div>';
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b || !box.contains(b)) return;
    if(b.hasAttribute('data-padrao')) r = Object.assign({}, REGRAS_UI);
    else if(b.dataset.v != null){ const v = b.dataset.v; r[b.dataset.k] = typeof REGRAS_UI[b.dataset.k] === 'number' ? +v : v; }
    else if(b.dataset.k) r[b.dataset.k] = !r[b.dataset.k];
    else return;
    Som.tocar('clique'); Pref.gravar('regras', r); desenhar(); aoMudar && aoMudar(r);
  });
  box.addEventListener('toggle', () => Pref.gravar('regrasAberto', box.open));
  box.open = !!Pref.ler('regrasAberto', false);
  desenhar();
  return { ler: () => Object.assign({}, r), redesenhar: () => { r = lerRegras(); desenhar(); } };
}
// regras efetivas da partida (no modo de teste, tudo mais rápido)
function regrasDaPartida(r){
  r = Object.assign({}, r);
  if(TESTE){ r.tempoContestacao = 1500; r.respiro = Math.min(r.respiro, 300); r.tempoBater = 2500; }
  return r;
}

/* =================================================================
   SOLO
   ================================================================= */
let soloBots = Pref.ler('soloBots', 3);
$('#solo-bots').textContent = soloBots;
$('#solo-nome').value = Pref.ler('nome', '');
$('#online-nome').value = Pref.ler('nome', '');
$$('#tela-solo [data-passo]').forEach(b => b.onclick = () => { soloBots = Math.max(1, Math.min(5, soloBots + (+b.dataset.passo))); $('#solo-bots').textContent = soloBots; Som.tocar('clique'); });
let soloRegras = null;
const soloModo = segmento('solo-modo', v => { $('#solo-modo-ajuda').textContent = v === 'gramatica' ? 'Cartas de pergunta e resposta, com a Relâmpago.' : 'O UNO de sempre, com números no lugar das perguntas.'; soloRegras && soloRegras.redesenhar(); });
const soloNivel = segmento('solo-nivel');
const soloRitmo = segmento('solo-ritmo');
soloModo.definir(Pref.ler('soloModo', 'gramatica'));
soloNivel.definir(Pref.ler('soloNivel', 'normal'));
soloRitmo.definir(Pref.ler('soloRitmo', '1'));
soloRegras = montarRegras('#solo-regras', () => soloModo());
montarEscolhaBicho('#solo-bicho'); montarEscolhaBicho('#online-bicho');
function embaralharNomes(){ const a = NOMES_ROBOS.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function iniciarSolo(opts){
  opts = opts || {};
  Som.iniciar(); Som.tocar('clique');
  const nome = ($('#solo-nome').value.trim() || 'Você').slice(0, 14);
  Pref.gravar('nome', $('#solo-nome').value.trim()); Pref.gravar('soloBots', soloBots);
  Pref.gravar('soloModo', soloModo()); Pref.gravar('soloNivel', soloNivel()); Pref.gravar('soloRitmo', soloRitmo());
  const modo = opts.modo || soloModo();
  const nomes = embaralharNomes();
  const meu = Pref.ler('bicho', 'raposa'), bichos = bichosPara(meu, soloBots);
  const jogadores = [{ nome, bot:false, avatar:meu }].concat(Array.from({length:soloBots}, (_, i) => ({ nome:nomes[i], bot:true, nivel:soloNivel(), avatar:bichos[i] })));
  const ritmo = TESTE ? 0.45 : parseFloat(soloRitmo());
  const cfg = { modo, jogadores, ritmo, regras: regrasDaPartida(soloRegras ? soloRegras.ler() : lerRegras()) };
  if(sessao) sessao.encerrar();
  Mesa.preparar(null);
  ir('tela-jogo');
  sessao = new SessaoLocal(cfg);
  Mesa.sessao = sessao;
  if(!TESTE && (opts.tutorial || !Pref.ler('tutorialVisto', false))){
    // segura os robôs desde já e abre o tutorial depois da distribuição das cartas
    const s = sessao; s.pausar('tuto');
    setTimeout(() => { if(sessao === s) Tutorial.iniciar(modo); }, 1000);
  }
}
$('#btn-comecar-solo').onclick = () => iniciarSolo();
$('#btn-tutorial').onclick = () => { Dicas.zerar(); iniciarSolo({ tutorial:true, modo:'gramatica' }); };

/* =================================================================
   TUTORIAL (passo a passo na primeira partida) e DICAS (uma vez cada)
   ================================================================= */
const Tutorial = {
  ativo:false, passos:[], i:0,
  iniciar(modo){
    const s = sessao;
    if(!(s instanceof SessaoLocal) || s instanceof SessaoAnfitriao) return;
    this.passos = [
      { alvo:'#descarte', txt:'Esta é a <b>carta da mesa</b>. Na sua vez, jogue uma carta com a mesma <b>cor</b>, o mesmo <b>número</b> ou o mesmo <b>símbolo</b>. Toque nela para ler.' },
      { alvo:'.zona-mao', txt:'Esta é a <b>sua mão</b>. Na sua vez, as cartas que servem sobem e brilham. Toque numa carta para ler e jogar.' +
        (modo === 'gramatica' ? ' Na mão aparece se a carta é <b>pergunta (?)</b> ou <b>resposta (!)</b>. Toque para ler o texto.' : '') },
      { alvo:'#monte', txt:'Nenhuma serve? Toque no <b>monte</b> para comprar. Se a carta comprada também não servir, passe a vez.' },
      modo === 'gramatica' && { alvo:'#descarte', txt:'⚡ <b>Relâmpago</b>: se a mesa for uma pergunta e você tiver a <b>resposta</b> dela (ou o contrário), jogue <b>até fora da sua vez</b> e ganhe bônus! Cor e número mudam a cada partida: só acha o par quem <b>sabe</b>.' },
      modo === 'gramatica' && { alvo:'#descarte', txt:'Quando der, aparecem os botões <b>📖 Ler</b> (mostra suas perguntas/respostas por extenso) e <b>✋ Bater</b> (congela a mesa pra ninguém jogar por cima enquanto você escolhe). Errou? Compra 2.' },
      { alvo:'.barra-acoes', txt:'Quando ficar com <b>2 cartas</b>, aperte <b>UNO!</b> antes de jogar a penúltima. Se esquecer, os robôs te pegam e você compra 2.' },
      { alvo:'#assentos', txt:'Esses são os <b>robôs</b>. Quem está na vez brilha em amarelo. Boa partida!' }
    ].filter(Boolean);
    this.i = 0; this.ativo = true;
    s.pausar('tuto');
    Mesa.fecharPainel();
    $('#tuto').classList.add('on');
    this.mostrar();
  },
  mostrar(){
    const p = this.passos[this.i];
    const el = document.querySelector(p.alvo), r = el && el.getBoundingClientRect();
    const luz = $('#tuto-luz'), bal = $('#tuto-balao'), m = 8;
    if(r && r.width){
      Object.assign(luz.style, { left:(r.left - m) + 'px', top:(r.top - m) + 'px', width:(r.width + 2*m) + 'px', height:(r.height + 2*m) + 'px' });
    }
    $('#tuto-txt').innerHTML = p.txt;
    $('#tuto-passo').textContent = (this.i + 1) + ' de ' + this.passos.length;
    $('#tuto-prox').textContent = this.i === this.passos.length - 1 ? 'Jogar!' : 'Próximo';
    // balão do lado com mais espaço
    bal.style.top = ''; bal.style.bottom = '';
    if(!r || r.top + r.height / 2 > innerHeight / 2) bal.style.bottom = (r ? innerHeight - r.top + 18 : innerHeight * .4) + 'px';
    else bal.style.top = (r.bottom + 18) + 'px';
    bal.classList.remove('entra'); void bal.offsetWidth; bal.classList.add('entra');
    $('#tuto-prox').focus();
  },
  proximo(){ Som.tocar('clique'); this.i++; if(this.i >= this.passos.length) this.fim(); else this.mostrar(); },
  esconder(){ this.ativo = false; $('#tuto').classList.remove('on'); },
  fim(){
    this.esconder();
    Pref.gravar('tutorialVisto', true);
    if(sessao && sessao.retomar) sessao.retomar('tuto');
  }
};
$('#tuto-prox').onclick = () => Tutorial.proximo();
$('#tuto-pular').onclick = () => { Som.tocar('clique'); Tutorial.fim(); };
addEventListener('resize', () => { if(Tutorial.ativo) Tutorial.mostrar(); });

const Dicas = {
  vistas: Pref.ler('dicas', {}),
  zerar(){ this.vistas = {}; Pref.gravar('dicas', {}); },
  uma(k, msg){ if(this.vistas[k]) return; this.vistas[k] = true; Pref.gravar('dicas', this.vistas); aviso(msg, 'ouro', 4500); },
  checar(v){
    if(v.fase !== 'jogar') return;
    if(v.regras && v.regras.dicas === false) return;
    // não entrega o par: só lembra que dá pra procurar (vale pra qualquer pergunta/resposta na mesa)
    if(v.modo === 'gramatica' && ehPerguntaResposta(v.topo) && Mesa.candidatasRaio(v).length)
      this.uma('relampago2', '⚡ Pergunta ou resposta na mesa! Toque em 📖 Ler pra procurar o par na sua mão, ou ✋ Bater pra congelar a mesa enquanto pensa.');
    if(v.fase === 'jogar' && v.acumulado && v.vez === v.eu)
      this.uma('acumulado', 'Tem +' + v.acumulado + ' acumulado! Jogue um +2/+4 pra passar adiante, ou compre tudo.');
    if(v.vez === v.eu && v.mao.length === 2 && !v.gritou)
      this.uma('uno', 'Duas cartas! Aperte UNO! antes de jogar a próxima.');
  }
};

/* =================================================================
   ESTATÍSTICAS (guardadas no aparelho)
   ================================================================= */
function mesclar(base, salvo){
  if(!salvo || typeof salvo !== 'object') return base;
  Object.keys(base).forEach(k => {
    if(base[k] && typeof base[k] === 'object') base[k] = mesclar(base[k], salvo[k]);
    else if(typeof salvo[k] === 'number') base[k] = salvo[k];
  });
  return base;
}
const Stats = {
  base(){
    const pv = () => ({ p:0, v:0 });
    return { partidas:0, vitorias:0, seq:0, melhorSeq:0, jogadas:0,
      modo:{ gramatica:pv(), classico:pv() }, nivel:{ facil:pv(), normal:pv(), dificil:pv() }, online:pv(),
      relValeu:0, relDerrubada:0, contAcertou:0, contErrou:0, unoGritado:0, pegou:0, pego:0 };
  },
  d:null,
  carregar(){ this.d = mesclar(this.base(), Pref.ler('stats', null)); },
  salvar(){ Pref.gravar('stats', this.d); },
  registrar(novos, v, s){
    if(v.eu == null) return;
    const d = this.d, eu = v.eu, antes = JSON.stringify(d);
    novos.forEach(ev => {
      switch(ev.tipo){
        case 'jogou': case 'relampago': if(ev.j === eu) d.jogadas++; break;
        case 'semContestacao': if(ev.j === eu) d.relValeu++; break;
        case 'contestou':
          if(ev.autor === eu){ if(ev.acusadorCerto) d.relDerrubada++; else d.relValeu++; }
          if(ev.j === eu){ if(ev.acusadorCerto) d.contAcertou++; else d.contErrou++; }
          break;
        case 'uno': if(ev.j === eu) d.unoGritado++; break;
        case 'pegou': if(ev.j === eu) d.pegou++; if(ev.alvo === eu) d.pego++; break;
        case 'vitoria': {
          const venci = ev.j === eu ? 1 : 0;
          d.partidas++; d.vitorias += venci;
          d.seq = venci ? d.seq + 1 : 0; d.melhorSeq = Math.max(d.melhorSeq, d.seq);
          d.modo[v.modo].p++; d.modo[v.modo].v += venci;
          const solo = s instanceof SessaoLocal && !(s instanceof SessaoAnfitriao);
          if(solo){
            const bot = s.cfg.jogadores.find(j => j.bot), n = bot && d.nivel[bot.nivel];
            if(n){ n.p++; n.v += venci; }
          } else { d.online.p++; d.online.v += venci; }
          break;
        }
      }
    });
    if(JSON.stringify(d) !== antes) this.salvar();
  },
  zerar(){ this.d = this.base(); this.salvar(); }
};
Stats.carregar();

function pct(v, p){ return p ? Math.round(100 * v / p) + '%' : '—'; }
function desenharStats(){
  const d = Stats.d;
  const caixa = (n, rot) => '<div class="num-box"><b>' + n + '</b><span>' + rot + '</span></div>';
  const linha = (rot, val) => '<div class="linha-stat"><span>' + rot + '</span><b>' + val + '</b></div>';
  const vp = o => o.p ? o.v + ' de ' + o.p + ' (' + pct(o.v, o.p) + ')' : '—';
  const bloco = (titulo, linhas) => '<div class="bloco"><h3>' + titulo + '</h3>' + linhas.join('') + '</div>';
  $('#stats-conteudo').innerHTML =
    (d.partidas ? '' : '<p class="texto">Jogue uma partida até o fim para começar a contar.</p>') +
    '<div class="blocos-num">' + caixa(d.partidas, d.partidas === 1 ? 'partida' : 'partidas') + caixa(d.vitorias, d.vitorias === 1 ? 'vitória' : 'vitórias') +
      caixa(pct(d.vitorias, d.partidas), 'aproveitamento') + caixa(d.melhorSeq, 'melhor sequência') + '</div>' +
    bloco('Vitórias por baralho', [linha('Gramática', vp(d.modo.gramatica)), linha('UNO clássico', vp(d.modo.classico))]) +
    bloco('Contra robôs', [linha('Fácil', vp(d.nivel.facil)), linha('Normal', vp(d.nivel.normal)), linha('Difícil', vp(d.nivel.dificil))]) +
    bloco('Online', [linha('Com amigos', vp(d.online))]) +
    bloco('⚡ Relâmpago', [linha('Suas Relâmpagos que valeram', d.relValeu), linha('Suas Relâmpagos derrubadas', d.relDerrubada),
      linha('Contestações certas', d.contAcertou), linha('Contestações erradas', d.contErrou)]) +
    bloco('UNO!', [linha('Gritou UNO!', d.unoGritado), linha('Pegou alguém sem UNO', d.pegou), linha('Foi pego sem UNO', d.pego), linha('Cartas jogadas', d.jogadas)]) +
    bloco('Estudo', [linha('Pares dominados', Estudo.dominados() + ' de ' + PARES.length), linha('Cartas estudadas', Estudo.d.vistas)]);
}
aoEntrar['tela-stats'] = desenharStats;
$('#btn-zerar-stats').onclick = async () => {
  if(!(await confirmar('Zerar todas as estatísticas das partidas?', 'Zerar'))) return;
  Stats.zerar(); desenharStats(); aviso('Estatísticas zeradas');
};

/* =================================================================
   ESTUDO — flashcards com repetição espaçada simples (caixas de Leitner)
   ================================================================= */
const Estudo = {
  d: mesclar({ vistas:0 }, Pref.ler('estudoInfo', null)),
  caixas: Pref.ler('estudo', {}),          // índice do par -> caixa 0..4 (3 ou mais = dominado)
  tema:'todos', atual:null, virada:false, placar:{ ok:0, erro:0 },
  caixa(i){ return this.caixas[i] || 0; },
  lista(){ return PARES.map((p, i) => i).filter(i => this.tema === 'todos' || PARES[i].t === this.tema); },
  dominados(l){ return (l || PARES.map((p, i) => i)).filter(i => this.caixa(i) >= 3).length; },
  sortear(){
    // cartas de caixa baixa (erradas ou novas) aparecem bem mais
    const peso = [8, 5, 3, 2, 1], l = this.lista();
    const cand = l.length > 1 ? l.filter(i => i !== this.atual) : l;
    let r = Math.random() * cand.reduce((s, i) => s + peso[this.caixa(i)], 0);
    for(const i of cand){ r -= peso[this.caixa(i)]; if(r <= 0) return i; }
    return cand[cand.length - 1];
  },
  montarTemas(){
    const box = $('#estudo-temas');
    const temas = ['todos'].concat(Array.from(new Set(PARES.map(p => p.t))));
    box.innerHTML = temas.map(t => '<button data-t="' + esc(t) + '" aria-pressed="' + (t === this.tema) + '"' + (t === this.tema ? ' class="on"' : '') + '>' + (t === 'todos' ? 'Todos' : esc(t)) + '</button>').join('');
    box.onclick = e => {
      const b = e.target.closest('button'); if(!b) return;
      this.tema = b.dataset.t; Som.tocar('clique');
      box.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      this.proxima();
    };
  },
  entrar(){ this.placar = { ok:0, erro:0 }; this.montarTemas(); this.proxima(); },
  proxima(){
    this.atual = this.sortear(); this.virada = false;
    const p = PARES[this.atual], giro = $('#flash-giro');
    giro.innerHTML = '';
    giro.append(criarCarta({ id:'eq', cor:p.qc, tipo:'numero', numero:p.qn, texto:p.qt, papel:'pergunta', topico:p.t }, 'xg', false, true));
    const tras = criarCarta({ id:'er', cor:p.ac, tipo:'numero', numero:p.an, texto:p.at, papel:'resposta', topico:p.t }, 'xg', false, true);
    tras.classList.add('tras'); giro.append(tras);
    // volta para a frente sem animar o giro e entra deslizando
    giro.style.transition = 'none'; $('#flash').classList.remove('virada'); void giro.offsetWidth; giro.style.transition = '';
    giro.classList.remove('troca'); void giro.offsetWidth; giro.classList.add('troca');
    $('#estudo-info').textContent = p.t + ' · pense na resposta e vire a carta';
    $('#estudo-antes').style.display = ''; $('#estudo-depois').style.display = 'none';
    this.atualizar();
  },
  virar(){
    if(!this.virada){
      this.virada = true; this.d.vistas++; Pref.gravar('estudoInfo', this.d);
      $('#estudo-info').textContent = 'você acertou a resposta?';
      $('#estudo-antes').style.display = 'none'; $('#estudo-depois').style.display = '';
    }
    Som.tocar('carta');
    $('#flash').classList.toggle('virada');   // depois de virada, tocar alterna para reler a pergunta
  },
  responder(ok){
    if(!this.virada) return;
    const i = this.atual;
    this.caixas[i] = ok ? Math.min(4, this.caixa(i) + 1) : 0;
    Pref.gravar('estudo', this.caixas);
    this.placar[ok ? 'ok' : 'erro']++;
    Som.tocar(ok ? 'certo' : 'errado'); vibrar(ok ? 15 : [30, 30, 30]);
    if(ok && this.caixa(i) === 3) aviso('Par dominado: ' + PARES[i].t + ' ' + PARES[i].qn + ' ✓', 'ouro', 2000);
    this.proxima();
  },
  atualizar(){
    const l = this.lista(), dom = this.dominados(l);
    $('#estudo-prog').textContent = dom + ' de ' + l.length + (l.length === 1 ? ' par dominado' : ' pares dominados');
    $('#estudo-placar').textContent = '✓ ' + this.placar.ok + '  ✗ ' + this.placar.erro;
    $('#estudo-barra').style.width = (l.length ? dom / l.length * 100 : 0) + '%';
  }
};
aoEntrar['tela-estudo'] = () => Estudo.entrar();
$('#flash').onclick = () => Estudo.virar();
$('#flash').onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); Estudo.virar(); } };
$('#btn-virar').onclick = () => Estudo.virar();
$('#btn-errei').onclick = () => Estudo.responder(false);
$('#btn-acertei').onclick = () => Estudo.responder(true);

// partida contra robôs pausa sozinha quando o app vai para segundo plano
document.addEventListener('visibilitychange', () => {
  if(!(sessao instanceof SessaoLocal) || sessao instanceof SessaoAnfitriao) return;
  if(document.hidden) sessao.pausar('oculto'); else sessao.retomar('oculto');
});

/* =================================================================
   ONLINE (PeerJS)
   ================================================================= */
const PREFIXO = 'unogramatica-sala-';
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function carregarPeer(){
  if(window.Peer) return Promise.resolve();
  return new Promise((ok, falha) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = () => window.Peer ? ok() : falha(new Error('PeerJS indisponível'));
    s.onerror = () => falha(new Error('Sem internet para o modo online'));
    document.head.append(s);
  });
}
function gerarCodigo(){ let c = ''; for(let i = 0; i < 5; i++) c += LETRAS[Math.floor(Math.random()*LETRAS.length)]; return c; }

class Rede {
  constructor(){ this.peer = null; this.convidados = []; this.conn = null; this.aoDados = null; this.aoSair = null; this.fechado = false; }
  fechar(){ this.fechado = true; clearInterval(this.batida); try{ this.convidados.forEach(c => c.conn.close()); }catch(e){} try{ this.conn && this.conn.close(); }catch(e){} try{ this.peer && this.peer.destroy(); }catch(e){} }
}

const Sala = {
  rede:null, souAnfitriao:false, codigo:null, jogadores:[], bots:[], emJogo:false, modo:'gramatica', regras:null,
  nomeLocal(){ const n = ($('#online-nome').value.trim() || 'Jogador').slice(0, 14); Pref.gravar('nome', $('#online-nome').value.trim()); return n; },

  async criar(){
    Som.iniciar();
    const nome = this.nomeLocal();
    try{ await carregarPeer(); }catch(e){ aviso(e.message + '. Confira a conexão.', 'erro', 3500); return; }
    this.limpar();
    this.souAnfitriao = true; this.emJogo = false; this.bots = []; this.modo = salaModo();
    this.regras = salaRegras ? salaRegras.ler() : lerRegras();
    this.rede = new Rede();
    this.jogadores = [{ nome, eu:true, bicho:Pref.ler('bicho', 'raposa') }];
    this.mostrarSala();
    const tentar = (n) => {
      this.codigo = gerarCodigo();
      $('#sala-codigo').textContent = '·····';
      const peer = new Peer(PREFIXO + this.codigo, { debug:0 });
      this.rede.peer = peer;
      peer.on('open', () => { $('#sala-codigo').textContent = this.codigo; this.atualizarLista(); });
      peer.on('error', err => {
        if(err && err.type === 'unavailable-id' && n < 4){ try{ peer.destroy(); }catch(e){} tentar(n + 1); return; }
        if(!this.emJogo) aviso('Problema na conexão online (' + (err && err.type || 'erro') + ').', 'erro', 3500);
      });
      peer.on('connection', conn => this.novaConexao(conn));
    };
    tentar(0);
    const rede = this.rede;
    rede.batida = setInterval(() => {
      const t = Date.now();
      rede.convidados.slice().forEach(c => {
        if(c.morto) return;
        if(c.aberta) try{ c.conn.send({ tipo:'ping' }); }catch(e){}
        if(t - (c.visto || t) > 9000){
          c.morto = true; c.aberta = false; try{ c.conn.close(); }catch(e){}
          if(this.emJogo){ rede.aoSair && rede.aoSair(c); }
          else { const i = rede.convidados.indexOf(c); if(i >= 0) rede.convidados.splice(i, 1); this.atualizarLista(); }
        }
      });
    }, 2000);
  },
  novaConexao(conn){
    const c = { conn, nome:null, aberta:false, indice:null, seq:0, visto:Date.now(), morto:false };
    conn.on('open', () => { c.aberta = true; c.visto = Date.now(); });
    conn.on('data', msg => {
      c.visto = Date.now();
      if(!msg || typeof msg !== 'object' || msg.tipo === 'oi') return;
      if(msg.tipo === 'entrar'){
        const token = String(msg.token || '').slice(0, 40);
        // voltou depois de cair: devolve o mesmo lugar na mesa
        const velho = token && this.rede.convidados.find(x => x !== c && x.token === token);
        if(velho){
          Object.assign(c, { nome:velho.nome, bicho:velho.bicho, token, indice:velho.indice, seq:0, aberta:true });
          velho.morto = true; velho.substituido = true; try{ velho.conn.close(); }catch(e){}
          this.rede.convidados[this.rede.convidados.indexOf(velho)] = c;
          if(this.emJogo && sessao && sessao.voltou) sessao.voltou(c); else this.atualizarLista();
          return;
        }
        if(this.emJogo || this.totalNaMesa() >= 6){ try{ conn.send({ tipo:'recusado', msg: this.emJogo ? 'A partida já começou.' : 'A sala está cheia (6 lugares).' }); }catch(e){} setTimeout(() => conn.close(), 300); return; }
        c.nome = String(msg.nome || 'Jogador').slice(0, 14);
        c.token = token; c.bicho = BICHOS[msg.bicho] ? msg.bicho : null;
        this.rede.convidados.push(c);
        Som.tocar('certo');
        this.atualizarLista();
        return;
      }
      if(this.rede.aoDados) this.rede.aoDados(c, msg);
    });
    conn.on('close', () => {
      if(c.morto || !this.rede) return;
      c.aberta = false; c.morto = true;
      const i = this.rede.convidados.indexOf(c);
      if(!this.emJogo && i >= 0){ this.rede.convidados.splice(i, 1); this.atualizarLista(); }
      else if(this.emJogo && this.rede.aoSair) this.rede.aoSair(c);
    });
  },
  totalNaMesa(){ return 1 + (this.rede ? this.rede.convidados.length : 0) + this.bots.length; },
  listaNomes(){ return [this.jogadores[0].nome].concat(this.rede.convidados.map(c => c.nome), this.bots.map(b => b.nome)); },
  listaBichos(){
    const usados = [this.jogadores[0].bicho].concat(this.rede.convidados.map(c => c.bicho));
    return usados.concat(this.bots.map(b => b.avatar)).map((b, i) => BICHOS[b] ? b : LISTA_BICHOS[i % LISTA_BICHOS.length]);
  },
  atualizarLista(){
    const box = $('#sala-lista'); box.innerHTML = '';
    if(!this.souAnfitriao) return;
    const nomes = this.listaNomes(), bichos = this.listaBichos();
    nomes.forEach((n, i) => {
      const d = document.createElement('div'); d.className = 'item';
      const ehBot = i > this.rede.convidados.length;
      d.style.setProperty('--av', AVATARES[i % AVATARES.length]);
      d.innerHTML = '<span class="avatar">' + bichoSVG(bichos[i]) + '</span>' + esc(n) + (i === 0 ? '<span class="tag">você · anfitrião</span>' : ehBot ? '<button data-tirar="' + (i - 1 - this.rede.convidados.length) + '">tirar robô</button>' : '<span class="tag">conectado</span>');
      box.append(d);
    });
    box.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => { this.bots.splice(+b.dataset.tirar, 1); this.atualizarLista(); });
    const total = nomes.length;
    const bt = $('#btn-iniciar-online');
    bt.disabled = total < 2;
    bt.textContent = total < 2 ? 'Esperando jogadores…' : 'Começar partida (' + total + ' na mesa)';
    $('#btn-add-bot').disabled = total >= 6;
    this.rede.convidados.forEach(c => { try{ c.conn.send({ tipo:'sala', nomes, bichos, modo:this.modo, regras:this.regras }); }catch(e){} });
  },
  adicionarBot(){
    if(this.totalNaMesa() >= 6) return;
    const usados = new Set(this.bots.map(b => b.nome));
    const nome = NOMES_ROBOS.find(n => !usados.has(n)) || 'Robô';
    const livres = LISTA_BICHOS.filter(b => this.listaBichos().indexOf(b) < 0);
    this.bots.push({ nome, bot:true, nivel:'normal', avatar: livres[0] || LISTA_BICHOS[this.bots.length % LISTA_BICHOS.length] });
    Som.tocar('clique'); this.atualizarLista();
  },
  iniciar(){
    if(!this.souAnfitriao || this.totalNaMesa() < 2) return;
    this.emJogo = true;
    const bichos = this.listaBichos();
    const jogadores = [{ nome:this.jogadores[0].nome, bot:false, avatar:bichos[0] }];
    this.rede.convidados.forEach((c, i) => { c.indice = i + 1; c.seq = 0; jogadores.push({ nome:c.nome, bot:false, avatar:bichos[i + 1] }); });
    this.bots.forEach((b, i) => jogadores.push({ nome:b.nome, bot:true, nivel:b.nivel, avatar:bichos[1 + this.rede.convidados.length + i] }));
    const cfg = { modo:this.modo, jogadores, ritmo: TESTE ? 0.2 : 1, regras: regrasDaPartida(this.regras || lerRegras()) };
    Mesa.preparar(null); ir('tela-jogo');
    sessao = new SessaoAnfitriao(cfg, this.rede);
    Mesa.sessao = sessao;
  },

  async entrar(){
    Som.iniciar();
    const nome = this.nomeLocal();
    const codigo = $('#online-codigo').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if(codigo.length !== 5){ aviso('O código tem 5 letras/números.', 'erro'); return; }
    try{ await carregarPeer(); }catch(e){ aviso(e.message + '. Confira a conexão.', 'erro', 3500); return; }
    this.limpar();
    this.souAnfitriao = false; this.emJogo = false;
    const rede = this.rede = new Rede();
    const peer = new Peer({ debug:0 }); rede.peer = peer;
    this.mostrarSala(true);
    const conv = new SessaoConvidado(rede), bicho = Pref.ler('bicho', 'raposa'), token = tokenLocal();
    let conectou = false, tentativas = 0;
    const desistir = setTimeout(() => { if(!conectou){ aviso('Não achei a sala ' + codigo + '. Confira o código.', 'erro', 3500); this.limpar(); ir('tela-online'); } }, 12000);
    const sairDeVez = () => { aviso('A conexão com a sala caiu.', 'erro', 3500); if(sessao === conv) sessao = null; this.limpar(); $('#vitoria').classList.remove('on'); ir('tela-menu'); };
    // caiu? tenta voltar sozinho algumas vezes (o anfitrião guarda o seu lugar)
    const cair = () => {
      if(rede.fechado) return;
      clearInterval(rede.batida);
      if(!conectou || tentativas >= 6){ sairDeVez(); return; }
      tentativas++;
      aviso('Conexão instável — reconectando… (' + tentativas + ')', '', 2200);
      setTimeout(() => { if(!rede.fechado){ if(peer.disconnected) try{ peer.reconnect(); }catch(e){} ligar(); } }, 2500);
    };
    const ligar = () => {
      let conn; try{ conn = peer.connect(PREFIXO + codigo, { reliable:true }); }catch(e){ cair(); return; }
      rede.conn = conn;
      let ouvido = Date.now(), viva = true;
      const morrer = () => { if(!viva) return; viva = false; try{ conn.close(); }catch(e){} cair(); };
      conn.on('open', () => {
        if(tentativas) aviso('Reconectado!', 'ouro', 1800);
        conectou = true; tentativas = 0; clearTimeout(desistir);
        conn.send({ tipo:'entrar', nome, bicho, token }); ouvido = Date.now();
        clearInterval(rede.batida);
        rede.batida = setInterval(() => { try{ conn.send({ tipo:'oi' }); }catch(e){} if(Date.now() - ouvido > 10000) morrer(); }, 2000);
      });
      conn.on('data', msg => {
        ouvido = Date.now();
        if(!msg || typeof msg !== 'object' || msg.tipo === 'ping') return;
        if(msg.tipo === 'sala'){ this.listaConvidado(msg.nomes, msg.modo, msg.bichos, msg.regras); return; }
        if(msg.tipo === 'recusado'){ viva = false; aviso(msg.msg, 'erro', 3500); this.limpar(); ir('tela-online'); return; }
        if(msg.tipo === 'vista' && sessao !== conv){ if(sessao && sessao !== conv) sessao.encerrar(); sessao = conv; Mesa.sessao = conv; }
        conv.receber(msg);
      });
      conn.on('close', morrer);
      conn.on('error', morrer);
      if(conectou) setTimeout(() => { if(viva && !conn.open) morrer(); }, 8000);
    };
    peer.on('open', () => { if(!rede.conn) ligar(); });
    peer.on('disconnected', () => { if(!rede.fechado) try{ peer.reconnect(); }catch(e){} });
    peer.on('error', err => {
      if(conectou){ if(err && (err.type === 'peer-unavailable' || err.type === 'network')) cair(); return; }
      clearTimeout(desistir);
      aviso(err && err.type === 'peer-unavailable' ? 'Sala ' + codigo + ' não encontrada.' : 'Não deu pra conectar (' + (err && err.type || 'erro') + ').', 'erro', 3500);
      this.limpar(); ir('tela-online');
    });
  },
  listaConvidado(nomes, modo, bichos, regras){
    const box = $('#sala-lista'); box.innerHTML = '';
    nomes.forEach((n, i) => { const d = document.createElement('div'); d.className = 'item'; d.style.setProperty('--av', AVATARES[i % AVATARES.length]); d.innerHTML = '<span class="avatar">' + bichoSVG(bichos && bichos[i]) + '</span>' + esc(n) + (i === 0 ? '<span class="tag">anfitrião</span>' : ''); box.append(d); });
    $('#sala-modo-convidado').textContent = 'Baralho: ' + (modo === 'classico' ? 'UNO clássico' : 'Gramática');
    const rr = mesclarRegras(regras), res = resumoRegras(rr, modo);
    $('#sala-regras-resumo').textContent = res ? 'Regras: ' + res : '';
  },
  mostrarSala(convidado){
    $('#sala-titulo').textContent = convidado ? 'Na sala' : 'Sua sala';
    $('#sala-host').style.display = convidado ? 'none' : '';
    $('#sala-host-acoes').style.display = convidado ? 'none' : '';
    $('#sala-convidado').style.display = convidado ? '' : 'none';
    $('#sala-lista').innerHTML = '';
    ir('tela-sala');
  },
  limpar(){ if(this.rede){ this.rede.fechar(); } this.rede = null; this.emJogo = false; }
};
$('#btn-criar-sala').onclick = () => { Som.tocar('clique'); Sala.criar(); };
$('#btn-entrar-sala').onclick = () => { Som.tocar('clique'); Sala.entrar(); };
$('#btn-add-bot').onclick = () => Sala.adicionarBot();
$('#btn-iniciar-online').onclick = () => { Som.tocar('clique'); Sala.iniciar(); };
$('#sala-sair').onclick = () => { Sala.limpar(); ir('tela-online'); };
let salaRegras = null;
const salaModo = segmento('sala-modo', v => { Sala.modo = v; salaRegras && salaRegras.redesenhar(); if(Sala.rede) Sala.atualizarLista(); });
salaRegras = montarRegras('#sala-regras', () => salaModo(), r => { Sala.regras = r; if(Sala.rede && Sala.souAnfitriao) Sala.atualizarLista(); });
function tokenLocal(){ let t = Pref.ler('token', null); if(!t){ t = Math.random().toString(36).slice(2) + Date.now().toString(36); Pref.gravar('token', t); } return t; }
$('#btn-copiar').onclick = async () => { try{ await navigator.clipboard.writeText(Sala.codigo); aviso('Código copiado'); }catch(e){ aviso('Código: ' + Sala.codigo); } };
$('#btn-compartilhar').onclick = async () => {
  const txt = 'Bora jogar UNO Gramática! Código da sala: ' + Sala.codigo;
  // o link já leva o código: quem abrir cai direto na tela de entrar
  const link = location.href.split(/[?#]/)[0] + '?sala=' + Sala.codigo;
  if(navigator.share){ try{ await navigator.share({ title:'UNO Gramática', text:txt, url:link }); }catch(e){} }
  else { try{ await navigator.clipboard.writeText(txt + ' ' + link); aviso('Convite copiado'); }catch(e){ aviso(txt); } }
};
// atalhos do ícone instalado (manifest → shortcuts)
{ const atalho = { solo:'tela-solo', online:'tela-online', video:'tela-video' }[params.get('ir')]; if(atalho) setTimeout(() => ir(atalho), 0); }
if(params.get('sala')){
  $('#online-codigo').value = params.get('sala').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0,5);
  ir('tela-online');
}

/* =================================================================
   REGRAS e CARTAS FÍSICAS
   ================================================================= */
segmento('regras-aba', v => { $('#regras-gram').style.display = v === 'gram' ? '' : 'none'; $('#regras-clas').style.display = v === 'clas' ? '' : 'none'; });
segmento('mesa-aba', v => { $('#mesa-conferir').style.display = v === 'conferir' ? '' : 'none'; $('#mesa-consultar').style.display = v === 'consultar' ? '' : 'none'; });

const CARTAS_PR = [];
PARES.forEach((p, i) => {
  CARTAS_PR.push({ id:'q'+i, cor:p.qc, tipo:'numero', numero:p.qn, texto:p.qt, papel:'pergunta', par:i, topico:p.t });
  CARTAS_PR.push({ id:'r'+i, cor:p.ac, tipo:'numero', numero:p.an, texto:p.at, papel:'resposta', par:i, topico:p.t });
});
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function filtrar(termo){
  const t = norm(termo.trim()); if(!t) return [];
  return CARTAS_PR.filter(c => norm(c.texto + ' ' + c.topico + ' ' + c.numero + ' ' + c.cor + ' ' + c.numero + ' ' + c.cor).includes(t) || String(c.numero) === t);
}
const escolha = { a:null, b:null };
function montarBusca(lado){
  const input = $('#busca-' + lado), lista = $('#lista-' + lado), esc0 = $('#esc-' + lado);
  input.addEventListener('input', () => {
    lista.innerHTML = '';
    filtrar(input.value).slice(0, 30).forEach(c => {
      const b = document.createElement('button'); b.className = 'opcao';
      b.append(criarCarta(c, 'm')); const s = document.createElement('span'); s.textContent = c.numero + ' ' + NOME_COR[c.cor] + ' — ' + c.texto; b.append(s);
      b.onclick = () => { escolha[lado] = c; lista.innerHTML = ''; input.value = ''; mostrarEscolha(lado); julgar(); Som.tocar('clique'); };
      lista.append(b);
    });
  });
  function mostrarEscolha(l){
    const c = escolha[l]; esc0.innerHTML = '';
    if(!c) return;
    const d = document.createElement('div'); d.className = 'escolhida'; d.append(criarCarta(c, 'm'));
    const s = document.createElement('span'); s.textContent = c.numero + ' ' + NOME_COR[c.cor] + ' — ' + c.texto; d.append(s); esc0.append(d);
  }
}
function julgar(){
  const v = $('#veredito');
  if(!escolha.a || !escolha.b){ v.className = 'veredito'; return; }
  const sim = escolha.a.par === escolha.b.par && escolha.a.id !== escolha.b.id;
  v.className = 'veredito ' + (sim ? 'sim' : 'nao');
  v.textContent = sim ? '✅ É o par!' : '❌ Não é o par';
  Som.tocar(sim ? 'certo' : 'errado');
}
montarBusca('a'); montarBusca('b');
$('#busca-c').addEventListener('input', e => {
  const t = norm(e.target.value.trim()), box = $('#lista-c'); box.innerHTML = '';
  if(!t) return;
  PARES.forEach(p => {
    if(!norm(p.qt + ' ' + p.at + ' ' + p.t + ' ' + p.qn + ' ' + p.qc + ' ' + p.ac).includes(t) && String(p.qn) !== t) return;
    const d = document.createElement('div'); d.className = 'par-item';
    d.innerHTML = '<div class="topico">' + esc(p.t) + '</div>' +
      '<div class="q"><span class="marca" style="background:' + HEX[p.qc] + '">' + p.qn + ' ' + NOME_COR[p.qc] + '</span><span>' + esc(p.qt) + '</span></div>' +
      '<div class="r"><span class="marca" style="background:' + HEX[p.ac] + '">' + p.an + ' ' + NOME_COR[p.ac] + '</span><span>' + esc(p.at) + '</span></div>';
    box.append(d);
  });
});

/* =================================================================
   PWA
   ================================================================= */
let pedidoInstalar = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedidoInstalar = e; $('#btn-instalar').style.display = ''; });
$('#btn-instalar').onclick = async () => { if(!pedidoInstalar) return; pedidoInstalar.prompt(); try{ await pedidoInstalar.userChoice; }catch(e){} pedidoInstalar = null; $('#btn-instalar').style.display = 'none'; };
window.addEventListener('appinstalled', () => { $('#btn-instalar').style.display = 'none'; aviso('Instalado! Procure o ícone na tela inicial.'); });
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !TESTE){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const avisar = w => {
        if(!w || !navigator.serviceWorker.controller) return;
        const b = $('#nova-versao'); b.classList.add('on');
        b.onclick = () => { w.postMessage('atualizar'); b.textContent = 'Atualizando…'; };
      };
      if(reg.waiting) avisar(reg.waiting);
      reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if(w.state === 'installed') avisar(w); }); });
      setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
    }).catch(() => {});
    let recarregou = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if(recarregou) return; recarregou = true; if(!sessao) location.reload(); else aviso('Versão nova pronta — ela abre na próxima vez.', 'ouro', 3000); });
  });
}

/* ganchos para testes automáticos */
window.__uno = { Mesa, get sessao(){ return sessao; }, ir, Sala, iniciarSolo, criarCarta, bichoSVG, BICHOS, Som };
})();
