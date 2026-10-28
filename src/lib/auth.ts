
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabaseAdmin } from "@/lib/supabase"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account.provider === "google") {
                try {
                    // Check if user exists
                    const { data: existingUser } = await supabaseAdmin
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .single()

                    if (!existingUser) {
                        // Create new user automatically
                        await supabaseAdmin
                            .from('users')
                            .insert({
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                points: 0,
                                rank: 'Новичок',
                                reports_count: 0,
                            })
                    }
                    return true
                } catch (error) {
                    console.error("Error saving user from Google:", error)
                    return true
                }
            }
            return true
        },
        async session({ session, token }: any) {
            if (session?.user) {
                // Could fetch additional data from Supabase if needed
            }
            return session
        }
    },
    pages: {
        signIn: '/?view=login',
        error: '/?view=login&error=true'
    }
}
