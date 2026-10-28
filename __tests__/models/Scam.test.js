// Mock mongoose
const mockSchema = jest.fn().mockReturnThis()
const mockPre = jest.fn()
const mockModel = jest.fn()

jest.mock('mongoose', () => ({
  Schema: jest.fn(() => ({
    pre: mockPre,
    index: jest.fn(),
  })),
  model: mockModel,
  models: {},
}))

describe('Scam Model', () => {
  let ScamSchema

  beforeEach(() => {
    jest.clearAllMocks()
    // Import the module to trigger schema creation
    require('@/lib/models/Scam')
    ScamSchema = require('mongoose').Schema.mock.results[0].value
  })

  it('defines required fields', () => {
    expect(ScamSchema).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumber: expect.objectContaining({
          type: String,
          required: true
        }),
        phoneHash: expect.objectContaining({
          type: String,
          required: true,
          index: true
        }),
        company: expect.objectContaining({
          type: String,
          required: true,
          trim: true
        }),
        description: expect.objectContaining({
          type: String,
          required: true,
          maxlength: 1000
        })
      })
    )
  })

  it('defines enum fields with correct values', () => {
    expect(ScamSchema).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: expect.objectContaining({
          enum: ['male', 'female', 'unknown']
        }),
        scamType: expect.objectContaining({
          enum: ['phishing', 'fake_sale', 'crypto', 'other']
        })
      })
    )
  })

  it('sets up pre-save middleware', () => {
    expect(mockPre).toHaveBeenCalledWith('save', expect.any(Function))
  })

  it('creates model with correct name', () => {
    expect(mockModel).toHaveBeenCalledWith('Scam', expect.any(Object))
  })
})



