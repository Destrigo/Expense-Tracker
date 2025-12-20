import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  MoreHorizontal,
  Home,
  Briefcase,
  Plane,
  Gift,
  Coffee,
  Wifi,
  Phone,
  Dumbbell,
  Book,
  Music,
  Gamepad2,
  Shirt,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  film: Film,
  'file-text': FileText,
  heart: Heart,
  'more-horizontal': MoreHorizontal,
  home: Home,
  briefcase: Briefcase,
  plane: Plane,
  gift: Gift,
  coffee: Coffee,
  wifi: Wifi,
  phone: Phone,
  dumbbell: Dumbbell,
  book: Book,
  music: Music,
  gamepad: Gamepad2,
  shirt: Shirt,
  palette: Palette,
};

export const AVAILABLE_ICONS = Object.keys(iconMap);

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon = ({
  icon,
  color,
  size = 'md',
  className,
}: CategoryIconProps) => {
  const IconComponent = iconMap[icon] || MoreHorizontal;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl transition-transform duration-200',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent
        className={cn(iconSizes[size])}
        style={{ color }}
      />
    </div>
  );
};
