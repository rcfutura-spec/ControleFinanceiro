import {
  UtensilsCrossed, Car, Home, Gamepad2, Heart, GraduationCap, Tv, Shirt, Package,
  ShoppingCart, Plane, CreditCard, Music, PawPrint, Baby, Scissors, Wrench, Smartphone,
  Gift, Lightbulb, Dumbbell, Wine, Coffee, Film, Briefcase, Stethoscope, Globe,
  Bus, Laptop, BookOpen, Building2, Key, Phone, Brush, Droplets, Fuel,
  Moon, TreePine, Flower2, Zap, Waves, Snowflake, Sparkles, Ghost,
  AlertTriangle, Tags,
} from 'lucide-react'

const iconMap = {
  UtensilsCrossed, Car, Home, Gamepad2, Heart, GraduationCap, Tv, Shirt, Package,
  ShoppingCart, Plane, CreditCard, Music, PawPrint, Baby, Scissors, Wrench, Smartphone,
  Gift, Lightbulb, Dumbbell, Wine, Coffee, Film, Briefcase, Stethoscope, Globe,
  Bus, Laptop, BookOpen, Building2, Key, Phone, Brush, Droplets, Fuel,
  Moon, TreePine, Flower2, Zap, Waves, Snowflake, Sparkles, Ghost,
  AlertTriangle, Tags,
}

export default function Icon({ name, size = 18, className = '', ...props }) {
  const LucideIcon = iconMap[name]
  if (!LucideIcon) return null
  return <LucideIcon size={size} className={className} {...props} />
}
