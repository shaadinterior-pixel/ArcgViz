import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'glass'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Simple variant mapping since we don't have tailwind-merge/clsx installed yet
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "relative overflow-hidden bg-gradient-to-r from-[#24B86C] to-[#11998E] text-white hover:opacity-90 shadow-[0_8px_30px_rgba(36,184,108,0.25)] border-0 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shine",
      outline: "border border-border bg-transparent hover:bg-white/5",
      ghost: "hover:bg-white/5 text-foreground",
      glass: "glass hover:bg-white/10 text-foreground"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8 text-base",
      icon: "h-9 w-9"
    }

    return (
      <Comp
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
