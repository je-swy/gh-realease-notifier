const cron = require('node-cron')
const pool = require('./db')
const { getLatestRelease } = require('./github')
const { sendReleaseEmail } = require('./mailer')

async function scan() {
  console.log('Scanner: checking releases...')

  const { rows } = await pool.query(
    'SELECT * FROM subscriptions WHERE confirmed = true'
  )

  // Group subscriptions by repo for efficiency (to minimize GitHub API calls)
  const repoMap = {}
  for (const sub of rows) {
    if (!repoMap[sub.repo]) repoMap[sub.repo] = []
    repoMap[sub.repo].push(sub)
  }

  for (const [repo, subscribers] of Object.entries(repoMap)) {
    try {
      const latestTag = await getLatestRelease(repo)
      if (!latestTag) continue

      // check if we already notified about this release
      for (const sub of subscribers) {
        if (sub.last_seen_tag === latestTag) continue

        // send email about new release
        await sendReleaseEmail(sub.email, repo, latestTag, sub.unsubscribe_token)

        // update last seen tag in DB
        await pool.query(
          'UPDATE subscriptions SET last_seen_tag = $1 WHERE id = $2',
          [latestTag, sub.id]
        )

        console.log(`Sent notification: ${sub.email} → ${repo}@${latestTag}`)
      }
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        console.warn('GitHub rate limit — scan will retry in the next scheduled run')
        break
      }
      console.error(`Error for ${repo}:`, error.message)
    }
  }
}

function start() {
  // run every 10 minutes
  cron.schedule('*/10 * * * *', scan)
  console.log('Scanner запущено')
}

module.exports = { start, scan }