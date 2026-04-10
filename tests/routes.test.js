describe('Validate repo format', () => {
  const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/

  test('correct format owner/repo', () => {
    expect(repoRegex.test('microsoft/vscode')).toBe(true)
    expect(repoRegex.test('golang/go')).toBe(true)
  })

  test('incorrect format', () => {
    expect(repoRegex.test('microsoft')).toBe(false)
    expect(repoRegex.test('microsoft/vscode/extra')).toBe(false)
    expect(repoRegex.test('')).toBe(false)
  })
})