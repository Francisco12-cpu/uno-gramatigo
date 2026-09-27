# UNO Gramática

O UNO da aula de português — criado por **Francisco Audir**.

Jogue contra robôs ou online com os amigos, no baralho de **Gramática** (perguntas e respostas + Relâmpago) ou no **UNO clássico**.

## Como publicar no GitHub Pages
1. Crie um repositório e envie todos os arquivos desta pasta (mantenha a pasta `icons/`).
2. No GitHub: **Settings → Pages → Branch: main / (root) → Save**.
3. Abra o link gerado no celular e toque em **Instalar no celular** (ou "Adicionar à tela inicial").

O modo contra robôs funciona offline depois da primeira abertura. O modo online precisa de internet.

## Modos
- **Contra robôs:** 1 a 5 robôs, 3 dificuldades, 3 ritmos.
- **Online:** uma pessoa cria a sala e passa o código de 5 letras; dá pra completar a mesa com robôs. Se alguém sair no meio, um robô assume as cartas.
- **Cartas físicas:** confere se duas cartas formam par (sem revelar a resposta) e consulta as perguntas.
- **Regras:** as regras dos dois baralhos.

## Regras da casa (modo Gramática)
- **Relâmpago:** se a carta da mesa for pergunta/resposta e você tiver o par, jogue a qualquer momento, mesmo fora da vez. Ganha 1 carta bônus (mesma cor ou número). Depois, a vez continua com quem estava jogando.
- **Contestar:** se a Relâmpago estiver errada, quem jogou compra 2 e a vez vai para quem contestou. Se estiver certa, quem contestou compra 2. Sem contestação, vale — até blefe.
- Todo o resto segue o UNO oficial (+4 só sem a cor da mesa, UNO! com 1 carta, etc.).

## Arquivos
- `index.html` — o jogo inteiro (motor de regras + interface)
- `manifest.webmanifest`, `sw.js`, `icons/` — instalação como app (PWA)
