// Placeholder component for ads - disabled for MVP
interface AdBannerProps {
  position: 'top' | 'bottom' | 'content'
  size: '728x90' | '320x50' | '300x250'
}

export default function AdBanner({ position, size }: AdBannerProps) {
  // Ads disabled for MVP
  return (
    <div className={`flex justify-center items-center w-full bg-gray-100 border border-gray-200 ${size === '728x90' ? 'h-[90px] hidden md:flex' : size === '320x50' ? 'h-[50px] flex md:hidden' : 'h-[250px] w-[300px] mx-auto'}`}>
      <span className="text-gray-500 text-sm">Реклама</span>
    </div>
  )
}
