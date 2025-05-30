import { Card, CardHeader, CardBody, Image, Link } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { EditIcon, TrashIcon } from "./icons";
import { auth } from "@/api/auth";
import { WebinarInput } from "@/api/interface";

export function CardViewAdmin(): React.ReactElement {
  const [webinarTitle, setWebinarTitle] = useState(""); // WIP
  const [speaker, setSpeaker] = useState(""); // WIP
  const [date, setDate] = useState(""); // WIP
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<WebinarInput[]>([]); // WIP

  useEffect(() => {
    async function loadWebinarData() {
      try {
        const result = await auth.get_all_webinar();

        if (result.success) {
          setWebinarList(result.data); // tampilkan pakai .map()
        }

        const webinar_data = localStorage.getItem("webinar_data");
        console.log("Webinar data from localStorage:", webinar_data);

        if (webinar_data) {
          const webinar_data_object: WebinarInput = JSON.parse(webinar_data);
          console.log("Parsed webinar data:", webinar_data_object);
          setWebinarTitle(webinar_data_object.name);
          setSpeaker(webinar_data_object.speaker);
          setDate(webinar_data_object.dstart);
        }
      } catch (error) {
        console.error("Error loading webinar data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

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
          <h4 className="font-bold text-large">
            {webinarTitle || "Judul tidak tersedia"}
          </h4>
          <p className="text-tiny uppercase font-bold">
            {speaker || "Pembicara tidak tersedia"}
          </p>
          <small className="text-default-500">
            {date || "Tanggal tidak tersedia"}
          </small>
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
