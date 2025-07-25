import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from 'lucide-react'
import {useTheme} from "@/components/theme-provider"

export function ThemeToggle(){
  const {theme , setTheme} = useTheme()

  const isDark = theme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return(
    <div className="flex items-center space-x-2 mt-4">
    <span className="text-sm">{isDark ? <Moon className="h-5 w-5 text-yellow-400" /> : <Sun className="h-5 w-5 text-blue-500" />}
</span>
    <Switch checked = {isDark} onCheckedChange={handleToggle}/>
    </div>
   )
}