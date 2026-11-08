// Testes do motor de regras: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const { Game, PARES, construirBaralho, formamPar, ehPerguntaResposta, mulberry32 } = require('../js/core.js');

const J = (n, bot) => Array.from({ length: n }, (_, i) => ({ nome: 'J' + i, bot: bot === undefined ? i > 0 : bot, nivel: 'normal' }));
function rodar(g, ate, passo) { let t = g.agora; while (g.fase !== 'fim' && t < ate) { t += passo || 100; g.update(t); } return g; }
// coloca uma carta específica no topo da mesa
function porNoTopo(g, carta) { g.descarte.push(carta); g.cor = carta.cor; g.respiroAte = 0; }
function tirarDaMao(g, j, pred) { const i = g.maos[j].findIndex(pred); return i >= 0 ? g.maos[j].splice(i, 1)[0] : null; }
function acharNoJogo(g, pred) {
  for (const m of g.maos) { const i = m.findIndex(pred); if (i >= 0) return m.splice(i, 1)[0]; }
  const i = g.monte.findIndex(pred); if (i >= 0) return g.monte.splice(i, 1)[0];
  return null;
}

test('baralho tem 108 cartas e distribuição de um UNO oficial', () => {
  for (const modo of ['gramatica', 'classico']) {
    const b = construirBaralho(modo, mulberry32(1));
    assert.strictEqual(b.length, 108);
    const nums = b.filter(c => c.tipo === 'numero');
    assert.strictEqual(nums.length, 76);
    for (const cor of ['amarelo', 'azul', 'verde', 'vermelho']) {
      assert.strictEqual(nums.filter(c => c.cor === cor && c.numero === 0).length, 1);
      for (let n = 1; n <= 9; n++) assert.strictEqual(nums.filter(c => c.cor === cor && c.numero === n).length, 2);
    }
  }
});

test('modo Gramática sorteia cor/número a cada partida (sem pista visual do par)', () => {
  const a = construirBaralho('gramatica', mulberry32(1)), b = construirBaralho('gramatica', mulberry32(2));
  const dif = a.filter((c, i) => c.tipo === 'numero' && (c.cor !== b[i].cor || c.numero !== b[i].numero)).length;
  assert.ok(dif > 50, 'baralhos diferentes entre partidas');
  // em muitas partidas, a chance do par ter o mesmo número fica perto do acaso (~10%)
  let mesmo = 0, total = 0;
  for (let s = 0; s < 300; s++) {
    const d = construirBaralho('gramatica', mulberry32(s));
    for (let i = 0; i < PARES.length; i++) { total++; if (d[2 * i].numero === d[2 * i + 1].numero) mesmo++; }
  }
  assert.ok(mesmo / total < 0.15, 'mesmo número em ' + (mesmo / total));
});

test('baralho fixo mantém as cores das cartas impressas', () => {
  const d = construirBaralho('gramatica', mulberry32(3), true);
  PARES.forEach((p, i) => { assert.strictEqual(d[2 * i].cor, p.qc); assert.strictEqual(d[2 * i + 1].numero, p.an); });
});

test('partidas só de robôs terminam e nunca perdem cartas, com todas as regras', () => {
  const combos = [{}, { empilhar: true }, { varias: true }, { seteZero: true }, { juiz: 'automatico' }, { empilhar: true, varias: true, seteZero: true, maoInicial: 5, respiro: 0 }];
  for (const regras of combos) for (const modo of ['gramatica', 'classico']) for (let s = 1; s <= 40; s++) {
    const g = new Game({ seed: s, modo, regras, jogadores: J(2 + (s % 5), true) });
    let t = 0;
    while (g.fase !== 'fim' && t < 3e6) { t += 100; g.update(t); assert.strictEqual(g.totalCartas(), 108, JSON.stringify(regras) + ' seed ' + s); }
    assert.strictEqual(g.fase, 'fim', 'travou: ' + JSON.stringify(regras) + ' ' + modo + ' seed ' + s);
  }
});

test('Relâmpago certa: vale sem contestação e dá bônus; combo conta', () => {
  const g = new Game({ seed: 5, modo: 'gramatica', jogadores: J(3, false), primeiro: 0 });
  const p = acharNoJogo(g, c => c.papel === 'pergunta'), r = acharNoJogo(g, c => formamPar(c, p));
  porNoTopo(g, p); g.maos[2].push(r);
  assert.ok(g.act(2, { tipo: 'relampago', id: r.id }).ok);
  assert.strictEqual(g.fase, 'contestacao');
  g.update(g.agora + 7000);
  assert.strictEqual(g.fase, 'bonus');
  assert.strictEqual(g.combo, 1);
  assert.ok(g.act(2, { tipo: 'bonusPular' }).ok);
  assert.strictEqual(g.vez, 0, 'fora da vez: a vez continua com quem estava');
});

test('Relâmpago errada contestada: carta volta, autor compra 2, vez de quem contestou', () => {
  const g = new Game({ seed: 6, modo: 'gramatica', jogadores: J(3, false), primeiro: 0 });
  const p = acharNoJogo(g, c => c.papel === 'pergunta'), x = acharNoJogo(g, c => c.papel === 'resposta' && c.par !== p.par);
  porNoTopo(g, p); g.maos[2].push(x);
  const antes = g.maos[2].length;
  g.act(2, { tipo: 'relampago', id: x.id });
  assert.ok(g.act(1, { tipo: 'contestar' }).ok);
  assert.strictEqual(g.maos[2].length, antes + 2);
  assert.strictEqual(g.vez, 1);
  assert.strictEqual(g.topo().id, p.id);
});

test('juiz automático derruba Relâmpago errada sem ninguém contestar', () => {
  const g = new Game({ seed: 7, modo: 'gramatica', regras: { juiz: 'automatico' }, jogadores: J(3, false), primeiro: 0 });
  const p = acharNoJogo(g, c => c.papel === 'pergunta'), x = acharNoJogo(g, c => c.papel === 'resposta' && c.par !== p.par);
  porNoTopo(g, p); g.maos[1].push(x);
  const antes = g.maos[1].length;
  g.act(1, { tipo: 'relampago', id: x.id });
  assert.strictEqual(g.fase, 'jogar');
  assert.strictEqual(g.maos[1].length, antes + 2);
  assert.strictEqual(g.vez, 0);
});

test('bater na mesa congela: ninguém joga por cima; tempo esgotado compra 1', () => {
  const g = new Game({ seed: 8, modo: 'gramatica', regras: { tempoBater: 5000 }, jogadores: J(3, false), primeiro: 0 });
  const p = acharNoJogo(g, c => c.papel === 'pergunta'); porNoTopo(g, p);
  if (!g.maos[2].some(ehPerguntaResposta)) g.maos[2].push(acharNoJogo(g, c => ehPerguntaResposta(c)));
  assert.ok(g.act(2, { tipo: 'bater' }).ok);
  assert.strictEqual(g.fase, 'reserva');
  const qualquer = g.maos[0][0];
  assert.strictEqual(g.act(0, { tipo: 'jogar', id: qualquer.id, cor: 'azul' }).ok, false);
  assert.strictEqual(g.act(1, { tipo: 'bater' }).ok, false);
  const antes = g.maos[2].length;
  g.update(g.agora + 5100);
  assert.strictEqual(g.fase, 'jogar');
  assert.strictEqual(g.maos[2].length, antes + 1);
});

test('respiro: pergunta recém-caída segura a próxima jogada, mas libera Relâmpago', () => {
  const g = new Game({ seed: 9, modo: 'gramatica', regras: { respiro: 2000 }, jogadores: J(2, false), primeiro: 0, agora: 0 });
  assert.ok(g.respirando());
  assert.strictEqual(g.act(0, { tipo: 'comprar' }).ok, false);
  g.update(2100);
  assert.ok(g.act(0, { tipo: 'comprar' }).ok);
});

test('empilhar: +2 sobre +2 acumula e quem não responde compra tudo', () => {
  const g = new Game({ seed: 10, modo: 'classico', regras: { empilhar: true }, jogadores: J(3, false), primeiro: 0 });
  const a = acharNoJogo(g, c => c.tipo === 'mais2'), b = acharNoJogo(g, c => c.tipo === 'mais2');
  g.maos[0].push(a); g.maos[1].push(b); g.cor = a.cor;
  assert.ok(g.act(0, { tipo: 'jogar', id: a.id }).ok);
  assert.strictEqual(g.acumulado, 2); assert.strictEqual(g.vez, 1);
  assert.ok(g.act(1, { tipo: 'jogar', id: b.id }).ok);
  assert.strictEqual(g.acumulado, 4); assert.strictEqual(g.vez, 2);
  const antes = g.maos[2].length;
  assert.ok(g.act(2, { tipo: 'comprar' }).ok);
  assert.strictEqual(g.maos[2].length, antes + 4); assert.strictEqual(g.vez, 0); assert.strictEqual(g.acumulado, 0);
});

test('várias de uma vez: duas cartas com o mesmo número saem juntas', () => {
  const g = new Game({ seed: 11, modo: 'classico', regras: { varias: true }, jogadores: J(2, false), primeiro: 0 });
  const topo = g.topo();
  const a = acharNoJogo(g, c => c.tipo === 'numero' && c.cor === topo.cor && c.numero !== topo.numero);
  const b = acharNoJogo(g, c => c.tipo === 'numero' && c.numero === a.numero && c.id !== a.id);
  g.maos[0].push(a, b);
  const antes = g.maos[0].length;
  assert.ok(g.act(0, { tipo: 'jogar', id: a.id, ids: [a.id, b.id] }).ok);
  assert.strictEqual(g.maos[0].length, antes - 2);
  assert.strictEqual(g.topo().id, b.id);
});

test('7 troca de mão com o escolhido', () => {
  const g = new Game({ seed: 12, modo: 'classico', regras: { seteZero: true }, jogadores: J(3, false), primeiro: 0 });
  const sete = acharNoJogo(g, c => c.tipo === 'numero' && c.numero === 7);
  g.maos[0].push(sete); g.cor = sete.cor;
  const maoDe2 = g.maos[2].map(c => c.id).join();
  assert.ok(g.act(0, { tipo: 'jogar', id: sete.id, alvo: 2 }).ok);
  assert.strictEqual(g.maos[0].map(c => c.id).join(), maoDe2);
});

test('tempo da vez esgotado: compra e passa sozinho', () => {
  const g = new Game({ seed: 13, modo: 'classico', regras: { tempoVez: 10000 }, jogadores: J(2, false), primeiro: 0, agora: 0 });
  const antes = g.maos[0].length;
  g.update(10100);
  assert.strictEqual(g.vez, 1);
  assert.strictEqual(g.maos[0].length, antes + 1);
});
