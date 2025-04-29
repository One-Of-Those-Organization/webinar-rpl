import { Input } from "@heroui/input";
import { SearchIcon } from "./icons";
import React from "react";

export function Search(): React.ReactElement{
    const searchInput = (
        <Input
        aria-label="Search"
        classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
        }}
        labelPlacement="outside"
        placeholder="Search..."
        startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
        />
    );

    return searchInput;
}