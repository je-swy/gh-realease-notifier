// main logic for checking GitHub repos and sending notifications
const axios = require('axios')

// GitHub API client with optional token for higher rate limits
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  },
})

// Check if a repo exists on GitHub
async function checkRepo(repo) {
  try {
    await githubApi.get(`/repos/${repo}`)
    return true
  } catch (error) {
    if (error.response?.status === 404) return false
    if (error.response?.status === 429) throw new Error('RATE_LIMIT')
    throw error
  }
}

// Get the latest release tag of a repo
async function getLatestRelease(repo) {
  try {
    const response = await githubApi.get(`/repos/${repo}/releases/latest`)
    return response.data.tag_name
  } catch (error) {
    if (error.response?.status === 404) return null
    if (error.response?.status === 429) throw new Error('RATE_LIMIT')
    throw error
  }
}

module.exports = { checkRepo, getLatestRelease }