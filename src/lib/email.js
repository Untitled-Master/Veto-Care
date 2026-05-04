// Email service - calls Vercel API
// The API uses 0utmailcore server-side with env vars

async function sendEmail(to, subject, html) {
  const res = await fetch("https://api0utmail-test-email.vercel.app/sendHtml", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: import.meta.env.VITE_OUTMAIL_KEY,
      google_token: {
        "access_token": import.meta.env.VITE_OUTMAIL_TOKEN_ACCESS,
        "refresh_token": import.meta.env.VITE_OUTMAIL_TOKEN_REFRESH,
        "scope": "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
        "token_type": "Bearer",
        "expiry_date": 1777927074834
      }, 
      to,
      subject,
      html
    })
  });
  return res.json();
}

// Shared CSS Theme for all emails
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #09090b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  .wrapper { background-color: #ffffff; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; }
  .logo-box { background-color: #10b981; color: #ffffff; width: 28px; height: 28px; border-radius: 6px; display: inline-block; text-align: center; line-height: 28px; font-weight: 800; font-size: 14px; margin-right: 10px; vertical-align: middle; }
  .breadcrumb { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #a1a1aa; vertical-align: middle; }
  .title { font-size: 24px; font-weight: 600; letter-spacing: -0.03em; margin: 24px 0 12px 0; color: #09090b; }
  .description { font-size: 14px; color: #71717a; line-height: 1.6; margin-bottom: 32px; }
  .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
  .card-header { background-color: #fafafa; padding: 12px 20px; border-bottom: 1px solid #e4e4e7; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; }
  .card-body { padding: 16px 20px; }
  .data-row { padding: 10px 0; border-bottom: 1px solid #f4f4f5; }
  .data-row:last-child { border-bottom: none; }
  .label { font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; display: block; margin-bottom: 2px; }
  .value { font-size: 13px; font-weight: 600; color: #09090b; }
  .action-box { margin-top: 32px; padding: 20px; background-color: #09090b; border-radius: 12px; color: #ffffff; }
  .action-text { font-size: 12px; line-height: 1.5; margin: 0; }
  .highlight { color: #10b981; font-weight: 700; }
  .footer { font-size: 10px; color: #a1a1aa; margin-top: 48px; text-align: center; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; }
`;

function generateBarcode(appointmentId) {
  return `VETX-${appointmentId.slice(0, 8).toUpperCase()}`;
}

function formatDateFR(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTimeFR(timeStr) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

// 1. Send Appointment Request (Owner + Vet)
export async function sendAppointmentEmails(appointment, pet, owner, vet) {
  const ownerEmail = owner?.email;
  const vetEmail = vet?.email;
  if (!ownerEmail && !vetEmail) return { success: false };

  try {
    if (ownerEmail) {
      const ownerHtml = getOwnerEmailHtml(appointment, pet, vet);
      await sendEmail(ownerEmail, "Demande de rendez-vous enregistree - VetX", ownerHtml);
    }
    if (vetEmail) {
      const vetHtml = getVetEmailHtml(appointment, pet, owner, vet);
      await sendEmail(vetEmail, "Nouvelle demande de rendez-vous - VetX", vetHtml);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 2. Vet Accepted Account
export async function sendVetAcceptanceEmail(vetName, email, password) {
  try {
    const html = getVetAcceptanceEmailHtml(vetName, email, password);
    await sendEmail(email, "Votre compte a ete approuve - VetX Pro", html);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 3. Vet Refused Account
export async function sendVetRefusalEmail(vetName, email, reason) {
  try {
    const html = getVetRefusalEmailHtml(vetName, reason);
    await sendEmail(email, "Mise a jour concernant votre inscription - VetX", html);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 4. Vet Confirmed Appointment
export async function sendVetConfirmationEmail(appointment, pet, owner, vet) {
  try {
    const html = getVetConfirmationEmailHtml(appointment, pet, vet);
    const ownerEmail = owner?.email;
    if (ownerEmail) {
      await sendEmail(ownerEmail, "Rendez-vous confirme - VetX", html);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 5. Vet Declined Appointment
export async function sendVetDeclineEmail(appointment, pet, owner, vet, reason) {
  try {
    const html = getVetDeclineEmailHtml(appointment, pet, vet, reason);
    const ownerEmail = owner?.email;
    if (ownerEmail) {
      await sendEmail(ownerEmail, "Rendez-vous decline - VetX", html);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 6. Owner Cancelled
export async function sendOwnerCancelEmail(appointment, pet, owner, vet) {
  try {
    const html = getOwnerCancelEmailHtml(appointment, pet, owner, vet);
    const vetEmail = vet?.email;
    if (vetEmail) {
      await sendEmail(vetEmail, "Rendez-vous annule - VetX", html);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// --- HTML TEMPLATES ---

function getOwnerEmailHtml(appointment, pet, vet) {
  const barcode = generateBarcode(appointment.id);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box">V</div><span class="breadcrumb">VetX / VISITE</span></div>
    <h1 class="title">Rendez-vous enregistre</h1>
    <p class="description">Bonjour ${pet?.owner_name || "Cher client"}, votre demande a ete transmise. Le veterinaire doit maintenant confirmer la disponibilite.</p>
    <div class="card">
      <div class="card-header">Recépissé Numérique</div>
      <div class="card-body">
        <div class="data-row"><span class="label">Patient</span><div class="value">${pet?.name || "N/A"}</div></div>
        <div class="data-row"><span class="label">Service</span><div class="value">${appointment.service}</div></div>
        <div class="data-row"><span class="label">Date</span><div class="value">${formatDateFR(appointment.scheduled_date)}</div></div>
        <div class="data-row"><span class="label">Praticien</span><div class="value">${vet?.name || "N/A"}</div></div>
      </div>
      <div style="text-align:center; padding:20px; background:#fafafa; border-top:1px solid #e4e4e7;">
        <div class="mono" style="font-size:20px; letter-spacing:4px;">${barcode}</div>
      </div>
    </div>
    <div class="action-box"><p class="action-text">Pour suivre l'etat de cette demande, connectez-vous a votre <span class="highlight">Espace Client VetX</span> sur notre plateforme.</p></div>
    <div class="footer">VetX Algeria - Infrastructure de Sante</div>
  </div></div></body></html>`;
}

function getVetEmailHtml(appointment, pet, owner, vet) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box">V</div><span class="breadcrumb">VetX / PRO</span></div>
    <h1 class="title">Nouvelle demande</h1>
    <p class="description">Dr. ${vet?.name?.replace("Dr. ", "")}, vous avez reçu une nouvelle demande de consultation via le portail VetX.</p>
    <div class="card">
      <div class="card-header">Infos Client & Animal</div>
      <div class="card-body">
        <div class="data-row"><span class="label">Proprietaire</span><div class="value">${owner?.full_name || "Client"}</div></div>
        <div class="data-row"><span class="label">Animal</span><div class="value">${pet?.name} (${pet?.species})</div></div>
        <div class="data-row"><span class="label">Service</span><div class="value">${appointment.service}</div></div>
        <div class="data-row"><span class="label">Creneau</span><div class="value">${formatDateFR(appointment.scheduled_date)} a ${formatTimeFR(appointment.scheduled_time)}</div></div>
      </div>
    </div>
    <div class="action-box"><p class="action-text">Veuillez vous connecter a votre <span class="highlight">Tableau de Bord Veterinaire</span> pour confirmer ou modifier ce rendez-vous.</p></div>
    <div class="footer">VetX Pro Algeria</div>
  </div></div></body></html>`;
}

function getVetAcceptanceEmailHtml(vetName, email, password) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box">V</div><span class="breadcrumb">VetX / ACCES</span></div>
    <h1 class="title">Compte Approuve</h1>
    <p class="description">Bonjour Dr. ${vetName}, votre demande d'adhesion au reseau VetX a ete validee. Vous pouvez desormais configurer votre clinique en ligne.</p>
    <div class="card">
      <div class="card-header">Identifiants Securises</div>
      <div class="card-body">
        <div class="data-row"><span class="label">Email</span><div class="value">${email}</div></div>
        <div class="data-row"><span class="label">Mot de passe provisoire</span><div class="value mono">${password}</div></div>
      </div>
    </div>
    <div class="action-box" style="background:#10b981;"><p class="action-text">Rendez-vous sur la page de <span class="highlight" style="color:white;text-decoration:underline;">Connexion Veterinaire</span> pour acceder a vos outils.</p></div>
    <div class="footer">VetX Professional Network</div>
  </div></div></body></html>`;
}

function getVetRefusalEmailHtml(vetName, reason) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box" style="background:#ef4444;">V</div><span class="breadcrumb">VetX / INSCRIPTION</span></div>
    <h1 class="title">Mise a jour de dossier</h1>
    <p class="description">Bonjour Dr. ${vetName}, nous avons examine votre demande. Malheureusement, nous ne pouvons pas l'approuver actuellement.</p>
    <div class="card" style="border-color:#fecaca;">
      <div class="card-header" style="color:#b91c1c; background:#fef2f2;">Motif du refus</div>
      <div class="card-body"><p class="value" style="color:#7f1d1d;">${reason}</p></div>
    </div>
    <p class="description">Pour toute contestation, veuillez contacter le support technique via le site officiel.</p>
    <div class="footer">VetX Algeria Sante</div>
  </div></div></body></html>`;
}

function getVetConfirmationEmailHtml(appointment, pet, vet) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box">V</div><span class="breadcrumb">VetX / STATUS</span></div>
    <h1 class="title" style="color:#10b981;">Visite Confirmee</h1>
    <p class="description">Excellente nouvelle ! Votre rendez-vous pour ${pet?.name} a ete officiellement confirme par le cabinet.</p>
    <div class="card" style="border-color:#10b981;">
      <div class="card-header" style="background:#ecfdf5; color:#047857;">Details du RDV</div>
      <div class="card-body">
        <div class="data-row"><span class="label">Date</span><div class="value">${formatDateFR(appointment.scheduled_date)}</div></div>
        <div class="data-row"><span class="label">Heure</span><div class="value">${formatTimeFR(appointment.scheduled_time)}</div></div>
        <div class="data-row"><span class="label">Clinique</span><div class="value">${vet?.clinic_name || vet?.name}</div></div>
      </div>
    </div>
    <div class="action-box"><p class="action-text">Consultez votre <span class="highlight">Espace Personnel</span> pour voir l'adresse exacte et les consignes pre-operatoires.</p></div>
    <div class="footer">VetX - La Sante Animale Simplifiee</div>
  </div></div></body></html>`;
}

function getVetDeclineEmailHtml(appointment, pet, vet, reason) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box" style="background:#71717a;">V</div><span class="breadcrumb">VetX / AGENDA</span></div>
    <h1 class="title">Rendez-vous non disponible</h1>
    <p class="description">Bonjour, le Dr. ${vet?.name} ne peut malheureusement pas honorer votre demande de rendez-vous pour ${pet?.name}.</p>
    ${reason ? `<div class="card"><div class="card-header">Note du veterinaire</div><div class="card-body"><p class="value">${reason}</p></div></div>` : ''}
    <div class="action-box" style="background:#71717a;"><p class="action-text">Nous vous invitons a retourner sur la plateforme pour choisir un autre praticien ou un autre creneau horaire.</p></div>
    <div class="footer">VetX Network</div>
  </div></div></body></html>`;
}

function getOwnerCancelEmailHtml(appointment, pet, owner, vet) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyles}</style></head>
  <body><div class="wrapper"><div class="container">
    <div class="header"><div class="logo-box" style="background:#ef4444;">V</div><span class="breadcrumb">VetX / ANNULATION</span></div>
    <h1 class="title">Rendez-vous annule</h1>
    <p class="description">Dr. ${vet?.name?.replace("Dr. ", "")}, nous vous informons que le client a annule la consultation prevue.</p>
    <div class="card">
      <div class="card-header">Creneau libere</div>
      <div class="card-body">
        <div class="data-row"><span class="label">Client</span><div class="value">${owner?.full_name}</div></div>
        <div class="data-row"><span class="label">Animal</span><div class="value">${pet?.name}</div></div>
        <div class="data-row"><span class="label">Initialement prevu</span><div class="value">${formatDateFR(appointment.scheduled_date)}</div></div>
      </div>
    </div>
    <div class="action-box" style="background:#18181b;"><p class="action-text">Ce creneau est desormais disponible pour d'autres patients dans votre gestionnaire de rendez-vous.</p></div>
    <div class="footer">VetX Pro Portal</div>
  </div></div></body></html>`;
}