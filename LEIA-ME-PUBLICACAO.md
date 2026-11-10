# Digiana — guia de publicação

Entrega: 06/11/2026. Este pacote contém a versão final revisada do site e este guia.

## Arquivos e hospedagem

- `index.html`: página completa, com CSS, JavaScript, logos e fonte da marca incorporados. Não exige npm, build, banco de dados ou Node.js para servir a página.
- Publique o `index.html` na raiz pública do domínio (por exemplo, `public_html` em hospedagem compartilhada, ou o DocumentRoot de Apache/Nginx). Faça backup do site existente antes de substituí-lo.
- Configure o domínio/DNS para o servidor e habilite HTTPS com certificado válido e redirecionamento HTTP → HTTPS.
- Para conferir antes de publicar, na pasta do pacote execute `python3 -m http.server 8088` e acesse `http://localhost:8088`.
- O formulário precisa de um backend separado para enviar mensagens; hospedar apenas o HTML não ativa o envio.

## Comportamento aprovado

- Desktop: cards em grade, sem empilhamento.
- Mobile/tablets abaixo de 1024 px: cards empilhados durante a rolagem, com escala e desfoque; os anteriores desaparecem quando cobertos.
- Menu compacto em telas até 860 px, incluindo acesso à Intranet.
- Barra horizontal com movimento contínuo.
- WhatsApp fixo no canto inferior direito, com a cor da marca e sem brilho.
- Logo horizontal original no topo; logo branca vertical no rodapé.
- Rodapé com links internos e seis públicos, mais mapa compacto ao lado de Empresa no desktop. Layout reorganizado em telas menores.
- Mapa em cinza, com marcador colorido da Digiana.
- Por solicitação do cliente, o empilhamento dos cards e a faixa horizontal funcionam mesmo quando “Reduzir movimento” está ativo no sistema. Outras animações respeitam essa preferência.

## Contatos e links

- WhatsApp: `(71) 3321-1993` — `https://wa.me/557133211993`.
- E-mail exibido: `contato@digiana.com.br`.
- Intranet: `https://app.colabin.com.br` (nova aba).
- Localização fornecida: `https://share.google/KWqMYIsUsrSeEOeoF`.
- Mapa: Edifício Roosevelt, Comércio, Salvador–BA. Coordenadas obtidas do local no Google Maps: `-12.9724334, -38.5137938`.
- **Área do cliente ainda aponta para a seção de contato**: substituir pelo endereço definitivo quando informado.

## Formulário e Backend de E-mail (Configurado)

O formulário agora possui backend dedicado e seguro para envio direto para `digiana@digiana.com.br` via Zoho Mail:

1. **Campos Adicionados:** Inseridos os campos obrigatórios de **E-mail** (`email`) e **Telefone / WhatsApp** (`telefone`) no formulário do layout.
2. **Endpoint Seguro:** Criado o micro-serviço em Node.js (`/api/contato`) integrado ao Docker Compose e com proxy reverso no Nginx.
3. **Credenciais Protegidas:** As credenciais SMTP ficam exclusivamente no arquivo `.env` (ignorado no Git e no Docker build para total segurança).
4. **Zoho Mail SMTP:** Configurado para `smtppro.zoho.com` na porta `465` (SSL).
5. **Reply-To Dinâmico:** Os e-mails chegam com o campo `Reply-To` apontando para o e-mail do cliente, permitindo responder diretamente pelo cliente de e-mail.

### Como ativar em Produção ou Local:
1. Abra o arquivo `.env` na raiz do projeto.
2. Preencha `SMTP_PASS` com a sua senha (ou Senha de Aplicativo gerada no painel de segurança do Zoho Mail).
3. Reinicie os serviços:
   ```bash
   docker compose up -d --build
   ```

## Privacidade e pendências de conteúdo

- O link de Política de Privacidade do formulário ainda aponta para `#contato`; no rodapé há apenas o texto “Política de Privacidade · LGPD”. Publicar a política aprovada e atualizar os links.
- Confirmar destino de Área do cliente e e-mail destinatário antes da publicação final.
- O painel de consulta apresenta dados fictícios e mantém a observação correspondente.

## Recursos externos

O HTML usa Google Fonts (Sora), Leaflet 1.9.4 via `unpkg.com` e tiles do OpenStreetMap. Requer acesso à internet para esses recursos; manter a atribuição do mapa. O mapa visual é Leaflet/OpenStreetMap, e seu link abre a localização fornecida no Google Maps. Não há chave da API do Google Maps nesta versão.

Se houver política CSP no servidor, permitir os recursos externos necessários e considerar que o arquivo utiliza CSS e JavaScript inline, imagens em `data:` e fonte incorporada. Adaptar a política ou separar os recursos conforme os padrões do ambiente, sem simplesmente bloquear esses recursos.

## Validação após publicar

- Verificar HTTPS, logos, fontes, links, WhatsApp e Intranet.
- Conferir desktop, mobile e mudança de orientação: menu, cards, formulário e rodapé sem rolagem horizontal.
- Testar links do rodapé até os cards, mapa em cinza e marcador colorido.
- Após integrar o backend, enviar um contato real e confirmar recebimento e tratamento de erro.
- Validar os destinos de Área do cliente e Política de Privacidade.

## Edição e manutenção

O arquivo foi ajustado a partir de um HTML existente. Há estilos adicionais no fim do documento que substituem regras anteriores; preservar a ordem ao editar. O JavaScript do formulário está no script principal, e o empilhamento dos cards está no bloco `all-cards-stack-script`.
