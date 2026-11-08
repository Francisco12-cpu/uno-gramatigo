/* =====================================================================
   UNO Gramática — motor de regras (v2)
   Puro (sem DOM). Roda no navegador (window.UnoCore) e no Node (tests).
   O host é a autoridade: todas as jogadas passam por Game.act().
   ===================================================================== */
(function (root) {
  'use strict';

  const PARES = [
    {t:"Substantivo", qc:"amarelo", qn:0, qt:"O que é um substantivo?", ac:"azul", an:0, at:"É a palavra que nomeia seres, objetos, lugares, sentimentos, qualidades ou ideias."},
    {t:"Substantivo", qc:"verde", qn:0, qt:"Quais são os tipos principais de substantivos?", ac:"vermelho", an:0, at:"Substantivos comuns, próprios, simples, compostos, primitivos, derivados, concretos, abstratos e coletivos."},
    {t:"Substantivo", qc:"amarelo", qn:1, qt:"O que é um substantivo concreto?", ac:"azul", an:1, at:"Se refere a algo que pode ser percebido pelos sentidos, como objetos físicos."},
    {t:"Substantivo", qc:"verde", qn:1, qt:"O que é um substantivo abstrato?", ac:"vermelho", an:1, at:"Uma ideia, emoção, qualidade ou conceito, algo que não pode ser tocado fisicamente."},
    {t:"Adjetivo", qc:"amarelo", qn:2, qt:"O que é um adjetivo?", ac:"azul", an:2, at:"É uma palavra que descreve ou qualifica um substantivo."},
    {t:"Adjetivo", qc:"verde", qn:2, qt:"O que são adjetivos pátrios?", ac:"vermelho", an:2, at:"São adjetivos que designam um indivíduo de acordo com seu local de nascimento ou residência."},
    {t:"Adjetivo", qc:"verde", qn:3, qt:"Qual é a função principal de um adjetivo em uma frase?", ac:"amarelo", an:3, at:"É fornecer informações adicionais sobre o substantivo, tornando a descrição mais precisa e detalhada."},
    {t:"Adjetivo", qc:"azul", qn:3, qt:"São exemplos de adjetivos primitivos:", ac:"vermelho", an:3, at:"branco, alegre, feliz"},
    {t:"Artigo", qc:"amarelo", qn:4, qt:"O que é um artigo na língua portuguesa?", ac:"azul", an:4, at:"É uma palavra que precede um substantivo para indicar seu gênero (masculino ou feminino) e seu número (singular ou plural)."},
    {t:"Artigo", qc:"verde", qn:4, qt:"Quantos tipos de artigos existem?", ac:"vermelho", an:4, at:"Dois tipos: definidos e indefinidos."},
    {t:"Artigo", qc:"amarelo", qn:5, qt:"Quais são os artigos definidos?", ac:"azul", an:5, at:"o, a, os, as"},
    {t:"Artigo", qc:"verde", qn:5, qt:"Quais são os artigos indefinidos?", ac:"vermelho", an:5, at:"um, uma, uns, umas"},
    {t:"Advérbio", qc:"amarelo", qn:6, qt:"O que é um advérbio na língua portuguesa?", ac:"azul", an:6, at:"É a classe de palavra que modifica um verbo, um adjetivo ou outro advérbio, indicando tempo, lugar, modo, entre outros."},
    {t:"Advérbio", qc:"verde", qn:6, qt:"Qual é a função principal dos advérbios em uma frase?", ac:"vermelho", an:6, at:"É modificar ou acrescentar informações ao verbo, adjetivo ou advérbio."},
    {t:"Advérbio", qc:"amarelo", qn:7, qt:"Como podemos reconhecer um advérbio em uma frase?", ac:"azul", an:7, at:"Eles respondem a perguntas como \"como?\", \"quando?\", \"onde?\" e \"quanto?\""},
    {t:"Advérbio", qc:"verde", qn:7, qt:"\"Ela correu rapidamente.\" Indica advérbio de:", ac:"vermelho", an:7, at:"MODO"},
    {t:"Verbo", qc:"azul", qn:8, qt:"O que é um verbo na língua portuguesa?", ac:"verde", an:8, at:"É uma classe de palavra que indica ação, estado, processo ou fenômeno em uma frase."},
    {t:"Verbo", qc:"amarelo", qn:8, qt:"Qual é a principal função de um verbo em uma sentença?", ac:"vermelho", an:8, at:"É indicar ação, estado ou fenômeno."},
    {t:"Verbo", qc:"azul", qn:9, qt:"Quais são os três principais tipos de verbos na língua portuguesa?", ac:"vermelho", an:9, at:"Verbos regulares, verbos irregulares e verbos auxiliares."},
    {t:"Verbo", qc:"verde", qn:9, qt:"O que é conjugação verbal?", ac:"amarelo", an:9, at:"É o processo de flexionar o verbo de acordo com o tempo, modo, pessoa e número."},
    {t:"Pronome", qc:"amarelo", qn:1, qt:"O que é um pronome na língua portuguesa?", ac:"azul", an:1, at:"É uma palavra usada para substituir ou fazer referência a um substantivo, evitando sua repetição na frase."},
    {t:"Pronome", qc:"verde", qn:1, qt:"Qual é a função principal dos pronomes na gramática?", ac:"vermelho", an:1, at:"É substituir substantivos para tornar o discurso mais claro, conciso."},
    {t:"Pronome", qc:"amarelo", qn:2, qt:"Quais são os principais tipos de pronomes em português?", ac:"azul", an:2, at:"Pronomes pessoais, possessivos, demonstrativos, indefinidos, interrogativos e relativos."},
    {t:"Pronome", qc:"verde", qn:2, qt:"\"Ele\" é um exemplo de pronome:", ac:"vermelho", an:2, at:"Pessoal"},
    {t:"Preposição", qc:"verde", qn:3, qt:"O que é uma preposição na língua portuguesa?", ac:"amarelo", an:3, at:"É uma palavra que estabelece uma relação de sentido entre dois termos, indicando localização, direção, tempo, modo, posse."},
    {t:"Preposição", qc:"azul", qn:3, qt:"Qual é a principal função das preposições em uma sentença?", ac:"vermelho", an:3, at:"É conectar elementos na frase."},
    {t:"Preposição", qc:"amarelo", qn:4, qt:"Pode dar um exemplo de uma preposição de lugar?", ac:"azul", an:4, at:"\"O livro está dentro da mochila\", é um exemplo de preposição de lugar."},
    {t:"Preposição", qc:"verde", qn:4, qt:"Cite três exemplos de preposições comuns em português:", ac:"vermelho", an:4, at:"São \"em\", \"para\" e \"com\""},
    {t:"Numeral", qc:"amarelo", qn:5, qt:"O que é um numeral na língua portuguesa?", ac:"azul", an:5, at:"É uma classe de palavra usada para indicar quantidade, ordem, posição ou divisão de algo."},
    {t:"Numeral", qc:"verde", qn:5, qt:"Quais são os principais tipos de numerais em português?", ac:"vermelho", an:5, at:"São cardinais, ordinais, multiplicativos e fracionários."},
    {t:"Numeral", qc:"amarelo", qn:6, qt:"Dê um exemplo de numeral cardinal:", ac:"azul", an:6, at:"\"Havia cinco maçãs na cesta.\""},
    {t:"Numeral", qc:"verde", qn:6, qt:"O que são numerais ordinais?", ac:"vermelho", an:6, at:"São aqueles que indicam a posição relativa de algo em uma sequência, como \"primeiro\"."},
    {t:"Interjeição", qc:"amarelo", qn:7, qt:"O que é uma interjeição na língua portuguesa?", ac:"azul", an:7, at:"É usada para expressar emoções, sentimentos, reações súbitas ou estados de espírito em uma frase."},
    {t:"Interjeição", qc:"verde", qn:7, qt:"Qual é a principal função das interjeições em uma sentença?", ac:"vermelho", an:7, at:"É transmitir emoções, como surpresa, alegria, susto, tristeza, entre outras."},
    {t:"Interjeição", qc:"azul", qn:8, qt:"Dê um exemplo de uma interjeição que expressa surpresa:", ac:"verde", an:8, at:"\"Uau!\""},
    {t:"Conjunção", qc:"amarelo", qn:8, qt:"O que é uma conjunção na língua portuguesa?", ac:"vermelho", an:8, at:"É uma palavra ou grupo de palavras que serve para conectar outras palavras, frases ou orações em uma sentença."},
    {t:"Conjunção", qc:"azul", qn:9, qt:"Qual é a função principal das conjunções em uma frase?", ac:"vermelho", an:9, at:"É estabelecer relações lógicas ou coordenativas entre elementos na frase."},
    {t:"Conjunção", qc:"verde", qn:9, qt:"O que são conjunções subordinativas?", ac:"amarelo", an:9, at:"São aquelas que introduzem orações subordinadas, que dependem de uma oração principal."}
  ];

  const CORES = ['amarelo', 'azul', 'verde', 'vermelho'];
  const ACOES = ['pula', 'reverso', 'mais2'];
  const TOTAL_CARTAS = 108;

  // regras padrão — todas configuráveis na criação da partida/sala
  const REGRAS_PADRAO = {
    tempoContestacao: 6000,   // ms para contestar uma Relâmpago
    respiro: 1500,            // ms em que ninguém joga por cima de uma pergunta/resposta recém-caída
    tempoBater: 8000,         // ms para escolher a carta depois de "bater na mesa"
    tempoVez: 0,              // ms por vez para humanos (0 = sem limite)
    maoInicial: 7,
    juiz: 'contestacao',      // 'contestacao' (os jogadores contestam) | 'automatico' (o app confere)
    empilhar: false,          // +2 em cima de +2, +4 em cima de qualquer +
    varias: false,            // jogar várias cartas iguais (mesmo número ou símbolo) de uma vez
    seteZero: false,          // 7 troca de mão com alguém, 0 gira todas as mãos
    bonus: 0,                 // cartas bônus depois de uma Relâmpago certa (0 = à vontade, enquanto combinar)
    baralhoFixo: false        // usa as cores/números das cartas impressas (sem sorteio)
  };

  const NIVEIS = {
    facil:   { saber: 0.40, pegar: 0.30, gritar: 0.60, contestaErrada: 0.30, contestaCerta: 0.10, blefe: 0.04, esperto: 0.3, tardio: 0.35, empilha: 0.5 },
    normal:  { saber: 0.70, pegar: 0.55, gritar: 0.85, contestaErrada: 0.60, contestaCerta: 0.06, blefe: 0.05, esperto: 0.7, tardio: 0.5, empilha: 0.85 },
    dificil: { saber: 0.93, pegar: 0.80, gritar: 0.97, contestaErrada: 0.88, contestaCerta: 0.02, blefe: 0.03, esperto: 1.0, tardio: 0.7, empilha: 1 }
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function embaralhar(a, rng) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // As 76 "vagas" de número de um UNO oficial: em cada cor, um 0 e dois de cada 1..9.
  function vagasNumericas() {
    const v = [];
    CORES.forEach(cor => { v.push({ cor, numero: 0 }); for (let n = 1; n <= 9; n++) { v.push({ cor, numero: n }); v.push({ cor, numero: n }); } });
    return v;
  }

  // No modo Gramática, cada partida sorteia cor e número das perguntas/respostas.
  // Assim o par NÃO tem pista visual (mesmo número, cor combinando…): só acha quem sabe.
  // A distribuição de cores/números continua idêntica à de um UNO normal.
  function construirBaralho(modo, rng, fixo) {
    rng = rng || Math.random;
    const b = []; let id = 0;
    if (modo === 'gramatica') {
      const vagas = fixo ? null : embaralhar(vagasNumericas(), rng);
      let k = 0;
      PARES.forEach((p, i) => {
        const vq = fixo ? { cor: p.qc, numero: p.qn } : vagas[k++];
        const va = fixo ? { cor: p.ac, numero: p.an } : vagas[k++];
        b.push({ id: id++, cor: vq.cor, tipo: 'numero', numero: vq.numero, texto: p.qt, papel: 'pergunta', par: i, topico: p.t });
        b.push({ id: id++, cor: va.cor, tipo: 'numero', numero: va.numero, texto: p.at, papel: 'resposta', par: i, topico: p.t });
      });
    } else {
      vagasNumericas().forEach(v => b.push({ id: id++, cor: v.cor, tipo: 'numero', numero: v.numero }));
    }
    CORES.forEach(cor => {
      for (let k = 0; k < 2; k++) ACOES.forEach(tipo => b.push({ id: id++, cor, tipo }));
    });
    for (let k = 0; k < 4; k++) {
      b.push({ id: id++, cor: 'preto', tipo: 'coringa' });
      b.push({ id: id++, cor: 'preto', tipo: 'mais4' });
    }
    return b;
  }

  function combina(carta, topo, cor) {
    if (carta.cor === 'preto') return true;
    if (carta.cor === cor) return true;
    if (topo.tipo === 'numero') return carta.tipo === 'numero' && carta.numero === topo.numero;
    return carta.tipo === topo.tipo;
  }
  // duas cartas "iguais" para jogar juntas: mesmo número, ou mesmo símbolo colorido
  function mesmoTipo(a, b) {
    if (a.cor === 'preto' || b.cor === 'preto') return false;
    if (a.tipo === 'numero') return b.tipo === 'numero' && a.numero === b.numero;
    return a.tipo === b.tipo;
  }

  function ehPerguntaResposta(c) { return !!c && c.tipo === 'numero' && typeof c.par === 'number'; }
  function formamPar(a, b) { return ehPerguntaResposta(a) && ehPerguntaResposta(b) && a.par === b.par && a.papel !== b.papel; }
  // o texto do par certo de uma carta (para ensinar depois que a jogada é resolvida)
  function textoDoPar(c) {
    if (!ehPerguntaResposta(c)) return null;
    const p = PARES[c.par];
    return c.papel === 'pergunta' ? p.at : p.qt;
  }

  class Game {
    constructor(o) {
      this.modo = o.modo === 'classico' ? 'classico' : 'gramatica';
      this.rng = o.seed != null ? mulberry32(o.seed) : Math.random;
      const r = Object.assign({}, REGRAS_PADRAO, o.regras || {});
      if (o.tempoContestacao != null) r.tempoContestacao = o.tempoContestacao;
      r.maoInicial = Math.max(3, Math.min(10, r.maoInicial | 0 || 7));
      if (r.juiz !== 'automatico') r.juiz = 'contestacao';
      this.regras = r;
      this.tempoContestacao = r.tempoContestacao;
      this.ritmoBots = o.ritmoBots != null ? o.ritmoBots : 1;
      this.agora = o.agora || 0;
      this.jogadores = o.jogadores.map(j => ({ nome: j.nome, bot: !!j.bot, nivel: NIVEIS[j.nivel] ? j.nivel : 'normal', avatar: j.avatar }));
      const n = this.jogadores.length;
      if (n < 2 || n > 10) throw new Error('2 a 10 jogadores');

      this.monte = embaralhar(construirBaralho(this.modo, this.rng, r.baralhoFixo), this.rng);
      this.maos = this.jogadores.map(() => []);
      for (let k = 0; k < r.maoInicial; k++) for (let j = 0; j < n; j++) this.maos[j].push(this.monte.pop());
      // primeira carta da mesa: sempre um número (regra simplificada de abertura)
      let i = this.monte.length - 1;
      while (this.monte[i].tipo !== 'numero') i--;
      const topo = this.monte.splice(i, 1)[0];
      this.descarte = [topo];
      this.cor = topo.cor;
      this.vez = o.primeiro != null ? o.primeiro % n : Math.floor(this.rng() * n);
      this.sentido = 1;
      this.fase = 'jogar';          // jogar | reserva | contestacao | bonus | fim
      this.comprou = false;         // jogador da vez já comprou neste turno
      this.compradaId = null;       // id da carta comprada (só ela pode ser jogada)
      this.acumulado = 0;           // +2/+4 empilhados esperando alguém comprar
      this.contestacao = null;
      this.reserva = null;          // quem "bateu na mesa" para soltar uma Relâmpago
      this.bonus = null;
      this.combo = 0;               // Relâmpagos certas seguidas
      this.vencedor = null;
      this.gritouUno = this.jogadores.map(() => false);
      this.vulneravel = null;       // índice de quem ficou com 1 carta sem gritar UNO
      this.idVulneravel = 0;
      this.idContestacao = 0;
      this.idReserva = 0;
      this.respiroAte = 0;
      this.vezDesde = this.agora;
      this.eventos = [];
      this.seq = 0;
      this.versao = 0;
      this.decisoes = {};
      this._marcarRespiro();
      this._emitir({ tipo: 'inicio', topo: topo, vez: this.vez });
    }

    /* ------------------------- utilidades ------------------------- */
    _embaralhar(a) { return embaralhar(a, this.rng); }
    _emitir(ev) {
      ev.seq = ++this.seq;
      ev.t = this.agora;
      this.eventos.push(ev);
      if (this.eventos.length > 80) this.eventos.splice(0, this.eventos.length - 80);
      this.versao++;
    }
    _prox(de, passos) {
      const n = this.jogadores.length;
      return (((de + this.sentido * passos) % n) + n) % n;
    }
    _avancar(passos) {
      this.vez = this._prox(this.vez, passos);
      this.comprou = false;
      this.compradaId = null;
      this.vezDesde = this.agora;
    }
    _voltarAJogar() { this.fase = 'jogar'; this.vezDesde = Math.max(this.vezDesde, this.agora); }
    topo() { return this.descarte[this.descarte.length - 1]; }
    totalCartas() { return this.monte.length + this.descarte.length + this.maos.reduce((s, m) => s + m.length, 0); }
    _marcarRespiro() {
      if (this.modo === 'gramatica' && this.regras.respiro > 0 && ehPerguntaResposta(this.topo())) this.respiroAte = this.agora + this.regras.respiro;
      else this.respiroAte = 0;
    }
    respirando() { return this.agora < this.respiroAte; }

    _comprarUma() {
      if (this.monte.length === 0) {
        if (this.descarte.length <= 1) return null;
        const topo = this.descarte.pop();
        this.monte = this._embaralhar(this.descarte);
        this.descarte = [topo];
        this._emitir({ tipo: 'reembaralhar' });
      }
      return this.monte.pop() || null;
    }
    _dar(j, qtd, motivo) {
      const cartas = [];
      for (let k = 0; k < qtd; k++) {
        const c = this._comprarUma();
        if (!c) break;
        this.maos[j].push(c);
        cartas.push(c);
      }
      if (this.maos[j].length > 2) this.gritouUno[j] = false;
      if (this.vulneravel === j && this.maos[j].length !== 1) this.vulneravel = null;
      this._emitir({ tipo: 'compra', j, cartas, motivo: motivo || 'compra' });
      return cartas;
    }
    _fecharJanelaUno(ator) {
      if (this.vulneravel !== null && this.vulneravel !== ator) this.vulneravel = null;
    }
    _depoisDeDescartar(j) {
      if (this.maos[j].length === 0 && this.vulneravel === j) this.vulneravel = null;
      if (this.maos[j].length === 1) {
        if (!this.gritouUno[j]) { this.vulneravel = j; this.idVulneravel++; }
        this.gritouUno[j] = false;
      }
    }
    _vitoria(j) {
      this.vencedor = j;
      this.vulneravel = null;
      this.fase = 'fim';
      this.contestacao = null;
      this.reserva = null;
      this.bonus = null;
      this._emitir({ tipo: 'vitoria', j });
    }

    podeJogar(j, carta) {
      if (this.acumulado > 0) {
        // com +2/+4 empilhados, só dá pra responder com outro "+"
        if (carta.tipo === 'mais4') return true;
        return carta.tipo === 'mais2' && this.topo().tipo === 'mais2';
      }
      if (!combina(carta, this.topo(), this.cor)) return false;
      if (carta.tipo === 'mais4') {
        // regra oficial: +4 só quando você não tem nenhuma carta da cor da mesa
        return !this.maos[j].some(c => c.id !== carta.id && c.cor === this.cor);
      }
      return true;
    }

    // efeito das cartas jogadas na própria vez (k = quantas iguais foram juntas)
    _efeitoNaVez(carta, k, alvo) {
      k = k || 1;
      const n = this.jogadores.length;
      if (carta.tipo === 'pula') {
        for (let i = 1; i <= k; i++) this._emitir({ tipo: 'pulou', j: this._prox(this.vez, i) });
        this._avancar(k + 1);
      } else if (carta.tipo === 'reverso') {
        if (n === 2) { this._emitir({ tipo: 'pulou', j: this._prox(this.vez, 1) }); this._avancar(2); return; }
        if (k % 2 === 1) { this.sentido *= -1; this._emitir({ tipo: 'inverteu', sentido: this.sentido }); }
        this._avancar(1);
      } else if (carta.tipo === 'mais2' || carta.tipo === 'mais4') {
        const qtd = (carta.tipo === 'mais2' ? 2 : 4) * k;
        if (this.regras.empilhar) {
          this.acumulado += qtd;
          this._emitir({ tipo: 'acumulou', total: this.acumulado, j: this._prox(this.vez, 1) });
          this._avancar(1);
        } else {
          const vit = this._prox(this.vez, 1);
          this._dar(vit, qtd, carta.tipo);
          this._emitir({ tipo: 'pulou', j: vit });
          this._avancar(2);
        }
      } else {
        if (this.regras.seteZero && carta.tipo === 'numero' && (carta.numero === 7 || carta.numero === 0)) this._seteZero(carta.numero, alvo);
        this._avancar(1);
      }
    }

    _seteZero(num, alvo) {
      const n = this.jogadores.length, j = this.vez;
      if (num === 7) {
        if (typeof alvo !== 'number' || alvo === j || alvo < 0 || alvo >= n) alvo = this._menorMao(j);
        const t = this.maos[j]; this.maos[j] = this.maos[alvo]; this.maos[alvo] = t;
        this._emitir({ tipo: 'trocou', j, alvo });
      } else {
        const velhas = this.maos.slice();
        for (let i = 0; i < n; i++) this.maos[this._prox(i, 1)] = velhas[i];
        this._emitir({ tipo: 'girou', sentido: this.sentido });
      }
      this.gritouUno = this.jogadores.map(() => false);
      this.vulneravel = null;
    }
    _menorMao(j) {
      let m = -1;
      for (let i = 0; i < this.jogadores.length; i++) if (i !== j && (m < 0 || this.maos[i].length < this.maos[m].length)) m = i;
      return m;
    }

    /* ---------------------------- ações ---------------------------- */
    act(j, a) {
      if (this.fase === 'fim') return this._erro('A partida acabou.');
      if (typeof j !== 'number' || j < 0 || j >= this.jogadores.length || !a) return this._erro('Jogador inválido.');
      switch (a.tipo) {
        case 'jogar': return this._jogar(j, a);
        case 'comprar': return this._comprar(j);
        case 'passar': return this._passar(j);
        case 'uno': return this._uno(j);
        case 'pegar': return this._pegar(j);
        case 'bater': return this._bater(j, a);
        case 'desistir': return this._desistir(j);
        case 'relampago': return this._relampago(j, a);
        case 'contestar': return this._contestar(j);
        case 'bonusJogar': return this._bonusJogar(j, a);
        case 'bonusPular': return this._bonusPular(j);
        default: return this._erro('Ação desconhecida.');
      }
    }
    _erro(msg) { return { ok: false, erro: msg }; }
    _ok() { return { ok: true }; }
    _achar(j, id) { return this.maos[j].findIndex(c => c.id === id); }
    _msgFase() {
      if (this.fase === 'reserva') return 'Alguém bateu na mesa — espere a Relâmpago.';
      return 'Espere a jogada em andamento terminar.';
    }

    _jogar(j, a) {
      if (this.fase !== 'jogar') return this._erro(this._msgFase());
      if (this.vez !== j) return this._erro('Não é a sua vez.');
      if (this.respirando()) return this._erro('Calma! Dê um segundinho pra todo mundo ler a carta.');
      const ids = Array.isArray(a.ids) && a.ids.length ? a.ids : [a.id];
      if (ids.length > 1 && !this.regras.varias) return this._erro('Jogar várias de uma vez está desligado nesta partida.');
      if (new Set(ids).size !== ids.length) return this._erro('Carta repetida.');
      const cartas = [];
      for (const id of ids) { const i = this._achar(j, id); if (i < 0) return this._erro('Carta não está na sua mão.'); cartas.push(this.maos[j][i]); }
      const carta = cartas[0];
      if (this.comprou && (ids.length > 1 || this.compradaId !== carta.id)) return this._erro('Depois de comprar, só dá pra jogar a carta comprada.');
      if (!this.podeJogar(j, carta)) {
        if (this.acumulado > 0) return this._erro('Tem +' + this.acumulado + ' acumulado: responda com +2/+4 ou compre.');
        if (carta.tipo === 'mais4' && combina(carta, this.topo(), this.cor)) return this._erro('+4 só quando você não tem a cor da mesa.');
        return this._erro('Essa carta não combina com a mesa.');
      }
      if (cartas.slice(1).some(c => !mesmoTipo(carta, c))) return this._erro('Só dá pra jogar juntas cartas com o mesmo número ou símbolo.');
      const ultima = cartas[cartas.length - 1];
      if (ultima.cor === 'preto' && CORES.indexOf(a.cor) < 0) return this._erro('Escolha uma cor.');
      cartas.forEach(c => { this.maos[j].splice(this._achar(j, c.id), 1); this.descarte.push(c); });
      this.cor = ultima.cor === 'preto' ? a.cor : ultima.cor;
      this.combo = 0;
      this._fecharJanelaUno(j);
      this._depoisDeDescartar(j);
      cartas.forEach((c, k) => this._emitir({ tipo: 'jogou', j, carta: c, cor: this.cor, junto: k > 0 }));
      if (this.maos[j].length === 0) { this._vitoria(j); return this._ok(); }
      this._efeitoNaVez(ultima, cartas.length, a.alvo);
      this._marcarRespiro();
      return this._ok();
    }

    _comprar(j) {
      if (this.fase !== 'jogar') return this._erro(this._msgFase());
      if (this.vez !== j) return this._erro('Não é a sua vez.');
      if (this.acumulado > 0) {
        const qtd = this.acumulado;
        this.acumulado = 0;
        this._fecharJanelaUno(j);
        this._dar(j, qtd, 'acumulado');
        this._emitir({ tipo: 'pulou', j });
        this._avancar(1);
        return this._ok();
      }
      if (this.respirando()) return this._erro('Calma! Dê um segundinho pra todo mundo ler a carta.');
      if (this.comprou) return this._erro('Você já comprou neste turno.');
      this._fecharJanelaUno(j);
      const cartas = this._dar(j, 1, 'compra');
      this.comprou = true;
      this.compradaId = cartas.length ? cartas[0].id : null;
      return this._ok();
    }

    _passar(j) {
      if (this.fase !== 'jogar') return this._erro(this._msgFase());
      if (this.vez !== j) return this._erro('Não é a sua vez.');
      if (!this.comprou) return this._erro('Compre uma carta antes de passar.');
      this._emitir({ tipo: 'passou', j });
      this._avancar(1);
      return this._ok();
    }

    _uno(j) {
      const n = this.maos[j].length;
      if (n === 2 && !this.gritouUno[j]) { this.gritouUno[j] = true; this._emitir({ tipo: 'uno', j }); return this._ok(); }
      if (n === 1 && this.vulneravel === j) { this.vulneravel = null; this._emitir({ tipo: 'uno', j, atrasado: true }); return this._ok(); }
      if (n === 2) return this._ok();
      return this._erro('UNO! só com 2 cartas (antes de jogar) ou 1 carta.');
    }

    _pegar(j) {
      if (this.fase !== 'jogar' && this.fase !== 'bonus') return this._erro('Agora não dá.');
      const alvo = this.vulneravel;
      if (alvo === null || alvo === j) return this._erro('Ninguém esqueceu o UNO.');
      this.vulneravel = null;
      this._emitir({ tipo: 'pegou', j, alvo });
      this._dar(alvo, 2, 'esqueceuUno');
      return this._ok();
    }

    _podeRelampago(j) {
      if (this.modo !== 'gramatica') return 'Relâmpago só existe no modo Gramática.';
      if (!ehPerguntaResposta(this.topo())) return 'A carta da mesa não é pergunta nem resposta.';
      if (!this.maos[j].some(ehPerguntaResposta)) return 'Você não tem pergunta nem resposta na mão.';
      return null;
    }

    // "bater na mesa": congela a mesa para você escolher sua Relâmpago com calma
    _bater(j, a) {
      if (this.fase !== 'jogar') return this._erro(this._msgFase());
      const e = this._podeRelampago(j); if (e) return this._erro(e);
      if (a.contra != null && a.contra !== this.topo().id) return this._erro('A carta da mesa mudou — confira de novo.');
      this.fase = 'reserva';
      this.reserva = { id: ++this.idReserva, autor: j, contra: this.topo().id, prazo: this.agora + this.regras.tempoBater };
      this._emitir({ tipo: 'bateu', j });
      return this._ok();
    }
    _desistir(j, tempo) {
      if (this.fase !== 'reserva' || this.reserva.autor !== j) return this._erro('Você não bateu na mesa.');
      this.reserva = null;
      this._voltarAJogar();
      this._emitir({ tipo: 'desistiu', j, tempo: !!tempo });
      this._dar(j, 1, 'bater');
      return this._ok();
    }

    _relampago(j, a) {
      if (this.fase === 'reserva') {
        if (this.reserva.autor !== j) return this._erro('Outra pessoa bateu na mesa primeiro.');
      } else if (this.fase !== 'jogar') return this._erro(this._msgFase());
      const e = this._podeRelampago(j); if (e) return this._erro(e);
      const topo = this.topo();
      if (a.contra != null && a.contra !== topo.id) return this._erro('A carta da mesa mudou — confira de novo.');
      const i = this._achar(j, a.id);
      if (i < 0) return this._erro('Carta não está na sua mão.');
      const carta = this.maos[j][i];
      if (!ehPerguntaResposta(carta)) return this._erro('Só cartas de pergunta ou resposta.');
      this.reserva = null;
      this.maos[j].splice(i, 1);
      this.descarte.push(carta);
      const corAntes = this.cor;
      this.cor = carta.cor;
      this._fecharJanelaUno(j);
      this._depoisDeDescartar(j);
      this.contestacao = {
        id: ++this.idContestacao, autor: j, carta, contra: topo, corAntes,
        eraVez: this.vez === j, prazo: this.agora + this.tempoContestacao
      };
      this._emitir({ tipo: 'relampago', j, carta, contra: topo });
      if (this.regras.juiz === 'automatico') {
        const certa = formamPar(carta, topo);
        this._emitir({ tipo: 'juiz', j, certa, carta, contra: topo });
        if (certa) this._relampagoValeu();
        else this._relampagoDerrubada(null);
        return this._ok();
      }
      this.fase = 'contestacao';
      return this._ok();
    }

    _relampagoDerrubada(acusador) {
      const c = this.contestacao;
      // a carta volta, o autor compra 2
      this.descarte.pop();
      this.maos[c.autor].push(c.carta);
      this.cor = c.corAntes;
      if (this.vulneravel === c.autor) this.vulneravel = null;
      this.contestacao = null;
      this.combo = 0;
      this._voltarAJogar();
      this._dar(c.autor, 2, 'contestacao');
      if (acusador != null) {
        // quem contestou certo ganha a vez
        this.vez = acusador; this.comprou = false; this.compradaId = null; this.vezDesde = this.agora;
        this._emitir({ tipo: 'vezDe', j: acusador });
      } else if (c.eraVez) {
        // errou na própria vez: perde a vez
        this._avancar(1);
      }
      this._marcarRespiro();
    }

    _contestar(j) {
      if (this.fase !== 'contestacao') return this._erro('Não há Relâmpago para contestar.');
      const c = this.contestacao;
      if (c.autor === j) return this._erro('Você não pode contestar a própria jogada.');
      const certa = formamPar(c.carta, c.contra);
      this._emitir({ tipo: 'contestou', j, autor: c.autor, acusadorCerto: !certa, carta: c.carta, contra: c.contra });
      if (!certa) this._relampagoDerrubada(j);
      else { this._dar(j, 2, 'contestacao'); this._relampagoValeu(); }
      return this._ok();
    }

    _relampagoValeu() {
      const c = this.contestacao;
      this.contestacao = null;
      this.combo++;
      if (this.maos[c.autor].length === 0) { this._vitoria(c.autor); return; }
      this.fase = 'bonus';
      const nb = this.regras.bonus | 0;
      this.bonus = { j: c.autor, eraVez: c.eraVez, restam: nb > 0 ? nb : Infinity, ultima: null, jogadas: 0 };
      this._emitir({ tipo: 'bonus', j: c.autor, combo: this.combo });
    }

    _bonusJogar(j, a) {
      if (this.fase !== 'bonus' || this.bonus.j !== j) return this._erro('Não é a sua carta bônus.');
      const i = this._achar(j, a.id);
      if (i < 0) return this._erro('Carta não está na sua mão.');
      const carta = this.maos[j][i];
      if (!this.podeJogar(j, carta)) return this._erro('A carta bônus precisa ter a mesma cor ou o mesmo número.');
      if (carta.cor === 'preto' && CORES.indexOf(a.cor) < 0) return this._erro('Escolha uma cor.');
      this.maos[j].splice(i, 1);
      this.descarte.push(carta);
      this.cor = carta.cor === 'preto' ? a.cor : carta.cor;
      this._fecharJanelaUno(j);
      this._depoisDeDescartar(j);
      this._emitir({ tipo: 'jogou', j, carta, cor: this.cor, bonus: true });
      if (this.maos[j].length === 0) { this._vitoria(j); return this._ok(); }
      const b = this.bonus;
      b.restam--; b.ultima = carta; b.alvo = a.alvo; b.jogadas++;
      // sequência: continua enquanto tiver bônus e carta que combine (só vale o efeito da última)
      if (b.restam > 0 && this.maos[j].some(c => this.podeJogar(j, c))) { this._emitir({ tipo: 'bonusMais', j, restam: b.restam }); return this._ok(); }
      this._fimBonus(carta, a.alvo);
      return this._ok();
    }

    _bonusPular(j) {
      if (this.fase !== 'bonus' || this.bonus.j !== j) return this._erro('Não é a sua carta bônus.');
      const b = this.bonus;
      this._emitir({ tipo: 'bonusPulado', j, parou: b.jogadas > 0 });
      this._fimBonus(b.ultima, b.alvo);
      return this._ok();
    }

    _fimBonus(carta, alvo) {
      const b = this.bonus;
      this.bonus = null;
      this._voltarAJogar();
      if (b.eraVez) {
        // a Relâmpago foi feita na própria vez: conta como a jogada do turno
        if (carta) this._efeitoNaVez(carta, 1, alvo); else this._avancar(1);
        this._marcarRespiro();
        return;
      }
      // fora da vez: a vez continua com quem estava jogando; efeitos caem nele
      if (carta) {
        const dono = this.vez;
        if (carta.tipo === 'pula') {
          this._emitir({ tipo: 'pulou', j: dono });
          this._avancar(1);
        } else if (carta.tipo === 'mais2' || carta.tipo === 'mais4') {
          this._dar(dono, carta.tipo === 'mais2' ? 2 : 4, carta.tipo);
          this._emitir({ tipo: 'pulou', j: dono });
          this._avancar(1);
        } else if (carta.tipo === 'reverso') {
          this.sentido *= -1;
          this._emitir({ tipo: 'inverteu', sentido: this.sentido });
        }
      }
      this.vezDesde = this.agora;
      this._marcarRespiro();
    }

    /* --------------------------- relógio --------------------------- */
    update(agora) {
      if (agora != null) this.agora = agora;
      let feitas = 0;
      for (let guard = 0; guard < 10; guard++) {
        if (this.fase === 'fim') break;
        if (this.fase === 'contestacao' && this.agora >= this.contestacao.prazo) {
          this._emitir({ tipo: 'semContestacao', j: this.contestacao.autor });
          this._relampagoValeu();
          feitas++; continue;
        }
        if (this.fase === 'reserva' && this.agora >= this.reserva.prazo) {
          this._desistir(this.reserva.autor, true);
          feitas++; continue;
        }
        if (this._tempoDaVezAcabou()) {
          const j = this.vez;
          this._emitir({ tipo: 'tempoEsgotado', j });
          if (this.acumulado > 0) this._comprar(j);
          else { if (!this.comprou) { this._fecharJanelaUno(j); this._dar(j, 1, 'compra'); } this._emitir({ tipo: 'passou', j }); this._avancar(1); this._marcarRespiro(); }
          feitas++; continue;
        }
        const plano = this._proximoPlanoBot();
        if (!plano || plano.em > this.agora) break;
        plano.fazer();
        feitas++;
      }
      return feitas;
    }
    _tempoDaVezAcabou() {
      const t = this.regras.tempoVez;
      if (!t || this.fase !== 'jogar' || this.jogadores[this.vez].bot) return false;
      return this.agora >= Math.max(this.vezDesde, this.respiroAte) + t;
    }
    // quanto falta da vez (para mostrar o relógio)
    restanteDaVez() {
      const t = this.regras.tempoVez;
      if (!t || this.fase !== 'jogar' || this.jogadores[this.vez].bot) return null;
      return Math.max(0, Math.max(this.vezDesde, this.respiroAte) + t - this.agora);
    }

    /* ---------------------------- robôs ---------------------------- */
    _decidir(chave, fn) {
      if (!(chave in this.decisoes)) {
        this.decisoes[chave] = fn();
        const ks = Object.keys(this.decisoes);
        if (ks.length > 400) ks.slice(0, 200).forEach(k => delete this.decisoes[k]);
      }
      return this.decisoes[chave];
    }
    _atraso(min, max) { return this.agora + (min + this.rng() * (max - min)) * this.ritmoBots; }

    _proximoPlanoBot() {
      if (this.fase === 'fim' || this.fase === 'reserva') return null;
      const planos = [];
      const n = this.jogadores.length;
      for (let j = 0; j < n; j++) {
        if (!this.jogadores[j].bot) continue;
        const p = this._planoDoBot(j);
        if (p) planos.push(p);
      }
      if (!planos.length) return null;
      planos.sort((a, b) => a.em - b.em);
      return planos[0];
    }

    _planoDoBot(j) {
      const nv = NIVEIS[this.jogadores[j].nivel];

      if (this.fase === 'contestacao') {
        const c = this.contestacao;
        if (c.autor === j) return null;
        const d = this._decidir('ct' + c.id + ':' + j, () => {
          const certa = formamPar(c.carta, c.contra);
          const vai = this.rng() < (certa ? nv.contestaCerta : nv.contestaErrada);
          return { vai, em: this._atraso(900, Math.max(1100, this.tempoContestacao * 0.8)) };
        });
        if (!d.vai) return null;
        return { em: d.em, fazer: () => this.act(j, { tipo: 'contestar' }) };
      }

      if (this.fase === 'bonus') {
        if (this.bonus.j !== j) return this._planoPegar(j, nv);
        const d = this._decidir('bn' + this.seq + ':' + j, () => ({ em: this._atraso(700, 1200) }));
        return { em: d.em, fazer: () => this._botBonus(j, nv) };
      }

      // fase jogar
      const planos = [];
      const pg = this._planoPegar(j, nv);
      if (pg) planos.push(pg);

      if (this.vulneravel === j) {
        const d = this._decidir('tarde' + this.idVulneravel + ':' + j, () => ({ vai: this.rng() < nv.tardio, em: this._atraso(1200, 3200) }));
        if (d.vai) planos.push({ em: d.em, fazer: () => this.act(j, { tipo: 'uno' }) });
      }

      const rel = this._planoRelampago(j, nv);
      if (rel && this.vez !== j) planos.push(rel);

      if (this.vez === j) {
        const d = this._decidir('vez' + this.versaoDaVez() + ':' + j, () => ({ em: this.modo === 'gramatica' ? this._atraso(1500, 2700) : this._atraso(900, 1600) }));
        planos.push({ em: Math.max(d.em, this.respiroAte), fazer: () => this._botTurno(j, nv, rel) });
      }
      if (!planos.length) return null;
      planos.sort((a, b) => a.em - b.em);
      return planos[0];
    }

    versaoDaVez() { return this.vez + '-' + this.seqVez(); }
    seqVez() {
      // muda sempre que a vez muda de dono ou a mesa muda — força o robô a "pensar" de novo
      return this.topo().id + '-' + this.comprou + '-' + this.maos[this.vez].length + '-' + this.cor + '-' + this.acumulado;
    }

    _planoPegar(j, nv) {
      const alvo = this.vulneravel;
      if (alvo === null || alvo === j) return null;
      const d = this._decidir('pg' + this.idVulneravel + ':' + j, () => ({ vai: this.rng() < nv.pegar, em: this._atraso(900, 2800) }));
      if (!d.vai) return null;
      return { em: d.em, fazer: () => this.act(j, { tipo: 'pegar' }) };
    }

    _planoRelampago(j, nv) {
      if (this.modo !== 'gramatica' || this.fase !== 'jogar') return null;
      const topo = this.topo();
      if (!ehPerguntaResposta(topo)) return null;
      const d = this._decidir('rl' + topo.id + ':' + this.idContestacao + ':' + j, () => {
        const par = this.maos[j].find(c => formamPar(c, topo));
        // ler e achar o par leva tempo: perto do "respiro" para quem sabe muito, mais devagar para quem sabe pouco
        if (par && this.rng() < nv.saber) { const ler = 900 + (1 - nv.saber) * 2600; return { id: par.id, em: this._atraso(ler, ler + 900) }; }
        const blefes = this.maos[j].filter(c => ehPerguntaResposta(c) && c.papel !== topo.papel && c.par !== topo.par);
        if (blefes.length && this.rng() < nv.blefe) return { id: blefes[Math.floor(this.rng() * blefes.length)].id, em: this._atraso(2000, 4200) };
        return null;
      });
      if (!d || this._achar(j, d.id) < 0) return null;
      return { em: d.em, id: d.id, fazer: () => { this._talvezGritar(j, nv); return this.act(j, { tipo: 'relampago', id: d.id }); } };
    }

    _talvezGritar(j, nv, quantas) {
      if (this.maos[j].length - (quantas || 1) !== 1 || this.gritouUno[j]) return;
      const d = this._decidir('gr' + this.seq + ':' + j, () => this.rng() < nv.gritar);
      if (d) this.act(j, { tipo: 'uno' });
    }

    _corPreferida(j) {
      const cont = { amarelo: 0, azul: 0, verde: 0, vermelho: 0 };
      this.maos[j].forEach(c => { if (c.cor !== 'preto') cont[c.cor]++; });
      let melhor = CORES[Math.floor(this.rng() * 4)], m = -1;
      CORES.forEach(c => { if (cont[c] > m) { m = cont[c]; melhor = c; } });
      return m > 0 ? melhor : CORES[Math.floor(this.rng() * 4)];
    }

    _escolherCarta(j, nv, candidatas, vitima) {
      if (!candidatas.length) return null;
      if (this.rng() > nv.esperto) return candidatas[Math.floor(this.rng() * candidatas.length)];
      const ameaca = vitima != null && this.maos[vitima].length <= 2;
      const pontos = c => {
        let p = 0;
        if (c.cor === 'preto') p -= 30;                // guarda coringas
        if (ameaca && (c.tipo === 'mais2' || c.tipo === 'mais4' || c.tipo === 'pula')) p += 60;
        if (c.tipo === 'mais4' && ameaca) p += 20;
        if (c.tipo !== 'numero' && c.cor !== 'preto') p += 5;
        if (c.tipo === 'numero') p += c.numero * 0.5;
        const mesmaCor = this.maos[j].filter(x => x.cor === c.cor).length;
        p += mesmaCor * 2;
        if (this.regras.varias) p += this.maos[j].filter(x => x.id !== c.id && mesmoTipo(c, x)).length * 6;
        return p + this.rng();
      };
      return candidatas.slice().sort((a, b) => pontos(b) - pontos(a))[0];
    }

    _botTurno(j, nv, rel) {
      if (this.vez !== j || this.fase !== 'jogar') return;
      if (rel && !this.comprou && !this.acumulado) { rel.fazer(); return; }
      const mao = this.maos[j];
      if (this.comprou) {
        const c = mao.find(x => x.id === this.compradaId);
        if (c && this.podeJogar(j, c)) {
          this._talvezGritar(j, nv);
          this.act(j, { tipo: 'jogar', id: c.id, cor: this._corPreferida(j), alvo: this._menorMao(j) });
        } else {
          this.act(j, { tipo: 'passar' });
        }
        return;
      }
      const jogaveis = mao.filter(c => this.podeJogar(j, c));
      if (!jogaveis.length || (this.acumulado && this.rng() > nv.empilha)) { this.act(j, { tipo: 'comprar' }); return; }
      const c = this._escolherCarta(j, nv, jogaveis, this._prox(j, 1));
      let ids = [c.id];
      if (this.regras.varias && !this.acumulado) ids = ids.concat(mao.filter(x => x.id !== c.id && mesmoTipo(c, x)).map(x => x.id));
      this._talvezGritar(j, nv, ids.length);
      const r = this.act(j, { tipo: 'jogar', id: c.id, ids, cor: this._corPreferida(j), alvo: this._menorMao(j) });
      if (!r.ok) this.act(j, { tipo: 'comprar' });
    }

    _botBonus(j, nv) {
      if (this.fase !== 'bonus' || this.bonus.j !== j) return;
      const jogaveis = this.maos[j].filter(c => this.podeJogar(j, c));
      const alvo = this.bonus.eraVez ? this._prox(j, 1) : this.vez;
      const c = this._escolherCarta(j, nv, jogaveis, alvo);
      if (!c || (c.cor === 'preto' && this.maos[j].length > 3 && this.rng() < (this.bonus.jogadas ? 0.9 : 0.6))) { this.act(j, { tipo: 'bonusPular' }); return; }
      this._talvezGritar(j, nv);
      this.act(j, { tipo: 'bonusJogar', id: c.id, cor: this._corPreferida(j), alvo: this._menorMao(j) });
    }

    /* ----------------------------- vista ----------------------------- */
    vista(j, desde) {
      desde = desde || 0;
      const mao = j != null && j >= 0 ? this.maos[j] : [];
      const topo = this.topo();
      const minhaVez = this.vez === j && this.fase === 'jogar';
      let jogaveis = [];
      if (minhaVez) {
        jogaveis = mao.filter(c => (!this.comprou || c.id === this.compradaId) && this.podeJogar(j, c)).map(c => c.id);
      } else if (this.fase === 'bonus' && this.bonus.j === j) {
        jogaveis = mao.filter(c => this.podeJogar(j, c)).map(c => c.id);
      }
      const ev = this.eventos.filter(e => e.seq > desde).map(e => {
        if (e.tipo === 'compra' && e.j !== j) return { seq: e.seq, tipo: 'compra', j: e.j, qtd: e.cartas.length, motivo: e.motivo };
        if (e.tipo === 'compra') return { seq: e.seq, tipo: 'compra', j: e.j, qtd: e.cartas.length, cartas: e.cartas, motivo: e.motivo };
        return e;
      });
      const rv = this.restanteDaVez();
      return {
        modo: this.modo,
        regras: this.regras,
        eu: j,
        nomes: this.jogadores.map(p => p.nome),
        bots: this.jogadores.map(p => p.bot),
        avatares: this.jogadores.map(p => p.avatar),
        qtds: this.maos.map(m => m.length),
        vez: this.vez,
        sentido: this.sentido,
        cor: this.cor,
        topo,
        pilha: this.descarte.slice(-5),
        monte: this.monte.length,
        fase: this.fase,
        comprou: minhaVez ? this.comprou : false,
        compradaId: minhaVez ? this.compradaId : null,
        acumulado: this.acumulado,
        combo: this.combo,
        respiro: Math.max(0, this.respiroAte - this.agora),
        tempoVez: rv,
        mao: mao.slice(),
        jogaveis,
        contestacao: this.contestacao ? {
          id: this.contestacao.id, autor: this.contestacao.autor, carta: this.contestacao.carta,
          contra: this.contestacao.contra, restante: Math.max(0, this.contestacao.prazo - this.agora),
          total: this.tempoContestacao
        } : null,
        reserva: this.reserva ? {
          id: this.reserva.id, autor: this.reserva.autor, restante: Math.max(0, this.reserva.prazo - this.agora), total: this.regras.tempoBater
        } : null,
        bonus: this.bonus ? { j: this.bonus.j, eraVez: this.bonus.eraVez, restam: this.bonus.restam === Infinity ? -1 : this.bonus.restam, jogadas: this.bonus.jogadas } : null,
        vulneravel: this.vulneravel,
        gritou: j != null && j >= 0 ? this.gritouUno[j] : false,
        vencedor: this.vencedor,
        eventos: ev,
        versao: this.versao
      };
    }
  }

  const api = { Game, PARES, CORES, NIVEIS, REGRAS_PADRAO, construirBaralho, combina, mesmoTipo, ehPerguntaResposta, formamPar, textoDoPar, TOTAL_CARTAS, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.UnoCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
