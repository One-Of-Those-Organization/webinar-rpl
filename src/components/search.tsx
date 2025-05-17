import { Input } from "@heroui/input";
import { SearchIcon } from "@/components/icons";
import React from "react";

export function Search(): React.ReactElement {
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

  return searchInput;
}
