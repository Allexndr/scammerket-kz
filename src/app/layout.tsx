import { ReactNode } from 'react';

// Since we have a root `[locale]` layout, the root layout is just a shell
// to satify Next.js requirements. It passes children through.
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
