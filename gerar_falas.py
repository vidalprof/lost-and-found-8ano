# -*- coding: utf-8 -*-
u"""
============================================================
 ESQUELETO — gerador das falas da folha viva

 ⚠️ REGRA DA CASA: o `falas.json` é a VERDADE. Texto escrito aqui = voz gravada.
    Texto mudou = voz regravada (o `entregar.yml` compara o carimbo sha1). É isto
    que acaba com "a tela diz uma coisa e a voz diz outra" — e atividade sem
    `falas.json` NÃO TEM COMO SER CONFERIDA, porque mp3 não se lê.

 ⚠️ UMA FONTE SÓ. As palavras, as frases e os textos moram no bloco
    `/*DADOS-INI*/` do `index.html` e são LIDOS daqui. Nada de segunda lista
    para desencontrar: já custou caro nesta casa um relatório sair zero com a
    folha inteira respondida.

 ⚠️ TODA TELA É NARRADA, e o alto-falante entra também em CADA RESPOSTA que a
    criança toca. Regra do Marcos: *"o alto-falante nas respostas também, para
    ajudar os alunos que não sabem ler"*. Sem isso a criança que ainda soletra
    escolhe pelo tamanho da palavra e a folha vira sorteio.

 ⚠️ A DICA NUNCA DIZ A RESPOSTA. Ela manda olhar uma pista, ou faz outra
    pergunta. Responder no segundo erro não é ajudar: é tirar da criança a única
    chance de pensar de novo.

 ⚠️ PALAVRAS QUE A VOZ ERRA (medido, e o portão `_qa/falas.py` reprova):
    "complete" vira "complite" — usar "preencha". Letra solta ("som S") sai como
    o NOME da letra: ancorar num exemplo ("o som de SAPO").

 Uso:  python3 <pasta>/gerar_falas.py
 Saída: reescreve os blocos FALAS e VOZOK do index.html, o `falas.json` e o
        `voz.txt`.
============================================================
"""
from __future__ import print_function

import collections
import io
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
CAM = os.path.join(AQUI, u"index.html")
PREFIXO = u"lf_"                     # <- o prefixo desta atividade
VOZ = u"pt-BR-AntonioNeural"

D = io.open(CAM, encoding=u"utf-8").read()


def bloco(nome):
    u"""Lê um objeto do bloco DADOS do index.html. Uma fonte só."""
    m = re.search(r"var " + nome + r" = (\{.*?\n\});", D, re.S)
    if not m:
        raise SystemExit(u"nao achei o bloco `var %s` no index.html" % nome)
    txt = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
    txt = re.sub(r'"\s*\+\s*\n\s*"', "", txt)                 # junta "a" + "b"
    txt = re.sub(r'([\{,]\s*)"?([A-Za-zÀ-ÿ_0-9]+)"?\s*:', r'\1"\2":', txt)
    txt = re.sub(r",(\s*[\}\]])", r"\1", txt)
    return json.loads(txt)


def lp(s):
    u"""tira a marcação e deixa o texto do jeito que a voz vai dizer"""
    return re.sub(r"\s+", u" ", re.sub(r"<[^>]+>", "", s)).strip()


def ch(w):
    return re.sub(r"[^a-z]", "",
                  unicodedata.normalize("NFKD", w.lower())
                  .encode("ascii", "ignore").decode())


F = collections.OrderedDict()
EN = set()                    # as chaves cujo texto e INGLES


def p(k, v):
    F[k] = v


def pe(k, v):
    u"""⭐ FALA EM INGLES — e ela e gravada com VOZ INGLESA, nao com voz
    portuguesa lendo ingles (ordem do Marcos, ago/2026: *"voz inglesa no
    ingles"*). O `entregar.yml` le o campo `lang` do falas.json e troca o
    `pt-BR-AntonioNeural` pelo `en-US-GuyNeural` so nessas.
    ⚠️ E ISSO NAO E ENFEITE NUM CADERNO DE INGLES: a crianca que ainda le
       devagar escolhe pelo SOM, e voz portuguesa dizendo *"whose"* ensina a
       pronuncia errada para a turma inteira."""
    F[k] = v
    EN.add(k)


# ---------------------------------------------------------------------------
# AS FALAS DO MOTOR — estas toda folha viva tem
# ---------------------------------------------------------------------------
p(u"capa", u"Lost and Found: o balcão dos achados e perdidos. Inglês, oitavo ano, "
           u"vinte e duas folhas sobre some, any, much, many e os pronomes "
           u"relativos. Você vai atender o balcão de um aeroporto. Escreva o seu "
           u"nome ali embaixo e toque em Começar.")
p(u"quase", u"Quase! Olhe de novo e tente outra.")
p(u"folhaPronta", u"Folha pronta! Muito bem.")
p(u"escreva", u"Escreva a palavra usando o teclado.")
p(u"ligue", u"Toque numa palavra do lado esquerdo e depois na do lado direito.")
p(u"toque_palavra", u"Primeiro toque numa palavra ali embaixo. Depois toque na "
                    u"gaveta dela.")
p(u"vozOn", u"Narração ligada!")
# ⭐ O FECHO TEM GANCHO (regra da casa): a atividade termina deixando uma
#    pergunta ABERTA, que a crianca leva para fora da tela. Aqui ela e a ponte
#    para o caderno de papel, onde acontece a escrita que a tela nao corrige.
p(u"fim", u"Você chegou ao fim do balcão! Agora você sabe dizer quanto tem "
          u"dentro da mala e de quem ela é. E fica a pergunta: o que é que "
          u"mais se perde na sua casa? Escreva no caderno, em inglês: I lost "
          u"a ... which ...")

# ---------------------------------------------------------------------------
# AS FALAS DAS FOLHAS — uma seção por folha, lendo os DADOS
#
#   FOO = bloco(u"FOO")
#   p(u"p1enun", u"Folha um: o que ela pede.")
#   for k, X in FOO.items():
#       p(u"diz_" + k, X[u"p"] + u".")
#       p(u"certo1_" + k, u"Isso! …")
#       p(u"dica1_" + k, u"… uma pista, NUNCA a resposta.")
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# AS FALAS DAS FOLHAS — uma seção por folha, lendo os DADOS do index.html.
#
# ⚠️ REGRA DAS FALAS EM INGLÊS: usa-se `pe()` para tudo o que está ESCRITO em
#    inglês na tela (a frase, a palavra da gaveta, a opção do botão) e `p()`
#    para o que é explicação em português. Voz portuguesa lendo inglês ensina a
#    pronúncia errada; voz inglesa lendo português sai incompreensível.
# ⚠️ A DICA NUNCA DIZ A RESPOSTA — manda olhar uma pista ou faz outra pergunta.
# ---------------------------------------------------------------------------
QUANT = bloco(u"QUANT")
GAV = bloco(u"GAV")
DUPLA = bloco(u"DUPLA")
SOMEANY = bloco(u"SOMEANY")
MALA = bloco(u"MALA")
MUCHMANY = bloco(u"MUCHMANY")
JULGA = bloco(u"JULGA")
DIALOGO = bloco(u"DIALOGO")
PERGUNTA = bloco(u"PERGUNTA")
RESPCURTA = bloco(u"RESPCURTA")
ACHA = bloco(u"ACHA")
WHOWHICH = bloco(u"WHOWHICH")
TRES = bloco(u"TRES")
POSSE = bloco(u"POSSE")
DEFINE = bloco(u"DEFINE")
JULGAP = bloco(u"JULGAP")
JUNTA = bloco(u"JUNTA")
ESCREVE = bloco(u"ESCREVE")
TEXTO = bloco(u"TEXTO")
MARCAR = bloco(u"MARCAR")
CARTAZ = bloco(u"CARTAZ")


def lac(s):
    u"""A LACUNA VIRA A PALAVRA `blank`, que é o que um professor de inglês diz
    de verdade ao ler uma frase com buraco em voz alta.
    ⚠️ E NÃO reticências: o portão `_qa/falas.py` reprova — com razão — uma fala
       marcada `lang:"en"` que tenha `...` ou acento português, porque foi assim
       que uma fala portuguesa saiu com sotaque americano e o Marcos ouviu
       (*"fala rato em inglês"*). Aqui o texto é inglês de verdade; o que não
       podia era o enfeite português no meio dele."""
    return lp(s).replace(u"___", u"blank")


# ---- o alto-falante de CADA resposta que a criança toca (regra do Marcos:
#      *"o alto-falante nas respostas também, para ajudar os alunos que não
#      sabem ler"*). Em inglês, com voz inglesa.
for _w in [u"a", u"an", u"some", u"any", u"much", u"many",
           u"who", u"which", u"whose"]:
    pe(u"op_" + _w, _w + u".")
p(u"op_certa", u"Está certa.")
p(u"op_erro", u"Tem erro.")
p(u"marca_c", u"Marca do que se conta.")
p(u"marca_u", u"Marca do que não se conta.")
p(u"toque_marca", u"Primeiro escolha uma das duas marcas ali em cima.")

# ---------------- 1 — A or SOME? ----------------
p(u"p1enun", u"Folha um. Leia a frase e escolha a palavra que falta: a, ou some.")
for k, Q in QUANT.items():
    pe(u"frase_" + k, Q[u"a"] + u" blank " + Q[u"b"])
    p(u"certo1_" + k, u"Isso! " + lp(Q[u"pq"]))
    p(u"dica1_" + k, u"Pense: dá para contar um, dois, três dessa coisa?")

# ---------------- 2 e 3 — as gavetas ----------------
p(u"p2enun", u"Folha dois. Uma gaveta é do que se pode contar. A outra é do que "
             u"não se conta em unidades.")
p(u"p3enun", u"Folha três. Agora são três gavetas. Olhe se a palavra está no "
             u"singular, no plural, ou se nem tem plural.")
for _gk, _G in GAV.items():
    for _C in _G[u"cols"]:
        pe(u"gav_" + _gk + u"_" + _C[u"k"], _C[u"n"] + u".")
    for _n, _P in _G[u"pal"].items():
        pe(u"diz2_" + _gk + u"_" + _n, _P[u"p"] + u".")
for k, P in GAV[u"cp1"][u"pal"].items():
    p(u"certo2_" + k, u"Isso! Gaveta certa.")
    p(u"dica2_" + k, u"Tente dizer dois desses em inglês. Se soar estranho, é a "
                     u"outra gaveta.")
for k, P in GAV[u"cp2"][u"pal"].items():
    p(u"certo3_" + k, u"Isso! Gaveta certa.")
    p(u"dica3_" + k, u"Olhe o fim da palavra: tem s de plural? E tem o a ou o an "
                     u"na frente?")

# ---------------- 4 — circle and underline ----------------
p(u"p4enun", u"Folha quatro. Escolha a marca e toque na palavra: o que se conta, "
             u"ou o que não se conta.")
# ⚠️ `DU`, e nao `F`: `F` e o dicionario GLOBAL das falas, e usa-lo como
#    variavel de laco apagava as falas todas com o conteudo de uma frase.
for k, DU in DUPLA.items():
    pe(u"dupla_" + k, u" ".join(DU[u"palavras"]))
    p(u"certo4_" + k + u"_c", u"Isso! Essa dá para contar.")
    p(u"certo4_" + k + u"_u", u"Isso! Essa não se conta em unidades.")
    p(u"dica4_" + k, u"Nesta frase há uma de cada. Leia devagar e ache os nomes "
                     u"das coisas.")

# ---------------- 5 — some or any ----------------
p(u"p5enun", u"Folha cinco. Olhe se a frase diz que tem, se ela nega ou se ela "
             u"pergunta. Depois escolha.")
_PQT = {u"a": u"A frase diz que TEM.", u"n": u"A frase NEGA.",
        u"p": u"A frase PERGUNTA.", u"e": u"Esta é a exceção."}
for k, S in SOMEANY.items():
    pe(u"sa_" + k, lac(S[u"f"]))
    p(u"certo5_" + k, u"Isso! " + lp(S[u"pq"]))
    p(u"dica5_" + k, _PQT.get(S[u"t"], u"Leia a frase de novo.") +
                     u" Olhe o começo dela outra vez.")

# ---------------- 6 — what is in the suitcase ----------------
p(u"p6enun", u"Folha seis. Olhe a figura e escolha: a, an, some ou any.")
for k, V in MALA.items():
    pe(u"mala_" + k, V[u"a"] + u" blank " + V[u"b"])
    p(u"certo6_" + k, u"Isso mesmo!")
    p(u"dica6_" + k, u"Duas perguntas: essa coisa se conta? E a frase nega ou "
                     u"pergunta?")

# ---------------- 7 — much or many ----------------
p(u"p7enun", u"Folha sete. Olhe a palavra que vem depois da lacuna: ela se conta "
             u"ou não?")
for k, M in MUCHMANY.items():
    pe(u"mm_" + k, lac(M[u"f"]))
    p(u"certo7_" + k, u"Isso mesmo!")
    p(u"dica7_" + k, u"Se dá para contar, é uma. Se não dá, é a outra.")

# ---------------- 8 — correct the mistakes ----------------
p(u"p8enun", u"Folha oito. Esta frase em inglês está certa, ou tem alguma coisa "
             u"errada?")
for k, J in JULGA.items():
    pe(u"jul_" + k, lp(J[u"f"]))
    p(u"certo8_" + k, u"Isso! " + lp(J[u"pq"]))
    p(u"dica8_" + k, u"Olhe o fim das palavras: tem s onde não devia, ou falta s "
                     u"onde devia?")

# ---------------- 9 — o diálogo do balcão ----------------
p(u"p9enun", u"Folha nove. Preencha a conversa: some, any, much ou many.")
p(u"dlgtit", lp(DIALOGO[u"titulo"]))
for _i, _L in enumerate(DIALOGO[u"linhas"]):
    pe(u"dlg_" + str(_i), _L[u"q"] + u": " + lac(_L[u"t"]))
for k, C in DIALOGO[u"lac"].items():
    p(u"certo9_" + k, u"Isso! " + lp(C[u"pq"]))
    p(u"dica9_" + k, u"Quem está falando: quem pergunta, quem diz que tem, ou "
                     u"quem nega?")

# ---------------- 10 — make a question ----------------
p(u"p10enun", u"Folha dez. Esta é a resposta. Monte a pergunta tocando nos "
              u"pedaços na ordem certa.")
for k, W in PERGUNTA.items():
    pe(u"perg_" + k, lp(W[u"resp"]))
    p(u"certo10_" + k, u"Perfeito! A pergunta ficou de pé.")
    p(u"dica10_" + k, u"Toda pergunta destas começa igual. E o que vem no fim é "
                      u"o verbo com there.")

# ---------------- 11 — yes, there is ----------------
p(u"p11enun", u"Folha onze. Toque na pergunta e depois na resposta que combina "
              u"com ela.")
for k, R in RESPCURTA.items():
    pe(u"rp_" + k, lp(R[u"p"]))
    pe(u"rd_" + k, lp(R[u"s"]))
    p(u"certo11_" + k, u"Isso! A pergunta e a resposta combinam.")
    p(u"dica11_" + k, u"A pergunta é de uma coisa só ou de várias? A resposta "
                      u"tem de ser do mesmo jeito.")

# ---------------- 12 — ache o pronome ----------------
p(u"p12enun", u"Folha doze. Em cada frase há um pronome relativo. Toque nele.")
for k, A in ACHA.items():
    pe(u"acha_" + k, u" ".join(A[u"palavras"]))
    p(u"certo12_" + k, u"Achou!")
    p(u"dica12_" + k, u"Ele fica logo depois do nome da pessoa ou da coisa que a "
                      u"frase está explicando.")

# ---------------- 13 — who or which ----------------
p(u"p13enun", u"Folha treze. Olhe a palavra que vem antes da lacuna: é gente ou "
              u"é coisa?")
for k, P in WHOWHICH.items():
    pe(u"ww_" + k, lac(P[u"f"]))
    p(u"certo13_" + k, u"Isso mesmo!")
    p(u"dica13_" + k, u"Um dos dois é só para gente. O outro é para coisa e "
                      u"para bicho.")

# ---------------- 14 — who, which, whose ----------------
p(u"p14enun", u"Folha catorze. Agora são três. Se a coisa depois da lacuna é de "
              u"alguém, o pronome é outro.")
for k, T in TRES.items():
    pe(u"tres_" + k, lac(T[u"f"]))
    p(u"certo14_" + k, u"Isso mesmo!")
    p(u"dica14_" + k, u"Depois da lacuna vem um verbo, ou vem uma coisa que é de "
                      u"alguém?")

# ---------------- 15 — whose ----------------
p(u"p15enun", u"Folha quinze. Olhe a palavra que vem depois da lacuna: se for "
              u"uma coisa de alguém, é whose.")
for k, O in POSSE.items():
    pe(u"po_" + k, lac(O[u"f"]))
    p(u"certo15_" + k, u"Isso! Você viu de quem era a coisa.")
    p(u"dica15_" + k, u"Depois de whose vem sempre o nome de uma coisa. Depois "
                      u"de who vem sempre um verbo.")

# ---------------- 16 — what is it ----------------
p(u"p16enun", u"Folha dezesseis. Toque no nome e depois na explicação dele.")
for k, E in DEFINE.items():
    pe(u"def_" + k, lp(E[u"p"]) + u".")
    pe(u"defd_" + k, lp(E[u"s"]) + u".")
    p(u"certo16_" + k, u"Isso! A explicação é dessa mesmo.")
    p(u"dica16_" + k, u"A explicação começa dizendo se é pessoa, animal, prédio "
                      u"ou máquina. Comece por aí.")

# ---------------- 17 — certa ou errada ----------------
p(u"p17enun", u"Folha dezessete. Olhe o pronome em negrito. Ele está no lugar "
              u"certo?")
for k, U in JULGAP.items():
    pe(u"julp_" + k, lp(U[u"f"]))
    p(u"certo17_" + k, u"Isso! " + lp(U[u"pq"]))
    p(u"dica17_" + k, u"Pergunte: o que vem logo depois do pronome é uma coisa "
                      u"DE alguém?")

# ---------------- 18 — join the two sentences ----------------
p(u"p18enun", u"Folha dezoito. Junte as duas frases numa só. Toque nos pedaços "
              u"na ordem certa.")
for k, Z in JUNTA.items():
    pe(u"jun_" + k, lp(Z[u"a"]) + u" " + lp(Z[u"b"]))
    p(u"certo18_" + k, u"Perfeito! Duas frases viraram uma.")
    p(u"dica18_" + k, u"O pedaço com o pronome entra logo depois da pessoa ou da "
                      u"coisa que ele explica.")

# ---------------- 19 — escreva o pronome ----------------
p(u"p19enun", u"Folha dezenove. Escreva o pronome que falta. Repare: toda frase "
              u"aqui tem vírgula, e depois de vírgula o inglês nunca usa that.")
for k, X in ESCREVE.items():
    pe(u"esc_" + k, X[u"a"] + u" blank " + X[u"b"])
    p(u"certo19_" + k, u"Isso! Escrito certinho.")
    p(u"dica19_" + k, u"Depois da lacuna vem um verbo, ou vem uma coisa que é de "
                      u"alguém? E lembre: aqui nunca é that.")

# ---------------- 20 — the man who wrote Hamlet ----------------
p(u"p20enun", u"Folha vinte. Agora responda sobre o texto.")
pe(u"hist_" + TEXTO[u"k"], lp(TEXTO[u"corpo"]))
for _i, _P in enumerate(TEXTO[u"perg"]):
    p(u"pergh_" + str(_i), lp(_P[u"q"]))
    for _j, _o in enumerate(_P[u"o"]):
        p(u"resph_" + str(_i) + u"_" + str(_j), lp(_o))
    p(u"certo20_" + str(_i), u"Isso! " + lp(_P.get(u"pq", u"Você leu com atenção.")))
    p(u"dica20_" + str(_i), u"Volte ao texto e leia de novo a parte que fala "
                            u"disso.")

# ---------------- 21 — mark every uncountable ----------------
p(u"p21enun", u"Folha vinte e um. Marque todas as palavras que não se contam. "
              u"Depois toque em Conferir.")
for k, Y in MARCAR.items():
    pe(u"diz21_" + k, Y[u"n"] + u".")
p(u"certo21", u"Você marcou todas, e só as certas!")
p(u"dica21", u"Sobrou alguma marcada que dá para contar, ou faltou marcar "
             u"alguma que não dá. Confira uma por uma.")

# ---------------- 22 — o cartaz que eu levo ----------------
p(u"p22enun", u"Folha vinte e dois. Escolha as regras que você quer no seu "
              u"cartaz. Pode escolher quantas quiser.")
for k, C in CARTAZ.items():
    p(u"certo22_" + k, u"Entrou no seu cartaz!")

# ---------------------------------------------------------------------------
# A SAÍDA
# ---------------------------------------------------------------------------
def chave(s):
    u"""O nome do mp3 sai do TEXTO, não da chave da fala — assim duas chaves que
    dizem a mesma frase gravam um arquivo só."""
    s = re.sub(r"\s+", u" ", s or u"").strip().lower()
    hh = 5381
    for c in s:
        hh = ((hh * 33) ^ ord(c)) & 0xFFFFFFFF
    d, out = hh, u""
    if d == 0:
        return u"0"
    while d:
        out = u"0123456789abcdefghijklmnopqrstuvwxyz"[d % 36] + out
        d //= 36
    return out


falas, vistos = [], {}
for k in sorted(F.keys()):
    txt = F[k]
    if not txt:
        continue
    c = chave(txt)
    if c in vistos:
        continue
    vistos[c] = 1
    item = {u"id": PREFIXO + c, u"texto": txt, u"voz": VOZ}
    if k in EN:
        item[u"lang"] = u"en"
        item[u"voz"] = u"en-US-GuyNeural"
    falas.append(item)

html = io.open(CAM, encoding=u"utf-8").read()
blocoF = (u"/*FALAS-INI*/\nvar FALAS = "
          + json.dumps(F, ensure_ascii=False, indent=1, sort_keys=True) + u";\n/*FALAS-FIM*/")
blocoV = (u"/*VOZOK-INI*/var VOZOK = "
          + json.dumps(dict((c, 1) for c in vistos), ensure_ascii=False) + u";/*VOZOK-FIM*/")
novo = re.sub(r"/\*FALAS-INI\*/.*?/\*FALAS-FIM\*/", lambda m: blocoF, html, flags=re.S)
novo = re.sub(r"/\*VOZOK-INI\*/.*?/\*VOZOK-FIM\*/", lambda m: blocoV, novo, flags=re.S)
io.open(CAM, u"w", encoding=u"utf-8").write(novo)
io.open(os.path.join(AQUI, u"falas.json"), u"w", encoding=u"utf-8").write(
    json.dumps(falas, ensure_ascii=False, indent=1))
io.open(os.path.join(AQUI, u"voz.txt"), u"w", encoding=u"utf-8").write(VOZ + u"\n")
print(u"FALAS: %d chaves; falas.json: %d fala(s) para gravar" % (len(F), len(falas)))
