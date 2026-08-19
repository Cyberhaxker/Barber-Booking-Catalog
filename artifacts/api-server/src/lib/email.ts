import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface BookingConfirmationData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  styleName: string;
  bookingDate: string;
  bookingTime: string;
  bookingId: number;
  notes?: string | null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr} ${ampm}`;
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
  const { clientName, clientEmail, styleName, bookingDate, bookingTime, bookingId, notes } = data;

  const formattedDate = formatDate(bookingDate);
  const formattedTime = formatTime(bookingTime);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation – MamboFades</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d12;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#16161f;border-radius:12px;overflow:hidden;border:1px solid #2a2a3a;">
          <!-- Header -->
          <tr>
            <td style="background-color:#b8860b;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#0d0d12;font-size:28px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">MamboFades</h1>
              <p style="margin:6px 0 0;color:#0d0d12;font-size:13px;letter-spacing:1px;opacity:0.8;">EXQUISITE HAIR DESIGNER</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:22px;font-weight:700;">Booking Confirmed</h2>
              <p style="margin:0 0 32px;color:#9090a0;font-size:15px;">Hi ${clientName}, your appointment is booked. We look forward to seeing you.</p>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2a;border-radius:8px;border:1px solid #2a2a3a;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #2a2a3a;">
                          <span style="color:#9090a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Service</span><br/>
                          <span style="color:#f5f5f5;font-size:16px;font-weight:600;margin-top:4px;display:block;">${styleName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #2a2a3a;">
                          <span style="color:#9090a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date</span><br/>
                          <span style="color:#f5f5f5;font-size:16px;font-weight:600;margin-top:4px;display:block;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #2a2a3a;">
                          <span style="color:#9090a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Time</span><br/>
                          <span style="color:#f5f5f5;font-size:16px;font-weight:600;margin-top:4px;display:block;">${formattedTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;${notes ? "border-bottom:1px solid #2a2a3a;" : ""}">
                          <span style="color:#9090a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</span><br/>
                          <span style="color:#b8860b;font-size:16px;font-weight:700;margin-top:4px;display:block;">#MF-${String(bookingId).padStart(4, "0")}</span>
                        </td>
                      </tr>
                      ${notes ? `
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#9090a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Notes</span><br/>
                          <span style="color:#f5f5f5;font-size:15px;margin-top:4px;display:block;">${notes}</span>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#9090a0;font-size:14px;">Need to reschedule or cancel? Contact us:</p>
              <p style="margin:0;color:#b8860b;font-size:14px;">muchenjeharold@gmail.com</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a3a;text-align:center;">
              <p style="margin:0;color:#505060;font-size:12px;">MamboFades &mdash; Exquisite Hair Designer</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"MamboFades" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `Booking Confirmed – ${styleName} on ${formattedDate}`,
      html,
    });
    logger.info({ bookingId, clientEmail }, "Booking confirmation email sent");
  } catch (err) {
    logger.error({ err, bookingId, clientEmail }, "Failed to send booking confirmation email");
  }
}

export async function sendAdminNotification(data: BookingConfirmationData): Promise<void> {
  const { clientName, clientEmail, clientPhone, styleName, bookingDate, bookingTime, bookingId, notes } = data;

  const formattedDate = formatDate(bookingDate);
  const formattedTime = formatTime(bookingTime);
  const adminEmail = process.env.GMAIL_USER!;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking – MamboFades</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d12;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#16161f;border-radius:12px;overflow:hidden;border:1px solid #2a2a3a;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e1e2a;padding:24px 40px;border-bottom:2px solid #b8860b;">
              <p style="margin:0;color:#b8860b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">New Booking Alert</p>
              <h1 style="margin:6px 0 0;color:#f5f5f5;font-size:24px;font-weight:800;">MamboFades</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 6px;color:#f5f5f5;font-size:20px;font-weight:700;">You have a new appointment</h2>
              <p style="margin:0 0 32px;color:#9090a0;font-size:14px;">Reference <strong style="color:#b8860b;">#MF-${String(bookingId).padStart(4, "0")}</strong> — ${formattedDate} at ${formattedTime}</p>

              <!-- Client info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2a;border-radius:8px;border:1px solid #2a2a3a;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a3a;">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Client</p>
                    <p style="margin:4px 0 0;color:#f5f5f5;font-size:16px;font-weight:600;">${clientName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a3a;">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                    <p style="margin:4px 0 0;font-size:15px;"><a href="mailto:${clientEmail}" style="color:#b8860b;text-decoration:none;">${clientEmail}</a></p>
                  </td>
                </tr>
                ${clientPhone ? `
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a3a;">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Phone</p>
                    <p style="margin:4px 0 0;font-size:15px;"><a href="tel:${clientPhone}" style="color:#b8860b;text-decoration:none;">${clientPhone}</a></p>
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2a2a3a;">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Service</p>
                    <p style="margin:4px 0 0;color:#f5f5f5;font-size:15px;font-weight:600;">${styleName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;${notes ? "border-bottom:1px solid #2a2a3a;" : ""}">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date &amp; Time</p>
                    <p style="margin:4px 0 0;color:#f5f5f5;font-size:15px;font-weight:600;">${formattedDate} &mdash; ${formattedTime}</p>
                  </td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;color:#9090a0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Client Notes</p>
                    <p style="margin:4px 0 0;color:#f5f5f5;font-size:15px;">${notes}</p>
                  </td>
                </tr>` : ""}
              </table>

              <p style="margin:0;color:#9090a0;font-size:13px;">Log in to your admin panel to confirm or manage this booking.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a3a;text-align:center;">
              <p style="margin:0;color:#505060;font-size:12px;">MamboFades Admin Notifications</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"MamboFades" <${adminEmail}>`,
      to: adminEmail,
      subject: `New Booking: ${clientName} — ${styleName} on ${formattedDate}`,
      html,
    });
    logger.info({ bookingId }, "Admin notification email sent");
  } catch (err) {
    logger.error({ err, bookingId }, "Failed to send admin notification email");
  }
}
