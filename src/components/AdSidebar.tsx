// Placeholder component for sidebar ads - disabled for MVP
interface AdSidebarProps {
  position: 'left' | 'right'
}

export default function AdSidebar({ position }: AdSidebarProps) {
  // Ads disabled for MVP
  return (
    <div className="flex justify-center items-center w-full h-[600px] bg-gray-100 border border-gray-200 rounded">
      <span className="text-gray-500 text-sm">Боковая реклама</span>
    </div>
  )
}
