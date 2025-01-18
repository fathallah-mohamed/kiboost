import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users,
  BookOpen,
  Calendar,
  ShoppingCart,
  Package,
  BarChart,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

const navItems: NavItem[] = [
  { icon: Users, label: "Profils enfants", value: "profiles", color: "text-blue-500" },
  { icon: BookOpen, label: "Recettes", value: "recipes", color: "text-green-500" },
  { icon: Calendar, label: "Planificateur", value: "planner", color: "text-orange-500" },
  { icon: ShoppingCart, label: "Liste de courses", value: "shopping", color: "text-purple-500" },
  { icon: Package, label: "Restes", value: "leftovers", color: "text-pink-500" },
  { icon: BarChart, label: "Statistiques", value: "stats", color: "text-indigo-500" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-all duration-200",
                !isCollapsed ? "px-4" : "px-2",
                activeTab === item.value && "bg-accent"
              )}
              onClick={() => onTabChange(item.value)}
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
              {!isCollapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="self-end mb-4 mr-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <SidebarContent />
    </div>
  );
};