const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmEmail(email, repo, confirmToken) {
  const confirmUrl = `${process.env.BASE_URL}/api/confirm/${confirmToken}`;
  
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `Accept subscription to ${repo}`,
    html: `
      <h2>Confirm subscription</h2>
      <p>You have subscribed to releases of the repository <b>${repo}</b></p>
      <a href="${confirmUrl}">Confirm subscription</a>
    `
  });
}

async function sendReleaseEmail(email, repo, tag, unsubscribeToken) {
  const unsubscribeUrl = `${process.env.BASE_URL}/api/unsubscribe/${unsubscribeToken}`;
  
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `New release ${repo}: ${tag}`,
    html: `
      <h2>New release!</h2>
      <p>The repository <b>${repo}</b> has released a new version: <b>${tag}</b></p>
      <a href="https://github.com/${repo}/releases/tag/${tag}">View release</a>
      <br><br>
      <a href="${unsubscribeUrl}">Unsubscribe</a>
    `
  });
}

module.exports = { sendConfirmEmail, sendReleaseEmail };