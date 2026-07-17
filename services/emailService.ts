import { logger } from "../utils/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Enterprise Email service with compiled responsive templates and diagnostic console logs.
 */
export const emailService = {
  /**
   * General-purpose send function.
   * Can easily be updated to use nodemailer or sendgrid when SMTP credentials are provided.
   */
  send: async (params: SendEmailParams): Promise<boolean> => {
    logger.info(`[SMTP Engine Simulation] Sending Email to: ${params.to}`);
    logger.info(`[SMTP Subject] ${params.subject}`);
    logger.info(
      `------------------------------------------------------------\n` +
      `[EMAIL RECEIVED BOX INBOX DISPLAY]:\n` +
      `${params.html.replace(/<[^>]*>/g, " ").slice(0, 400)}...\n` +
      `------------------------------------------------------------`
    );
    return true; // Return true to indicate successful hand-off
  },

  /**
   * WELCOME EMAIL TEMPLATE
   */
  sendWelcome: async (to: string, fullName: string): Promise<boolean> => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Paisa Blueprint</h2>
          <span style="font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase;">Enterprise Portfolio Locker 🇮🇳</span>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Welcome to compounding freedom, ${fullName}! 👋</h3>
          <p style="line-height: 1.6; font-size: 14px;">We are thrilled to welcome you to Paisa Blueprint. Your secure central database financial locker has been successfully registered and initialized.</p>
          <p style="line-height: 1.6; font-size: 14px;">You can now unlock advanced budget sandboxes, model 7th & 8th Pay scale progressions, run high-fidelity SIP compounding algorithms, and consult your customized Gemini AI Finance Coach anytime.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "http://localhost:3000"}/profile" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Financial Portfolio</a>
          </div>
          <p style="line-height: 1.6; font-size: 14px;">If you have any questions, our support advisors are ready to help.</p>
        </div>
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
          <p>&copy; 2026 Paisa Blueprint Inc. All rights reserved.</p>
          <p>This is a secure system notification sent to ${to}</p>
        </div>
      </div>
    `;

    return emailService.send({
      to,
      subject: "Welcome to Paisa Blueprint - Your Financial Locker is Ready! 🚀",
      html
    });
  },

  /**
   * EMAIL VERIFICATION TEMPLATE
   */
  sendVerification: async (to: string, fullName: string, token: string): Promise<boolean> => {
    const verifyLink = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin: 0; font-size: 24px; text-transform: uppercase;">Paisa Blueprint</h2>
          <span style="font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase;">Security Verification Panel</span>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Verify Your Email Address</h3>
          <p style="line-height: 1.6; font-size: 14px;">Namaste ${fullName},</p>
          <p style="line-height: 1.6; font-size: 14px;">Thank you for registering an account on Paisa Blueprint. To secure your database locker and verify your identity, please click the verification button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="line-height: 1.6; font-size: 13px; color: #64748b;">Or copy and paste this link in your web browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #3b82f6;"><a href="${verifyLink}">${verifyLink}</a></p>
          <p style="line-height: 1.6; font-size: 13px; color: #64748b; margin-top: 20px;">This verification link will expire in 24 hours.</p>
        </div>
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
          <p>&copy; 2026 Paisa Blueprint Inc.</p>
        </div>
      </div>
    `;

    return emailService.send({
      to,
      subject: "Verify Your Paisa Blueprint Email Address 🛡️",
      html
    });
  },

  /**
   * FORGOT PASSWORD TEMPLATE
   */
  sendForgotPassword: async (to: string, fullName: string, token: string): Promise<boolean> => {
    const resetLink = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin: 0; font-size: 24px; text-transform: uppercase;">Paisa Blueprint</h2>
          <span style="font-size: 11px; color: #ef4444; font-weight: bold; text-transform: uppercase;">Access Recovery Request</span>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Password Reset Request</h3>
          <p style="line-height: 1.6; font-size: 14px;">Hello ${fullName},</p>
          <p style="line-height: 1.6; font-size: 14px;">We received a request to reset your password for your Paisa Blueprint locker. Click the button below to establish a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Reset My Password</a>
          </div>
          <p style="line-height: 1.6; font-size: 13px; color: #64748b;">Or paste this link into your address bar:</p>
          <p style="word-break: break-all; font-size: 12px; color: #3b82f6;"><a href="${resetLink}">${resetLink}</a></p>
          <p style="line-height: 1.6; font-size: 13px; color: #ef4444; font-weight: bold; margin-top: 20px;">If you did not request this reset, please ignore this email. Your password will remain completely secure.</p>
          <p style="line-height: 1.6; font-size: 13px; color: #64748b;">This request link will expire in 1 hour.</p>
        </div>
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
          <p>&copy; 2026 Paisa Blueprint Inc.</p>
        </div>
      </div>
    `;

    return emailService.send({
      to,
      subject: "Paisa Blueprint Locker Reset Key 🔑",
      html
    });
  },

  /**
   * PASSWORD CHANGED CONFIRMATION TEMPLATE
   */
  sendPasswordChanged: async (to: string, fullName: string): Promise<boolean> => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin: 0; font-size: 24px; text-transform: uppercase;">Paisa Blueprint</h2>
          <span style="font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase;">Security Alert</span>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">Password Updated Successfully ✔️</h3>
          <p style="line-height: 1.6; font-size: 14px;">Namaste ${fullName},</p>
          <p style="line-height: 1.6; font-size: 14px;">This is a security confirmation that the password/passcode locker for your account <strong>${to}</strong> was changed on <strong>${new Date().toUTCString()}</strong>.</p>
          <p style="line-height: 1.6; font-size: 14px; color: #b91c1c; font-weight: bold;">If you did not authorize this action, please contact support and freeze your ledger immediately to safeguard your compounding calculators.</p>
          <p style="line-height: 1.6; font-size: 14px;">No further actions are required if you initiated this change.</p>
        </div>
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
          <p>&copy; 2026 Paisa Blueprint Inc.</p>
        </div>
      </div>
    `;

    return emailService.send({
      to,
      subject: "Security Alert: Paisa Blueprint Password Changed 🚨",
      html
    });
  },

  /**
   * ACCOUNT DELETED TEMPLATE
   */
  sendAccountDeleted: async (to: string, fullName: string): Promise<boolean> => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin: 0; font-size: 24px; text-transform: uppercase;">Paisa Blueprint</h2>
          <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Locker Closed</span>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Your Database Locker has been Deleted</h3>
          <p style="line-height: 1.6; font-size: 14px;">Dear ${fullName},</p>
          <p style="line-height: 1.6; font-size: 14px;">We are writing to confirm that, as requested, your Paisa Blueprint account associated with <strong>${to}</strong> has been completely and permanently deleted from our servers.</p>
          <p style="line-height: 1.6; font-size: 14px;">All associated profiles, financial ledger records, custom retirement SIP plans, and history files have been securely wiped. This action is irreversible.</p>
          <p style="line-height: 1.6; font-size: 14px;">We are sad to see you go. If you ever want to model and coordinate your salary assets again, you are always welcome to sign up for a new locker.</p>
        </div>
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
          <p>&copy; 2026 Paisa Blueprint Inc.</p>
        </div>
      </div>
    `;

    return emailService.send({
      to,
      subject: "Account Locker Deleted - Paisa Blueprint 🗑️",
      html
    });
  }
};
