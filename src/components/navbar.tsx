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
} from "@heroui/navbar";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
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
        className="flex lg:hidden basis-1 pl-4 -mr-10"
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
        <NavbarItem className="hidden lg:flex ml-3">
          <Link href="/" color="foreground">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Link href="/about" color="foreground">
            About
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Link href="/dashboard" color="foreground">
            Dashboard
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <ThemeSwitch />
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "foreground"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
                onClickCapture={
                  index === siteConfig.navMenuItems.length - 1
                    ? async () =>
                        (await auth.logout()) ? navigate("/login") : null
                    : () => {}
                }
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
