import { NextRequest, NextResponse, userAgent } from 'next/server';
import nodemailer from 'nodemailer';

const ipRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = ipRateMap.get(ip);
  if (!rec || now > rec.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  rec.count++;
  return rec.count <= RATE_LIMIT;
}

function getClientIp(req: NextRequest): string {
  const headers = ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'];
  for (const h of headers) {
    const val = req.headers.get(h);
    if (!val) continue;
    const candidates = val.split(',').map((s) => s.trim());
    for (const ip of candidates) {
      if (isPublicIp(ip)) return ip;
    }
  }
  return 'unknown';
}

function isPublicIp(ip: string): boolean {
  if (!ip) return false;
  const privateRanges = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./, /^::1$/, /^fc00:/, /^fe80:/];
  return !privateRanges.some((r) => r.test(ip));
}

const SUBJECT_LABELS: Record<string, string> = {
  yatirim: 'Yatırım & Finansman',
  partner: 'Stratejik Ortaklık',
  urun: 'Ürün & Teknoloji',
  kariyer: 'Kariyer & Ekip',
  medya: 'Medya & Basın',
  diger: 'Diğer',
};

let _transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml(data: {
  name: string; email: string; subject: string; message: string;
  orgName: string; orgRole: string;
  ip: string;
  deviceType: string; deviceVendor: string; deviceModel: string;
  osName: string; osVersion: string;
  browserName: string; browserVersion: string;
  country: string; city: string; region: string;
  latitude: string; longitude: string;
  acceptLang: string;
}): string {
  const {
    name, email, subject, message, orgName, orgRole,
    ip, deviceType, deviceVendor, deviceModel,
    osName, osVersion, browserName, browserVersion,
    country, city, region, latitude, longitude, acceptLang,
  } = data;

  const orgSection = orgName ? `
    <tr><td style="padding:4px 0;"><strong style="color:#00cc6a;">🏢 Şirket:</strong> ${esc(orgName)}</td></tr>
    <tr><td style="padding:4px 0;"><strong style="color:#00cc6a;">🪪 Ünvan:</strong> ${esc(orgRole)}</td></tr>` : '';

  const deviceLabel = [deviceVendor, deviceModel].filter(Boolean).join(' ') || '—';
  const deviceTypeLabel = deviceType || 'Masaüstü';

  const locationParts = [city, region, country].filter(Boolean).join(', ') || '—';
  const coordsLabel = latitude && longitude ? `${latitude}, ${longitude}` : '—';

  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080c0a;font-family:Arial,sans-serif;">
<table width="100%" cellPadding="0" cellSpacing="0" style="background:#080c0a;padding:32px 0;">
<tr><td align="center">
<table width="620" cellPadding="0" cellSpacing="0" style="background:#0e1512;border:1px solid #1a2e23;border-radius:16px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,#00FF88,#00cc6a);padding:20px 32px;">
      <h1 style="margin:0;color:#080c0a;font-size:20px;font-weight:800;">📩 Yeni İletişim Formu Mesajı</h1>
      <p style="margin:4px 0 0;color:#0e1512;font-size:13px;opacity:.75;">NaT — Natural Agriculture Technologies</p>
    </td>
  </tr>
  <tr><td style="padding:28px 32px;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="color:#F5F4EE;font-size:14px;line-height:1.7;">

      <!-- Gönderen -->
      <tr><td colspan="2" style="padding-bottom:4px;">
        <h3 style="margin:0 0 10px;color:#00cc6a;font-size:13px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid #1a2e23;padding-bottom:6px;">👤 Gönderen</h3>
      </td></tr>
      <tr><td style="padding:4px 0;"><strong style="color:#00cc6a;">Ad Soyad:</strong> ${esc(name)}</td></tr>
      <tr><td style="padding:4px 0;"><strong style="color:#00cc6a;">E-posta:</strong> <a href="mailto:${esc(email)}" style="color:#00FF88;">${esc(email)}</a></td></tr>
      <tr><td style="padding:4px 0;"><strong style="color:#00cc6a;">Konu:</strong> ${esc(subject)}</td></tr>
      ${orgSection}

      <!-- Mesaj -->
      <tr><td style="padding:16px 0 8px;">
        <h3 style="margin:0 0 8px;color:#00cc6a;font-size:13px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid #1a2e23;padding-bottom:6px;">💬 Mesaj</h3>
        <div style="background:#080c0a;border:1px solid #1a2e23;border-radius:10px;padding:16px;color:#b0aea7;white-space:pre-wrap;">${esc(message)}</div>
      </td></tr>

      <!-- Cihaz Bilgileri -->
      <tr><td style="padding:16px 0 4px;">
        <h3 style="margin:0 0 10px;color:#00cc6a;font-size:13px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid #1a2e23;padding-bottom:6px;">📱 Cihaz Bilgileri</h3>
      </td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">💻 <strong style="color:#d0cec8;">Cihaz Türü:</strong> ${esc(deviceTypeLabel)}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">📟 <strong style="color:#d0cec8;">Cihaz Modeli:</strong> ${esc(deviceLabel)}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🖥️ <strong style="color:#d0cec8;">İşletim Sistemi:</strong> ${esc(osName || '—')} ${esc(osVersion || '')}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🌐 <strong style="color:#d0cec8;">Tarayıcı:</strong> ${esc(browserName || '—')} ${esc(browserVersion || '')}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🗣️ <strong style="color:#d0cec8;">Tarayıcı Dili:</strong> ${esc(acceptLang || '—')}</td></tr>

      <!-- Konum Bilgileri -->
      <tr><td style="padding:16px 0 4px;">
        <h3 style="margin:0 0 10px;color:#00cc6a;font-size:13px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid #1a2e23;padding-bottom:6px;">📍 Konum Bilgileri</h3>
      </td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🌍 <strong style="color:#d0cec8;">Konum:</strong> ${esc(locationParts)}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🗺️ <strong style="color:#d0cec8;">Koordinatlar:</strong> ${esc(coordsLabel)}</td></tr>
      <tr><td style="padding:3px 0;font-size:13px;color:#b0aea7;">🌐 <strong style="color:#d0cec8;">IP Adresi:</strong> ${esc(ip !== 'unknown' ? ip : '—')}</td></tr>

    </table>
  </td></tr>
  <tr>
    <td style="padding:14px 32px;background:#080c0a;border-top:1px solid #1a2e23;text-align:center;">
      <p style="margin:0;font-size:11px;color:#4a5a50;">Bu e-posta NaT İletişim Formu aracılığıyla otomatik oluşturulmuştur.</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { status: 'error', message: 'Çok fazla istek. Lütfen biraz bekleyin.' },
      { status: 429 }
    );
  }

  // Device & browser detection using Next.js built-in userAgent (no external API)
  const { browser, device, os } = userAgent(request);

  // Geolocation from Vercel's automatic headers (no external API)
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const cityRaw = request.headers.get('x-vercel-ip-city') ?? '';
  const city = (() => { try { return decodeURIComponent(cityRaw); } catch { return cityRaw; } })();
  const region = request.headers.get('x-vercel-ip-country-region') ?? '';
  const latitude = request.headers.get('x-vercel-ip-latitude') ?? '';
  const longitude = request.headers.get('x-vercel-ip-longitude') ?? '';
  const acceptLang = (request.headers.get('accept-language') ?? '').split(',')[0] ?? '';

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* ignore parse errors */ }

  const sanitize = (v: unknown) => String(v ?? '').trim().slice(0, 2000);
  const s = {
    name: sanitize(body.name),
    email: sanitize(body.email),
    subject: sanitize(body.subject),
    message: sanitize(body.message),
    orgName: sanitize(body.orgName),
    orgRole: sanitize(body.orgRole),
  };

  const errors: string[] = [];
  if (s.name.length < 2) errors.push('Ad Soyad gerekli.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) errors.push('Geçerli e-posta gerekli.');
  if (!s.subject) errors.push('Konu seçimi gerekli.');
  if (s.message.length < 10) errors.push('Mesaj çok kısa.');

  if (errors.length) {
    return NextResponse.json({ status: 'error', message: errors.join(' ') }, { status: 422 });
  }

  const subjectLabel = SUBJECT_LABELS[s.subject] ?? s.subject;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"NaT İletişim Formu" <${process.env.SMTP_FROM}>`,
      to: process.env.MAIL_TO,
      replyTo: `"${s.name}" <${s.email}>`,
      subject: `📩 [${subjectLabel}] ${s.name} — NaT İletişim Formu`,
      html: buildHtml({
        ...s,
        subject: subjectLabel,
        ip,
        deviceType: device.type ?? '',
        deviceVendor: device.vendor ?? '',
        deviceModel: device.model ?? '',
        osName: os.name ?? '',
        osVersion: os.version ?? '',
        browserName: browser.name ?? '',
        browserVersion: browser.version ?? '',
        country,
        city,
        region,
        latitude,
        longitude,
        acceptLang,
      }),
      text: `Gönderen: ${s.name} <${s.email}>\nKonu: ${subjectLabel}\n\n${s.message}`,
    });

    return NextResponse.json({ status: 'success', message: 'Mesajınız başarıyla gönderildi. Teşekkür ederiz!' });
  } catch (err) {
    console.error('[NaT Mail] Nodemailer hatası:', err);
    return NextResponse.json(
      { status: 'error', message: 'Mail gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
