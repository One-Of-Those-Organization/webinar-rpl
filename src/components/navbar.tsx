import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { siteConfig } from "@/config/site";
import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { auth } from "@/api/auth";
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
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await auth.userinfo();
        if (response.success && response.data) {
          setEmail(response.data.UserEmail);
          setUserName(response.data.UserFullName);
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
        toast.error("Login to access Webinar Features");
      }
    };
    fetchUserInfo();
  }, []);

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-200",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-500 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const renderDropdownItems = () => {
    if (isLoggedIn) {
      return (
        <>
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-semibold">Signed in as</p>
            <p className="font-semibold">{userName || email}</p>
          </DropdownItem>
          <DropdownItem key="my-profile" onClick={() => navigate("/profile")}>
            Profile
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            onClick={async () => {
              if (await auth.logout()) {
                setIsLoggedIn(false);
                setEmail("");
                setUserName("");
                navigate("/login");
              }
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
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">Webinar UKDC</p>
          </Link>
        </NavbarBrand>
        {isLoggedIn && (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/dashboard" color="foreground">
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <Link href="/about" color="foreground">
                About
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className="items-center gap-4" justify="end">
        {isLoggedIn && (
          <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        )}
        <ThemeSwitch className="hidden lg:block" />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name={isLoggedIn ? userName || email : "Guest"}
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            {renderDropdownItems()}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {isLoggedIn && searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <ThemeSwitch />
          {isLoggedIn ? (
            siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link color="foreground" href={item.href} size="lg">
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))
          ) : (
            <NavbarMenuItem>
              <Link color="foreground" href="/login" size="lg">
                You are not logged in
              </Link>
            </NavbarMenuItem>
          )}
        </div>
        <ToastContainer />
      </NavbarMenu>
    </HeroUINavbar>
  );
};
