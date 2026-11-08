// Simulação de equilíbrio: quanto o CONHECIMENTO de gramática, sozinho, ajuda a vencer?
// Uso: node tests/simular.js [partidas]
const { Game, NIVEIS } = require('../js/core.js');
const N = +process.argv[2] || 2000;
const base = Object.assign({}, NIVEIS.normal);
// iguais em tudo (UNO, pegar, estratégia) — só muda o quanto sabem os pares
NIVEIS.sabe = Object.assign({}, base, { saber: 0.95, contestaErrada: 0.9, contestaCerta: 0.02, blefe: 0 });
NIVEIS.medio = Object.assign({}, base, { saber: 0.6, contestaErrada: 0.55, contestaCerta: 0.1, blefe: 0.02 });
// quem não sabe nada: não acha pares; quando contesta, é no chute
NIVEIS.nada = Object.assign({}, base, { saber: 0, contestaErrada: 0.12, contestaCerta: 0.12, blefe: 0.03 });

function rodar(niveis, regras) {
  const v = niveis.map(() => 0); let rel = 0, turnos = 0;
  for (let s = 0; s < N; s++) {
    const g = new Game({ seed: 1000 + s, modo: 'gramatica', regras, jogadores: niveis.map((n, i) => ({ nome: 'b' + i, bot: true, nivel: n })) });
    let t = 0; while (g.fase !== 'fim' && t < 4e6) { t += 100; g.update(t); }
    if (g.fase === 'fim') v[g.vencedor]++;
    rel += g.idContestacao;
  }
  return v.map(x => (100 * x / N).toFixed(1) + '%').join('  ') + '   (Relâmpagos por partida: ' + (rel / N).toFixed(1) + ')';
}
const R = [
  ['bônus 1 carta', { bonus: 1 }],
  ['bônus 2', { bonus: 2 }],
  ['bônus à vontade (padrão)', {}],
  ['juiz automático', { juiz: 'automatico' }],
  ['empilhar + várias + 7-0', { empilhar: true, varias: true, seteZero: true }]
];
for (const [nome, regras] of R) {
  console.log('\n== ' + nome + ' ==');
  console.log('4 que não sabem (controle)        ', rodar(['nada', 'nada', 'nada', 'nada'], regras));
  console.log('1 que SABE  vs 3 que não sabem     ', rodar(['sabe', 'nada', 'nada', 'nada'], regras));
  console.log('1 MÉDIO     vs 3 que não sabem     ', rodar(['medio', 'nada', 'nada', 'nada'], regras));
  console.log('1 que NÃO sabe vs 3 que sabem      ', rodar(['nada', 'sabe', 'sabe', 'sabe'], regras));
}
