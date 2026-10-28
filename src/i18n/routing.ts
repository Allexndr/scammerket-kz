import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['ru', 'kz', 'en'],
    defaultLocale: 'ru',
    localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
