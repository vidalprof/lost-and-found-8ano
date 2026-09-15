# -*- coding: utf-8 -*-
u"""
============================================================
 RECORTAR AS FIGURAS DA FOLHA DE PAPEL — Lost & Found, Inglês 8º ano

 ⚠️ POR QUE ELAS NÃO SÃO GERADAS POR IA. Ordem do Marcos, 14/set/2026:
    ***"procure na internet, nada de imagem gerada por IA, utilize das
    atividades"***. A figura tem de continuar sendo a que a professora dá no
    papel — é isso que faz a criança reconhecer, na tela, a atividade da sala.

 DE ONDE SAEM: da **d24** (`_sequencias/folhas_ing8/d24_bb37d3.jpg`,
 1532×2167, iSLCollective), cujo comando impresso é *"Match the words to the
 pictures and decide whether they are countable (C) or uncountable (U) nouns
 (circle the right option)"*. Ela é a folha das 54 com **incontáveis
 abstratos** (love, time, music, homework, furniture, money) — e é por isso que
 as figuras deste caderno saem dela: são objetos de balcão de achados e
 perdidos, não comida de folha de 5º ano.

 ⚠️ A GRADE FOI MEDIDA, NÃO CHUTADA. As três colunas saíram de uma varredura do
    branco dos quadrinhos contra o amarelo do fundo, e as cinco linhas, dos
    vãos amarelos entre eles. Os números abaixo são o que a varredura devolveu.

 ⚠️ A BOLINHA AZUL. Cada quadrinho da d24 traz, no canto inferior direito, um
    círculo azul-claro onde o aluno escreve o número da resposta. Ele não é
    parte do desenho e tem de sair — senão toda figura do caderno aparece com
    uma bolha azul grudada. Sai por COR (é um azul chapado e único na folha),
    antes de qualquer outra coisa.

 ⚠️ E O NOME TEM DE BATER COM O DESENHO. Trocar um nome aqui não dá erro nenhum:
    só faz a criança ver um vestido onde a frase diz `clock`. Conferir OLHANDO a
    folha de contato em /tmp/conferir_ing8.png.

 Uso:  python3 _ing8/recortar_das_folhas.py
============================================================
"""
from __future__ import print_function

import io
import json
import os
import sys
from collections import deque

try:
    from PIL import Image
    import numpy as np
except ImportError as e:                                   # pragma: no cover
    print(u"preciso de Pillow+numpy (%s)" % e)
    sys.exit(2)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, os.path.join(RAIZ, u"_padrao"))
from recorte_folha import limpa_fundo, tira_halo, aperta, tira_risco  # noqa: E402
from scipy import ndimage as nd                          # noqa: E402

FOLHA = os.path.join(RAIZ, u"_sequencias", u"folhas_ing8", u"d24_bb37d3.jpg")
DEST = os.path.join(AQUI, u"img")
PRE = u"lf_"

# a grade MEDIDA na d24 (ver o cabeçalho)
COLS = [(76, 360), (385, 670), (701, 986)]
LINS = [(411, 701), (716, 1006), (1022, 1313), (1328, 1618), (1631, 1925)]

# linha, coluna (base 0) -> nome do arquivo e o que a criança vai ver
#
# ⚠️⚠️ A ESCOLHA DOS SEIS QUADRINHOS FOI MEDIDA, e esta é a terceira lição desta
#    mesma hora. A bolinha de responder é impressa POR CIMA do desenho, então
#    apagá-la leva junto o pedaço que estava embaixo — e "imagem que falta
#    parte" é reclamação que o Marcos já fez, com estas palavras. A saída não é
#    inventar o pedaço que falta (isso seria desenhar por cima da folha de
#    papel, e a regra da origem existe justamente contra isso): é ESCOLHER os
#    quadrinhos em que não há desenho debaixo da bolinha.
#    Medi a tinta de desenho sob o disco nos QUINZE quadrinhos da folha. O piso
#    de ruído (a própria borda do círculo) é ~9%. Ficaram os seis mais limpos:
#      suitcase 8,8% · money 9,0% · match 9,1% · music 9,2% · mouse 10,0% ·
#      tea 12,2%
#    Saíram, por perderem pedaço de verdade: hearts 50%, furniture 27%,
#      milk 27%, book 21%, clock 20%, girl 19%, dress 17%.
#    As frases da folha 6 foram reescritas para caber nestas seis — o conteúdo
#    seguiu a figura, e não o contrário.
PECAS = [
    (1, 0, u"suitcase", u"uma mala de viagem com etiquetas"),
    (1, 2, u"mouse", u"um rato cinzento"),
    (4, 2, u"money", u"notas de dinheiro"),
    (2, 0, u"music", u"notas musicais numa pauta"),
    (0, 1, u"match", u"um fósforo aceso"),
    (0, 2, u"tea", u"uma xícara de chá"),
]

FOLGA = 5          # entra 5 px para dentro: a borda impressa do quadrinho fica fora
LIM_TINTA = 205    # abaixo disto conta como massa do desenho


def sem_bolinha(c):
    u"""Apaga o CÍRCULO de responder que vem impresso em todo quadrinho da d24.

    ⚠️⚠️ DUAS LIÇÕES PAGAS AQUI, E A SEGUNDA DESFEZ A PRIMEIRA. Vistas as duas
       na folha de contato, que é para isso que ela existe:

       1ª tentativa — apagar por COR (o azul chapado da bolinha). Saiu o miolo e
          ficou um ARCO CINZA no canto de cinco figuras: a bolinha tem contorno,
          e o contorno não é azul.
       2ª tentativa — crescer a mancha azul 6 px para comer o contorno. Aí o
          estrago foi MAIOR: o vestido ficou esburacado de branco, a mala perdeu
          dois adesivos e o relógio ganhou um risco. O motivo é óbvio depois de
          visto — **o desenho também tem azul claro**, e crescer a máscara
          espalhou o apagamento por dentro dele.

       ⭐ O QUE RESOLVE NÃO É A COR, É A POSIÇÃO. A bolinha está SEMPRE no mesmo
          lugar: medida em três quadrinhos diferentes, ela ocupa de 70% a 100%
          da largura e de ~73% a 100% da altura, o que dá um disco de centro em
          (85%, 87%) e raio de ~15% da largura. É esse disco que se apaga, sem
          olhar cor nenhuma — e assim nada fora do canto é tocado.
       ⚠️ O que estava DEBAIXO da bolinha já estava perdido na folha de papel:
          ela é impressa POR CIMA do desenho (vê-se na barra do vestido)."""
    a = np.array(c.convert(u"RGB")).astype(int)
    H, W = a.shape[0], a.shape[1]
    cy, cx, rr = 0.87 * H, 0.85 * W, 0.16 * W
    ys, xs = np.ogrid[:H, :W]
    disco = ((ys - cy) ** 2 + (xs - cx) ** 2) <= rr * rr
    a[disco] = [255, 255, 255]
    return Image.fromarray(a.astype(u"uint8"), u"RGB")


def so_o_desenho(c, guarda=0.05):
    u"""Fica só com as ILHAS DE TINTA que são o desenho, e joga fora os cacos —
    a assinatura miúda do autor no pé da mala, um respingo da borda.

    ⚠️ O CORTE AQUI É 5%, E NÃO OS 9% DA FÁBRICA DE NOMES. O motivo está na
       própria folha: `music` são notas soltas numa pauta, e a menor delas tem
       7% da maior ilha. Com 9% ela sumia e a figura ia para a tela com um
       pedaço faltando — que é exatamente a reclamação que o Marcos já fez
       (*"imagens que faltam partes"*). Medido nesta folha, não herdado.
    ⚠️ `np.array` e NÃO `np.asarray`: o segundo devolve a matriz SÓ LEITURA e a
       escrita estoura — lição paga na Fábrica de Nomes."""
    a = np.array(c.convert(u"RGBA"))
    H, W = a.shape[0], a.shape[1]
    tinta = (a[:, :, 3] > 40)
    ilha = np.zeros((H, W), dtype=np.int32)
    tam, n = {}, 0
    for y in range(H):
        for x in range(W):
            if not tinta[y, x] or ilha[y, x]:
                continue
            n += 1
            fila, cont = deque([(y, x)]), 0
            ilha[y, x] = n
            while fila:
                cy, cx = fila.popleft()
                cont += 1
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and tinta[ny, nx] and not ilha[ny, nx]:
                            ilha[ny, nx] = n
                            fila.append((ny, nx))
            tam[n] = cont
    if not tam:
        return c
    maior = max(tam.values())
    fica = set(k for k, v in tam.items() if v >= maior * guarda)
    fora = np.isin(ilha, list(fica), invert=True) & tinta
    a[fora, 3] = 0
    return Image.fromarray(a, u"RGBA")


def main():
    if not os.path.exists(FOLHA):
        print(u"NAO ACHEI a folha %s — rodar o buscar-fotos.yml antes." % FOLHA)
        return 2
    im = Image.open(FOLHA).convert(u"RGB")
    if not os.path.isdir(DEST):
        os.makedirs(DEST)
    origem = {}
    cam_or = os.path.join(DEST, u"ORIGEM.json")
    if os.path.exists(cam_or):
        origem = json.load(io.open(cam_or, encoding=u"utf-8"))
    contato = Image.new(u"RGB", (len(PECAS) * 300, 340), u"white")
    for i, (r, cc, nome, _alt) in enumerate(PECAS):
        y0, y1 = LINS[r]
        x0, x1 = COLS[cc]
        c = im.crop((x0 + FOLGA, y0 + FOLGA, x1 - FOLGA, y1 - FOLGA))
        c = sem_bolinha(c)
        c = limpa_fundo(c)
        c = tira_halo(c)
        # ⚠️ A BORDA IMPRESSA DO QUADRINHO. Mesmo entrando 5 px, a moldura preta
        #    do quadro deixa um traço colado na beirada — na primeira rodada ele
        #    apareceu como uma RISCA embaixo das notas de dinheiro, que a folha
        #    de contato mostrou. O `tira_risco` corta nas quatro beiradas.
        c = tira_risco(c)
        c = so_o_desenho(c)
        c = aperta(c)
        arq = PRE + nome + u".png"
        c.save(os.path.join(DEST, arq), optimize=True)
        origem[arq] = u"folha:d24_bb37d3.jpg (iSLCollective) linha %d coluna %d" % (r + 1, cc + 1)
        # a folha de contato, para o OLHO conferir que o nome bate com o desenho
        v = c.copy()
        v.thumbnail((280, 280))
        base = Image.new(u"RGB", (300, 340), u"white")
        base.paste(v, (150 - v.size[0] // 2, 150 - v.size[1] // 2),
                   v if v.mode == u"RGBA" else None)
        contato.paste(base, (i * 300, 0))
        print(u"   %-16s %4dx%-4d  %5d bytes" %
              (arq, c.size[0], c.size[1], os.path.getsize(os.path.join(DEST, arq))))
    io.open(cam_or, u"w", encoding=u"utf-8").write(
        json.dumps(origem, indent=1, sort_keys=True, ensure_ascii=False))
    contato.save(u"/tmp/conferir_ing8.png")
    print(u"\n   folha de contato: /tmp/conferir_ing8.png  <- OLHAR, nome por nome")
    return 0


if __name__ == u"__main__":
    sys.exit(main())
