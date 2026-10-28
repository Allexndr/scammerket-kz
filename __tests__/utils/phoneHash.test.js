const crypto = require('crypto')

describe('Phone Hash Utility', () => {
  it('creates consistent hash for same phone number', () => {
    const phone1 = '+77771234567'
    const phone2 = '+77771234567'

    const hash1 = crypto.createHash('sha256').update(phone1.replace(/\D/g, '')).digest('hex')
    const hash2 = crypto.createHash('sha256').update(phone2.replace(/\D/g, '')).digest('hex')

    expect(hash1).toBe(hash2)
  })

  it('creates different hashes for different phone numbers', () => {
    const phone1 = '+77771234567'
    const phone2 = '+77779876543'

    const hash1 = crypto.createHash('sha256').update(phone1.replace(/\D/g, '')).digest('hex')
    const hash2 = crypto.createHash('sha256').update(phone2.replace(/\D/g, '')).digest('hex')

    expect(hash1).not.toBe(hash2)
  })

  it('normalizes phone number before hashing', () => {
    const phone1 = '+7 (777) 123-45-67'
    const phone2 = '77771234567'
    const phone3 = '7777-123-45-67'

    const hash1 = crypto.createHash('sha256').update(phone1.replace(/\D/g, '')).digest('hex')
    const hash2 = crypto.createHash('sha256').update(phone2.replace(/\D/g, '')).digest('hex')
    const hash3 = crypto.createHash('sha256').update(phone3.replace(/\D/g, '')).digest('hex')

    expect(hash1).toBe(hash2)
    expect(hash2).toBe(hash3)
  })
})



