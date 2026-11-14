import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

STATUS_LABELS = {
    "approved_shortlisted": "Shortlisted ✅",
    "invited_for_trial": "Invited for Trial 🎯",
    "rejected": "Not Selected ❌",
    "pending": "Pending ⏳",
}

STATUS_COLORS = {
    "approved_shortlisted": "#16a34a",
    "invited_for_trial": "#2563eb",
    "rejected": "#dc2626",
    "pending": "#d97706",
}


def send_status_email(
    to_email: str,
    athlete_name: str,
    club_name: str,
    status: str,
    feedback: str = "",
    trial_datetime: str = "",
):
    """Send a status update email to an athlete when their application changes."""
    sendgrid_key = os.getenv("SENDGRID_API_KEY", "")
    from_email = os.getenv("FROM_EMAIL", "noreply@sportbridge.in")

    if not sendgrid_key:
        print("[emailer] SENDGRID_API_KEY not set, skipping email.")
        return

    label = STATUS_LABELS.get(status, status.replace("_", " ").title())
    color = STATUS_COLORS.get(status, "#6b7280")

    trial_block = ""
    if status == "invited_for_trial" and trial_datetime:
        trial_block = f"""
        <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;border-radius:4px;">
          <strong>🗓 Trial Date &amp; Time:</strong><br/>
          <span style="font-size:16px;color:#1e40af;">{trial_datetime}</span>
        </div>
        """

    feedback_block = ""
    if feedback:
        feedback_block = f"""
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px 16px;margin:16px 0;border-radius:4px;">
          <strong>Manager's Note:</strong><br/>
          <em style="color:#374151;">{feedback}</em>
        </div>
        """

    subject_map = {
        "approved_shortlisted": f"🎉 You've been shortlisted by {club_name}!",
        "invited_for_trial": f"🎯 Trial Invitation from {club_name}",
        "rejected": f"Update on your application to {club_name}",
    }
    subject = subject_map.get(status, f"Application Update from {club_name}")

    html_content = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f3f4f6;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:28px 32px;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">⚽ SportBridge</span>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Maharashtra's Sports Talent Pipeline</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="font-size:16px;color:#111827;margin:0 0 8px;">Hi <strong>{athlete_name}</strong>,</p>
            <p style="color:#374151;margin:0 0 20px;">
              Your application to <strong>{club_name}</strong> has been reviewed.
            </p>

            <!-- Status Badge -->
            <div style="text-align:center;margin:20px 0;">
              <span style="display:inline-block;background:{color};color:#fff;padding:10px 28px;border-radius:999px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                {label}
              </span>
            </div>

            {trial_block}
            {feedback_block}

            <p style="color:#374151;margin:20px 0 8px;">
              Log in to your SportBridge account to view your full application dashboard.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="http://sportbridge.in/dashboard" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                View Dashboard →
              </a>
            </div>

            <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">
              Keep pursuing your dream! Maharashtra's sports scene needs talent like yours. 🏆
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              SportBridge · Maharashtra Sports Talent Pipeline<br/>
              You received this because you applied through SportBridge.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        print(f"[emailer] Email sent to {to_email}, status={response.status_code}")
    except Exception as e:
        print(f"[emailer] Failed to send email: {e}")
