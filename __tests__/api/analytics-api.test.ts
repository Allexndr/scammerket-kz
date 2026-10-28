// Mock mongoose and models
const mockAggregate = jest.fn()
const mockScamModel = {
  aggregate: mockAggregate
}

jest.mock('@/lib/models/Scam', () => ({
  __esModule: true,
  default: mockScamModel
}))

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve())
}))

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/analytics/top-companies/route'

describe('/api/analytics/top-companies', () => {
  beforeEach(() => {
    mockAggregate.mockClear()
  })

  it('returns top companies data successfully', async () => {
    const mockData = [
      { company: 'TestBank', totalReports: 10, verifiedReports: 8, verificationRate: 80 },
      { company: 'FakeShop', totalReports: 5, verifiedReports: 3, verificationRate: 60 }
    ]

    const mockStats = {
      totalScams: 15,
      totalVerified: 11,
      verificationRate: 73.3,
      totalVotes: 25
    }

    mockAggregate.mockResolvedValueOnce(mockData)
    mockAggregate.mockResolvedValueOnce([mockStats])

    const request = new NextRequest('http://localhost:3000/api/analytics/top-companies')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.topCompanies).toEqual(mockData)
    expect(data.totalStats).toEqual(mockStats)
  })

  it('returns default stats when no data', async () => {
    mockAggregate.mockResolvedValueOnce([])
    mockAggregate.mockResolvedValueOnce([])

    const request = new NextRequest('http://localhost:3000/api/analytics/top-companies')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.topCompanies).toEqual([])
    expect(data.totalStats).toEqual({
      totalScams: 0,
      totalVerified: 0,
      verificationRate: 0,
      totalVotes: 0
    })
  })

  it('handles database errors gracefully', async () => {
    mockAggregate.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/analytics/top-companies')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch analytics')
  })

  it('aggregates company data correctly', async () => {
    const mockAggregatedData = [
      {
        _id: 'TestBank',
        count: 10,
        verifiedCount: 8,
        avgLikes: 2.5,
        avgDislikes: 0.5,
        verificationRate: 80
      }
    ]

    mockAggregate.mockResolvedValueOnce(mockAggregatedData)
    mockAggregate.mockResolvedValueOnce([])

    const request = new NextRequest('http://localhost:3000/api/analytics/top-companies')
    const response = await GET(request)
    const data = await response.json()

    expect(mockAggregate).toHaveBeenCalledWith([
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 },
          verifiedCount: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          avgLikes: { $avg: '$likes' },
          avgDislikes: { $avg: '$dislikes' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          company: '$_id',
          totalReports: '$count',
          verifiedReports: '$verifiedCount',
          avgLikes: { $round: ['$avgLikes', 1] },
          avgDislikes: { $round: ['$avgDislikes', 1] },
          verificationRate: {
            $round: [{ $multiply: [{ $divide: ['$verifiedCount', '$count'] }, 100] }, 1]
          }
        }
      }
    ])
  })

  it('limits results to top 10 companies', async () => {
    mockAggregate.mockResolvedValueOnce([])
    mockAggregate.mockResolvedValueOnce([])

    const request = new NextRequest('http://localhost:3000/api/analytics/top-companies')
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $limit: 10 })
      ])
    )
  })
})


