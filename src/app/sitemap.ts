import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://scammerket.kz'
    const locales = ['ru', 'kz', 'en']

    const staticPages = [
        '',
        '/scams',
        '/types',
        '/registry',
        '/registry/report',
        '/report',
        '/leaderboard',
        '/ai',
        '/business',
        '/privacy',
    ]

    const entries: MetadataRoute.Sitemap = []

    // Static pages
    for (const page of staticPages) {
        for (const locale of locales) {
            const url = locale === 'ru' ? `${baseUrl}${page}` : `${baseUrl}/${locale}${page}`
            entries.push({
                url,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'daily' : page === '/scams' ? 'daily' : 'weekly',
                priority: page === '' ? 1.0 : page === '/scams' ? 0.9 : page === '/report' ? 0.8 : 0.6,
            })
        }
    }

    // Dynamic scam pages — critical for SEO (phone number searches)
    try {
        const { data: scams } = await supabaseAdmin
            .from('scams')
            .select('id, updated_at, created_at')
            .order('created_at', { ascending: false })
            .limit(500)

        for (const scam of (scams || [])) {
            entries.push({
                url: `${baseUrl}/scams/${scam.id}`,
                lastModified: new Date(scam.updated_at || scam.created_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.8,
            })
        }

        // Also add social scam pages
        const { data: socialScams } = await supabaseAdmin
            .from('social_scams')
            .select('id, updated_at, created_at')
            .order('created_at', { ascending: false })
            .limit(200)

        for (const scam of (socialScams || [])) {
            entries.push({
                url: `${baseUrl}/registry/${scam.id}`,
                lastModified: new Date(scam.updated_at || scam.created_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.7,
            })
        }
    } catch (e) {
        console.error('Sitemap: Failed to fetch scams', e)
    }

    return entries
}
