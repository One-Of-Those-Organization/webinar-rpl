import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default_admin";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";

export default function SertifikatUserPage() {
  // Sample certificate data
  const certificateData = {
    id: "CERT-2023-001",
    title: "Web Development Workshop",
    date: "15 November 2023",
    organizer: "Digital Learning Academy",
    recipient: "John Doe",
    description: "For active participation in the 3-day intensive web development workshop covering modern JavaScript frameworks.",
    qrCode: "/qr-code-placeholder.png",
    downloadLink: "#"
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-full text-center justify-center">
          <h1 className={title({ color: "blue" })}>Selamat! Anda telah menyelesaikan kegiatan ini. </h1>
          <br />
            <p className="text-lg mt-2">
            Silakan unduh sertifikat partisipasi Anda.
            </p>
        </div>

        <div className="mt-8 w-full max-w-3xl">
          <Card className="border-2 border-primary-200">
            <CardBody className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{certificateData.title}</h2>
                    <p className="text-sm text-default-500">{certificateData.organizer}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                    {certificateData.id}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-default-500">Diterbitkan untuk</h3>
                    <p className="text-lg">{certificateData.recipient}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-default-500">Tanggal</h3>
                    <p>{certificateData.date}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-default-500">Deskripsi</h3>
                    <p className="text-default-600">{certificateData.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l-1 border-default-200 pl-6">
                <Image
                  alt="QR Code"
                  className="w-32 h-32"
                  src={certificateData.qrCode}
                />
                <p className="text-xs text-center mt-2 text-default-500">
                  Scan untuk verifikasi keaslian sertifikat
                </p>
              </div>
            </CardBody>

            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t-1 border-default-200">
              <div className="text-xs text-default-500">
                Sertifikat ini berlaku secara digital dan tidak memerlukan tanda tangan basah
              </div>
              <div className="flex gap-2">
                <Button 
                  as={Link}
                  href={certificateData.downloadLink}
                  className={buttonStyles({ color: "primary", variant: "solid" })}
                >
                  Unduh Sertifikat (PDF)
                </Button>
                <Button 
                  variant="bordered" 
                  className="border-primary-500 text-primary-500"
                >
                  Bagikan
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-8 bg-default-100 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Panduan Klaim Sertifikat</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-default-600">
              <li>Klik tombol "Unduh Sertifikat" untuk mendapatkan versi PDF</li>
              <li>Sertifikat sudah dilengkapi dengan QR code untuk verifikasi keaslian</li>
              <li>Anda dapat membagikan sertifikat ini melalui media sosial</li>
              <li>Jika menemui kendala, hubungi panitia melalui email panitia@contoh.com</li>
            </ol>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}