async function subscribe() {
  const email = document.getElementById('email').value
  const repo = document.getElementById('repo').value
  const btn = document.getElementById('btn')
  const message = document.getElementById('message')

  if (!email || !repo) {
    showMessage('Please fill in all fields', 'error')
    return
  }

  btn.disabled = true
  btn.textContent = 'Sending...'

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&repo=${encodeURIComponent(repo)}`
    })

    const data = await res.json()

    if (res.ok) {
      showMessage('✅ ' + data.message, 'success')
    } else {
      showMessage('❌ ' + data.message, 'error')
    }
  } catch (e) {
    showMessage('❌ Server connection error', 'error')
  } finally {
    btn.disabled = false
    btn.textContent = 'Subscribe'
  }
}

function showMessage(text, type) {
  const el = document.getElementById('message')
  el.textContent = text
  el.className = `message ${type}`
  el.style.display = 'block'
}
