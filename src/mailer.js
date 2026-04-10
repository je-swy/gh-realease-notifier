const nodemailer = require('nodemailer')
require('dotenv').config()

// main logic for sending emails about new releases and confirmations
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send confirmation email to user after they subscribe to a repo
async function sendConfirmEmail(email, repo, confirmToken) {
  const confirmUrl = `${process.env.BASE_URL}/api/confirm/${confirmToken}`
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Accept subscription to ${repo}`,
    html: `
      <h2>Confirm subscription</h2>
      <p>You have subscribed to releases of the repository <b>${repo}</b></p>
      <a href="${confirmUrl}">Confirm subscription</a>
    `,
  })
}

// Send release notification email to user with unsubscribe link
async function sendReleaseEmail(email, repo, tag, unsubscribeToken) {
  const unsubscribeUrl = `${process.env.BASE_URL}/api/unsubscribe/${unsubscribeToken}`
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `New release ${repo}: ${tag}`,
    html: `
      <h2>New release!</h2>
      <p>The repository <b>${repo}</b> has released a new version: <b>${tag}</b></p>
      <a href="https://github.com/${repo}/releases/tag/${tag}">View release</a>
      <br><br>
      <a href="${unsubscribeUrl}">Unsubscribe</a>
    `,
  })
}

module.exports = { sendConfirmEmail, sendReleaseEmail }