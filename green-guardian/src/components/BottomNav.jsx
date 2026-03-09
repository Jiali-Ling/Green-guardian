import { Home, Camera, MapPin, User, Sparkles } from "lucide-react";
import "../styles/BottomNav.css";

export default function BottomNav({ currentView, onNavigate }) {
  const navItems = [
    { id: "home", icon: Sparkles, label: "Home" },
    { id: "feed", icon: Home, label: "Feed" },
    { id: "scan", icon: Camera, label: "Scan" },
    { id: "map", icon: MapPin, label: "Map" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? "nav-item--active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
