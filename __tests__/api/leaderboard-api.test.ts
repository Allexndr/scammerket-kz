// Mock mongoose and models
const mockAggregate = jest.fn()
const mockUserModel = {
  aggregate: mockAggregate
}

jest.mock('@/lib/models/User', () => ({
  __esModule: true,
  default: mockUserModel
}))

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve())
}))

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/leaderboard/route'

describe('/api/leaderboard', () => {
  beforeEach(() => {
    mockAggregate.mockClear()
  })

  it('returns leaderboard data successfully', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник',
        reportsCount: 5,
        votesCount: 20,
        createdAt: new Date()
      },
      {
        _id: 'user2',
        name: 'Jane Smith',
        points: 200,
        rank: 'Эксперт',
        reportsCount: 8,
        votesCount: 15,
        createdAt: new Date()
      }
    ]

    mockAggregate.mockResolvedValue(mockUsers)

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.users).toEqual(mockUsers)
    expect(data.total).toBe(2)
  })

  it('returns empty array when no users', async () => {
    mockAggregate.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.users).toEqual([])
    expect(data.total).toBe(0)
  })

  it('handles database errors gracefully', async () => {
    mockAggregate.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch leaderboard')
  })

  it('aggregates user data with reports and votes counts', async () => {
    mockAggregate.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          from: 'scams',
          localField: '_id',
          foreignField: 'reportedBy',
          as: 'reports'
        }
      },
      {
        $addFields: {
          reportsCount: { $size: '$reports' },
          votesCount: { $size: '$votes' }
        }
      },
      {
        $sort: { points: -1, reportsCount: -1, votesCount: -1 }
      },
      {
        $limit: 50
      },
      {
        $project: {
          _id: 1,
          name: 1,
          points: 1,
          rank: 1,
          reportsCount: 1,
          votesCount: 1,
          createdAt: 1
        }
      }
    ])
  })

  it('sorts users by points, reports, and votes', async () => {
    mockAggregate.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $sort: { points: -1, reportsCount: -1, votesCount: -1 }
        })
      ])
    )
  })

  it('limits results to 50 users', async () => {
    mockAggregate.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $limit: 50 })
      ])
    )
  })

  it('projects only necessary fields', async () => {
    mockAggregate.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/leaderboard')
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $project: {
            _id: 1,
            name: 1,
            points: 1,
            rank: 1,
            reportsCount: 1,
            votesCount: 1,
            createdAt: 1
          }
        })
      ])
    )
  })
})


