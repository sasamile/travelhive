import { CircleDollarSign, Globe, MapPin } from 'lucide-react'

type ExperienceFooterProps = {
  links: string[]
}

export function ExperienceFooter({ links }: ExperienceFooterProps) {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="size-4" />
          <span className="text-sm font-semibold">© 2024 Premium Travel S.L.</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-500">
          {links.map((link) => (
            <a key={link} className="hover:underline" href="#">
              {link}
            </a>
          ))}
        </div>
        <div className="flex gap-4">
          <Globe className="size-4 text-gray-400 cursor-pointer hover:text-primary" />
          <CircleDollarSign className="size-4 text-gray-400 cursor-pointer hover:text-primary" />
        </div>
      </div>
    </footer>
  )
}
