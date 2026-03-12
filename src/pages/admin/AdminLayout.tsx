import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Users, LogOut, Home, Settings, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { HomeService } from "@/lib/api/home"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const navItems = [
    { to: "/admin/profile", label: "Profile", icon: Users },
    { to: "/admin/content", label: "Content", icon: BookOpen },
    { to: "/admin/settings", label: "Site Settings", icon: Settings },
];

const AdminLayout = () => {
    const { logout } = useAuth();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                HomeService.getSettings()
                    .then(res => {
                        if (res && res.data) {
                            setLogoUrl(res.data.logo);
                        }
                    })
                    .catch(err => console.error("Failed to load logo", err));
            } catch (err) {
                console.error("Failed to fetch settings for admin logo", err);
            }
        };
        fetchSettings();
    }, []);

    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-center max-w-[90px] border-b mx-auto shrink-0">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Site Logo"
                        className="h-20 w-auto object-contain"
                    />
                ) : (
                    <img
                        src=""
                        alt="Site Logo Default"
                        className="h-30 w-auto object-contain"
                    />
                )}
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>
            <div className="pl-4 border-t border-border mt-auto shrink-0">
                <NavLink
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                        `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary border-b-2 border-primary h-14 flex items-center" : "text-muted-foreground h-14 flex items-center"}`
                    }
                >
                    <Home className="h-4 w-4 mr-2" />
                    Back to site
                </NavLink>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Navigation Header */}
                <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <button className="md:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-md shrink-0">
                                    <Menu className="h-5 w-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0 flex flex-col pt-0">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <SheetDescription className="sr-only">Admin Navigation</SheetDescription>
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </header>

                {/* Main content */}
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;