import {Card, CardHeader, CardBody, Image, Link} from "@heroui/react";
import React from "react";

export function CardView(): React.ReactElement {
  return (
      <Link href="/detail">
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
      </CardHeader>
      
    </Card>
      </Link>
  );
}
