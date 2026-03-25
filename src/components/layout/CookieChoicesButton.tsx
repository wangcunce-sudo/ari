'use client';

export default function CookieChoicesButton() {
  return (
    <button
      type="button"
      className="font-sans text-xs tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
      onClick={() => {
        window.open('https://privacy.umusic.com/', '_blank');
      }}
    >
      Cookie Choices
    </button>
  );
}
