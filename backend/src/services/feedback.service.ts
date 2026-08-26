import { sendFeedbackEmail } from "./mailer.service.js";

export async function submitFeedback(input: { email: string; message: string }) {
  await sendFeedbackEmail(input.email, input.message);
}
