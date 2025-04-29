import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/defaultmain";
import { Search } from "@/components/search";
import { CardView } from "@/components/card";
import {Image} from "@heroui/react";

export default function DetailPage() {
  return (
    <DefaultLayout>
      <section>
        <div>
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src="https://heroui.com/images/hero-card-complete.jpeg"
          width="100%"
          height="100mm"
          />
          <div className="flex flex-row gap-2 px-4 py-2 justify-center">
          <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  href="#"
                >
                  Materi
                </Link>
                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "ghost",
                    size: "lg",
                  })}
                  href="#"
                >
                  Link
                </Link>
                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  href="#"
                >
                  Sertifikat
                </Link>
          </div>
        </div>

        <div className="px-4 py-2">
            <div><h1 className="font-bold text-4xl">Webinar Series</h1></div>
            <div className="font-bold text-xl">Hari Tanggal : <span className="text-[#B6A3E8] font-bold">Senin, 28 April 2025</span></div>
            <div className="font-bold text-xl">Tempat : <span className="text-[#B6A3E8] font-bold">Online</span></div>
            <div>
                <h1 className="font-bold text-xl">Deskripsi :</h1>
                <p className="text-justify text-lg">Lorem ipsum dolor sit amet consectetur, adipisicing elit. At voluptatem commodi consectetur exercitationem repellat quibusdam nisi, eos quos atque repudiandae sequi fuga repellendus omnis? Culpa obcaecati debitis architecto qui corporis.</p>
            </div>
        </div>

      </section>
    </DefaultLayout>
  );
}
