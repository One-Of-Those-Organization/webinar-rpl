import { Link as RouterLink } from "react-router-dom";
import { siteConfig } from "@/config/siteAdmin";
import { Logo } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserData } from "@/api/interface";
import { auth_user } from "@/api/auth_user";

export const NavbarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Path checks untuk active state
  const isDashboardPage = location.pathname === "/admin";
  const isUserPage = location.pathname === "/admin/user";
  const isWebinarPage = location.pathname === "/admin/webinar";

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
          <p className="font-semibold">{email}</p>
        </DropdownItem>

        <DropdownItem key="my-profile" onClick={() => navigate("/profile")}>
          Profile
        </DropdownItem>

        <DropdownItem
          key="Back to Dashboard"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          onClick={async () => {
            localStorage.clear();
            navigate("/login");
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
          <RouterLink
            to="/admin"
            className="flex justify-start items-center gap-1 text-foreground no-underline"
          >
            <Logo />
            <p className="font-bold text-inherit">Webinar UKDC</p>
          </RouterLink>
        </NavbarBrand>

        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin"
              className={`border-b-2 border-transparent hover:border-primary transition-colors no-underline ${
                isDashboardPage ? "text-primary" : "text-foreground"
              }`}
            >
              Dashboard
            </RouterLink>
          </NavbarItem>
        )}

        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin/user"
              className={`border-b-2 border-transparent hover:border-primary transition-colors no-underline ${
                isUserPage ? "text-primary" : "text-foreground"
              }`}
            >
              User
            </RouterLink>
          </NavbarItem>
        )}

        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin/webinar"
              className={`border-b-2 border-transparent hover:border-primary transition-colors no-underline ${
                isWebinarPage ? "text-primary" : "text-foreground"
              }`}
            >
              Webinar
            </RouterLink>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="items-center gap-4" justify="end">
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
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <ThemeSwitch />
          {isLoggedIn
            ? siteConfig.navMenuItems.map((item, index) => (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <RouterLink
                    to={item.href}
                    className={`text-lg no-underline ${
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </RouterLink>
                </NavbarMenuItem>
              ))
            : null}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
