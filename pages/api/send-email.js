// api/send-email.js - Vercel API route using 0utmailcore
const outmail = require("0utmailcore");

function generateBarcode(appointmentId) {
  return `VETX-${appointmentId.slice(0, 8).toUpperCase()}`;
}

function formatDateFR(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeFR(timeStr) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

const getOwnerEmailHtml = (appointment, pet, vet) => {
  const barcode = generateBarcode(appointment.id);

return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Linear/Vercel Aesthetic Theme */
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #ffffff; 
      color: #09090b; 
      margin: 0; 
      padding: 0; 
      -webkit-font-smoothing: antialiased; 
    }
    .wrapper { background-color: #ffffff; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    
    /* Breadcrumb Header */
    .header { margin-bottom: 48px; }
    .logo-box { 
      background-color: #10b981; 
      color: #ffffff; 
      width: 28px; 
      height: 28px; 
      border-radius: 6px; 
      display: inline-block; 
      text-align: center; 
      line-height: 28px; 
      font-weight: 800; 
      font-size: 14px; 
      margin-right: 10px; 
      vertical-align: middle; 
    }
    .breadcrumb { 
      font-size: 11px; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.15em; 
      color: #a1a1aa; 
      vertical-align: middle; 
    }
    .breadcrumb-active { color: #10b981; }

    /* Hero Section */
    .status-pill { 
      display: inline-flex; 
      align-items: center;
      padding: 4px 10px; 
      border-radius: 6px; 
      font-size: 10px; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      background-color: #ecfdf5; 
      color: #047857; 
      border: 1px solid #d1fae5; 
      margin-bottom: 20px; 
    }
    .title { 
      font-size: 28px; 
      font-weight: 600; 
      letter-spacing: -0.04em; 
      margin: 0 0 16px 0; 
      color: #09090b;
    }
    .description { 
      font-size: 15px; 
      color: #71717a; 
      line-height: 1.6; 
      margin-bottom: 32px; 
    }

    /* Digital Receipt Card */
    .receipt-card { 
      background-color: #ffffff; 
      border: 1px solid #e4e4e7; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .receipt-header {
      background-color: #fafafa;
      padding: 12px 24px;
      border-bottom: 1px solid #e4e4e7;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #71717a;
    }
    .receipt-body { padding: 8px 24px; }
    .data-row { 
      padding: 12px 0; 
      border-bottom: 1px solid #f4f4f5; 
    }
    .data-row:last-child { border-bottom: none; }
    .label { 
      font-size: 12px; 
      font-weight: 500; 
      color: #a1a1aa; 
      display: block; 
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .value { 
      font-size: 14px; 
      font-weight: 600; 
      color: #09090b; 
    }

    /* Barcode Area */
    .barcode-wrap { 
      text-align: center; 
      padding: 24px; 
      background-color: #fafafa; 
      border-top: 1px solid #e4e4e7;
    }
    .barcode-text { 
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; 
      font-size: 18px; 
      font-weight: 700; 
      letter-spacing: 0.2em; 
      color: #09090b; 
    }
    .barcode-sub { 
      font-size: 9px; 
      color: #a1a1aa; 
      margin-top: 6px; 
      text-transform: uppercase; 
      font-weight: 700; 
      letter-spacing: 0.1em;
    }

    /* Action Notice */
    .action-box { 
      margin-top: 32px; 
      padding: 20px; 
      background-color: #09090b; 
      border-radius: 12px; 
      color: #ffffff;
    }
    .action-text { font-size: 13px; line-height: 1.5; margin: 0; }
    .action-highlight { color: #10b981; font-weight: 700; }

    .footer { 
      font-size: 11px; 
      color: #a1a1aa; 
      margin-top: 48px; 
      text-align: center; 
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Logo & Breadcrumb -->
      <div class="header">
        <div class="logo-box">V</div>
        <span class="breadcrumb">VetX <span style="color:#e4e4e7;margin:0 4px;">/</span> <span class="breadcrumb-active">Visite</span></span>
      </div>
      
      <div class="status-pill">En attente de confirmation</div>
      
      <h1 class="title">Rendez-vous enregistre</h1>
      <p class="description">Bonjour ${pet?.owner_name || "Client"}, votre demande de consultation clinique a ete transmise avec succes au praticien.</p>

      <!-- Receipt Card -->
      <div class="receipt-card">
        <div class="receipt-header">Details de la réservation</div>
        <div class="receipt-body">
          <div class="data-row">
            <span class="label">Patient</span>
            <div class="value">${pet?.name || "N/A"}</div>
          </div>
          <div class="data-row">
            <span class="label">Service Clinique</span>
            <div class="value">${appointment.service}</div>
          </div>
          <div class="data-row">
            <span class="label">Date et Heure</span>
            <div class="value">${formatDateFR(appointment.scheduled_date)} a ${formatTimeFR(appointment.scheduled_time)}</div>
          </div>
          <div class="data-row">
            <span class="label">Praticien Responsable</span>
            <div class="value">${vet?.name || "N/A"}</div>
          </div>
        </div>
        
        <div class="barcode-wrap">
          <div class="barcode-text">${barcode}</div>
          <div class="barcode-sub">Référence unique du dossier</div>
        </div>
      </div>

      <!-- Instructions (Replacing Button) -->
      <div class="action-box">
        <p class="action-text">
          Pour consulter, modifier ou transmettre des documents medicaux supplementaires, veuillez vous connecter a votre <span class="action-highlight">Portail Client VetX</span> sur notre site officiel.
        </p>
      </div>

      <div class="footer">
        © 2026 VetX Algeria Professional. <br>
        Infrastructure numerique pour la sante animale.
      </div>
    </div>
  </div>
</body>
</html>`;
};

const getVetEmailHtml = (appointment, pet, owner, vet) => {
  const ownerName = owner?.full_name || owner?.email?.split("@")[0] || "Client";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #18181b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { margin-bottom: 32px; border-bottom: 1px solid #f4f4f5; padding-bottom: 24px; }
    .logo { background-color: #18181b; color: #ffffff; width: 32px; height: 32px; border-radius: 6px; display: inline-block; text-align: center; line-height: 32px; font-weight: bold; font-size: 18px; margin-right: 8px; vertical-align: middle; }
    .brand-name { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; vertical-align: middle; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981; margin-bottom: 16px; display: block; }
    .data-row { margin-bottom: 12px; }
    .label { font-size: 12px; color: #71717a; display: block; margin-bottom: 2px; }
    .value { font-size: 14px; font-weight: 600; color: #18181b; }
    .instruction { font-size: 14px; color: #71717a; line-height: 1.5; margin-top: 32px; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #dcfce7; color: #166534; }
    .footer { font-size: 11px; color: #a1a1aa; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">V</div>
      <span class="brand-name">VetX Professional</span>
    </div>

    <h2 style="font-size: 24px; font-weight: 600; tracking: -0.02em; margin-bottom: 24px;">Nouvelle demande de rendez-vous</h2>

    <div class="card">
      <span class="section-label">Patient & Proprietaire</span>
      <div class="data-row">
        <span class="label">Proprietaire</span>
        <div class="value">${ownerName}</div>
      </div>
      <div class="data-row">
        <span class="label">Animal</span>
        <div class="value">${pet?.name || "N/A"} (${pet?.species || "Non specifie"})</div>
      </div>
      <div class="data-row">
        <span class="label">Contact</span>
        <div class="value">${owner?.phone || "Non renseigne"}</div>
      </div>
    </div>

    <div class="card">
      <span class="section-label">Details Cliniques</span>
      <div class="data-row">
        <span class="label">Service sollicite</span>
        <div class="value">${appointment.service}</div>
      </div>
      <div class="data-row">
        <span class="label">Date et Heure</span>
        <div class="value">${formatDateFR(appointment.scheduled_date)} a ${formatTimeFR(appointment.scheduled_time)}</div>
      </div>
    </div>

    <div class="instruction">
      <strong>Action requise :</strong> Pour confirmer ou refuser ce rendez-vous, veuillez vous connecter a votre portail veterinaire VetX.
    </div>

    <div class="footer">
      © 2026 VetX Algeria Professional.
    </div>
  </div>
</body>
</html>`;
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { appointment, pet, owner, vet, ownerEmail, vetEmail } = req.body;
    const apiKey = process.env.OUTMAIL_KEY;
    const token = JSON.parse(process.env.OUTMAIL_TOKEN);

    const results = { owner: null, vet: null };

    // Send to owner - Subject: Rendez-vous enregistre - VetX
    if (ownerEmail) {
      const ownerHtml = getOwnerEmailHtml(appointment, pet, vet);
      results.owner = await outmail.sendHtml(apiKey, token, ownerEmail, "Rendez-vous enregistre - VetX", ownerHtml);
    }

    // Send to vet - Subject: Nouvelle demande de rendez-vous - VetX
    if (vetEmail) {
      const vetHtml = getVetEmailHtml(appointment, pet, owner, vet);
      results.vet = await outmail.sendHtml(apiKey, token, vetEmail, "Nouvelle demande de rendez-vous - VetX", vetHtml);
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};