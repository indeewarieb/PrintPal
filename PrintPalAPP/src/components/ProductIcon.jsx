import {
  Coffee,
  Tag,
  FlaskConical,
  Clock,
  UtensilsCrossed,
  Box,
  CreditCard,
  BookOpen,
  Flag,
  Pin,
  CupSoda,
  Tags,
  Droplet,
  AlarmClock,
  ChefHat,
  PackageOpen,
  Contact,
  NotebookPen,
  Megaphone,
  Award,
} from 'lucide-react'

const icons = {
  coffee: Coffee,
  tag: Tag,
  flask: FlaskConical,
  clock: Clock,
  plate: UtensilsCrossed,
  cube: Box,
  card: CreditCard,
  notebook: BookOpen,
  flag: Flag,
  pin: Pin,
}

// A second, related icon per product type — used as the "other angle" image
// shown on hover, the way a real product photo gallery would swap shots.
const iconsAlt = {
  coffee: CupSoda,
  tag: Tags,
  flask: Droplet,
  clock: AlarmClock,
  plate: ChefHat,
  cube: PackageOpen,
  card: Contact,
  notebook: NotebookPen,
  flag: Megaphone,
  pin: Award,
}

export default function ProductIcon({ name, alt = false, ...props }) {
  const set = alt ? iconsAlt : icons
  const Icon = set[name] || Box
  return <Icon {...props} />
}

