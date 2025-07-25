import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import {ThemeToggle} from "@/components/switch-toggle"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <ThemeToggle/>
      </div>
    </ThemeProvider>
  )
}

export default App
