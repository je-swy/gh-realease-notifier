// main entry point for the GitHub Release Notifier application
// - sets up Express server, runs DB migrations, and starts the release scanner
// - uses environment variables for configuration (DB connection, GitHub token, etc.)
// - modular structure with separate files for routes, DB access, GitHub API, and scanning logic
// To run: set up .env file with DB credentials and optionally GITHUB_TOKEN, then execute `node src/index.js`

require('dotenv').config()
const express = require('express')
const fs = require('fs')
const path = require('path')
const pool = require('./db')
const routes = require('./routes')
const scanner = require('./scanner')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public')) // static files if needed
app.use('/api', routes)

// Run DB migrations before starting the server and scanner
async function runMigrations() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../migrations/001_init.sql'),
    'utf8'
  )
  await pool.query(sql)
  console.log('Migrations completed')
}

// Start the server and scanner
async function start() {
  await runMigrations()
  scanner.start()
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
  })
}

start()