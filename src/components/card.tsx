import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Image, Link, Button } from "@heroui/react";
import { Webinar } from "@/api/interface";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CardViewProps {
  webinar?: Webinar;
  isRegistered?: boolean;
  onRegister?: (webinarId: number) => void;
}

export function CardView({ 
  webinar, 
  isRegistered = false, 
  onRegister 
}: CardViewProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Countdown effect for upcoming webinars
  useEffect(() => {
    if (!webinar?.dstart) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(webinar.dstart).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [webinar?.dstart]);

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Date not available";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Check if webinar is live
  const isLive = () => {
    if (!webinar?.dstart || !webinar?.dend) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    const endDate = new Date(webinar.dend);
    return now >= startDate && now <= endDate;
  };

  // Check if webinar is upcoming
  const isUpcoming = () => {
    if (!webinar?.dstart) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    return now < startDate;
  };

  const handleRegister = () => {
    if (webinar && onRegister) {
      onRegister(webinar.id);
    }
  };

  // If no webinar data is provided, show dummy content
  if (!webinar) {
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

  return (
    <Card className="py-4 h-full flex flex-col">
      <CardBody className="overflow-visible py-2 flex-grow">
        {isLoading && (
          <Skeleton
            height={180}
            width="100%"
            style={{ borderRadius: "0.75rem", aspectRatio: "4 / 3" }}
          />
        )}
        <div className="relative">
          <Image
            alt="Webinar background"
            className={`rounded-xl object-cover w-full aspect-[4/3] ${
              isLoading ? "hidden" : "block"
            }`}
            src={webinar.imageUrl}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          {isLive() && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              🔴 LIVE
            </div>
          )}
        </div>
      </CardBody>
      
      <CardHeader className="pb-2 pt-2 px-4 flex-col items-start flex-grow">
        <h4 className="font-bold text-large line-clamp-2" title={webinar.name}>
          {webinar.name || "Webinar Title"}
        </h4>
        <p className="text-tiny uppercase font-bold text-gray-600">
          {webinar.speaker || "Speaker Name"}
        </p>
        <small className="text-default-500 mb-2">
          {formatDate(webinar.dstart)}
        </small>
        
        {webinar.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3" title={webinar.description}>
            {webinar.description}
          </p>
        )}

        {/* Countdown for upcoming webinars */}
        {isUpcoming() && countdown && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mb-3 w-full">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Starts in:
            </p>
            <div className="grid grid-cols-4 gap-1 text-center">
              <div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {countdown.days}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Days</div>
              </div>
              <div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {countdown.hours}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Hours</div>
              </div>
              <div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {countdown.minutes}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Min</div>
              </div>
              <div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {countdown.seconds}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Sec</div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Action Button */}
      <div className="px-4 pb-4">
        {isRegistered ? (
          <Button 
            className="w-full" 
            color="success" 
            variant="flat"
            isDisabled
          >
            ✓ Telah Terdaftar
          </Button>
        ) : isLive() ? (
          <Button 
            className="w-full" 
            color="primary"
            onClick={handleRegister}
          >
            Join Live Webinar
          </Button>
        ) : isUpcoming() && countdown ? (
          <Button 
            className="w-full" 
            color="secondary"
            variant="bordered"
            isDisabled
          >
            Registration Opens Soon
          </Button>
        ) : (
          <Button 
            className="w-full" 
            color="primary"
            onClick={handleRegister}
          >
            Register Now
          </Button>
        )}
      </div>
    </Card>
  );
}