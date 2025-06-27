import { Link } from "react-router-dom";
import { Logo } from "@/components/icons";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserData } from "@/api/interface";
import { auth_user } from "@/api/auth_user";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDashboardPage = location.pathname === "/dashboard";
  const isAboutPage = location.pathname === "/about";

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await auth_user.get_current_user();

      if (response.success && response.data) {
        const userData = response.data as UserData;
        setEmail(userData.UserEmail);
        setProfilePicture(userData.UserPicture);
        setIsLoggedIn(true);
        setIsAdmin(userData.UserRole === 1);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const renderDropdownItems = () => {
    if (loading) {
      return (
        <DropdownItem key="loading">
          <p className="text-sm">Loading...</p>
        </DropdownItem>
      );
    }

    if (!isLoggedIn) {
      return (
        <DropdownItem key="login" onClick={() => navigate("/login")}>
          <p className="font-semibold">Login</p>
          <p className="text-sm">You are not logged in</p>
        </DropdownItem>
      );
    }

    return (
      <>
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold break-all whitespace-normal max-w-[200px]">
            {email}
          </p>
        </DropdownItem>

        <DropdownItem key="my-profile" onClick={() => navigate("/profile")}>
          Profile
        </DropdownItem>

        {isAdmin && (
          <DropdownItem key="admin" onClick={() => navigate("/admin")}>
            Admin Dashboard
          </DropdownItem>
        )}

        {!isAdmin && (
          <DropdownItem
            key="History Webinar"
            onClick={() => navigate("/participants/${email}")}
          >
            History Webinar
          </DropdownItem>
        )}

        <DropdownItem
          key="logout"
          color="danger"
          onClick={async () => {
            localStorage.clear();
            navigate("/", { state: { logoutSuccess: true } });
          }}
        >
          Log Out
        </DropdownItem>
      </>
    );
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent
        className="flex lg:hidden basis-1 pl-4 -mr-12"
        justify="start"
      >
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="mx-auto gap-3 max-w-fit" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            to="/"
            className="flex justify-start items-center gap-1 text-foreground no-underline"
          >
            <Logo />
            <p className="font-bold text-inherit">Webinar UKDC</p>
          </Link>
        </NavbarBrand>

        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <Link
              to="/dashboard"
              className={`border-b-2 border-transparent hover:border-primary transition-colors no-underline ${
                isDashboardPage ? "text-primary" : "text-foreground"
              }`}
            >
              Dashboard
            </Link>
          </NavbarItem>
        )}

        <NavbarItem className="hidden lg:flex">
          <Link
            to="/about"
            className={`border-b-2 border-transparent hover:border-primary transition-colors no-underline ${
              isAboutPage ? "text-primary" : "text-foreground"
            }`}
          >
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="items-center gap-4" justify="end">
        {isLoggedIn && isDashboardPage && (
          <NavbarItem className="hidden lg:flex">
            <Search />
          </NavbarItem>
        )}
        <ThemeSwitch className="hidden lg:block" />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name={isLoggedIn ? email : "Guest"}
              size="sm"
              src={
                isLoggedIn && profilePicture
                  ? profilePicture
                  : "https://i.pravatar.cc/150?u=a042581f4e29026704d"
              }
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            {renderDropdownItems()}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {isLoggedIn && isDashboardPage && <Search />}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <ThemeSwitch />

          {isLoggedIn ? (
            <>
              <NavbarMenuItem>
                <Link
                  to="/dashboard"
                  className={`text-lg no-underline ${
                    isDashboardPage ? "text-primary" : "text-foreground"
                  }`}
                >
                  Dashboard
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  to="/about"
                  className={`text-lg no-underline ${
                    isAboutPage ? "text-primary" : "text-foreground"
                  }`}
                >
                  About
                </Link>
              </NavbarMenuItem>
            </>
          ) : (
            <NavbarMenuItem>
              <Link
                to="/about"
                className={`text-lg no-underline ${
                  isAboutPage ? "text-primary" : "text-foreground"
                }`}
              >
                About
              </Link>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
