const { checkRepo, getLatestRelease } = require('../src/github')

describe('GitHub API', () => {
  test('checkRepo returns true for existing repo', async () => {
    const result = await checkRepo('microsoft/vscode')
    expect(result).toBe(true)
  })

  test('checkRepo returns false for non-existing repo', async () => {
    const result = await checkRepo('this-repo/does-not-exist-xyz123')
    expect(result).toBe(false)
  })

  test('getLatestRelease returns tag for existing repo', async () => {
    const tag = await getLatestRelease('microsoft/vscode')
    expect(tag).toBeTruthy()
    expect(typeof tag).toBe('string')
  })

  test('getLatestRelease returns null for non-existing repo', async () => {
    const tag = await getLatestRelease('this-repo/does-not-exist-xyz123')
    expect(tag).toBeNull()
  })
})