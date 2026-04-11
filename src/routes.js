const express = require('express')
const router = express.Router()
const pool = require('./db')
const { checkRepo } = require('./github')
const { sendConfirmEmail } = require('./mailer')

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  const { email, repo } = req.body

  // validate repo format and email presence
  if (!email || !repo) {
    return res.status(400).json({ message: 'Email and repo are required' })
  }

  // simple regex to validate "owner/repo" format
  const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
  if (!repoRegex.test(repo)) {
    return res.status(400).json({ message: 'Invalid repo format. Example: owner/repo' })
  }

  // main logic for handling new subscription requests
  try {
    // check if repo exists on GitHub
    const exists = await checkRepo(repo)
    if (!exists) {
      return res.status(404).json({ message: 'Repository not found on GitHub' })
    }

    // save subscription to DB (if not exists)
    await pool.query(
      `INSERT INTO subscriptions (email, repo)
       VALUES ($1, $2)
       ON CONFLICT (email, repo) DO NOTHING`,
      [email, repo]
    )

    // check if subscription is already confirmed
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE email = $1 AND repo = $2',
      [email, repo]
    )

    // if already confirmed, no need to send email again
    if (rows[0].confirmed) {
      return res.status(409).json({ message: 'Subscription already confirmed' })
    }

    res.status(200).json({ message: 'Success! Confirmation email is being sent.' })
    //  send confirmation email
    sendConfirmEmail(email, repo, rows[0].confirm_token).catch(err => {
      console.error('Email sending failed in background:', err.message)
    })
  } catch (error) {
    if (error.message === 'RATE_LIMIT') {
      return res.status(429).json({ message: 'GitHub rate limit. Try again later.' })
    }
    console.error(error)
    if (!res.headersSent) {
        return res.status(500).json({ message: 'Internal server error' })
    }
  }
})

// GET /api/confirm/:token - accept subscription
// This endpoint is called when user clicks the confirmation link in their email
// It verifies the token and marks the subscription as confirmed in the database
router.get('/confirm/:token', async (req, res) => {
  const { token } = req.params

  const { rows } = await pool.query(
    'SELECT * FROM subscriptions WHERE confirm_token = $1',
    [token]
  )

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Token not found' })
  }

  await pool.query(
    'UPDATE subscriptions SET confirmed = true WHERE confirm_token = $1',
    [token]
  )

  res.redirect('/success.html');
})

// GET /api/unsubscribe/:token
// This endpoint is called when user clicks the unsubscribe link in the release notification email
// It verifies the token and deletes the subscription from the database
router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params

  const { rows } = await pool.query(
    'SELECT * FROM subscriptions WHERE unsubscribe_token = $1',
    [token]
  )

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Token not found' })
  }

  await pool.query(
    'DELETE FROM subscriptions WHERE unsubscribe_token = $1',
    [token]
  )

  return res.status(200).json({ message: 'Unsubscribed successfully' })
})

// GET /api/subscriptions?email=...
// This endpoint allows users to view their current subscriptions by providing their email address
// It returns a list of repos they are subscribed to along with confirmation status and last seen release tag
// This is an optional endpoint for better user experience, allowing users to manage their subscriptions
router.get('/subscriptions', async (req, res) => {
  const { email } = req.query

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const { rows } = await pool.query(
    'SELECT email, repo, confirmed, last_seen_tag FROM subscriptions WHERE email = $1',
    [email]
  )

  return res.status(200).json(rows)
})

module.exports = router