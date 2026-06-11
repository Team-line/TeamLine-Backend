import resend from "../../config/reSend.js";
import { EMAIL_FROM } from "../../config/env.js";
import { resetPasswordTemplate } from "./resetPassword.template.js";
import appErrors from "../errors/appErrors.js";
export const sendEmail = async function (email, html, subject) {
  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: subject,
      html,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new appErrors("Failed to send email", 500);
  }
};
