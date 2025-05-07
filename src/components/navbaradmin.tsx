import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { siteConfig } from "@/config/siteAdmin";
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

export const NavbarAdmin = () => {
  const navigate = useNavigate();

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
            href="/admin"
          >
            <Logo />
            <p className="font-bold text-inherit">Webinar UKDC</p>
          </Link>
        </NavbarBrand>
        <NavbarItem className="hidden lg:flex">
          <Link href="/admin" color="foreground">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Link href="/admin/user" color="foreground">
            User
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Link href="/admin/webinar" color="foreground">
            Webinar
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="items-center gap-4" justify="end">
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <ThemeSwitch className="hidden lg:block" />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="my-profile" onClick={() => navigate("/profile")}>
              Profile
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onClick={async () =>
                (await auth.logout()) ? navigate("/login") : null
              }
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <ThemeSwitch />
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  "foreground" /* "foreground" | "primary" | "secondary" */
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
