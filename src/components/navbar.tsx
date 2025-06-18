import { Link } from "react-router-dom";
import { Logo } from "@/components/icons";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserData } from "@/api/interface";
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
  const user_data = localStorage.getItem("user_data");

  const isDashboardPage = location.pathname === "/dashboard";
  const isAboutPage = location.pathname === "/about";

  useEffect(() => {
    try {
      if (user_data) {
        // Fetch (parse) data from json
        const user_data_object: UserData = JSON.parse(user_data);

        // Set value to useState
        setEmail(user_data_object.UserEmail);
        setProfilePicture(user_data_object.UserPicture);
        setIsLoggedIn(true);
        if (user_data_object.UserRole === 1) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.log("Unexpected Error");
    }
  }, [user_data]);

  const renderDropdownItems = () => {
    if (!isLoggedIn) {
      return (
        <DropdownItem key="login" onClick={() => navigate("/login")}>
          <p className="font-semibold">Login</p>
          <p className="text-sm">You are not logged in</p>
        </DropdownItem>
      );
    }

    // User sudah login, tampilkan menu berdasarkan role
    return (
      <>
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{email}</p>
        </DropdownItem>

        <DropdownItem key="my-profile" onClick={() => navigate("/profile")}>
          Profile
        </DropdownItem>

        {/* Tambahkan menu Admin Dashboard jika user adalah admin */}
        {isAdmin && (
          <DropdownItem key="admin" onClick={() => navigate("/admin")}>
            Admin Dashboard
          </DropdownItem>
        )}

        <DropdownItem
          key="logout"
          color="danger"
          onClick={async () => {
            localStorage.clear();
            navigate("/");
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
