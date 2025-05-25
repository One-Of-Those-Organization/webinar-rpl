import { Card, CardHeader, CardBody, Image, Link } from "@heroui/react";
import React from "react";
import { EditIcon, TrashIcon } from "./icons";

export function CardViewAdmin(): React.ReactElement {
  return (
    <Link href="/">
      <Card className="py-4">
        <CardBody className="overflow-visible py-2">
          <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src="https://app.requestly.io/delay/1000/https://heroui.com/images/hero-card-complete.jpeg"
            width="100%"
          />
        </CardBody>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">Frontend Radio</h4>
          <p className="text-tiny uppercase font-bold">Daily Mix</p>
          <small className="text-default-500">12 Tracks</small>
          <div className="flex gap-2 mt-2">
            <Link
              href=""
              className="bg-blue-500 hover:bg-blue-700 py-1 pl-2 pr-3 rounded-full text-white hover:text-slate-300 transition-colors duration-200"
            >
              <EditIcon size={16} className="mr-2" />
              <span className="mr-1">Edit</span>
            </Link>
            <Link
              href=""
              className="bg-red-500 hover:bg-red-700 py-1 pl-2 pr-3 rounded-full text-white hover:text-slate-300 transition-colors duration-200"
            >
              <TrashIcon size={16} className="mr-2" />
              <span className="mr-1">Delete</span>
            </Link>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
