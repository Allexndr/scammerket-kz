import { NextRequest } from 'next/server'
import { GET } from '@/app/api/search/route'

// Mock mongoose and models
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}))

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}))

const mockScamFind = jest.fn()
jest.mock('@/lib/models/Scam', () => ({
  __esModule: true,
  default: {
    find: mockScamFind,
  },
}))

describe('/api/search', () => {
  beforeEach(() => {
    mockScamFind.mockClear()
  })

  it('returns 400 when no query provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/search')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Query parameter is required')
  })

  it('searches by phone number and returns hashed results', async () => {
    const mockScams = [
      {
        _id: '507f1f77bcf86cd799439011',
        phoneNumber: '77771234567',
        phoneHash: 'hashed_phone',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 5,
        dislikes: 1,
        reportedBy: { name: 'Test User' },
        createdAt: new Date(),
        comments: [],
      },
    ]

    mockScamFind.mockResolvedValue(mockScams)

    const request = new NextRequest('http://localhost:3000/api/search?q=%2B77771234567')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockScamFind).toHaveBeenCalledWith({ phoneHash: expect.any(String) })
    expect(data.results).toHaveLength(1)
    expect(data.results[0].phoneNumber).toBe('777****567') // Should mask phone number
    expect(data.results[0].company).toBe('Test Bank')
  })

  it('searches by company name', async () => {
    const mockScams = [
      {
        _id: '507f1f77bcf86cd799439011',
        phoneNumber: '77771234567',
        company: 'Kaspi Bank',
        likes: 10,
        dislikes: 2,
        reportedBy: { name: 'Test User' },
        createdAt: new Date(),
        comments: [],
      },
    ]

    mockScamFind.mockResolvedValue(mockScams)

    const request = new NextRequest('http://localhost:3000/api/search?q=Kaspi&type=company')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockScamFind).toHaveBeenCalledWith({
      company: { $regex: 'Kaspi', $options: 'i' },
    })
  })

  it('limits results to 50', async () => {
    const mockScams = Array(60).fill({
      _id: 'test',
      phoneNumber: '77771234567',
      company: 'Test',
      likes: 1,
      dislikes: 0,
      reportedBy: { name: 'Test' },
      createdAt: new Date(),
      comments: [],
    })

    mockScamFind.mockResolvedValue(mockScams)

    const request = new NextRequest('http://localhost:3000/api/search?q=test')

    const response = await GET(request)
    const data = await response.json()

    expect(data.results).toHaveLength(50)
  })

  it('handles database errors', async () => {
    mockScamFind.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/search?q=test')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to search')
  })
})



