"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <motion.div animate={{ rotate: theme === "dark" ? 0 : 180 }} transition={{ duration: 0.5 }}>
        {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-yellow-300" />}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

