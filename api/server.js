const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuracao do transporter SMTP
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtppro.zoho.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const isSecure = process.env.SMTP_SECURE === 'false' ? false : (port === 465);

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Health check
app.get(['/', '/health', '/api', '/api/health'], (req, res) => {
  res.json({ status: 'ok', service: 'digiana-api-contato' });
});

// Endpoint de consulta de CNPJ via BrasilAPI
const handleCnpj = async (req, res) => {
  try {
    const rawCnpj = req.params.cnpj || req.query.cnpj;
    const cleanCnpj = String(rawCnpj || '').replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return res.status(400).json({ error: 'CNPJ deve conter 14 dígitos.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Digiana-Website/1.0' }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'CNPJ não localizado na Receita Federal.' });
      }
      return res.status(response.status).json({ error: 'Não foi possível consultar o CNPJ no momento.' });
    }

    const data = await response.json();

    // Formatar telefone se disponível
    let telFormatado = '';
    if (data.ddd_telefone_1) {
      const nums = data.ddd_telefone_1.replace(/\D/g, '');
      if (nums.length === 10) {
        telFormatado = `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
      } else if (nums.length === 11) {
        telFormatado = `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
      } else {
        telFormatado = data.ddd_telefone_1;
      }
    }

    return res.json({
      razao_social: data.razao_social || '',
      nome_fantasia: data.nome_fantasia || '',
      empresa: data.nome_fantasia || data.razao_social || '',
      email: (data.email || '').toLowerCase(),
      telefone: telFormatado,
      municipio: data.municipio || '',
      uf: data.uf || ''
    });

  } catch (error) {
    console.error('[ERRO] Falha ao consultar CNPJ:', error.message);
    return res.status(500).json({ error: 'Erro de comunicação ao consultar o CNPJ.' });
  }
};

app.get('/cnpj/:cnpj', handleCnpj);
app.get('/api/cnpj/:cnpj', handleCnpj);

// Endpoint de envio de contato
const handleContato = async (req, res) => {
  try {
    const { nome, empresa, tem_cnpj, cnpj, email, telefone, segmento, interesse, msg, lgpd } = req.body;

    if (!nome || !empresa) {
      return res.status(400).json({ error: 'Nome e empresa são obrigatórios.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido para retorno.' });
    }

    if (!telefone) {
      return res.status(400).json({ error: 'Informe um telefone ou WhatsApp para contato.' });
    }

    if (!lgpd) {
      return res.status(400).json({ error: 'É necessário concordar com o tratamento de dados.' });
    }

    if (!process.env.SMTP_PASS) {
      console.error('[ERRO] Senha do SMTP não definida no arquivo .env');
      return res.status(500).json({ error: 'Serviço de e-mail temporariamente indisponível (configuração pendente).' });
    }

    const transporter = createTransporter();

    const destinatario = process.env.MAIL_DESTINATION || process.env.SMTP_USER || 'digiana@digiana.com.br';
    const remetente = process.env.MAIL_FROM || `"Site Digiana" <${process.env.SMTP_USER}>`;

    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' });

    // Montagem do corpo HTML do e-mail
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #02254D; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Nova Solicitação de Contato — Site Digiana</h2>
          <p style="color: #00BA96; margin: 6px 0 0; font-size: 14px;">Recebida em ${dataHora}</p>
        </div>
        
        <div style="padding: 24px; color: #333333; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 150px; color: #555;">Nome:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(nome)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Empresa:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(empresa)}</td>
            </tr>
            ${cnpj ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">CNPJ:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(cnpj)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">E-mail de Retorno:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${escapeHtml(email)}" style="color: #00BA96; text-decoration: none; font-weight: bold;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Telefone / WhatsApp:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="https://wa.me/${escapeHtml((telefone || '').replace(/\D/g, ''))}" style="color: #00BA96; text-decoration: none; font-weight: bold;">${escapeHtml(telefone)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Segmento:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(segmento || 'Não informado')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Assunto de Interesse:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(interesse || 'Não informado')}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p style="font-weight: bold; margin-bottom: 6px; color: #555;">Momento da empresa / Mensagem:</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #00BA96; padding: 12px 16px; border-radius: 4px; white-space: pre-wrap; font-size: 14px; color: #222;">
${escapeHtml(msg || 'Nenhuma mensagem adicional informada.')}
            </div>
          </div>
        </div>

        <div style="background-color: #f4f6f8; padding: 14px 24px; text-align: center; font-size: 12px; color: #777;">
          Mensagem enviada através do formulário de contato oficial do site Digiana.
        </div>
      </div>
    `;

    const mailOptions = {
      from: remetente,
      to: destinatario,
      replyTo: (email && email.includes('@')) ? email : destinatario,
      subject: `[Contato Site] ${interesse ? interesse + ' - ' : ''}${empresa} (${nome})`,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SUCESSO] E-mail enviado com sucesso! Message ID: ${info.messageId}`);

    return res.status(200).json({
      success: true,
      message: 'Solicitação enviada com sucesso! Nossa equipe entrará em contato.'
    });

  } catch (error) {
    console.error('[ERRO] Falha ao enviar e-mail via SMTP:', error);
    return res.status(500).json({
      error: 'Falha no envio da mensagem. Por favor, tente novamente ou entre em contato via WhatsApp.'
    });
  }
};

app.post('/contato', handleContato);
app.post('/api/contato', handleContato);

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.listen(PORT, () => {
  console.log(`API de envio Digiana rodando na porta ${PORT}`);
});
