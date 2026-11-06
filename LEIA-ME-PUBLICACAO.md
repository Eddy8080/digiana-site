# Digiana — Guia de Publicação

**Data de entrega:** 06/11/2026  
**Domínio:** `digiana.com.br`  
**IP de Produção:** `163.176.125.230`  

---

## 1. Arquivos e Hospedagem

- `index.html`: Página principal completa com CSS, JavaScript, vetores/logos e tipografia embutidos. Não exige Node.js, npm, build ou banco de dados para entrega estática.
- `politica-de-privacidade.html`: Página de privacidade vinculada ao formulário e ao rodapé. Deve ser publicada no mesmo diretório do `index.html`.
- **Hospedagem estática/Nginx:**
  - Servir os arquivos diretamente via Nginx ou em um contêiner estático dedicado (`nginx:alpine`).
  - Habilitar suporte a HTTPS (Let's Encrypt / Certbot) com redirecionamento de `http://` para `https://`.
- **Validação prévia local:**
  - Execute `python3 -m http.server 8088` ou use o contêiner Docker local (`http://localhost:8088`).

---

## 2. Credenciais de E-mail & Configuração SMTP

Para a integração do backend de envio do formulário, foram definidas as seguintes credenciais da conta de e-mail institucional:

| Parâmetro | Configuração |
| :--- | :--- |
| **Conta / Usuário** | `digiana@digiana.com.br` |
| **Senha** | `Digiana@03` |
| **E-mail Destinatário (recebimento)** | `contato@digiana.com.br` (ou `digiana@digiana.com.br`) |
| **Host SMTP sugerido** | `mail.digiana.com.br` / `smtp.digiana.com.br` (ou provedor MX configurado no domínio) |
| **Porta e Criptografia** | `587` (STARTTLS) ou `465` (SSL/TLS) |

> [!WARNING]
> **Segurança:** Nunca exponha a senha de e-mail no HTML ou JavaScript do navegador. As credenciais devem residir exclusivamente nas variáveis de ambiente do backend ou serviço de envio no servidor.

---

## 3. Formulário: Backend e Envio

O formulário atual no HTML estático possui validação front-end e comportamento demonstrativo. Para envio efetivo:

1. **Endpoint de Envio:**
   - Criar um endpoint (ex.: `POST /api/contato` ou contêiner de envio de mensagens).
2. **Campos do Formulário:**
   - Os campos enviados são: `nome`, `empresa`, `segmento`, `interesse`, `msg` e `lgpd`.
   - Adicionar atributos `name` aos inputs para compatibilidade com `FormData` padrão.
3. **Validação e Proteção:**
   - Validar tamanhos de campo no servidor.
   - Implementar proteção contra spam (ex.: honeypot ou rate limit por IP).
   - Configurar registros SPF, DKIM e DMARC no DNS do domínio para assegurar a entregabilidade dos e-mails.

---

## 4. Contatos, Links e Identidade

- **WhatsApp Oficial:** `(71) 3321-1993` — [wa.me/557133211993](https://wa.me/557133211993)
- **E-mail exibido no site:** `contato@digiana.com.br`
- **Intranet:** `https://app.colabin.com.br` (abre em nova aba)
- **Localização:** Edifício Roosevelt, Comércio, Salvador–BA  
  - Coordenadas: `-12.9724334, -38.5137938`  
  - Link externo: [Google Maps](https://share.google/KWqMYIsUsrSeEOeoF)
- **Área do Cliente:** Aponta temporariamente para a seção de contato até a definição da URL final.

---

## 5. Comportamento e Recursos Aprovados

- **Desktop:** Cards em grade visual limpa, sem empilhamento.
- **Mobile / Tablets (< 1024px):** Cards empilhados dinamicamente com efeito de escala e desfoque à medida que rolam.
- **Menu Compacto (< 860px):** Navegação adaptativa com link direto para a Intranet.
- **WhatsApp Flutuante:** Botão fixo no canto inferior direito nas cores oficiais da marca.
- **Acessibilidade:** Faixa contínua e empilhamento adaptados para suportar navegação assistida e preferências de movimento reduzido.
- **Recursos Externos:** Google Fonts (Sora), Leaflet 1.9.4 e tiles OpenStreetMap.

---

## 6. Procedimento de Teste Local e Publicação Futura

1. **Teste Local em Contêiner:**
   - Subir o contêiner Docker localmente para validar a entrega dos arquivos estáticos.
2. **Ambiente de Produção (Servidor Oracle):**
   - **DNS:** Zona `digiana.com.br` apontada para o IP `163.176.125.230`.
   - **Porta interna sugerida:** Porta `8002` ou rede Docker interna `digiana_digiana_network`.
   - **Proxy Reverso (Nginx em Produção):** Configurar `proxy_pass` no Nginx do servidor para encaminhar `digiana.com.br` ao contêiner.
   - **SSL/HTTPS:** Emitir certificado Let's Encrypt para `digiana.com.br` e `www.digiana.com.br`.
