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

export const NavbarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user_data = localStorage.getItem("user_data");

  // Path checks untuk active state
  const isDashboardPage = location.pathname === "/admin";
  const isUserPage = location.pathname === "/admin/user";
  const isWebinarPage = location.pathname === "/admin/webinar";

  useEffect(() => {
    try {
      // Check kalau dapet data (biar ga null)
      if (user_data) {
        // Fetch (parse) data from json
        const user_data_object: UserData = JSON.parse(user_data);

        // Set value to useState
        setEmail(user_data_object.UserEmail);
        setProfilePicture(user_data_object.UserPicture);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log("Unexpected Error");
    }
  }, []);

  const renderDropdownItems = () => {
    if (isLoggedIn) {
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
    } else {
      return (
        <DropdownItem key="login" onClick={() => navigate("/login")}>
          <p className="font-semibold">Login</p>
          <p className="text-sm">You are not logged in</p>
        </DropdownItem>
      );
    }
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
            className="flex justify-start items-center gap-1 text-foreground"
          >
            <Logo />
            <p className="font-bold text-inherit">Webinar UKDC</p>
          </RouterLink>
        </NavbarBrand>
        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin"
              className={`${
                isDashboardPage ? "text-primary" : "text-foreground"
              } hover:opacity-80 transition-opacity`}
            >
              Dashboard
            </RouterLink>
          </NavbarItem>
        )}
        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin/user"
              className={`${
                isUserPage ? "text-primary" : "text-foreground"
              } hover:opacity-80 transition-opacity`}
            >
              User
            </RouterLink>
          </NavbarItem>
        )}
        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">
            <RouterLink
              to="/admin/webinar"
              className={`${
                isWebinarPage ? "text-primary" : "text-foreground"
              } hover:opacity-80 transition-opacity`}
            >
              Webinar
            </RouterLink>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="items-center gap-4" justify="end">
        {isLoggedIn && <NavbarItem className="hidden lg:flex"></NavbarItem>}
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
                    className={`${
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-foreground"
                    } text-lg hover:opacity-80 transition-opacity`}
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
