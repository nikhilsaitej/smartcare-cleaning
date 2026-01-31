import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Phone, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { COMPANY_INFO } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, loading, signOut } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const NavLinks = () => (
    <>
      <Link href="/" className={cn("text-sm font-medium hover:text-primary transition-colors cursor-pointer", location === "/" && "text-primary font-bold")} data-testid="link-home">Home</Link>
      <Link href="/about" className={cn("text-sm font-medium hover:text-primary transition-colors cursor-pointer", location === "/about" && "text-primary font-bold")} data-testid="link-about">About Us</Link>
      <Link href="/services" className={cn("text-sm font-medium hover:text-primary transition-colors cursor-pointer", location === "/services" && "text-primary font-bold")} data-testid="link-services">Services</Link>
      <Link href="/products" className={cn("text-sm font-medium hover:text-primary transition-colors cursor-pointer", location === "/products" && "text-primary font-bold")} data-testid="link-products">Products</Link>
      <Link href="/contact" className={cn("text-sm font-medium hover:text-primary transition-colors cursor-pointer", location === "/contact" && "text-primary font-bold")} data-testid="link-contact">Contact</Link>
    </>
  );

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm border-gray-200 py-2" 
          : "bg-white/50 backdrop-blur-sm border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
              <img src={logo} alt="SmartCare Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold font-display text-primary leading-none tracking-tight">
                SMARTCARE
              </h1>
              <span className="text-[10px] md:text-xs text-orange-500 font-bold uppercase tracking-wider">
                Cleaning Solutions
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Phone className="h-4 w-4" />
            {COMPANY_INFO.phone}
          </a>
          <Link href="/cart">
            <Button size="icon" variant="ghost" className="relative text-gray-700 hover:bg-gray-100" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </Link>
          
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer" data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md shadow-orange-500/20" data-testid="button-login-nav">
                  Login
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/cart">
            <Button size="icon" variant="ghost" className="relative text-gray-700">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-8 mt-8">
                <div className="flex flex-col gap-6">
                  <NavLinks />
                </div>
                <hr />
                <div className="flex flex-col gap-4">
                  {!loading && (
                    user ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <Button variant="outline" onClick={handleSignOut} className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login">
                          <Button className="w-full bg-orange-500 hover:bg-orange-600">Login</Button>
                        </Link>
                        <Link href="/signup">
                          <Button variant="outline" className="w-full">Sign Up</Button>
                        </Link>
                      </>
                    )
                  )}
                  <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center justify-center gap-2 text-primary font-bold">
                    <Phone className="h-4 w-4" />
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
