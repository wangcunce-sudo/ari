import CookieChoicesButton from './CookieChoicesButton';

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/arianagrande/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/arianagrande',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Apple Music',
    href: 'https://music.apple.com/us/artist/ariana-grande/412778295',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.769-.75c-.55-.107-1.1-.153-1.657-.153H5.852c-.54 0-1.075.046-1.6.153a4.93 4.93 0 0 0-1.773.75C1.305 1.63.56 2.63.244 3.934a9.305 9.305 0 0 0-.24 2.19C-.004 6.525 0 6.935 0 7.32v9.36c0 .387 0 .795.004 1.2.012.735.094 1.46.24 2.19.317 1.31 1.062 2.31 2.18 3.042a5.02 5.02 0 0 0 1.769.75c.55.108 1.1.155 1.657.155h12.296c.54 0 1.074-.046 1.6-.155a4.93 4.93 0 0 0 1.772-.75c1.117-.732 1.862-1.732 2.18-3.042.146-.73.228-1.456.24-2.19.003-.404.003-.813.003-1.2V7.32c0-.386 0-.794-.003-1.196zm-6.423 3.99v5.712a3.32 3.32 0 0 1-.237 1.24 2.526 2.526 0 0 1-1.475 1.42 3.343 3.343 0 0 1-1.225.218 3.18 3.18 0 0 1-1.234-.243 2.55 2.55 0 0 1-1.56-2.344 2.594 2.594 0 0 1 2.597-2.596c.33 0 .66.06.972.176l.166.063V7.845a.296.296 0 0 1 .296-.296h1.407a.296.296 0 0 1 .296.296v2.27z" />
      </svg>
    ),
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/66CXWjxzNUsdJxJ2JdwvnR',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ArianaGrande',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@arianagrande',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-24 flex flex-col items-center gap-12 px-8">
      <div className="font-headline italic text-3xl text-on-surface">Ariana Grande</div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-10">
        {SOCIALS.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener"
            aria-label={label}
            className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity text-on-surface"
          >
            {icon}
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase">{label}</span>
          </a>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* 版权 */}
        <a
          href="http://republicrecords.com/"
          target="_blank"
          rel="noopener"
          className="font-sans text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-80 transition-opacity"
        >
          © {new Date().getFullYear()} Republic Records
        </a>
        {/* 官网同款四链接 */}
        <div className="flex gap-6 flex-wrap justify-center">
          <a
            href="https://privacy.umusic.com/terms/"
            target="_blank"
            rel="noopener"
            className="font-sans text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
          >
            Terms
          </a>
          <a
            href="https://privacy.universalmusic.com/CCPA"
            target="_blank"
            rel="noopener"
            className="font-sans text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
          >
            Do Not Sell My Personal Information
          </a>
          <a
            href="https://privacy.umusic.com/"
            target="_blank"
            rel="noopener"
            className="font-sans text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
          >
            Privacy
          </a>
          {/* Cookie Choices — 官网用 OneTrust 弹窗，此处用独立客户端组件承载 onClick */}
          <CookieChoicesButton />
        </div>
      </div>
    </footer>
  );
}
