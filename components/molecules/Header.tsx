import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiSettings, FiHome } from 'react-icons/fi';
import { RiPaletteLine } from 'react-icons/ri';

import Logo from '../../assets/svg/logo.svg';
import { useThemeWindow } from '../../hooks/useThemeWindow';

const links = [
  {
    icon: FiHome,
    aria: 'Go to the home page',
    href: '/',
  },
  {
    icon: FiSettings,
    aria: 'Go to the settings page',
    href: '/settings',
  },
];

export const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const { toggleThemeWindow } = useThemeWindow();
  const router = useRouter();

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  }

  return (
    <header className="flex flex-col py-5 md:py-7 xl:py-11 items-center">
      <div className="flex flex-col justifiy-between gap-8">
        <div className="flex flex-row justify-between gap-5 xsm:gap-7 xl:gap-10">
          <div className="flex items-center justify-center w-7 xsm:w-14 md:w-16 xl:w-20">
            <Logo className="w-full h-full fill-primary" />
          </div>
          <div className="flex items-center justify-center">
            <h1 className="text-lg xsm:text-4xl md:text-5xl xl:text-6xl font-medium">Tiktofiy!</h1>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <nav>
            <ul className="flex flex-row gap-3 h-full">
              {links.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a aria-label={link.aria} className="block p-3">
                      <link.icon
                        className={`w-6 h-6 transition-colors duration-200 ease-in-out ${
                          router.pathname === link.href ? 'text-subactive' : 'text-sub'
                        }`}
                      />
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-row gap-3">
            <button
              onClick={() => toggleThemeWindow(true)}
              aria-label="Toggle theme window"
              className="p-3"
            >
              <div className="flex flex-row gap-3">
                <div className="flex items-center justify-center text-sm text-subactive font-medium">
                  {theme}
                </div>
                <RiPaletteLine className="w-6 h-6 text-sub" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
