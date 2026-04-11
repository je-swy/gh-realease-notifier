async function unsubscribe() {
  const email = document.getElementById('unsub-email').value
  const repo = document.getElementById('unsub-repo').value

  if (!email || !repo) return showMessage('Please fill in all fields', 'error')

  try {
      const res = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `email=${encodeURIComponent(email)}&repo=${encodeURIComponent(repo)}`
      })
      const data = await res.json()
      showMessage(data.message, res.ok ? 'success' : 'error')
  } catch (e) {
      showMessage('Connection error', 'error')
  }
}

function showMessage(text, type) {
    const el = document.getElementById('message')
    el.textContent = text
    el.className = `message ${type}`
    el.style.display = 'block'
}