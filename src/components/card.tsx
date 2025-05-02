import React, { useState } from "react";
import { Card, CardHeader, CardBody, Image, Link } from "@heroui/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function CardView(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Link href="/detail">
      <Card className="py-4">
        <CardBody className="overflow-visible py-2">
          {isLoading && (
            <Skeleton
              height={180}
              width="100%"
              style={{ borderRadius: "0.75rem", aspectRatio: "4 / 3" }}
            />
          )}
          <Image
            alt="Card background"
            className={`rounded-xl object-cover w-full aspect-[4/3] ${
              isLoading ? "hidden" : "block"
            }`}
            src="https://app.requestly.io/delay/1000/https://heroui.com/images/hero-card-complete.jpeg"
            onLoad={() => setIsLoading(false)}
          />
        </CardBody>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">Dummy Lorem</h4>
          <p className="text-tiny uppercase font-bold">Dummy Lorem</p>
          <small className="text-default-500">Dummy Lorem</small>
        </CardHeader>
      </Card>
    </Link>
  );
}
