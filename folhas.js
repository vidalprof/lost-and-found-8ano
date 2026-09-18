/* ============================================================
   ESQUELETO DA FOLHA VIVA — as folhas.

   ⚠️ ESTE ARQUIVO É A CASCA. As folhas (`f01`, `f02`, …) se escrevem abaixo, e
   cada uma nasce de um VERBO impresso numa folha de papel colhida. O crivo —
   comando VERBATIM e veredito de cada uma das trinta — vai em
   `_sequencias/POTE-<assunto>.md`, e é DELE que sai o roteiro.

   ⚠️ A POSIÇÃO É A IDENTIDADE: a folha da posição 7 usa o pote `p7`, grava os
      ids `n7_*` e fala `p7enun`. Não há segunda lista para desencontrar.

   O QUE JÁ VEM PRONTO AQUI (clonar destas peças, não reescrever):
     · `faixa` · `enunciado` · `item` · `fechaItem` · `nomeSecreto`
     · `opcoes` (a fileira de escolhas, com arrastar de brinde)
     · `puxavel` (arrastar com mouse, dedo e caneta — três lições pagas dentro)
     · `gavetas` (classificar em colunas, nas duas portas)
     · `montaLigar` (ligar com linha curva)
     · o teclado (`abreCruz`/`digitaCruz`/`confereCruz`/`rolaParaCruz`)
     · navegação, boletim, relatório do professor, dossiê, retomar 55 min
   ============================================================ */

var livro = document.getElementById("livro"), PAGEL = [], TIRAS = [];
/* ⚠️⚠️ AS FOLHAS DE LIGAR SE DECLARAM AQUI, e o número errado quebra DUAS
   folhas de uma vez — medido no `_rima1`, que estava no ar: a folha que liga
   NUNCA fechava (a criança ligava tudo e continuava faltando) e a folha
   apontada por engano FECHAVA SOZINHA, sem ninguém tocar nela. São as únicas
   cujos ids não nascem de `n<pi>_`, e sim dentro do `montaLigar`
   (`l<pi>g<i>_<chave>`). Conferir com `node _qa/conta_folha.js <pasta>`. */
/* as folhas de LIGAR: 4 (figura -> nome), 18 (pergunta -> resposta curta),
   25 (comeco da frase -> fim dela) e 26 (o nome -> a definicao). Os ids delas
   nascem dentro do `montaLigar`, nao de `n<pi>_`. */
var LIGAR = [4, 18, 25, 26];
/* a cor da faixa por BLOCO da escada, não por folha: a criança vê que o assunto
   mudou. Uma entrada por folha, de c1 a c5. */
/* uma cor por BLOCO da escada: 1-7 o que se conta · 8-13 some/any ·
   14-18 quanto · 19-26 qual pronome · 27-35 juntar as duas frases */
var CORES = ["c1","c1","c1","c1","c1","c1","c1",
             "c2","c2","c2","c2","c2","c2",
             "c3","c3","c3","c3","c3",
             "c4","c4","c4","c4","c4","c4","c4","c4",
             "c5","c5","c5","c5","c5","c5","c5","c5","c5"];


function faixa(d, i, titulo){ d.appendChild(el("div", "faixa", '<div class="num">' + i + '</div><h2>' + titulo + '</h2>')); }
function aoAbrir(d, fn){ if(!d._aoAbrir) d._aoAbrir = []; d._aoAbrir.push(fn); }
/* ---------- O ALTO-FALANTE ----------
   Regra da casa: tudo o que a criança PRECISA LER tem que poder ser OUVIDO.
   O desenho do botão é CSS puro: nada de emoji (vira quadradinho nos PCs da
   escola). */
function botaoSom(rot, aoTocar){
  var b = el("button", "som");
  b.innerHTML = '<i class="cone"></i><i class="onda o1"></i><i class="onda o2"></i>';
  b.setAttribute("aria-label", rot || "Ouvir");
  b.onclick = function(ev){ ev.stopPropagation(); sPasso(); aoTocar(); };
  return b;
}
function enunciado(d, pi, texto, chave){
  var cx = el("div", "enunlin");
  cx.appendChild(el("div", "enun", texto));
  cx.appendChild(botaoSom("Ouvir o que a folha pede", function(){ falar(chave); }));
  d.appendChild(cx);
}
function item(n){ return el("div", "item", n ? '<span class="n">' + n + '.</span>' : ""); }
function fechaItem(d, box, id){
  if(ST.resp[id]) box.className = "item feito";
  box.setAttribute("data-qa", "item-" + id);
  d.appendChild(box);
}
/* ⚠️ A RESPOSTA NÃO PODE APARECER ANTES DE A CRIANÇA RESPONDER. A palavra não
   some: fica INVISÍVEL (`visibility`, para o espaço ficar guardado e a folha não
   pular) e aparece no instante do acerto. É o que o `_qa/resposta_impressa.py`
   mede. */
function nomeSecreto(txt, id){
  var b = el("b", "segredo" + (ST.resp[id] ? " revelado" : ""), txt);
  b.setAttribute("data-nome", id);
  return b;
}
function chaveQuadro(w){ return String(w).toLowerCase().replace(/[^a-z]/g, ""); }

/* ---------- fileira de opções (a peça que mais se repete) ----------
   `soltarEm` (opcional) liga o ARRASTAR: a criança pode puxar a peça até o
   alvo em vez de só tocar nela. AS DUAS PORTAS, SEMPRE — no PC da escola ela
   usa o mouse e arrastar é o gesto natural; no celular, tocar é. */
function opcoes(pai, pi, id, lista, certa, cls, falaCerto, falaDica, aoAcertar, soltarEm){
  registra(id, pi, certa);
  var box = el("div", "ops"), feito = !!ST.resp[id];
  function responde(o, b){
    if(ST.resp[id]) return;
    sPasso(); if(o.fala) falar(o.fala);
    if(o.v === certa){
      b.className = "op" + (cls ? " " + cls : "") + " certa";
      if(aoAcertar) aoAcertar(b);
      setTimeout(function(){ acertou(id, falaCerto); }, aoAcertar ? 620 : 240);
    } else {
      b.className = "op" + (cls ? " " + cls : "") + " erro";
      setTimeout(function(){ b.className = "op" + (cls ? " " + cls : ""); }, 500);
      errou(id, falaDica);
    }
  }
  lista.forEach(function(o){
    var b = el("button", "op" + (cls ? " " + cls : "") + (feito && o.v === certa ? " certa" : ""), o.rot);
    b.setAttribute("data-qa", "op-" + id + "-" + o.v);
    b.setAttribute("aria-label", o.aria || o.v);
    b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } responde(o, b); };
    if(soltarEm) puxavel(b, soltarEm, function(){ responde(o, b); });
    box.appendChild(b);
  });
  pai.appendChild(box);
}

/* ---------- PUXAR uma peça até um alvo (mouse, dedo e caneta) ----------
   ⚠️ Pointer Events e não mouse+touch separados: no celular o navegador dispara
   eventos de mouse FANTASMA depois do toque, e foi assim que o arrastar já
   quebrou duas vezes nesta casa.
   ⚠️ E nada de `preventDefault` no início: isso mataria o toque. Só depois de o
   dedo ANDAR 8 px é que vira arrasto — antes disso continua sendo um toque
   normal e o `onclick` responde igual. */
var PUXA = null;

function puxavel(bt, alvos, aoSoltar){
  if(!alvos.push) alvos = [alvos];
  bt.style.touchAction = "none";
  bt.addEventListener("pointerdown", function(ev){
    if(ev.button && ev.button !== 0) return;
    PUXA = {bt: bt, alvos: alvos, aoSoltar: aoSoltar,
            x0: ev.clientX, y0: ev.clientY,
            lx: ev.clientX, ly: ev.clientY,
            andando: false, fantasma: null};
  });
}
/* ⚠️⚠️ TRÊS LIÇÕES PAGAS AQUI, e nenhuma delas dava erro na tela — o arrasto
   simplesmente não acontecia:
   1. ouvir o `pointermove` no PRÓPRIO botão: só o primeiro movimento chegava.
      O padrão certo é ouvir no DOCUMENTO — o dedo precisa poder SAIR de cima da
      peça, que é justamente o que ele faz ao levá-la.
   2. o navegador FUNDE os movimentos: num teste com oito passos chegou UM
      `pointermove`. Quem manda é a SOLTURA, não a contagem de movimentos.
   3. o `pointercancel` chega ANTES do `pointerup` e vem com clientX/clientY
      = 0,0 — quem usasse a coordenada dele concluiria que a criança soltou no
      canto da tela. Por isso o último ponto REAL fica guardado. */
function _puxaAnda(ev){
  var P = PUXA; if(!P) return;
  P.lx = ev.clientX; P.ly = ev.clientY;
  var dx = ev.clientX - P.x0, dy = ev.clientY - P.y0;
  if(!P.andando){
    if(dx * dx + dy * dy < 64) return;
    P.andando = true; P.bt._arrastou = true;
    var f = P.bt.cloneNode(true);
    f.className = "fantasma " + P.bt.className;
    var r = P.bt.getBoundingClientRect();
    f.style.width = r.width + "px"; f.style.height = r.height + "px";
    f._ox = r.left; f._oy = r.top;
    document.body.appendChild(f); P.fantasma = f;
    P.bt.className = P.bt.className + " puxada";
  }
  if(ev.cancelable) ev.preventDefault();
  P.fantasma.style.left = (P.fantasma._ox + dx) + "px";
  P.fantasma.style.top = (P.fantasma._oy + dy) + "px";
  P.alvos.forEach(function(a){
    a.className = a.className.replace(/ ?perto/, "") + (sobre(ev, a) ? " perto" : "");
  });
}
function _puxaSolta(ev){
  var P = PUXA; if(!P) return;
  PUXA = null;
  P.alvos.forEach(function(a){ a.className = a.className.replace(/ ?perto/, ""); });
  P.bt.className = P.bt.className.replace(/ ?puxada/, "");
  if(P.fantasma && P.fantasma.parentNode) P.fantasma.parentNode.removeChild(P.fantasma);
  var px = ev.clientX, py = ev.clientY;
  if(!px && !py){ px = P.lx; py = P.ly; }
  var onde = {clientX: px, clientY: py};
  var andou = (px - P.x0) * (px - P.x0) + (py - P.y0) * (py - P.y0) >= 64;
  if(!andou) return;
  P.bt._arrastou = true;
  var i;
  for(i = 0; i < P.alvos.length; i++){
    if(sobre(onde, P.alvos[i])){ P.aoSoltar(P.alvos[i], i); break; }
  }
  setTimeout(function(){ P.bt._arrastou = false; }, 60);
}
document.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
document.addEventListener("pointermove", _puxaAnda);
document.addEventListener("pointerup", _puxaSolta);
document.addEventListener("pointercancel", _puxaSolta);
function sobre(ev, alvo){
  var r = alvo.getBoundingClientRect(), m = 14;
  return ev.clientX >= r.left - m && ev.clientX <= r.right + m &&
         ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
}

function monta(){
  livro.innerHTML = ""; PAGEL = []; RESP = {}; TIRAS = [];
  /* ⚠️ UMA ENTRADA POR FOLHA, na ordem, começando pela capa `f0`. */
  var caps = [f0, f01, f02, f03, f04, f05, f06, f07, f08, f09, f10, f11,
             f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23,
             f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35], i;
  for(i = 0; i < caps.length; i++){
    var d = el("div", "pagina" + (i > 0 ? " " + CORES[i - 1] : "")); d.setAttribute("data-pag", i);
    caps[i](d, i);
    if(i > 0) d.appendChild(el("div", "carimbo", "FOLHA<br>PRONTA"));
    livro.appendChild(d); PAGEL.push(d);
  }
}

/* ---------- capa ----------
   A capa não é enfeite: é a primeira coisa que a criança vê, e é ela que diz
   "isto aqui é um lugar bom". O tema sai do PROBLEMA do caderno.
   ⚠️ CAPA CLONADA = TROCAR A CENA, SEMPRE. Numa capa herdada desta casa ficou um
      `img()` de outra atividade: o app abria com um quadradinho vazio e um 404
      no console, e nenhum portão de texto viu. */
function f0(d){
  var c = el("div", "capa"), nome = "Lost & Found — o balcao dos achados e perdidos", k, letras = "";
  for(k = 0; k < nome.length; k++){
    var ch = nome.charAt(k);
    letras += ch === " " ? '<span class="esp"></span>'
      : '<span class="lt" style="animation-delay:' + (0.04 * k).toFixed(2) + 's">' + ch + '</span>';
  }
  c.innerHTML =
    '<div class="ceu"><i class="nv n1"></i><i class="nv n2"></i><i class="nv n3"></i><i class="sol"></i></div>' +
    '<h1 class="titu">' + letras + '</h1>' +
    '<div class="sub">Inglês &middot; 8º ano &middot; 35 folhas de some, any, much, many e os pronomes who, which, that e whose</div>' +
    '<div class="chamada">Você vai atender o balcão de <b>achados e perdidos</b> de um aeroporto. Escreva o seu nome ali embaixo e toque em <b>Começar</b>.</div>';
  d.appendChild(c);
}
function gavetas(d, pi, gk, pede){
  faixa(d, pi, NOMES[pi - 1]);
  var G = GAV[gk];
  enunciado(d, pi, pede, "p" + pi + "enun");
  var cols = el("div", "colunas"), caixas = {}, listaC = [];
  G.cols.forEach(function(C){
    var c = el("div", "coluna");
    var t = el("div", "ctit", C.n);
    t.setAttribute("data-alvo", "1");
    /* ⚠️ o alvo é COMPARTILHADO pela folha inteira, então ele se declara no
       nível da página — e com o número da folha no nome, porque as 22 folhas
       moram no mesmo HTML e o jogador da banca busca por `document.querySelector`. */
    c.setAttribute("data-qa", "alvo-gav" + pi + "_" + C.k);
    t.appendChild(botaoSom("Ouvir a regra desta gaveta", function(){ falar("gav_" + gk + "_" + C.k); }));
    c.appendChild(t);
    var dentro = el("div", "cdentro");
    c.appendChild(dentro);
    c._v = C.k; c._dentro = dentro;
    caixas[C.k] = c; listaC.push(c);
    cols.appendChild(c);
  });
  d.appendChild(cols);
  var banco = el("div", "figbanco"), marcada = null;
  ST.folha["p" + pi].forEach(function(n, i){
    var P = G.pal[n], id = "n" + pi + "_" + i;
    registra(id, pi, ">gav" + pi + "_" + P.c);
    var b = el("button", "op pal" + (ST.resp[id] ? " usada" : ""), P.p);
    b.setAttribute("aria-label", P.p);
    b.setAttribute("data-qa", "item-" + id);
    /* a palavra escrita é a PEÇA que a criança pega, não a resposta entregue */
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) caixas[P.c]._dentro.appendChild(el("span", "fdentro", P.p));
    function larga(col){
      if(ST.resp[id]) return;
      if(col._v === P.c){
        b.className = "op pal usada";
        col._dentro.appendChild(el("span", "fdentro", P.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + n);
      } else {
        col.className = "coluna erro";
        setTimeout(function(){ col.className = "coluna"; }, 500);
        errou(id, "dica" + pi + "_" + n);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("diz2_" + gk + "_" + n);
      if(marcada === b){ b.className = "op pal"; marcada = null; return; }
      if(marcada) marcada.className = "op pal";
      b.className = "op pal marcada"; marcada = b;
    };
    puxavel(b, listaC, function(col){ larga(col); });
    banco.appendChild(b);
  });
  listaC.forEach(function(col){
    col.onclick = function(){
      if(!marcada){ sPasso(); falar("toque_palavra"); return; }
      marcada._larga(col);
    };
  });
  d.appendChild(banco);
}

/* ============================================================
   AS FOLHAS — escrever daqui para baixo, uma função por folha.

   O MOLDE de uma folha de escolher:

     function f01(d, pi){
       faixa(d, pi, NOMES[pi - 1]);
       enunciado(d, pi, "O que a criança tem de fazer.", "p" + pi + "enun");
       ST.folha["p" + pi].forEach(function(k, i){
         var D = MEUDADO[k], id = "n" + pi + "_" + i, box = item(i + 1);
         // … desenhar a peça …
         opcoes(box, pi, id, lista, certa, "pal",
                "certo" + pi + "_" + k, "dica" + pi + "_" + k);
         fechaItem(d, box, id);
       });
     }

   ⚠️ E CADA PEÇA TEM DE SER ALCANÇÁVEL PELO JOGADOR DA BANCA, senão a folha sai
      como dívida e ninguém a mede. Os contratos, em `_qa/joga_folha.js`:
        `esc-<id>`            → campo de teclado
        `op-<id>-<valor>`     → uma escolha
        `item-<id>` + `>gav`  → pegar a peça e largar na gaveta
        `pinta-<id>-<x>` + `data-lapis="<x>"` e o estojo `lapis-<x>` → pintar
        `cp-<id>-a` / `cp-<id>-z` → as duas pontas da palavra no caça-palavras
        `conferir-<id>`       → marque vários e confirme
   ============================================================ */
/* ---------- o teclado da palavra: uma por vez, letra a letra ----------
   ⚠️ UMA PEÇA SÓ PARA A CRUZADINHA (22) E PARA O REESCREVA (19). As duas
   escrevem palavra letra a letra; escrever dois teclados seria arrumar lugar
   para um segundo defeito. O que muda entre elas é só o rótulo da tarja —
   daí o `E.rot`. */
var CRUZ = null;
/* ---------- ROLAR A PALAVRA PARA CIMA DO TECLADO ----------
   ⚠️⚠️ O TECLADO TAPAVA A ATIVIDADE, e o Marcos viu no celular (15/set/2026):
      *"ele preenche a tela e não dá para ver a atividade"*. Medido: na
      cruzadinha de 360x640 o teclado ocupava 368 px de 640 e a grade ficava
      INTEIRA por baixo dele — a criança escrevia às cegas.
   ⚠️ E A REGRA TEM DOIS DEGRAUS, porque medir só um não bastou:
      1. se a PALAVRA inteira cabe na faixa que sobra, ela sobe inteira;
      2. se não cabe (palavra em pé, tela de 320x568 — medido), sobe a CASINHA
         QUE ESTÁ SENDO ESCRITA, centrada na faixa. É o que um campo de texto
         faz: mantém à vista a letra que a pessoa está digitando.
   Por isso ela é chamada duas vezes: ao abrir o teclado e a cada letra.
   ⚠️⚠️ E ELA ATENDE OS DOIS TECLADOS DA CASA, o que é a lição paga aqui
      (15/set/2026): há dois desenhos de teclado nos cadernos de folha viva —
      o da CRUZADINHA, que escreve numa fila de casinhas (`CRUZ.E.cels`), e o
      da SÍLABA/PALAVRA, que escreve numa quadra só (`ATIVA.q`). Eu escrevi
      esta função ancorada no primeiro e a enfiei nos dezoito cadernos pelo
      `function abreCruz(` — que só existe em TRÊS. Nos outros quinze ficou a
      CHAMADA sem a função: `setTimeout(rolaParaCruz, 60)` estourava
      ReferenceError e matava o resto de `ativa()`, que era justamente quem
      escrevia a dica e falava com a criança. O teclado abria mudo.
      O `node --check` não vê isso (a sintaxe está perfeita); quem vê é o
      `_qa/funcoes.py`, o portão "função que não existe" — que eu não rodei. */
function rolaParaCruz(){
  /* ⚠️ VAZIA DE PROPÓSITO, e ela fica aqui em vez de sumir. Enquanto o
     teclado era uma barra fixa nossa, esta função levava a palavra para
     a faixa que sobrava acima dele. Agora quem abre é o teclado do
     aparelho, e o navegador já rola a página sozinho para o campo com
     foco. Apagá-la quebraria as chamadas que ainda existem por aí. */
}
function abreCruz(E, pi){
  /* ⚠️ SEM BARRA FIXA, SEM ROLAGEM FORÇADA. O teclado da casa era fixo no pé da
     tela e tapava a palavra que a criança escrevia — daí existir o `comtec` e o
     `rolaParaCruz`. Agora quem abre é o teclado do APARELHO, que o próprio
     navegador já trata: ele rola a página para deixar o campo com foco à vista.
     Foi por isso que as duas peças saíram daqui juntas. */
  /* ⚠️ Toque na casinha dispara o `onclick` da casinha E o da grade: a mesma
     palavra pede para abrir duas vezes. Se já está aberta, só devolve o foco —
     fechar e reabrir era o que apagava a letra e (antes do conserto acima)
     estourava. */
  if(CRUZ && CRUZ.E === E){ try{ TECIN && TECIN.focus(); }catch(e){} return; }
  if(CRUZ) fechaCruz();
  CRUZ = {E: E, val: "", pi: pi};
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista ativa";
  pintaCruz();
  var grade = E.cels && E.cels[0] ? E.cels[0].parentNode : null;
  var c = poeCampoSobre(grade);
  c.value = "";
  c.setAttribute("maxlength", String(E.aceita ? E.cels.length : E.w.length));
  c.setAttribute("aria-label", E.rot || "Escreva a palavra");
  try{ c.focus({preventScroll: false}); }catch(e){ c.focus(); }
  falar("escreva");
}
function fechaCruz(){
  /* ⚠️⚠️ LIÇÃO PAGA — "O ALUNO NÃO CONSEGUIA DIGITAR" (Marcos, 18/set/2026, na
     folha 8 d'A Fábrica de Nomes). Aqui estava `CRUZ = null; pintaCruz();` — e
     `pintaCruz` começa lendo `CRUZ.E`. Estourava TypeError toda vez que se
     fechava a caneta. Como a casinha E a grade tinham `onclick`, um toque na
     casinha chamava `abreCruz` duas vezes: a segunda fechava a primeira, o
     fecho estourava, e o `abreCruz` morria ANTES de reabrir. Resultado: a
     criança tocava, nada abria, digitava e nada acontecia — sem erro na tela.
     O jogador da banca não pegou porque clicava na GRADE (um `onclick` só);
     agora ele clica na CASINHA, como a criança. Aqui: pintar com o E guardado
     ANTES de zerar, e nunca ler CRUZ depois de zerá-lo. */
  if(!CRUZ) return;
  var E = CRUZ.E;
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista";
  CRUZ = null;
  if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
  limpaCruz(E);
}
function limpaCruz(E){
  (E && E.cels || []).forEach(function(c){
    if(!c || c.className.indexOf(" ok") > -1) return;
    var n = c.querySelector(".cn");
    c.textContent = ""; if(n) c.appendChild(n);
    c.className = "ccel viva";
  });
}
function pintaCruz(){
  if(!CRUZ) return;                       /* nunca ler CRUZ.E sem CRUZ */
  var E = CRUZ.E, v = CRUZ.val;
  E.cels.forEach(function(c, i){
    if(!c) return;
    var n = c.querySelector(".cn");
    c.textContent = v.charAt(i) || "";
    if(n) c.appendChild(n);
    c.className = "ccel viva" + (i === v.length ? " ativa" : "");
  });
}
function digitaCruz(ch){
  if(!CRUZ) return;
  sTecla();
  var E = CRUZ.E;
  if(ch === "ap") CRUZ.val = CRUZ.val.slice(0, -1);
  else if(ch === "ok"){ confereCruz(); return; }
  else { if(CRUZ.val.length >= E.w.length) return; CRUZ.val += ch; }
  pintaCruz(); rolaParaCruz();
  if(CRUZ.val.length >= E.w.length) setTimeout(confereCruz, 380);
}
/* ⚠️⚠️ O ACENTO NÃO PODE REPROVAR QUEM ACERTOU A PALAVRA (ordem do Marcos,
   15/set/2026, com a turma na sala: *"faça que tanto com o sem dê certo"*).
   O gabarito de BACTERIAS estava sem acento e o teclado da tela TEM os acentos:
   a criança que escrevia BACTÉRIAS — que é o certo em português — era recusada,
   e ficava olhando para uma palavra certa marcada como errada. O contrário
   também acontecia, em caderno cujo gabarito vinha acentuado.
   ⚠️ E ONDE O ACENTO É O CONTEÚDO, ele continua contando: a folha declara
      `exigeAcento` e aí a comparação é letra por letra, acento incluído. */
function semAcento(s){
  s = String(s || "").toUpperCase();
  var de = "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ", para = "AAAAAEEEEIIIIOOOOOUUUUC", i, o = "";
  for(i = 0; i < s.length; i++){
    var n = de.indexOf(s.charAt(i));
    o += n > -1 ? para.charAt(n) : s.charAt(i);
  }
  return o;
}
function mesmaPalavra(a, b, exigeAcento){
  if(exigeAcento) return String(a).toUpperCase() === String(b).toUpperCase();
  return semAcento(a) === semAcento(b);
}
function confereCruz(){
  if(!CRUZ || !CRUZ.val) return;
  var E = CRUZ.E, pi = CRUZ.pi;
  if(mesmaPalavra(CRUZ.val, E.w, E.exigeAcento)){
    E.cels.forEach(function(c, i){
      if(!c) return;
      var n = c.querySelector(".cn");
      c.textContent = E.w.charAt(i); if(n) c.appendChild(n);
      c.className = "ccel viva ok";
    });
    if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista feita";
    CRUZ = null;
    if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
    acertou(E.id, "certo" + pi + "_" + E.k);
  } else {
    CRUZ.val = ""; pintaCruz();
    errou(E.id, "dica" + pi + "_" + E.k);
  }
}
function montaLigar(caixa, pi, tag, pares, pagina){
  var box = el("div", "ligar"), ce = el("div", "col"), cd = el("div", "col");
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "linhas");
  box.appendChild(ce); box.appendChild(cd); box.appendChild(svg); caixa.appendChild(box);
  var ordem = baralha(pares.map(function(_, i){ return i; }));
  var E = {}, D = {}, marcada = null;
  pares.forEach(function(P){ registra("l" + pi + tag + "_" + P.k, pi, P.k); });
  function centro(e, lado){
    var r = e.getBoundingClientRect(), b = box.getBoundingClientRect();
    return {x: (lado === "e" ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top};
  }
  function linha(a, b2, cor){
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var dx = Math.max(28, Math.abs(b2.x - a.x) * 0.45);
    var dd = "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + a.y + " " +
             (b2.x - dx) + "," + b2.y + " " + b2.x + "," + b2.y;
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", dd); halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "#ffffff"); halo.setAttribute("stroke-width", 11);
    halo.setAttribute("stroke-linecap", "round");
    var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", dd); l.setAttribute("fill", "none");
    l.setAttribute("stroke", cor); l.setAttribute("stroke-width", 6);
    l.setAttribute("stroke-linecap", "round");
    g.appendChild(halo); g.appendChild(l);
    [a, b2].forEach(function(p){
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
      c.setAttribute("fill", cor); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 2.5);
      g.appendChild(c);
    });
    svg.appendChild(g); return g;
  }
  function desmarca(){ if(marcada) marcada.el.className = marcada.el.className.replace(" marcada", ""); marcada = null; }
  function redesenha(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var k in E) if(ST.lig["l" + pi + tag + "_" + k]) linha(centro(E[k].el, "e"), centro(D[k].el, "d"), "#15a34a");
  }
  aoAbrir(pagina, redesenha);
  window.addEventListener("resize", function(){ if(pagina.className.indexOf("viva") > -1) redesenha(); });
  function fecha(Re, Rd){
    var id = "l" + pi + tag + "_" + Re.k;
    if(Rd.k === Re.k){
      ST.lig[id] = 1; tentativa(id, true); ST.resp[id] = 1; salvar();
      Re.el.className += " feita"; Rd.el.className += " feita"; desmarca(); redesenha(); sCerto();
      falar(Re.fc); setTimeout(function(){ confereFolha(pi); }, 850);
    } else {
      tentativa(id, false); sErro();
      Rd.el.className += " treme";
      setTimeout(function(){ Rd.el.className = Rd.el.className.replace(" treme", ""); }, 500);
      falar(ST.tent[id].erros >= 2 ? Re.dica : "quase");
      if(ST.tent[id].erros >= 2 && D[Re.k].el.className.indexOf("feita") < 0) D[Re.k].el.className += " mostra";
    }
  }
  pares.forEach(function(P){
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.esq);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-e-" + P.k);
    e.setAttribute("aria-label", P.ariaE);
    var R = {k: P.k, el: e, fc: P.fc, dica: P.dica};
    E[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; sPasso(); falar(P.fe);
    });
    e.onkeydown = function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; falar(P.fe); } };
    ce.appendChild(e);
  });
  ordem.forEach(function(j){
    var P = pares[j];
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.dir);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-d-" + P.k);
    e.setAttribute("aria-label", P.ariaD);
    var R = {k: P.k, el: e}; D[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault();
      if(marcada) fecha(marcada, R); else { sPasso(); falar(P.fd); falarDepois("ligue", 900); }
    });
    e.onkeydown = function(ev){ if((ev.key === "Enter" || ev.key === " ") && marcada){ ev.preventDefault(); fecha(marcada, R); } };
    cd.appendChild(e);
  });
}

/* ---------- o teclado da tela, e o teclado DE VERDADE ----------
   ⚠️⚠️ O ALFABETO ESTAVA INCOMPLETO, E ISSO TRANCAVA A CRIANÇA (15/set/2026).
   Faltavam K, W e Y — e, pior, faltavam Ê, Â, Ã, Ô, Õ, À e Ü. Quem tentasse
   escrever PÊSSEGO no teclado da tela ou no teclado de verdade ficava com
   "PSSEGO": a tecla não existia, a letra não entrava, e a folha NUNCA FECHAVA.
   Não havia erro nenhum no console; a criança só tentava de novo até desistir.
   Medido com o navegador de verdade, letra por letra, antes deste conserto.
   ⚠️ Quem fecha esta família agora é o portão `_qa/teclado.py`: ele confere que
      o alfabeto tem as 26 letras e os treze acentos do português, e que o
      teclado da tela e o filtro do teclado de verdade usam o MESMO alfabeto —
      porque dois alfabetos diferentes é o mesmo defeito com uma porta só.
   ⚠️ REGRA DAS DUAS PORTAS (Marcos, ago/2026): *"seria interessante se o aluno
   além de teclar no teclado virtual funcionasse se ele tocasse no teclado de
   verdade, as duas opções"*. No PC da escola tem teclado e a criança vai
   digitar; no celular, não tem. Nunca só uma porta. */
/* ============================================================
   O TECLADO DO APARELHO — substitui o teclado de 41 teclas da casa.

   ⭐ ORDEM DO MARCOS (15/set/2026): *"pode remover o teclado das atividades,
      melhor digitar com teclado normal"*. O nosso ocupava 53% de um celular de
      640 px, e mesmo redistribuído para 4 fileiras ainda comia 40%.

   ⚠️ O QUE ELE RESOLVE E O QUE NÃO RESOLVE, dito por inteiro: no PC da escola o
      teclado físico já funcionava (as duas portas são regra da casa desde
      ago/2026) — o campo abaixo não muda nada lá. Ele existe pelo CELULAR, que
      não tem teclado físico: sem um campo de verdade para focar, o aparelho não
      abre teclado nenhum e a criança fica trancada.
   ============================================================ */
var TECIN = null;
function campoTeclado(){
  if(TECIN) return TECIN;
  TECIN = document.createElement("input");
  TECIN.id = "tecIn";
  TECIN.type = "text";
  TECIN.setAttribute("autocomplete", "off");
  TECIN.setAttribute("autocorrect", "off");
  TECIN.setAttribute("autocapitalize", "characters");
  TECIN.setAttribute("spellcheck", "false");
  TECIN.setAttribute("aria-label", "Escreva a palavra");
  TECIN.setAttribute("inputmode", "text");
  /* ⚠️ O EVENTO É `input`, NÃO `keydown`: no celular o teclado do sistema não
     dispara keydown com a letra (ele "compõe" o texto), e um caderno que só
     ouvisse keydown seria mudo justamente no aparelho para o qual este campo
     existe. */
  TECIN.addEventListener("input", function(){
    if(!CRUZ) return;
    var v = (TECIN.value || "").toUpperCase();
    var teto = CRUZ.E.aceita ? CRUZ.E.cels.length : CRUZ.E.w.length;
    if(v.length > teto) v = v.slice(0, teto);
    CRUZ.val = v; TECIN.value = v;
    pintaCruz();
    if(!CRUZ.E.aceita && CRUZ.val.length >= CRUZ.E.w.length) setTimeout(confereCruz, 380);
  });
  TECIN.addEventListener("keydown", function(ev){
    if(ev.key === "Enter"){ ev.preventDefault(); confereCruz(); }
    else if(ev.key === "Escape"){ fechaCruz(); }
  });
  /* ⚠️⚠️ PERDER O FOCO NÃO FECHA MAIS A PALAVRA (18/set/2026). Aqui havia um
     `blur -> fechaCruz()`. Medido no navegador com o gesto da criança: ela toca
     na casinha, toca em "Ouvir a frase" para escutar de novo (o que a folha
     CONVIDA a fazer) e o foco vai para o botão — a palavra fechava, e o que ela
     digitava em seguida caía no vazio. No PC a digitação nem precisa do foco
     (o teclado é ouvido no documento); no celular, tocar de novo na casinha
     devolve o foco e reabre o teclado do aparelho. Então o blur não faz nada. */
  document.body.appendChild(TECIN);
  return TECIN;
}
function poeCampoSobre(grade){
  var c = campoTeclado();
  if(grade && grade.parentNode){
    if(c.parentNode !== grade) grade.appendChild(c);
    c.style.left = "0"; c.style.top = "0";
    c.style.width = "100%"; c.style.height = "100%";
  }
  return c;
}
document.addEventListener("keydown", function(ev){
  if(document.activeElement && document.activeElement.id === "nomeIn") return;
  var k = (ev.key || "").toUpperCase();
  /* ⭐ DIGITAR SEM TER CLICADO ABRE A PRIMEIRA PALAVRA VAZIA DA FOLHA
     (18/set/2026). A criança do 5º ano vê as casinhas e começa a digitar —
     nada dizia "toque nas casinhas primeiro". As DUAS PORTAS valem para o
     gesto também: no PC, o teclado tem de funcionar sem clique. */
  if(!CRUZ && k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){
    var alvo = null, todos = document.querySelectorAll('.pagina.viva [data-qa^="esc-"]');
    for(var i = 0; i < todos.length && !alvo; i++){
      var idq = todos[i].getAttribute("data-qa").slice(4);
      if(!ST.resp[idq]) alvo = todos[i];
    }
    if(alvo){ alvo.click(); }
  }
  if(!CRUZ) return;
  if(k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){ ev.preventDefault(); digitaCruz(k); }
  else if(ev.key === "Backspace"){ ev.preventDefault(); digitaCruz("ap"); }
  else if(ev.key === "Enter"){ ev.preventDefault(); digitaCruz("ok"); }
  else if(ev.key === "Escape"){ fechaCruz(); }
});

/* ---------- folha pronta e navegação ---------- */
function idsDaPagina(pi){
  /* ⚠️⚠️ ISTO JÁ MENTIU DUAS VEZES NESTA CASA. Antes, cada folha gravava `n6_0`
     à mão e esta função dizia à mão que a página 6 tinha ids `n6_`. Eram DOIS
     lugares a combinar, os dois sintaticamente corretos, e quando a ordem das
     folhas mudava o relatório saía ZERO com a folha toda respondida — sem erro
     nenhum no console. Agora o id NASCE DA POSIÇÃO e aqui se lê a mesma
     posição; a única forma diferente é o LIGAR, que se declara na constante. */
  var ids = [], i, k, L = (ST.folha["p" + pi] || []);
  if(LIGAR.indexOf(pi) > -1){
    for(i = 0; i < L.length; i++)
      for(k = 0; k < L[i].length; k++) ids.push("l" + pi + "g" + i + "_" + L[i][k]);
    return ids;
  }
  for(i = 0; i < L.length; i++) ids.push("n" + pi + "_" + i);
  return ids;
}
function pendentes(pi){
  var ids = idsDaPagina(pi), n = 0, i;
  for(i = 0; i < ids.length; i++) if(!ST.resp[ids[i]]) n++;
  return n;
}
function confereFolha(pi){
  if(pendentes(pi) > 0 || ST.prontas[pi]) return;
  ST.prontas[pi] = 1; salvar();
  PAGEL[pi].className += " pronta"; sFesta(); confete(24);
  if(pi < PAGEL.length - 1){ falar("folhaPronta"); setTimeout(function(){ if(ST.pag === pi) vaiPara(pi + 1); }, 2400); }
  else setTimeout(fim, 1400);
  atualizaNav();
}
function espelhaNome(t){
  var i = document.getElementById("nomeIn"); if(i && i.value !== t) i.value = t;
}
function vaiPara(pi){
  calar(); fechaCruz();
  document.getElementById("barraCapa").className = pi === 0 ? "aberta" : "";
  if(pi === 0) espelhaNome(ST.nome || "");
  document.getElementById("fim").style.display = "none";
  document.getElementById("retomar").style.display = "none";
  document.getElementById("nav").style.display = pi === 0 ? "none" : "flex";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  ST.pag = pi; salvar();
  /* ⚠️ GUARDA DO ESQUELETO VAZIO: enquanto o caderno ainda não tem folha
     nenhuma, o "Começar" pede a folha 1 e `PAGEL[1]` não existe — estourava
     `TypeError` e o portão do boot reprovava. Não é defeito do caderno em
     construção; é o esqueleto tendo de abrir limpo ANTES de ter conteúdo, que é
     justamente o que torna o pré-voo útil no primeiro minuto. Num caderno com
     folhas esta guarda nunca dispara. */
  var d = PAGEL[pi];
  if(!d){ atualizaNav(); return; }
  d.className += " viva";
  if(pi > 0) window.scrollTo(0, 0);
  if(d._aoAbrir) for(var z = 0; z < d._aoAbrir.length; z++) (function(fn){ setTimeout(fn, 60); })(d._aoAbrir[z]);
  atualizaNav();
  falarDepois(pi === 0 ? "capa" : "p" + pi + "enun", 280);
}
function atualizaNav(){
  var pi = ST.pag, total = PAGEL.length;
  document.getElementById("pg").textContent = pi === 0 ? "Capa" : "Folha " + pi + " de " + (total - 1);
  var feitas = 0, k; for(k in ST.prontas) feitas++;
  document.getElementById("progI").style.width = (feitas / (total - 1) * 100) + "%";
  document.getElementById("bAnt").disabled = pi === 0;
  var prox = document.getElementById("bProx");
  prox.style.visibility = pi === 0 ? "hidden" : "visible";
  var pend = pi > 0 ? pendentes(pi) : 0;
  prox.innerHTML = pi === total - 1 ? (pend ? "Faltam " + pend : "Ver o resultado")
    : (pend ? "Faltam " + pend + '<i class="seta dir"></i>' : 'Próxima<i class="seta dir"></i>');
  prox.className = pend ? "bt cinza" : "bt verde";
  document.getElementById("navTxt").textContent = pi === 0 ? "" : NOMES[pi - 1];
}

/* ---------- fim: boletim, medalha e relatório ---------- */
/* ⭐⭐ O FECHO A QUALQUER MOMENTO.
   O Marcos fixou a sequência em no mínimo 20 folhas (o piso era 25 e ele o
   baixou em 14/set/2026, por velocidade de produção). Este caderno tem 22, e o
   número saiu do inventário de verbos do `POTE`, não de uma meta. Só que a
   criança DEVAGAR leva bem mais nas mesmas 22 folhas — ela não termina. Se o boletim, o parecer e a
   medalha só existissem DEPOIS da última folha, quem mais precisa do elogio
   seria a única a nunca vê-lo.
   ⚠️ E o boletim conta só o que ela TENTOU. Folha que ela não chegou a abrir
      aparece como "ainda não" — jamais como 0 de 6. */
function fim(){
  /* ⭐⭐ AVISA O CONTROLE DA SALA QUE ESTA CRIANÇA TERMINOU.
     Pedido do Marcos (15/set/2026): *"preciso que essas atividades sequências
     didáticas me avisem quando termino no painel de atividades, aquele que tem
     o controle da sala, assim como as atividades que fazíamos antes"*.

     ⚠️ E ELAS NÃO AVISAVAM POR CAMINHO NENHUM — conferido no código do
     laboratório antes de escrever isto. A tela do aluno (`_lab/index.html`)
     reconhece o fim de DOIS jeitos, e a folha viva escapava dos dois:
       1. A ESPIADA — ela olha dentro do quadro e procura a MEDALHA do fim pela
          CLASSE `.medal`. A folha viva chama a dela de `#medalha`, por id, e
          portanto a espiada nunca a via;
       2. O AVISO — o motor manda `postMessage({eduverse:"terminou"})` ao chegar
          no fim. A folha viva não mandava nada, porque nasceu sem essa peça.
     Agora ela manda o aviso aqui, e a medalha ganhou também a classe `medal`
     no HTML: dois caminhos, um cobrindo o buraco do outro, que é a razão pela
     qual o laboratório tem os dois.

     ⚠️ FORA DO LABORATÓRIO NÃO HÁ PAI NENHUM ESCUTANDO e a linha não faz nada —
     por isso ela é segura em qualquer lugar (em casa, no celular, aberta
     direto pelo link). O `try` existe para o caso de a janela de cima ser de
     outro domínio, quando o navegador recusa a leitura de `window.parent`. */
  try{ if(window.parent && window.parent !== window)
         window.parent.postMessage({eduverse: "terminou"}, "*"); }catch(e){}
  calar();
  var abertas = 0, naoAbertas = [], pp;
  for(pp = 1; pp <= NOMES.length; pp++){
    var idp = idsDaPagina(pp), algum = false, z;
    for(z = 0; z < idp.length; z++) if(ST.tent[idp[z]]) { algum = true; break; }
    if(algum) abertas++; else naoAbertas.push(pp);
  }
  var completo = naoAbertas.length === 0;
  var tf = document.getElementById("fimTit");
  if(tf) tf.textContent = completo ? "Caderno completo!" : "O seu boletim de hoje";
  var bv = document.getElementById("bVoltar");
  if(bv) bv.style.display = completo ? "none" : "";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  document.getElementById("nav").style.display = "none";
  var f = document.getElementById("fim"); f.style.display = "block";
  var tot = 0, prim = 0, pi;
  for(pi = 1; pi <= NOMES.length; pi++){
    var ids = idsDaPagina(pi);
    for(var j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(!t) continue;
      tot++;
      if(t.erros === 0 && t.ok) prim++;
    }
  }
  var pc = tot ? prim / tot : 0;
  var cheias = pc >= .85 ? 3 : pc >= .6 ? 2 : 1, est = "", ke;
  for(ke = 0; ke < 3; ke++)
    est += '<img src="img/lf_selo' + (ke < cheias ? "" : "_off") + '.png?v=' + VIMG + '" alt="" draggable="false">';
  document.getElementById("estrelas").innerHTML = est;
  document.getElementById("estrelas").setAttribute("aria-label", cheias + " de 3 estrelas");
  var bar = document.getElementById("barras"); bar.innerHTML = "";
  for(pi = 1; pi <= NOMES.length; pi++){
    (function(pi){
      var ids = idsDaPagina(pi), p = 0, nt = 0, j;
      for(j = 0; j < ids.length; j++){
        var tt = ST.tent[ids[j]];
        if(tt) nt++;
        if(tt && tt.erros === 0 && tt.ok) p++;
      }
      if(nt === 0){
        bar.appendChild(el("div", "barra naoabriu",
          "<span>" + NOMES[pi - 1] + "</span><div class='tr'></div><b>ainda não</b>"));
        return;
      }
      var b = el("div", "barra", "<span>" + NOMES[pi - 1] + "</span><div class='tr'><i></i></div><b>" + p + "/" + nt + "</b>");
      bar.appendChild(b);
      setTimeout(function(){ b.querySelector("i").style.width = (nt ? p / nt * 100 : 0) + "%"; }, 400);
    })(pi);
  }
  /* ⭐ O PARECER DA CRIANÇA. O currículo de Blumenau diz que a avaliação orienta
     *"o professor E O ESTUDANTE acerca de quais objetivos foram alcançados"*, e
     que *"mostrar o que sabe ou o que não sabe é pertinente, faz parte do
     crescimento e não da exclusão"*. Então ela vê o que já sabe — na linguagem
     dela, sem número, sem a palavra "errou" e sem porcentagem.
     ⚠️ A ORDEM IMPORTA: primeiro o que ela JÁ SABE; o "vale treinar" vem depois
     e no máximo dois, senão a lista vira boletim de defeitos. */
  var jaSabe = [], treinar = [], q;
  for(q = 0; q < OBJETIVOS.length; q++){
    var Oq = OBJETIVOS[q], mq = mede(Oq.f);
    if(mq.tot === 0 || !mq.tent) continue;
    var pcq = Math.round(100 * mq.prim / mq.tent);
    (pcq >= 75 ? jaSabe : treinar).push(pcq >= 75 ? Oq.ok : Oq.n.toLowerCase());
  }
  var txt = "";
  if(jaSabe.length) txt = "Você já " + jaSabe.slice(0, 3).join("; ") + ".";
  else txt = "Você começou a reparar que o mesmo som pode se escrever de cinco jeitos — e isso é o principal!";
  if(treinar.length) txt += " Vale treinar mais: " + treinar.slice(0, 2).join(" e ") + ".";
  if(!completo)
    txt = "você fez " + abertas + " de " + NOMES.length + " folhas hoje — e olhe o "
        + "que já dá para ver: " + txt.charAt(0).toLowerCase() + txt.slice(1);
  /* ⚠️ SEM NOME, SEM PREFIXO. Com o prefixo fixo saía "Você, você já…" para a
     criança que não escreve o nome na capa — que é justamente a que mais precisa
     que a tela fale direito com ela. */
  var quem = (ST.nome || "").replace(/^\s+|\s+$/g, "");
  document.getElementById("resumo").innerHTML = quem
    ? "<b>" + esch(quem) + "</b>, " + txt.charAt(0).toLowerCase() + txt.slice(1)
    : txt.charAt(0).toUpperCase() + txt.slice(1);
  sFesta(); confete(40); falar("fim");
}
(function(){
  var m = document.getElementById("medalha"), t = null;
  function segura(){ t = setTimeout(function(){ abreRelatorio(); }, 2000); }
  function larga(){ if(t){ clearTimeout(t); t = null; } }
  m.addEventListener("pointerdown", segura);
  m.addEventListener("pointerup", larga);
  m.addEventListener("pointerleave", larga);
  m.addEventListener("pointercancel", larga);
})();

/* ============================================================
   O QUE A ATIVIDADE MEDE — e como isso vira PARECER e NOTA

   ⚠️ A NOTA FICA COM O PROFESSOR. A Instrução Normativa SEMED nº 1/2017, art.
   3º, citada no currículo de Blumenau, manda avaliar *"com preponderância dos
   aspectos qualitativos sobre os quantitativos"*. O parecer vai para a criança;
   o número fica só aqui.
   ⚠️ E NÃO SE CONTA TUDO IGUAL: acerto de primeira vale 1,0 e acerto com ajuda
   vale 0,6 — o relatório mostra os dois lado a lado, para o professor ver a
   nota E o esforço que ela custou. O critério sai impresso por exigência da
   mesma Instrução (*"a exposição de critérios utilizados"*).
   ============================================================ */
var PESO_PRIMEIRA = 1.0, PESO_COM_AJUDA = 0.6;

/* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os nomes
   e as folhas não baterem um a um. Os números são POSIÇÕES de folha: mudou a
   ordem, mudam aqui e no `curriculo.json`, no mesmo commit. *//* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os
   nomes e as folhas não baterem um a um, e também se alguma folha de trabalho
   ficar sem objetivo que a meça. Os números são POSIÇÕES de folha.
   Ex.: {n: "Distinguir X de Y", f: [1, 2, 3],
         ok:  "faz o que o objetivo pede, em palavras do professor",
         nao: "o que ainda não faz — sem a palavra 'errou'"}  */
var OBJETIVOS = [
  {n: "Distinguir o que se conta do que não se conta", f: [1, 2, 3, 4, 5, 6, 7, 12, 34]},
  {n: "Usar some e any conforme a frase", f: [8, 9, 10, 11]},
  {n: "Perguntar quanto com much e many", f: [13, 14, 15, 16, 17, 18]},
  {n: "Escolher o pronome relativo certo", f: [19, 20, 21, 22, 23, 24, 26, 27]},
  {n: "Juntar duas frases numa só com o pronome relativo", f: [25, 28, 29, 30, 31, 32, 33, 35]}
];

function mede(folhas){
  var prim = 0, ajuda = 0, tot = 0, tentados = 0, k, j;
  for(k = 0; k < folhas.length; k++){
    var ids = idsDaPagina(folhas[k]);
    tot += ids.length;
    for(j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(t) tentados++;
      if(!t || !t.ok) continue;
      if(t.erros === 0) prim++; else ajuda++;
    }
  }
  return {prim: prim, ajuda: ajuda, tot: tot, tent: tentados,
          pontos: prim * PESO_PRIMEIRA + ajuda * PESO_COM_AJUDA,
          pc: tot ? Math.round(100 * prim / tot) : 0};
}

function abreRelatorio(){
  var r = document.getElementById("relatorio");
  var linhas = "", domina = [], retomar = [], k;
  var pontos = 0, total = 0, primG = 0, ajudaG = 0, tentG = 0;
  var naoAlcancou = [];
  var folhasFeitas = 0, fz;
  for(fz = 1; fz <= NOMES.length; fz++){
    var idf = idsDaPagina(fz), tocou = false, y;
    for(y = 0; y < idf.length; y++) if(ST.tent[idf[y]]) { tocou = true; break; }
    if(tocou) folhasFeitas++;
  }
  var inteiro = folhasFeitas >= NOMES.length;

  for(k = 0; k < OBJETIVOS.length; k++){
    var O = OBJETIVOS[k], m = mede(O.f);
    pontos += m.pontos; total += m.tot; primG += m.prim; ajudaG += m.ajuda;
    tentG += m.tent;
    /* ⚠️⚠️ O QUE DECIDE É O QUE ELA FEZ. Antes, num caderno não terminado, o
       objetivo cujas folhas ela nem alcançou entrava em "retomar" com 0% — e o
       parecer dizia "precisa retomar" de uma criança que tinha ido bem no que
       deu tempo de fazer. Um julgamento errado com cara de medida, contra a
       criança. Objetivo não tocado não entra em lista nenhuma. */
    var pcObj = m.tent ? Math.round(100 * m.prim / m.tent) : -1;
    if(pcObj < 0) naoAlcancou.push(O.n.toLowerCase());
    else if(pcObj >= 75) domina.push(O.ok);
    else retomar.push(O.n.toLowerCase() + " (" + pcObj + "%)");
    var pcf = m.tent ? Math.round(100 * m.prim / m.tent) : 0;
    linhas += "<tr><td>" + esch(O.n) + "</td><td>" + m.prim + "/" + m.tot +
      "</td><td><b>" + m.pc + "%</b></td><td>" +
      (m.tent ? "<b>" + pcf + "%</b> <small>(" + m.prim + "/" + m.tent + ")</small>"
              : "<small>não fez</small>") + "</td><td>" + m.ajuda + "</td></tr>";
  }

  /* ⚠️ A NOTA DE UM CADERNO NÃO TERMINADO SE MEDE NO QUE FOI FEITO. Dividir
     pelos itens que ela nunca viu dá uma nota que não fala dela — fala do
     relógio. Com o caderno completo, os dois denominadores são o mesmo número. */
  var baseNota = inteiro ? total : tentG;
  var nota = baseNota ? Math.round(100 * pontos / baseNota) / 10 : 0;
  var pc = baseNota ? Math.round(100 * primG / baseNota) : 0;
  var conceito = !baseNota ? "Sem dados" :
    nota >= 8.5 ? "Dominou" : nota >= 6 ? "Está construindo" : "Precisa retomar";
  if(!inteiro) conceito += " (parcial)";

  var nome = esch(ST.nome || "O aluno");
  var parecer = nome + " ";
  if(domina.length && !retomar.length && !naoAlcancou.length)
    parecer += "domina os objetivos avaliados: " + domina.join("; ") + ".";
  else if(domina.length)
    parecer += "já " + domina.join("; ") + ". Ainda precisa retomar: " + retomar.join(", ") + ".";
  else
    parecer += "está começando a perceber que letras diferentes fazem o mesmo som. Nenhum " +
      "objetivo chegou a 75% de acerto de primeira — vale retomar ORALMENTE, ditando cinco " +
      "palavras por dia e perguntando POR QUE se escreve com aquela letra, antes de voltar " +
      "à tela. A regra dita em voz alta fixa mais do que a palavra copiada dez vezes.";
  if(naoAlcancou.length)
    parecer += " Ainda não chegou a fazer (a aula acabou antes): " + naoAlcancou.join(", ") + ".";

  var h = "<b>Relatório do professor</b> &mdash; " + nome + " &middot; " +
    Math.round((Date.now() - (ST.inicio || Date.now())) / 60000) + " min" +
    "<div class='notao'><span class='nn'>" + nota.toFixed(1).replace(".", ",") + "</span>" +
    "<span class='nl'><b>" + conceito + "</b><br>" + primG + " de " + baseNota +
    " de primeira (" + pc + "%)<br>" + ajudaG + " com ajuda</span></div>" +
    "<p class='parecer'>" + parecer + "</p>" +
    (inteiro ? "" :
      "<p class='avisoparcial'><b>Caderno não terminado:</b> " + folhasFeitas +
      " de " + NOMES.length + " folhas. A coluna <b>%</b> conta o caderno inteiro; " +
      "a coluna <b>do que fez</b> conta só o que a criança chegou a responder — " +
      "é esta que diz como ela foi.</p>") +
    "<table><tr><th>Objetivo</th><th>De primeira</th><th>%</th>" +
    "<th>do que fez</th><th>Com ajuda</th></tr>" + linhas + "</table>" +
    "<p class='comonota'>Nota de 0 a 10: acerto de primeira vale 1,0 e acerto com ajuda vale 0,6. " +
    "A criança não vê este número — ele fica só aqui.</p>" +
    "<p class='comonota'><b>O que este caderno NÃO mede:</b> várias das folhas de papel que " +
    "deram origem a ele terminam em <b>&ldquo;copie no seu caderno&rdquo;</b> e " +
    "<b>&ldquo;classifique no caderno&rdquo;</b> &mdash; e a tela não corrige o que a criança " +
    "escreve à mão. O que dá para medir aqui é reconhecer, marcar e escrever com o teclado. " +
    "<b>A cópia e o ditado no papel continuam sendo do professor</b>, e a folha 22 existe para " +
    "isso: a criança sai daqui com o quadro de regras dela para copiar no caderno.</p>";
  r.innerHTML = h; r.style.display = "block"; sPasso();
}
function esch(t){
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- retomar, chave mestra e a partida ---------- */
var CHAVE_MESTRA = "1275@";
function abreMenuProf(){
  var cx = document.getElementById("mpFolhas");
  if(!cx.childNodes.length){
    var mk = function(rot, alvo){
      var b = el("button", null, rot);
      b.onclick = function(){ fechaMenuProf(); vaiPara(alvo); };
      cx.appendChild(b);
    };
    mk("Capa", 0);
    /* ⚠️ `NOMES.length` e não um número cravado: com "10" escrito aqui, um
       caderno de 25 folhas mostrava só as dez primeiras no menu do professor —
       e as quinze restantes ficavam sem como conferir. */
    for(var k = 1; k <= NOMES.length; k++) mk(k + ". " + NOMES[k - 1], k);
  }
  calar(); document.getElementById("menuProf").className = "aberto";
}
function fechaMenuProf(){ document.getElementById("menuProf").className = ""; }
document.getElementById("mpFechar").onclick = fechaMenuProf;
document.getElementById("menuProf").onclick = function(ev){ if(ev.target === this) fechaMenuProf(); };
document.getElementById("nomeIn").oninput = function(){
  if(this.value.indexOf(CHAVE_MESTRA) > -1){ this.value = ST.nome || ""; abreMenuProf(); return; }
  ST.nome = this.value.slice(0, 24); espelhaNome(ST.nome); salvar();
};
document.getElementById("nomeIn").onkeydown = function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); this.blur(); } };
document.getElementById("bComecar").onclick = function(){ ac(); sPasso(); if(!ST.inicio) ST.inicio = Date.now(); vaiPara(1); };
document.getElementById("bAnt").onclick = function(){ sPasso(); vaiPara(Math.max(0, ST.pag - 1)); };
document.getElementById("bProx").onclick = function(){
  sPasso();
  if(ST.pag === PAGEL.length - 1 && pendentes(ST.pag) === 0) return fim();
  vaiPara(Math.min(PAGEL.length - 1, ST.pag + 1));
};
document.getElementById("bOuvir").onclick = function(){ ac(); if(ultimaFala) falar(ultimaFala); };
document.getElementById("bVoz").onclick = function(){
  vozLigada = !vozLigada; this.className = vozLigada ? "zap" : "zap off";
  if(!vozLigada) calar(); else falar("vozOn");
};
document.getElementById("bRever").onclick = function(){ sPasso(); vaiPara(1); };
document.getElementById("bRecomecar").onclick = function(){
  sPasso(); try{ localStorage.removeItem(CHAVE_LS); }catch(e){}
  ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
  monta(); vaiPara(0); falarDepois("novoCaderno", 400);
};
document.getElementById("bContinuar").onclick = function(){ ac(); sPasso(); vaiPara(ST.pag || 1); };
document.getElementById("bZerar").onclick = function(){ document.getElementById("bRecomecar").onclick(); };

(function boot(){
  var velho = carregar();
  if(velho && velho.folha){
    ST = velho;
    if(!ST.resp) ST.resp = {}; if(!ST.lig) ST.lig = {}; if(!ST.tent) ST.tent = {}; if(!ST.prontas) ST.prontas = {};
    /* ⚠️ TRAVA 2 — A REDE DE SEGURANÇA. Se montar a partir da memória estourar
       por qualquer motivo que eu não previ, o caderno joga a memória fora e
       abre LIMPO. Perder o "continuar de onde parou" é ruim; ficar com uma tela
       morta a aula toda é muito pior. */
    try{ monta(); }
    catch(erroMemoria){
      try{ localStorage.removeItem(CHAVE_LS); }catch(e3){}
      ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
      monta(); vaiPara(0); return;
    }
    document.getElementById("retomar").style.display = "block";
    document.getElementById("retTxt").textContent =
      (ST.nome ? ST.nome + ", você" : "Você") + " parou na folha " + (ST.pag || 1) + ": " + NOMES[(ST.pag || 1) - 1] + ".";
    document.getElementById("nav").style.display = "none";
  } else {
    ST.folha = novaFolha(); monta(); vaiPara(0);
  }
})();

/*<dossie-js>*/
/* ============================================================
   DOSSIÊ PEDAGÓGICO — o que o PROFESSOR vê quando abre a atividade

   ⭐ PEDIDO DO MARCOS (set/2026): *"preciso que quando um professor olhe e
      analise a atividade ele veja que está ótima"*.

   O buraco que isto fecha: o parecer pedagógico de cada caderno existia — mas
   morava num arquivo `.md` DENTRO DO REPOSITÓRIO, que nenhum professor abre.
   Quem olhava a atividade via um joguinho bonito e não tinha como saber se
   aquilo estava alinhado ao currículo da rede. Agora o alinhamento está DENTRO
   da atividade, a um toque — e a qualquer momento, não só no fim.

   ⚠️ E não é texto solto: cada habilidade citada aqui vem do
   `<pasta>/curriculo.json`, e o portão `_qa/pedagogo_curriculo.py` reprova se a frase
   citada não existir, palavra por palavra, no `_curriculo/blumenau.txt`, ou se
   os objetivos do relatório e os do currículo não baterem um a um. Citação de
   currículo é a única coisa que o professor NÃO tem como conferir sozinho sem
   abrir 440 páginas de PDF — por isso ela é medida.

   Abre por dois caminhos: o botão no menu do professor (chave mestra 1275@,
   vale a qualquer hora) e o botão dentro do relatório, no fim.

   Este arquivo é a FONTE: `python3 _padrao/dossie_professor.py <pasta>` injeta o CSS, o
   trecho de tela e este código no caderno. Não editar a cópia injetada.
   ============================================================ */
function dossieCita(s){
  var m = String(s || "").match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : String(s || "");
}
function dossieHTML(){
  var C = (typeof CURRICULO === "object" && CURRICULO) ? CURRICULO : null;
  if(!C) return "<p>Este caderno ainda não declarou o currículo.</p>";
  var h = "", k, o;
  h += "<p class='dfonte'><b>" + esch(C.componente) + " &middot; " + C.ano +
       "º ano.</b> " + esch(C.rede) + ". As habilidades abaixo estão " +
       "<b>copiadas do documento oficial, palavra por palavra</b> &mdash; nenhuma " +
       "foi reescrita nem resumida.</p>";
  h += "<table><tr><th>O que a atividade mede</th><th>Folhas</th>" +
       "<th>Habilidade do currículo da rede</th></tr>";
  for(k = 0; k < C.objetivos.length; k++){
    o = C.objetivos[k];
    h += "<tr><td>" + esch(o.objetivo) + "</td><td>" + o.folhas.join(", ") +
         "</td><td>&ldquo;" + esch(dossieCita(o.habilidade)) + "&rdquo;" +
         "<span class='dobj'>" + esch(o.pratica) + " &middot; " +
         esch(o.objeto) + "</span></td></tr>";
  }
  h += "</table>";

  h += "<p class='dsub'><b>A escada didática</b> &mdash; uma folha por degrau, e " +
       "nenhuma repete o gesto da anterior:</p><ol class='descada'>";
  for(k = 0; k < NOMES.length; k++) h += "<li>" + esch(NOMES[k]) + "</li>";
  h += "</ol>";

  h += "<p class='dsub'><b>Como a criança é avaliada</b></p>" +
       "<p class='dtxt'>O relatório do professor (no fim, segurando a medalha por " +
       "2 segundos) traz, por objetivo: quantos itens ela acertou <b>de primeira</b>, " +
       "quantos precisou de ajuda e a porcentagem. A partir de 75% de acerto de " +
       "primeira o objetivo conta como dominado. Sai também um parecer em palavras " +
       "&mdash; do jeito que se escreve no bimestral &mdash; e uma nota de 0 a 10 " +
       "que <b>a criança não vê</b>. Dentro da atividade não há nota, nem ranking, " +
       "nem a palavra &ldquo;errou&rdquo;: o erro responde na hora e diz o que " +
       "olhar, e a ajuda cresce a cada tentativa (dica &rarr; apoio concreto &rarr; " +
       "revelar).</p>";

  if(C.evidencia && C.evidencia.length){
    h += "<p class='dsub'><b>O que foi medido antes de publicar</b></p><ul class='dev'>";
    for(k = 0; k < C.evidencia.length; k++) h += "<li>" + esch(C.evidencia[k]) + "</li>";
    h += "</ul>";
  }
  return h;
}
function abreDossie(){
  var cx = document.getElementById("dsCorpo");
  if(!cx) return;
  if(typeof calar === "function") calar();
  cx.innerHTML = dossieHTML();
  document.getElementById("dossie").className = "aberto";
  cx.scrollTop = 0;
}
function fechaDossie(){ document.getElementById("dossie").className = ""; }
(function(){
  var b = document.getElementById("bDossie"), f = document.getElementById("dsFechar"),
      cx = document.getElementById("dossie");
  if(b) b.onclick = function(){ fechaMenuProf(); abreDossie(); };
  if(f) f.onclick = fechaDossie;
  if(cx) cx.onclick = function(ev){ if(ev.target === this) fechaDossie(); };

  /* o segundo caminho: o botão nasce DENTRO do relatório, quando ele abre.
     Fica ali e não na tela final porque o relatório é a parte que a criança
     não vê — e o dossiê é conversa de adulto. */
  if(typeof abreRelatorio === "function"){
    var antes = abreRelatorio;
    abreRelatorio = function(){
      antes.apply(this, arguments);
      var r = document.getElementById("relatorio");
      if(r && !r.querySelector(".bdossie")){
        var bt = document.createElement("button");
        bt.className = "bt bdossie";
        bt.textContent = "Dossiê pedagógico (currículo da rede)";
        bt.onclick = abreDossie;
        r.appendChild(bt);
      }
    };
  }
}());
/*</dossie-js>*/

/* ⭐ o botão "Terminar" e o "Voltar para o caderno" — ver o comentário do fim() */
(function(){
  var bt = document.getElementById("bTerminar");
  if(bt) bt.onclick = function(){
    var falta = 0, pz;
    for(pz = 1; pz <= NOMES.length; pz++) falta += pendentes(pz);
    if(falta && !confirm("Quer fechar o caderno e ver o seu boletim?\n\nVocê pode voltar depois e continuar de onde parou."))
      return;
    fim();
  };
  var bv = document.getElementById("bVoltar");
  if(bv) bv.onclick = function(){
    document.getElementById("fim").style.display = "none";
    vaiPara(ST.pag || 1);
  };
})();

/* ############################################################
   AS FOLHAS DO BALCÃO DE ACHADOS E PERDIDOS

   ⚠️ CADA FOLHA NASCE DE UM COMANDO IMPRESSO numa folha de papel colhida. O
      comando está copiado VERBATIM no comentário de cada uma, e o crivo das 54
      folhas — com o veredito de todas — está em `_sequencias/POTE-ING8.md`.
   ⚠️ ONDE A FRASE É MINHA, ESTÁ DITO. Não há bloco sem procedência.
   ############################################################ */

/* ============ 1 — A or SOME? ============
   Da d12 (iSLCollective), VERBATIM: *"Complete the sentences using either 'a' or
   'some':"* — e as quinze frases dela são todas `There is ___ …`.
   ⭐ ABRE PELO PROBLEMA, NÃO PELA REGRA (Portão 0 da filosofia): a criança lê
      *"There is ___ luggage in the car"*, escolhe `a`, e a frase sai torta no
      ouvido dela ANTES de existir qualquer explicação. O conceito
      (contável × incontável) só aparece depois, nas gavetas.
   ⭐ E O PAR `luggage` × `suitcase` É O CORAÇÃO: é a MESMA coisa do mundo, uma
      se conta e a outra não. Quem entende esse par entende a folha inteira. */
function f01(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia a frase e escolha a palavra que falta: " +
            "<b>a</b> ou <b>some</b>?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var Q = QUANT[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", Q.a + ' <i class="lacuna"></i> ' + Q.b));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("frase_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "a", rot: "a", aria: "a", fala: "op_a"},
                    {v: "some", rot: "some", aria: "some", fala: "op_some"}]),
           Q.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(Q.pq, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}

/* ============ 2 e 3 — AS GAVETAS ============
   folha 2 — da d04 (iSLCollective), VERBATIM: *"1. Countable or Uncountable?
             Write the following nouns under the correct column."*
   folha 3 — da d09 (iSLCollective), VERBATIM: *"Complete the lists on the
             bags."*, e as sacolas dela são TRÊS: Countable singular · Countable
             plural · Uncountable.
   ⭐ E VÊM COLADAS, subindo um degrau (regra do Marcos contra o *"isso eu já
      fiz"*): o que muda da 2 para a 3 não é a tela, é a pergunta — a terceira
      gaveta separa `a camera` de `cameras`, que é justamente onde o `some`
      muda de sentido (some cameras = algumas; some money = um pouco).
   ⭐ E OS INCONTÁVEIS ABSTRATOS VÊM DA d24 (*money, music, time, information*):
      é isso que separa o 8º ano do 5º. Sem eles, o caderno vira aula de comida
      — e todas as trinta folhas do primeiro lote são de comida.
   ⚠️ AS DUAS PORTAS: arrastar a palavra até a gaveta (PC da escola, mouse) e
      tocar na palavra e depois na gaveta (celular). */
function f02(d, pi){ gavetas(d, pi, "cp1",
  "Uma gaveta é do que se pode <b>contar</b> (um, dois, três). A outra é do " +
  "que <b>não se conta</b> em unidades."); }
function f03(d, pi){ gavetas(d, pi, "cp2",
  "Agora são <b>três</b> gavetas. Olhe se a palavra está no singular, no " +
  "plural, ou se nem tem plural."); }

/* ============ 4 — CIRCLE AND UNDERLINE ============
   Da d28, VERBATIM: *"Circle the countable nouns and underline the uncountable
   nouns in the following sentences."*
   ⭐ GESTO QUE SÓ ELA PEDE nas 54 folhas: duas marcas diferentes na MESMA frase.
      Até aqui a criança decidia sobre uma palavra por vez, apresentada sozinha;
      aqui as palavras estão dentro de uma frase corrida, que é onde elas moram
      de verdade — e ela decide DUAS vezes seguidas.
   ⚠️ DUAS POSIÇÕES DO POTE POR FRASE (`m1|c` e `m1|u`): com uma posição só, a
      folha se daria por pronta com metade das palavras marcadas. Quem conta os
      itens é o tamanho do pote (`node _qa/conta_folha.js`). */
function f07(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Escolha a marca e toque na palavra: o que <b>se conta</b>, " +
            "ou o que <b>não se conta</b>.", "p" + pi + "enun");
  var marca = null, bm = {};
  var barra = el("div", "ops lapis");
  [["c", "I can count it"], ["u", "I cannot count it"]].forEach(function(m){
    var b = el("button", "op curta lapiz marca" + m[0], m[1]);
    b.setAttribute("aria-label", m[1]);
    /* contrato do jogador da banca: o estojo publica `lapis-<x>` e a peça
       carrega `data-lapis="<x>"`. Pôr o `data-lapis` no lápis faz o jogador
       dizer "não sei jogar" — e folha que o jogador não alcança é folha que
       ninguém mede. */
    b.setAttribute("data-qa", "lapis-" + m[0]);
    b.onclick = function(){
      sPasso(); falar("marca_" + m[0]);
      if(marca) bm[marca].className = "op curta lapiz marca" + marca;
      marca = m[0]; b.className = "op curta lapiz marca" + m[0] + " marcada";
    };
    bm[m[0]] = b; barra.appendChild(b);
  });
  d.appendChild(barra);
  var pool = ST.folha["p" + pi], porFrase = {}, ordem = [];
  pool.forEach(function(par, i){
    var p = par.split("|");
    if(!porFrase[p[0]]){ porFrase[p[0]] = {}; ordem.push(p[0]); }
    porFrase[p[0]][p[1]] = "n" + pi + "_" + i;
    registra("n" + pi + "_" + i, pi, "pinta-" + p[1]);
  });
  ordem.forEach(function(k, i){
    var F = DUPLA[k], box = item(i + 1), ids = porFrase[k];
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Nesta frase há uma de cada."));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("dupla_" + k); }));
    box.appendChild(lin);
    var cx = el("div", "textinho");
    F.palavras.forEach(function(w, n){
      var pura = chaveQuadro(w);
      var qual = pura === chaveQuadro(F.cont) ? "c"
               : pura === chaveQuadro(F.inc) ? "u" : null;
      var id = qual ? ids[qual] : null;
      var b = el("button", "tp", w);
      b.setAttribute("aria-label", w);
      if(id){
        b.setAttribute("data-qa", "pinta-" + id + "-" + qual);
        b.setAttribute("data-lapis", qual);
        if(ST.resp[id]) b.className = "tp marca" + qual;
      }
      b.onclick = function(){
        if(id && ST.resp[id]) return;
        sPasso();
        if(!marca){ falar("toque_marca"); return; }
        if(qual === marca){
          b.className = "tp marca" + qual;
          acertou(id, "certo" + pi + "_" + k + "_" + qual);
        } else {
          b.className = "tp nao";
          setTimeout(function(){ b.className = "tp"; }, 420);
          errou(ids[marca], "dica" + pi + "_" + k);
        }
      };
      cx.appendChild(b);
      cx.appendChild(document.createTextNode(" "));
    });
    box.appendChild(cx);
    d.appendChild(box);
  });
}

/* ============ 5 — SOME or ANY? ============
   Da d30 (ezpzlearn), VERBATIM: *"Choose the correct answers."* — dezesseis
   frases de `some / any` com as três situações misturadas.
   ⭐ ABRE O BLOCO E JÁ MISTURA AS TRÊS SITUAÇÕES de propósito: afirmativa,
      negativa e pergunta. É a SITUAÇÃO que manda, não a palavra, e separar as
      três em folhas diferentes ensinaria a criança a chutar pelo bloco.
   ⚠️ AS DUAS EXCEÇÕES ENTRAM DECLARADAS: *Can I have…?* e *Would you like…?*
      levam `some` apesar de serem perguntas, porque são PEDIDO e OFERTA. Está
      no cartaz da d07 (*"some — It is also used in questions for offers and
      requests"*) e é o uso que o aluno mais precisa na vida. O porquê aparece
      escrito no acerto. */
function f08(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe se a frase <b>diz que tem</b>, se ela <b>nega</b> ou " +
            "se ela <b>pergunta</b>. Depois escolha.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var S = SOMEANY[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      S.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("sa_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "some", rot: "some", aria: "some", fala: "op_some"},
                    {v: "any", rot: "any", aria: "any", fala: "op_any"}]),
           S.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(S.pq, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}

/* ============ 6 — WHAT IS IN THE SUITCASE? ============
   Da d01 (LiveWorksheets), VERBATIM: *"Fill the gaps with a/ an/ some/ any."*;
   e da d10, *"Fill the gaps with some - any - a - an"*.
   ⭐ É A FOLHA ILUSTRADA DO BLOCO: aqui a criança VÊ a coisa antes de decidir, e
      é a figura que explica por que `an old clock` leva `an` e `money` não leva
      artigo nenhum. Quatro respostas possíveis, e todas as quatro aparecem.
   ⚠️ AS FIGURAS SAEM DA FOLHA DE PAPEL, recortadas da d24 — ordem do Marcos de
      14/set/2026: *"procure na internet, nada de imagem gerada por IA, utilize
      das atividades"*. Qual veio de onde está em `img/ORIGEM.json`. */
function f09(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe a figura e escolha: <b>a</b>, <b>an</b>, <b>some</b> " +
            "ou <b>any</b>?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var V = MALA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var c = el("div", "figsil");
    c.innerHTML = img(V.f, "figgrande", V.alt);
    box.appendChild(c);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", V.a + ' <i class="lacuna"></i> ' + V.b));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("malafr_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "a", rot: "a", aria: "a", fala: "op_a"},
                    {v: "an", rot: "an", aria: "an", fala: "op_an"},
                    {v: "some", rot: "some", aria: "some", fala: "op_some"},
                    {v: "any", rot: "any", aria: "any", fala: "op_any"}]),
           V.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 7 — MUCH or MANY? ============
   Da d07 (eslprintables), VERBATIM: *"B. Fill the blank spaces with much or
   many."*
   ⭐ FECHA O BLOCO PELA PERGUNTA, que é onde `much` e `many` realmente moram:
      ninguém diz *"I have many friends"* tanto quanto pergunta *"How many
      friends do you have?"*. E a pergunta é o que a criança vai usar falando.
   ⚠️ A FOLHA DE PAPEL TEM DEZOITO FRASES E CATORZE SÃO `many` — copiar a lista
      inteira ensinaria a criança a chutar `many` e acertar. Escolhi oito,
      quatro e quatro. */
function f14(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe a palavra que vem <b>depois</b> da lacuna: ela se " +
            "conta ou não?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var M = MUCHMANY[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      M.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a pergunta", function(){ falar("mm_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "much", rot: "much", aria: "much", fala: "op_much"},
                    {v: "many", rot: "many", aria: "many", fala: "op_many"}]),
           M.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 8 — CORRECT THE MISTAKES ============
   Da d02 (iSLCollective), VERBATIM: *"3. Correct the mistakes:"*
   ⭐ JULGAR É UM DEGRAU ACIMA DE ESCOLHER: a criança não recebe duas opções —
      ela olha a frase inteira e decide se ela se sustenta. É a mesma coisa que
      reler o próprio caderno antes de entregar.
   ⚠️ NA FOLHA DE PAPEL AS DEZESSETE FRASES ESTÃO TODAS ERRADAS, e isso não serve
      para julgar: quem percebesse o padrão responderia "errada" sempre e
      acertaria tudo sem ler nenhuma. Metade daqui está CERTA — e as certas são
      as próprias frases dela, consertadas. */
function f13(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Esta frase em inglês está <b>certa</b>, ou tem alguma " +
            "coisa errada?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var J = JULGA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", J.f));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("jul_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           [{v: "s", rot: "Está certa", aria: "Está certa", fala: "op_certa"},
            {v: "n", rot: "Tem erro", aria: "Tem erro", fala: "op_erro"}],
           J.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(J.pq, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}

/* ============ 9 — AT THE LOST & FOUND DESK ============
   ⭐ GESTO DO PAPEL, CONVERSA MINHA — e está declarado. O gesto vem da d08
      (*"Ex.2. Read the dialogue and fill in the gaps."*) e da d26 (*"Look at the
      menu and complete the conversation with a question from the box"*): as duas
      põem o quantificador dentro de uma CONVERSA, que é exatamente o que o
      currículo chama de *"práticas contextualizadas"*. O diálogo da d08 é sobre
      uma festa de aniversário; este é no balcão, porque é o mundo deste caderno.
   ⭐ E É A ÚNICA FOLHA EM QUE TUDO APARECE JUNTO: some, any, much e many numa
      conversa só — que é como eles aparecem na vida, e não em listas separadas. */
function f15(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  var cab = el("div", "enunlin");
  cab.appendChild(el("div", "ajuda", DIALOGO.titulo));
  cab.appendChild(botaoSom("Ouvir do que se trata", function(){ falar("dlgtit"); }));
  d.appendChild(cab);
  enunciado(d, pi, "Preencha a conversa: <b>some</b>, <b>any</b>, <b>much</b> " +
            "ou <b>many</b>.", "p" + pi + "enun");
  var pool = ST.folha["p" + pi], pos = {};
  pool.forEach(function(g, i){ pos[g] = "n" + pi + "_" + i; });
  DIALOGO.linhas.forEach(function(L, n){
    var box = item(0);
    var lin = el("div", "enunlin");
    var fala = el("div", "frasel", "<b>" + L.q + ":</b> " +
      L.t.replace(/___/g, '<i class="lacuna"></i>'));
    lin.appendChild(fala);
    lin.appendChild(botaoSom("Ouvir esta fala", function(){ falar("dlg_" + n); }));
    box.appendChild(lin);
    [L.g, L.g2].forEach(function(g){
      if(!g) return;
      var C = DIALOGO.lac[g], id = pos[g];
      opcoes(box, pi, id,
             baralha([{v: "some", rot: "some", aria: "some", fala: "op_some"},
                      {v: "any", rot: "any", aria: "any", fala: "op_any"},
                      {v: "much", rot: "much", aria: "much", fala: "op_much"},
                      {v: "many", rot: "many", aria: "many", fala: "op_many"}]),
             C.r, "pal", "certo" + pi + "_" + g, "dica" + pi + "_" + g,
             function(){ var x = el("div", "ajuda");
                         x.appendChild(nomeSecreto(C.pq, id)); box.appendChild(x); });
      fechaItem(d, box, id);
    });
    if(!L.g) d.appendChild(box);
  });
}

/* ============ 10 — MAKE A QUESTION ============
   Da d11 (makingenglishfun), VERBATIM: *"Make a Question. For Example: How much
   juice is there? There is some juice."*
   ⭐ É O DEGRAU MAIS ALTO DO BLOCO DOS QUANTIFICADORES: até aqui a criança
      escolhia uma palavra dentro de uma frase pronta; agora ela MONTA a pergunta
      inteira, e a ordem das palavras é a metade difícil do inglês. Ela recebe a
      RESPOSTA e tem de descobrir a pergunta — o caminho contrário do costume.
   ⚠️ A RESPOSTA DECLARADA É A FILA DE PEDAÇOS NA ORDEM, nunca a frase pronta:
      lição paga na Loteria do S — com a frase pronta ninguém, nem o jogador da
      banca nem o relatório, sabia em que ordem tocar, e a folha ficava sem
      medida nenhuma. */
function f17(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Esta é a <b>resposta</b>. Monte a <b>pergunta</b> tocando " +
            "nos pedaços na ordem certa.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var W = PERGUNTA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", W.resp));
    lin.appendChild(botaoSom("Ouvir a resposta", function(){ falar("perg_" + k); }));
    box.appendChild(lin);
    var mostra = el("div", "montada"), feito = "";
    mostra.appendChild(nomeSecreto(W.pedacos.join(" "), id));
    registra(id, pi, W.pedacos.map(function(p){ return chaveQuadro(p); }).join(" "));
    var linha = el("div", "ops"), passo = 0, bts = [];
    baralha(W.pedacos.map(function(p, x){ return x; })).forEach(function(x){
      var p = W.pedacos[x];
      var b = el("button", "op sil", p);
      b.setAttribute("aria-label", "Pedaço " + p);
      b.setAttribute("data-qa", "op-" + id + "-" + chaveQuadro(p));
      bts.push(b);
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        if(passo === x){
          b.className = "op sil usada";
          feito += (feito ? " " : "") + p; passo++;
          mostra.setAttribute("data-feito", feito);
          if(passo >= W.pedacos.length) acertou(id, "certo" + pi + "_" + k);
        } else {
          b.className = "op sil erro";
          setTimeout(function(){ b.className = "op sil"; }, 500);
          errou(id, "dica" + pi + "_" + k);
        }
      };
      linha.appendChild(b);
    });
    if(ST.resp[id]) bts.forEach(function(b){ b.className = "op sil usada"; });
    box.appendChild(mostra); box.appendChild(linha);
    fechaItem(d, box, id);
  });
}

/* ============ 11 — YES, THERE IS ============
   Da d01 (LiveWorksheets), VERBATIM: *"6. Is there any chicken? Yes, ______. ·
   7. Are there any oranges? No, ______."*
   ⭐ É A ÚNICA FOLHA DO CADERNO EM QUE O SINGULAR E O PLURAL MUDAM O VERBO, e
      não o substantivo: `is` × `are`, `isn't` × `aren't`. É o detalhe que a
      criança come na fala e que ninguém corrige.
   ⚠️ FOLHA DE LIGAR: os ids dela nascem dentro do `montaLigar` e ela está
      declarada em `var LIGAR` lá em cima. Errar esse número quebra DUAS folhas
      de uma vez — a que liga nunca fecha e a apontada fecha sozinha. */
function f18(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque na <b>pergunta</b> e depois na <b>resposta</b> que " +
            "combina com ela.", "p" + pi + "enun");
  var grupo = ST.folha["p" + pi][0];
  var pares = grupo.map(function(k){
    return {k: k,
            esq: '<span class="rotop">' + RESPCURTA[k].p + "</span>",
            dir: RESPCURTA[k].s,
            ariaE: RESPCURTA[k].p, ariaD: RESPCURTA[k].s,
            fe: "rp_" + k, fd: "rd_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  var cx = el("div", "");
  montaLigar(cx, pi, "g0", pares, d);
  d.appendChild(cx);
}

/* ============ 12 — ACHE O PRONOME NA FRASE ============
   Da b18 (eslforums), VERBATIM: *"1. Identify the Relative Pronoun (Underline
   the relative pronoun in each sentence)"*
   ⭐ ABRE O BLOCO DOS PRONOMES RELATIVOS PELO OLHO, não pela regra: antes de
      escolher qual pronome entra, a criança precisa VER onde ele mora. Todas as
      frases já estão prontas e certas; o que ela faz é apontar. É o degrau que
      falta em quase toda folha de papel, que já começa cobrando a escolha.
   ⭐ E É AQUI QUE O `that` APARECE PELA PRIMEIRA VEZ — sem ter de ser escolhido,
      só reconhecido (o porquê disso está no comentário da folha 14). */
function f19(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Em cada frase há <b>um</b> pronome relativo. Toque nele.",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var A = ACHA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, chaveQuadro(A.alvo));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Leia a frase e ache a palavra."));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("acha_" + k); }));
    box.appendChild(lin);
    var cx = el("div", "textinho");
    A.palavras.forEach(function(w, n){
      var pura = w.replace(/[^A-Za-z]/g, "");
      var certa = chaveQuadro(pura) === chaveQuadro(A.alvo);
      var b = el("button", "tp", w);
      b.setAttribute("aria-label", pura);
      b.setAttribute("data-qa", (certa ? "op-" + id + "-" + chaveQuadro(A.alvo)
                                       : "no-" + id + "-" + n));
      if(ST.resp[id] && certa) b.className = "tp achada";
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        if(certa){ b.className = "tp achada"; acertou(id, "certo" + pi + "_" + k); }
        else {
          b.className = "tp nao";
          setTimeout(function(){ b.className = "tp"; }, 420);
          errou(id, "dica" + pi + "_" + k);
        }
      };
      cx.appendChild(b);
      cx.appendChild(document.createTextNode(" "));
    });
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}

/* ============ 13 — WHO or WHICH? ============
   Da b20 (LiveWorksheets), VERBATIM: *"Complete the sentences using 'who, which
   or where'"*, e o cartaz dela: *"We use WHO to talk about a person · We use
   WHICH to talk about an object, or an animal"*.
   ⭐ A ESCOLHA MAIS SIMPLES PRIMEIRO, e ela é uma pergunta só: o que vem antes
      da lacuna é GENTE ou COISA? Todo o resto do bloco sai daqui.
   ⚠️ TIREI O `where` DAS OPÇÕES, e o motivo é o currículo: o 8º ano de Blumenau
      nomeia QUATRO pronomes (who, which, that, whose) e `where` não está entre
      eles. Deixá-lo na fileira faria a criança errar por um conteúdo que o ano
      dela não ensina — e as frases de lugar da folha ficaram fora do caderno. */
function f20(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe a palavra que vem <b>antes</b> da lacuna: é gente ou " +
            "é coisa?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var P = WHOWHICH[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      P.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("ww_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "who", rot: "who", aria: "who", fala: "op_who"},
                    {v: "which", rot: "which", aria: "which", fala: "op_which"}]),
           P.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 14 — WHO · WHICH · WHOSE ============
   Da b04 (7esl), VERBATIM: *"FILL IN THE BLANKS WITH THE CORRECT RELATIVE
   PRONOUN"*; e da b03 (iSLCollective).
   ⭐ O DEGRAU: de duas opções para três, e a terceira é a que ninguém adivinha —
      `whose`. É colada na 13 de propósito (repetição SEGUIDA, não espaçada).
   ⚠️⚠️ O `that` NÃO ESTÁ NA FILEIRA, e isso é uma decisão medida, não um
      esquecimento. Em toda frase de *"escolha o pronome"* das 54 folhas
      colhidas, onde cabe `who` também cabe `that`, e onde cabe `which` também
      cabe `that`: pôr os quatro na fileira seria reprovar a criança por ter
      escolhido uma resposta CERTA. O `that` tem lugar próprio neste caderno —
      a folha 12, onde ela o acha dentro da frase pronta, e a folha 17, onde ela
      julga *"This is the bank THAT was robbed yesterday"*, que é o único caso
      em que ele é indiscutível. Está escrito no dossiê do professor. */
function f21(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora são <b>três</b>. Se a coisa depois da lacuna é " +
            "<b>de alguém</b>, o pronome é outro.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var T = TRES[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      T.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("tres_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "who", rot: "who", aria: "who", fala: "op_who"},
                    {v: "which", rot: "which", aria: "which", fala: "op_which"},
                    {v: "whose", rot: "whose", aria: "whose", fala: "op_whose"}]),
           T.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 15 — WHOSE: DE QUEM É ISTO? ============
   Da b24 (LiveWorksheets), VERBATIM: *"Complete the sentences with who, which,
   whose and whom"* — e ela é a única das 24 folhas com SEIS exemplos limpos de
   `whose`, que é o pronome que quase toda folha trata numa frase só.
   ⭐ E AQUI HÁ UMA REGRA QUE SE VÊ, não que se decora: depois de `whose` vem
      sempre um SUBSTANTIVO (car, father, hair); depois de `who` vem sempre um
      VERBO (has, shouted, comes). A criança olha a palavra seguinte e decide.
      É a dica desta folha, e ela é verdadeira em inglês.
   ⭐ E É A FOLHA DO BALCÃO: *"the girl whose car had broken down"*, *"the man
      whose father is a professor"* — identificar alguém por uma coisa que é
      dele é o que se faz num balcão de achados e perdidos o dia inteiro. */
function f22(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe a palavra que vem <b>depois</b> da lacuna: se for uma " +
            "<b>coisa de alguém</b>, é whose.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var O = POSSE[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      O.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("po_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "who", rot: "who", aria: "who", fala: "op_who"},
                    {v: "whose", rot: "whose", aria: "whose", fala: "op_whose"}]),
           O.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 16 — WHAT IS IT? ============
   Da b22 (englishwsheets), VERBATIM: *"RELATIVE CLAUSES : Relative Pronouns —
   Fill in the blanks with 'who, which, whose, whom'"*, vinte e quatro
   quadrinhos em que cada um é uma DEFINIÇÃO: *"A butcher is a person ___ sells
   meat in a shop."*
   ⭐ A FRASE-DEFINIÇÃO É O USO MAIS NATURAL DO PRONOME RELATIVO: toda vez que
      alguém explica o que uma coisa é, ele aparece. Por isso esta folha fecha o
      bloco pelo SENTIDO, e não por mais uma escolha — a criança já sabe qual
      pronome cabe; aqui ela usa a frase inteira para reconhecer a coisa.
   ⚠️ AS FIGURAS DELA NÃO SE RECORTAM: a folha veio com 500×707, a menor das 54,
      e com uma marca d'água atravessada no meio. Mostrar aquilo ampliado
      reprovaria na regra de resolução do `_qa/leiaute_mao.js` (1,35×) — e
      ampliar figura é exatamente o que o Marcos mandou parar de fazer em
      14/set. O que entra desta folha é o TEXTO. */
function f26(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque no <b>nome</b> e depois na <b>explicação</b> dele.",
            "p" + pi + "enun");
  var grupo = ST.folha["p" + pi][0];
  var pares = grupo.map(function(k){
    return {k: k,
            esq: '<span class="rotop">' + DEFINE[k].p + "</span>",
            dir: DEFINE[k].s,
            ariaE: DEFINE[k].p, ariaD: DEFINE[k].s,
            fe: "def_" + k, fd: "defd_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  var cx = el("div", "");
  montaLigar(cx, pi, "g0", pares, d);
  d.appendChild(cx);
}

/* ============ 17 — CERTA OU ERRADA? ============
   Da b05 (iSLCollective), VERBATIM: *"2) Read the sentences below and put (C)
   CORRECT or (W) WRONG. Correct the worng one."*
   ⭐ É A FOLHA MAIS BEM ESCOLHIDA DAS 54, e o mérito é da professora que a fez:
      os erros que ela põe são exatamente os que o aluno comete — *"A boy WHO
      sister is in my class"* e *"a book WHICH pages are dirty"*, os dois com
      `whose` trocado. Julgar o erro do outro é ver o próprio erro de fora, que é
      um degrau acima de responder certo.
   ⭐ E É AQUI QUE O `that` É MEDIDO: *"This is the bank THAT was robbed
      yesterday"* está CERTA, e é o único lugar do caderno em que isso não admite
      discussão (ver o comentário da folha 14). */
function f27(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Olhe o pronome <b>em negrito</b>. Ele está no lugar certo?",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var U = JULGAP[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", U.f));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("julp_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           [{v: "s", rot: "Está certa", aria: "Está certa", fala: "op_certa"},
            {v: "n", rot: "Tem erro", aria: "Tem erro", fala: "op_erro"}],
           U.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(U.pq, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}

/* ============ 18 — JOIN THE TWO SENTENCES ============
   Da b12 (eslprintables), VERBATIM: *"B. Join the pairs of sentences using
   relative pronouns."*; da b06, *"C. Join the two sentences into one."*; e a b17
   desenha a regra com uma seta: *"We can use relative pronouns to connect two
   phrases. He is the man. He is my doctor. (who) → He is the man who is my
   doctor."*
   ⭐⭐ É O CORAÇÃO DO CADERNO. *"Juntar duas frases numa só"* é, palavra por
      palavra, o que o currículo de Blumenau chama de **"construir períodos
      compostos por subordinação"**. Escolher entre três pronomes é RECONHECER;
      juntar duas frases é CONSTRUIR — e só esta folha mede isso.
   ⭐ O ÚLTIMO ITEM PÕE A ORAÇÃO NO MEIO (*"The dog whose owner is Ms Nora chased
      me"*), que é o degrau: até ali ela sempre entrava no fim da frase.
   ⚠️ O QUE SE MEDE AQUI É A ORDEM — o pronome já vem escrito na peça. Quem mede
      a ESCOLHA do pronome é a folha 19, no teclado. Duas decisões diferentes,
      duas folhas. */
function f30(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Junte as <b>duas frases numa só</b>. Toque nos pedaços na " +
            "ordem certa.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var Z = JUNTA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", Z.a + " &nbsp;+&nbsp; " + Z.b));
    lin.appendChild(botaoSom("Ouvir as duas frases", function(){ falar("jun_" + k); }));
    box.appendChild(lin);
    var mostra = el("div", "montada"), feito = "";
    mostra.appendChild(nomeSecreto(Z.pedacos.join(" "), id));
    registra(id, pi, Z.pedacos.map(function(p){ return chaveQuadro(p); }).join(" "));
    var linha = el("div", "ops"), passo = 0, bts = [];
    baralha(Z.pedacos.map(function(p, x){ return x; })).forEach(function(x){
      var p = Z.pedacos[x];
      var b = el("button", "op sil frase", p);
      b.setAttribute("aria-label", "Pedaço " + p);
      b.setAttribute("data-qa", "op-" + id + "-" + chaveQuadro(p));
      bts.push(b);
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        if(passo === x){
          b.className = "op sil frase usada";
          feito += (feito ? " " : "") + p; passo++;
          mostra.setAttribute("data-feito", feito);
          if(passo >= Z.pedacos.length) acertou(id, "certo" + pi + "_" + k);
        } else {
          b.className = "op sil frase erro";
          setTimeout(function(){ b.className = "op sil frase"; }, 500);
          errou(id, "dica" + pi + "_" + k);
        }
      };
      linha.appendChild(b);
    });
    if(ST.resp[id]) bts.forEach(function(b){ b.className = "op sil frase usada"; });
    box.appendChild(mostra); box.appendChild(linha);
    fechaItem(d, box, id);
  });
}

/* ============ 19 — ESCREVA O PRONOME QUE FALTA ============
   Da b03 (iSLCollective), VERBATIM: *"Complete the sentences with relative
   pronouns from the box."*; e da b07 (eslprintables), *"Fill in the correct
   relative pronouns."*
   ⭐ ESCREVER É OUTRA COISA QUE ESCOLHER: com quatro botões na tela a criança
      pode acertar por eliminação; com o teclado ela tem de SABER a palavra. É o
      degrau que fecha o bloco.
   ⚠️⚠️ AS SEIS FRASES TÊM VÍRGULA, E ISSO NÃO É ESTILO: é o que torna o gabarito
      ÚNICO. Depois de vírgula o inglês não aceita `that` — então, das quatro
      palavras do currículo, só uma cabe em cada lacuna, e a criança não pode ser
      reprovada por ter escrito uma resposta que também estaria certa. A regra
      vira a dica da folha, e ela é verdadeira.
   ⚠️ E O TECLADO DA CASA NÃO TEM BARRA DE ESPAÇO: por isso todo gabarito aqui é
      UMA palavra só. Em inglês não há acento, então o alfabeto basta.
   ⚠️ AS DUAS PORTAS: o teclado da tela e o teclado DE VERDADE funcionam juntos —
      no PC da escola a criança vai digitar. */
function f32(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Escreva o pronome que falta. Repare: toda frase aqui tem " +
            "<b>vírgula</b> — e depois de vírgula o inglês nunca usa that.",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var X = ESCREVE[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, X.r);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", X.a + ' <i class="lacuna"></i> ' + X.b));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("esc_" + k); }));
    box.appendChild(lin);
    var grade = el("div", "cruz uma"), cels = [], t;
    grade.setAttribute("data-qa", "esc-" + id);
    for(t = 0; t < X.r.length; t++){
      var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
                 ST.resp[id] ? X.r.charAt(t) : "");
      c.setAttribute("aria-label", "Casa da palavra");
      cels.push(c); grade.appendChild(c);
    }
    var E = {k: k, w: X.r, id: id, cels: cels, n: i + 1,
             rot: "Escreva o pronome relativo", bt: el("span", "pista oculta", "")};
    cels.forEach(function(c){ c.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); }; });
    grade.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); };
    box.appendChild(grade);
    fechaItem(d, box, id);
  });
}

/* ============ 20 — THE MAN WHO WROTE HAMLET ============
   ⭐ O TEXTO É MEU, FEITO DAS FRASES DA b07 e da b16 — e está declarado. A b07 é
      a única das 54 folhas que traz conteúdo cultural de verdade (Shakespeare,
      o Globe Theatre, Stonehenge, Loch Ness), e o currículo de Blumenau tem um
      EIXO INTEIRO pedindo isso: *"Construir repertório cultural por meio do
      contato com manifestações artístico-culturais vinculadas à Língua
      Inglesa"*. Frase de gramática que também ensina quem foi Shakespeare vale
      por duas.
   ⭐ E AS PERGUNTAS NÃO SÃO SÓ DE COMPREENSÃO: três delas perguntam POR QUE o
      pronome é aquele. É o conceito vindo por ÚLTIMO, que é a lei da casa — a
      criança já usou os quatro pronomes em oito folhas; só agora ela é
      convidada a dizer a regra com as próprias palavras. */
function f33(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  var cab = el("div", "enunlin");
  cab.appendChild(el("div", "ajuda", TEXTO.titulo));
  cab.appendChild(botaoSom("Ouvir o texto", function(){ falar("hist_" + TEXTO.k); }));
  d.appendChild(cab);
  d.appendChild(el("div", "textao", TEXTO.corpo));
  enunciado(d, pi, "Agora responda sobre o texto.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(qk, i){
    var P = TEXTO.perg[parseInt(qk.slice(1), 10)];
    if(!P) return;
    var id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "enun", P.q));
    lin.appendChild(botaoSom("Ouvir a pergunta", function(){ falar("pergh_" + i); }));
    box.appendChild(lin);
    var lista = P.o.map(function(w, x){
      return {v: "o" + x, rot: w, aria: w, fala: "resph_" + i + "_" + x};
    });
    opcoes(box, pi, id, lista, "o" + P.r, "pal",
           "certo" + pi + "_" + i, "dica" + pi + "_" + i,
           P.pq ? function(){ var x2 = el("div", "ajuda");
                              x2.appendChild(nomeSecreto(P.pq, id)); box.appendChild(x2); } : null);
    fechaItem(d, box, id);
  });
}

/* ============ 21 — MARK EVERY UNCOUNTABLE ============
   O gesto vem da d13 (*"2 Circle the correct 'Quantifier'"*) e da d21
   (*"Classify the following words in countable (C) or uncountable(U)"*).
   ⭐ REVISÃO ESPAÇADA (Roediger, Bjork): o bloco do contável × incontável ficou
      dezessete folhas atrás, e é justamente por isso que ele volta aqui. O
      Aquecimento no fim não é enchimento — é o que fixa.
   ⭐ E AS DOZE PALAVRAS SÃO AS DO BALCÃO: money, key, water, book, music,
      suitcase, rice, camera, time, ticket, milk, dress. A criança fecha o
      caderno com o vocabulário que abriu.
   ⚠️ AQUI ELA MARCA VÁRIAS E SÓ DEPOIS CONFERE: pode mudar de ideia antes de
      entregar, que é uma decisão diferente de responder uma por uma. */
function f34(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Marque <b>todas</b> as palavras que <b>não se contam</b>. " +
            "Depois toque em <b>Conferir</b>.", "p" + pi + "enun");
  var id = "n" + pi + "_0", lista = ST.folha["p" + pi][0], certas = [];
  lista.forEach(function(k){ if(MARCAR[k].inc) certas.push(k); });
  registra(id, pi, certas.join(" "));
  var box = item(0);
  var cx = el("div", "marcax fichas"), marcadas = {}, bts = {};
  baralha(lista.slice(0)).forEach(function(k){
    var b = el("button", "lx ficha",
               '<span class="cx"></span><span class="rotop">' + MARCAR[k].n +
               '</span><span class="ft"></span>');
    b.setAttribute("aria-label", MARCAR[k].n);
    b.setAttribute("data-qa", "mc-" + id + "-" + k);
    bts[k] = b;
    b.onclick = function(){
      if(ST.resp[id]) return;
      sPasso(); falar("diz21_" + k);
      if(marcadas[k]){ delete marcadas[k]; b.className = "lx ficha";
                       b.querySelector(".cx").textContent = ""; }
      else { marcadas[k] = 1; b.className = "lx ficha marcada";
             b.querySelector(".cx").textContent = "X"; }
    };
    cx.appendChild(b);
  });
  box.appendChild(cx);
  function revela(){
    var kk;
    for(kk in bts){
      bts[kk].className = "lx ficha " + (MARCAR[kk].inc ? "certa" : "erroficha");
      if(MARCAR[kk].inc) bts[kk].querySelector(".cx").textContent = "X";
    }
  }
  var bt = el("button", "bt pronto", "Conferir");
  bt.setAttribute("data-qa", "conferir-" + id);
  bt.onclick = function(){
    if(ST.resp[id]) return;
    var erro = 0, kk;
    for(kk in bts) if(!!MARCAR[kk].inc !== !!marcadas[kk]) erro++;
    if(erro){
      for(kk in bts) if(marcadas[kk] && !MARCAR[kk].inc) bts[kk].className = "lx ficha errada";
      setTimeout(function(){ var g; for(g in bts) if(marcadas[g]) bts[g].className = "lx ficha marcada"; }, 900);
      errou(id, "dica" + pi);
      return;
    }
    revela(); bt.style.display = "none";
    acertou(id, "certo" + pi);
  };
  if(ST.resp[id]){ revela(); bt.style.display = "none"; }
  box.appendChild(bt);
  fechaItem(d, box, id);
}

/* ============ 22 — O CARTAZ QUE EU LEVO (o fecho com gancho) ============
   ⚠️ O FECHO DAS FOLHAS DE ORIGEM é *"Make your own sentences"* (b18) e *"Write
      one sentence using a relative pronoun"* (b10) — produção escrita livre, que
      a tela não corrige. O que a tela sabe fazer é a criança MONTAR o cartaz
      dela: toca na regra, a regra entra no cartaz com um exemplo, e o cartaz
      cresce embaixo.
   ⭐ É O "QUERO MAIS": ela sai daqui com um lembrete que é DELA, para colar no
      caderno de papel — e é ali, no papel, com o professor, que a escrita de
      frases que a tela não mede vai acontecer. O dossiê diz isso a ele.
   ⚠️ AQUI NÃO HÁ RESPOSTA CERTA NEM ERRADA. A criança escolhe as regras que quer
      levar, e o portão do "beco sem saída" precisa disso declarado: toda peça é
      alvo. */
function f35(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Escolha as regras que você quer no <b>seu cartaz</b>. " +
            "Pode escolher quantas quiser.", "p" + pi + "enun");
  var cartaz = el("div", "rua cartaz");
  function pintaCartaz(){
    cartaz.innerHTML = "";
    var n = 0;
    ST.folha["p" + pi].forEach(function(k, x){
      if(ST.resp["n" + pi + "_" + x]){
        cartaz.appendChild(el("div", "regral",
          "<b>" + CARTAZ[k].t + "</b><i>" + CARTAZ[k].ex + "</i>"));
        n++;
      }
    });
    if(!n) cartaz.appendChild(el("span", "ajuda", "o seu cartaz ainda está vazio…"));
  }
  var mural = el("div", "mural");
  ST.folha["p" + pi].forEach(function(k, i){
    var id = "n" + pi + "_" + i;
    registra(id, pi, CARTAZ[k].t);
    var c = el("button", "cartaocasa" + (ST.resp[id] ? " escolhido" : ""),
               '<span class="rotop">' + CARTAZ[k].t + "</span>");
    c.setAttribute("aria-label", CARTAZ[k].t);
    c.setAttribute("data-qa", "item-" + id);
    c.setAttribute("data-alvo", "1");
    c.onclick = function(){
      if(ST.resp[id]) return;
      sPasso(); c.className = "cartaocasa escolhido";
      pintaCartaz();
      acertou(id, "certo" + pi + "_" + k);
    };
    mural.appendChild(c);
  });
  d.appendChild(mural);
  d.appendChild(el("div", "ajuda", "O seu cartaz:"));
  d.appendChild(cartaz);
  pintaCartaz();
}

/* ############################################################
   AS TREZE FOLHAS QUE VIERAM COM O PISO DE 35 (15/set/2026)

   ⭐ O MARCOS CRONOMETROU: *"essas 20 25 folhas duram 30 minutos, precisamos
      elevar um pouco mais as folhas para umas 35 folhas"*. E logo depois deu a
      estratégia: *"repetir o mesmo exercício em duas folhas, claro questões
      diferentes"*, com o limite dele — *"só não dobrar quando for cruzadinha,
      memória, caça palavras, forca"*.
   ⚠️ E A CONDIÇÃO DA CASA CONTINUA VALENDO em cima da ideia dele: a segunda
      folha do par SOBE UM DEGRAU, senão a criança diz "isso eu já fiz". Aqui:
      a 31 põe a oração no MEIO da frase (a 30 punha no fim); a 28 pede a
      ORAÇÃO inteira (a 19 pedia só o pronome); a 12 volta ao contável num
      mundo novo (o safári).
   ⚠️ NENHUMA DELAS É FOLHA DE ENCHIMENTO: todas saíram do mesmo crivo
      (`_sequencias/POTE-ING8.md`), de folhas que ficaram de fora por falta de
      lugar, não por falta de valor.
   ############################################################ */

/* ============ 4 — MATCH THE PICTURES ============
   Da d07 (eslprintables), VERBATIM: *"Are the following countable or
   uncountable? Match the pictures with the nouns"*; e da d20, *"MATCH THE
   PICTURES TO THE NOUNS"*.
   ⭐ O DEGRAU CONCRETO DO BLOCO: nas folhas 1 a 3 a criança lia a palavra; aqui
      ela vê a coisa e tem de achar o nome dela em inglês. É a mesma mala que
      volta na folha 9 — reencontrar a figura ajuda, não atrapalha. */
function f04(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque na <b>figura</b> e depois no <b>nome</b> dela em inglês.",
            "p" + pi + "enun");
  var grupo = ST.folha["p" + pi][0];
  var pares = grupo.map(function(k){
    return {k: k,
            esq: img(LIGAFIG[k].f, "figop", LIGAFIG[k].alt),
            dir: LIGAFIG[k].p,
            ariaE: LIGAFIG[k].alt, ariaD: LIGAFIG[k].p,
            fe: "ligafige_" + k, fd: "ligafigd_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  var cx = el("div", "");
  montaLigar(cx, pi, "g0", pares, d);
  d.appendChild(cx);
}

/* ============ 5 — A, AN ou nada? ============
   Da d26 (iSLCollective), VERBATIM: *"2.- Write A or AN or – if no article is
   needed."*
   ⭐ A TERCEIRA OPÇÃO É A QUE ENSINA: o traço. `rice`, `sugar` e `ice cream`
      não levam artigo nenhum, e é exatamente aí que o aluno brasileiro erra —
      em português a gente diz *"o arroz"*, e ele escreve *"a rice"*.
   ⚠️ A chave da resposta "nenhum artigo" é `x`, e não `-`: hífen dentro de um
      `data-qa` vira separador e o jogador da banca perde a peça. */
function f05(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "O que vem antes desta palavra: <b>a</b>, <b>an</b>, ou " +
            "<b>nada</b>?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var T = ARTIGO[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    var pal = el("div", "pgrande", T.p);
    pal.setAttribute("data-alvo", "1");
    lin.appendChild(pal);
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("art_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           [{v: "a", rot: "a", aria: "a", fala: "op_a"},
            {v: "an", rot: "an", aria: "an", fala: "op_an"},
            {v: "x", rot: "— nada —", aria: "nenhum artigo", fala: "op_nada"}],
           T.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 6 — WRITE THE CORRECT FORM ============
   Da d02 (iSLCollective), VERBATIM: *"2. Write the words in the correct form:"*
   ⭐ ESCREVER O PLURAL É O QUE FECHA O BLOCO DO CONTÁVEL: dizer que `apple` se
      conta é uma coisa; escrever `apples`, `tomatoes` e `dresses` com a mão é
      outra. E os três plurais difíceis do inglês estão aqui — o `-es` depois
      de o, de ss e de ch.
   ⚠️ AS DUAS PORTAS: o teclado da tela e o teclado DE VERDADE, juntos. */
function f06(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Escreva a palavra do parêntese no <b>plural</b>.",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var L = PLURAL[k], id = "n" + pi + "_" + i, box = item(i + 1);
    registra(id, pi, L.r);
    var lin = el("div", "enunlin");
    var fr = el("div", "frasel", L.a + ' <i class="lacuna"></i> ' + L.b);
    lin.appendChild(fr);
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("plu_" + k); }));
    box.appendChild(lin);
    var dado = el("div", "ajuda", "(" + L.d + ")");
    dado.setAttribute("data-alvo", "1");
    box.appendChild(dado);
    var grade = el("div", "cruz uma"), cels = [], t;
    grade.setAttribute("data-qa", "esc-" + id);
    for(t = 0; t < L.r.length; t++){
      var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
                 ST.resp[id] ? L.r.charAt(t) : "");
      c.setAttribute("aria-label", "Casa da palavra");
      cels.push(c); grade.appendChild(c);
    }
    var E = {k: k, w: L.r, id: id, cels: cels, n: i + 1,
             rot: "Escreva no plural", bt: el("span", "pista oculta", "")};
    cels.forEach(function(c){ c.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); }; });
    grade.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); };
    box.appendChild(grade);
    fechaItem(d, box, id);
  });
}

/* ============ 10 — O BILHETE DO SAFÁRI ============
   Da d21 (eslprintables), VERBATIM: *"Complete with some or any:"* — e as cinco
   frases são dela, palavra por palavra.
   ⭐ A d21 É A ÚNICA DAS TRINTA FOLHAS DE QUANTIFICADOR QUE SAI DA COZINHA:
      zebra, leão, crocodilo, barraca, marshmallow de fogueira. Um acampamento
      de safári é contexto de 8º ano; comida com figurinha não é.
   ⚠️ O que é MEU aqui é só o envelope: as frases dela viraram um BILHETE, para
      o quantificador aparecer dentro de um texto e não numa lista solta. */
function f10(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  var cab = el("div", "enunlin");
  cab.appendChild(el("div", "ajuda", BILHETE.titulo));
  cab.appendChild(botaoSom("Ouvir de que se trata", function(){ falar("biltit"); }));
  d.appendChild(cab);
  enunciado(d, pi, "Preencha o bilhete: <b>some</b> ou <b>any</b>?",
            "p" + pi + "enun");
  var pos = {};
  ST.folha["p" + pi].forEach(function(g, i){ pos[g] = "n" + pi + "_" + i; });
  BILHETE.linhas.forEach(function(L, n){
    var box = item(n + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      L.t.replace(/___/g, '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir esta linha", function(){ falar("bil_" + n); }));
    box.appendChild(lin);
    var C = BILHETE.lac[L.g], id = pos[L.g];
    opcoes(box, pi, id,
           baralha([{v: "some", rot: "some", aria: "some", fala: "op_some"},
                    {v: "any", rot: "any", aria: "any", fala: "op_any"}]),
           C.r, "pal", "certo" + pi + "_" + L.g, "dica" + pi + "_" + L.g,
           function(){ var x = el("div", "ajuda");
                       x.appendChild(nomeSecreto(C.pq, id)); box.appendChild(x); });
    fechaItem(d, box, id);
  });
}

/* ============ 11 — LET'S MAKE A PIZZA ============
   Da d05 (eslprintables), VERBATIM: a lista de ingredientes e o bloco
   *"Understanding:"* com as perguntas de `any`.
   ⭐ LER PARA RESPONDER, e não para traduzir: a criança procura no texto se o
      ingrediente está lá e responde com a forma curta (*Yes, we do / No, we
      don't*). É o `any` dentro de uma tarefa de leitura, que é o que o
      currículo chama de prática contextualizada.
   ⚠️ A FOLHA DE PAPEL ESCREVE *"Tomato source"*, e isso é erro dela (molho é
      *sauce*; *source* é fonte). Corrigi, e está declarado no dossiê — copiar o
      erro seria ensinar errado. Duas perguntas dela ficaram fora pelo mesmo
      motivo (*"Do we have to wait any time after prepare the pizza?"*). */
function f11(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  var cab = el("div", "enunlin");
  cab.appendChild(el("div", "ajuda", PIZZA.titulo));
  cab.appendChild(botaoSom("Ouvir a receita", function(){ falar("rec_" + PIZZA.k); }));
  d.appendChild(cab);
  d.appendChild(el("div", "textao", PIZZA.corpo));
  enunciado(d, pi, "Olhe a receita e responda.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(qk, i){
    var P = PIZZA.perg[parseInt(qk.slice(1), 10)];
    if(!P) return;
    var id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "enun", P.q));
    lin.appendChild(botaoSom("Ouvir a pergunta", function(){ falar("pizq_" + i); }));
    box.appendChild(lin);
    var lista = P.o.map(function(w, x){
      return {v: "o" + x, rot: w, aria: w, fala: "pizr_" + i + "_" + x};
    });
    opcoes(box, pi, id, lista, "o" + P.r, "pal",
           "certo" + pi + "_" + i, "dica" + pi + "_" + i,
           function(){ var x2 = el("div", "ajuda");
                       x2.appendChild(nomeSecreto(P.pq, id)); box.appendChild(x2); });
    fechaItem(d, box, id);
  });
}

/* ============ 12 — O QUE CABE NA MOCHILA ============
   Da d21, VERBATIM: *"Classify the following words in countable (C) or
   uncountable(U):"*
   ⭐ REVISÃO ESPAÇADA ainda dentro do caderno (Roediger, Bjork), e num mundo
      DIFERENTE: a mesma ideia do bloco 1, agora com o vocabulário do safári. É
      trocar o contexto que faz a revisão valer — repetir a mesma lista seria só
      repetir a mesma tela.
   ⚠️ A folha de papel tem sete contáveis e três incontáveis, e marcar três de
      dez é fácil demais; `sand` e `grass` entraram para ficar sete e cinco, e
      estão declarados no bloco de dados. */
function f12(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Marque <b>tudo</b> o que <b>não se conta</b>. Depois toque " +
            "em <b>Conferir</b>.", "p" + pi + "enun");
  var id = "n" + pi + "_0", lista = ST.folha["p" + pi][0], certas = [];
  lista.forEach(function(k){ if(MOCHILA[k].inc) certas.push(k); });
  registra(id, pi, certas.join(" "));
  var box = item(0);
  var cx = el("div", "marcax fichas"), marcadas = {}, bts = {};
  baralha(lista.slice(0)).forEach(function(k){
    var b = el("button", "lx ficha",
               '<span class="cx"></span><span class="rotop">' + MOCHILA[k].n +
               '</span><span class="ft"></span>');
    b.setAttribute("aria-label", MOCHILA[k].n);
    b.setAttribute("data-qa", "mc-" + id + "-" + k);
    bts[k] = b;
    b.onclick = function(){
      if(ST.resp[id]) return;
      sPasso(); falar("moc_" + k);
      if(marcadas[k]){ delete marcadas[k]; b.className = "lx ficha";
                       b.querySelector(".cx").textContent = ""; }
      else { marcadas[k] = 1; b.className = "lx ficha marcada";
             b.querySelector(".cx").textContent = "X"; }
    };
    cx.appendChild(b);
  });
  box.appendChild(cx);
  function revela(){
    var kk;
    for(kk in bts){
      bts[kk].className = "lx ficha " + (MOCHILA[kk].inc ? "certa" : "erroficha");
      if(MOCHILA[kk].inc) bts[kk].querySelector(".cx").textContent = "X";
    }
  }
  var bt = el("button", "bt pronto", "Conferir");
  bt.setAttribute("data-qa", "conferir-" + id);
  bt.onclick = function(){
    if(ST.resp[id]) return;
    var erro = 0, kk;
    for(kk in bts) if(!!MOCHILA[kk].inc !== !!marcadas[kk]) erro++;
    if(erro){
      for(kk in bts) if(marcadas[kk] && !MOCHILA[kk].inc) bts[kk].className = "lx ficha errada";
      setTimeout(function(){ var g; for(g in bts) if(marcadas[g]) bts[g].className = "lx ficha marcada"; }, 900);
      errou(id, "dica" + pi);
      return;
    }
    revela(); bt.style.display = "none";
    acertou(id, "certo" + pi);
  };
  if(ST.resp[id]){ revela(); bt.style.display = "none"; }
  box.appendChild(bt);
  fechaItem(d, box, id);
}

/* ============ 16 — THE DELICIOUS LITTLE HOUSE ============
   Da d26 (iSLCollective), VERBATIM: *"3. - Look at the menu and complete the
   conversation with a question from the box."* — e o cardápio, com os preços,
   é o dela.
   ⭐ AQUI A CRIANÇA NÃO PREENCHE UMA PALAVRA: ela escolhe a PERGUNTA inteira.
      É um degrau diferente — em vez de saber qual quantificador cabe na lacuna,
      ela tem de saber o que se pergunta para chegar àquela resposta. É o
      caminho de trás para frente, como na folha 17.
   ⚠️ A caixa de perguntas da folha de papel veio cortada na colheita, então as
      quatro perguntas são minhas, montadas sobre o cardápio dela. Declarado. */
function f16(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  var cab = el("div", "enunlin");
  cab.appendChild(el("div", "ajuda", CARDAPIO.titulo));
  cab.appendChild(botaoSom("Ouvir o cardápio", function(){ falar("menu_" + CARDAPIO.k); }));
  d.appendChild(cab);
  d.appendChild(el("div", "textao", CARDAPIO.corpo));
  enunciado(d, pi, "Esta é a <b>resposta</b> do garçom. Qual foi a " +
            "<b>pergunta</b>?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(qk, i){
    var P = CARDAPIO.perg[parseInt(qk.slice(1), 10)];
    if(!P) return;
    var id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", P.q));
    lin.appendChild(botaoSom("Ouvir a resposta", function(){ falar("menq_" + i); }));
    box.appendChild(lin);
    var lista = P.o.map(function(w, x){
      return {v: "o" + x, rot: w, aria: w, fala: "menr_" + i + "_" + x};
    });
    opcoes(box, pi, id, lista, "o" + P.r, "pal",
           "certo" + pi + "_" + i, "dica" + pi + "_" + i,
           function(){ var x2 = el("div", "ajuda");
                       x2.appendChild(nomeSecreto(P.pq, id)); box.appendChild(x2); });
    fechaItem(d, box, id);
  });
}

/* ============ 23 — ESCOLHA ENTRE QUATRO ============
   Da b09 (7esl), VERBATIM: *"Choose the correct relative pronoun to complete
   the sentences."*, com quatro alternativas em cada.
   ⭐ É O FORMATO DE PROVA que o aluno de 8º ano vai encontrar — e o distrator é
      o que ensina: `whose` aparece em todas as quatro alternativas de todas as
      questões, obrigando a pensar em posse a cada vez.
   ⭐ E A QUESTÃO DO `that` É DELA, não minha: no item c4 as alternativas são
      that, where, whose e when — `which` não está entre elas, e `that` é a
      única possível. Terceira medição do `that` neste caderno, todas em
      lugares em que ele não admite discussão. */
function f23(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora são <b>quatro</b> opções. Só uma cabe.",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = QUIZ[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      C.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("quiz_" + k); }));
    box.appendChild(lin);
    var lista = C.o.map(function(w){
      return {v: w, rot: w, aria: w, fala: "op_" + w};
    });
    opcoes(box, pi, id, lista, C.r, "pal",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 24 — BRITISH THINGS ============
   Da b07 (eslprintables), VERBATIM: *"Fill in the correct relative pronouns."*
   ⭐ A ÚNICA DAS 54 FOLHAS COM CONTEÚDO CULTURAL DE VERDADE, e o currículo de
      Blumenau tem um eixo inteiro pedindo isso (DIMENSÃO INTERCULTURAL:
      *"Construir repertório cultural por meio do"* contato com manifestações
      artístico-culturais vinculadas à Língua Inglesa). Frase de gramática que
      também conta quem foi Guy Fawkes vale por duas.
   ⭐ E O ITEM `e3` É O CASO CLÁSSICO DO `that`: depois de um superlativo (*the
      most famous novel*) o inglês pede `that`, e `which` soa errado. Quarta e
      última medição do `that` no caderno. */
function f24(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Coisas da Inglaterra. Qual pronome cabe em cada frase?",
            "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = CULTURA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel",
      C.f.replace("___", '<i class="lacuna"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("cult_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id,
           baralha([{v: "who", rot: "who", aria: "who", fala: "op_who"},
                    {v: "which", rot: "which", aria: "which", fala: "op_which"},
                    {v: "whose", rot: "whose", aria: "whose", fala: "op_whose"},
                    {v: "that", rot: "that", aria: "that", fala: "op_that"}]),
           C.r, "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ============ 25 — AS DUAS METADES ============
   As frases são as da b18 (eslforums), VERBATIM, cortadas ao meio.
   ⭐⭐ É O DEGRAU QUE FALTAVA ANTES DE JUNTAR. Nas folhas 19 a 24 a criança
      escolhe uma palavra dentro de uma frase pronta; na 30 ela monta a frase
      inteira. Entre as duas coisas há um salto, e esta folha é a ponte: a frase
      já vem partida no lugar certo, e o que ela faz é ver que a metade de cima
      (*the woman who called you*) só se completa com uma metade de baixo.
   ⚠️ O CORTE É SEMPRE NO FIM DA ORAÇÃO RELATIVA, e é isso que a folha ensina
      sem dizer: a oração fica GRUDADA no nome que explica, e o resto da frase
      principal vem depois dela. */
function f25(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Cada frase foi cortada ao meio. Toque no <b>começo</b> e " +
            "depois no <b>fim</b> dela.", "p" + pi + "enun");
  var grupo = ST.folha["p" + pi][0];
  var pares = grupo.map(function(k){
    return {k: k,
            esq: '<span class="rotop">' + METADES[k].a + "</span>",
            dir: METADES[k].b,
            ariaE: METADES[k].a, ariaD: METADES[k].b,
            fe: "mete_" + k, fd: "metd_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  var cx = el("div", "");
  montaLigar(cx, pi, "g0", pares, d);
  d.appendChild(cx);
}

/* ============ 28 — ACHE A ORAÇÃO INTEIRA ============
   Degrau da b18, cujo comando é *"Underline the relative pronoun in each
   sentence"*.
   ⭐ NA FOLHA 19 ELA ACHA O PRONOME; AQUI, A ORAÇÃO TODA. É a diferença entre
      ver a dobradiça e ver a porta: o pronome sozinho não explica nada — o que
      explica o nome é tudo o que vem depois dele, até a frase principal voltar.
      Sem este degrau, "juntar duas frases" vira decorar uma fórmula.
   ⭐ E É A IDEIA DO MARCOS EM AÇÃO (*"repetir o mesmo exercício em duas folhas,
      claro questões diferentes"*) com a condição da casa por cima: a segunda
      folha do par SOBE — não é a mesma tarefa com outras frases.
   ⚠️ A RESPOSTA DECLARADA SÃO AS POSIÇÕES das palavras, não as palavras: numa
      frase com `is` duas vezes, contar por palavra faria a folha fechar com a
      segunda ainda por marcar (lição paga na Fábrica de Nomes, no "joão"). */
function f28(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque em <b>todas</b> as palavras da parte que " +
            "<b>explica</b> — do pronome até onde ela acaba.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var O = ORACAO[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var certas = [], n;
    for(n = O.de; n <= O.ate; n++) certas.push("w" + n);
    registra(id, pi, certas.join(" "));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Comece pelo pronome."));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("orac_" + k); }));
    box.appendChild(lin);
    var cx = el("div", "textinho"), faltam = certas.length, achadas = {};
    O.palavras.forEach(function(w, x){
      var dentro = (x >= O.de && x <= O.ate);
      var b = el("button", "tp", w);
      b.setAttribute("aria-label", w);
      b.setAttribute("data-qa", (dentro ? "op-" + id + "-w" + x : "no-" + id + "-" + x));
      if(ST.resp[id] && dentro) b.className = "tp achada";
      b.onclick = function(){
        if(ST.resp[id] || achadas[x]) return;
        sPasso();
        if(dentro){
          achadas[x] = 1; b.className = "tp achada"; faltam--;
          if(!faltam) acertou(id, "certo" + pi + "_" + k);
        } else {
          b.className = "tp nao";
          setTimeout(function(){ b.className = "tp"; }, 420);
          errou(id, "dica" + pi + "_" + k);
        }
      };
      cx.appendChild(b);
      cx.appendChild(document.createTextNode(" "));
    });
    box.appendChild(cx);
    fechaItem(d, box, id);
  });
}

/* ============ 29 — A ANATOMIA DA FRASE ============
   Da b16 (iSLCollective), VERBATIM: a tabela de quatro colunas *"Part of a main
   clause | Rel Pronoun | Part of a Relative Clause | Part of the main clause"*,
   com as frases dela (*A man | who/that | has the smallest pleasures | is the
   richest*).
   ⭐⭐ ESTA TABELA É A MELHOR EXPLICAÇÃO DAS 54 FOLHAS do que é um período
      composto por subordinação — ela DESMONTA a frase em peças e mostra que a
      oração relativa se enfia no MEIO da principal. Nenhuma outra folha faz
      isso; todas tratam a relativa como um rabo no fim.
   ⚠️ TRÊS GAVETAS E NÃO QUATRO: a folha separa a principal em duas colunas (o
      que vem antes e o que vem depois da relativa). Para a criança as duas são
      a mesma coisa — a frase principal — e a distinção que importa é a outra. */
function f29(d, pi){ gavetas(d, pi, "anat",
  "Estas frases foram desmontadas em pedaços. Ponha cada pedaço na gaveta dele."); }

/* ============ 31 — AGORA NO MEIO DA FRASE ============
   Da b10 (iSLCollective), VERBATIM: *"Write one sentence using a relative
   pronoun:"*; e da b06, *"C. Join the two sentences into one."*
   ⭐ COLADA NA 30, E COM UM DEGRAU SÓ — é a estratégia que o Marcos propôs
      (*"repetir o mesmo exercício em duas folhas, claro questões diferentes"*)
      com a condição da casa por cima: aqui a oração relativa entra no MEIO da
      frase principal, entre vírgulas. Na 30 ela entrava no fim, que é o lugar
      fácil.
   ⭐ E É AQUI QUE A VÍRGULA GANHA SENTIDO antes de a folha 32 cobrá-la: a
      criança monta cinco frases com a relativa entre vírgulas e depois
      descobre, escrevendo, que ali nunca cabe `that`. */
function f31(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "De novo, junte as duas — mas agora a parte que explica " +
            "entra <b>no meio</b>.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var Y = JUNTA2[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasel", Y.a + " &nbsp;+&nbsp; " + Y.b));
    lin.appendChild(botaoSom("Ouvir as duas frases", function(){ falar("jun2_" + k); }));
    box.appendChild(lin);
    var mostra = el("div", "montada"), feito = "";
    mostra.appendChild(nomeSecreto(Y.pedacos.join(" "), id));
    registra(id, pi, Y.pedacos.map(function(p){ return chaveQuadro(p); }).join(" "));
    var linha = el("div", "ops"), passo = 0, bts = [];
    baralha(Y.pedacos.map(function(p, x){ return x; })).forEach(function(x){
      var p = Y.pedacos[x];
      var b = el("button", "op sil frase", p);
      b.setAttribute("aria-label", "Pedaço " + p);
      b.setAttribute("data-qa", "op-" + id + "-" + chaveQuadro(p));
      bts.push(b);
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso();
        if(passo === x){
          b.className = "op sil frase usada";
          feito += (feito ? " " : "") + p; passo++;
          mostra.setAttribute("data-feito", feito);
          if(passo >= Y.pedacos.length) acertou(id, "certo" + pi + "_" + k);
        } else {
          b.className = "op sil frase erro";
          setTimeout(function(){ b.className = "op sil frase"; }, 500);
          errou(id, "dica" + pi + "_" + k);
        }
      };
      linha.appendChild(b);
    });
    if(ST.resp[id]) bts.forEach(function(b){ b.className = "op sil frase usada"; });
    box.appendChild(mostra); box.appendChild(linha);
    fechaItem(d, box, id);
  });
}
