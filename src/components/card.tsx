import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Image, Link } from "@heroui/react";
import { Webinar } from "@/api/interface";
import { auth_participants } from "@/api/auth_participants";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CardViewProps {
  webinar: Webinar;
}

export function CardView({ webinar }: CardViewProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // State to track registration status
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [isCommittee, setIsCommittee] = useState<boolean>(false);

  // Countdown effect for upcoming webinars
  useEffect(() => {
    if (!webinar.dstart) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(webinar.dstart).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [webinar.dstart]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      setStatusLoading(true);
      try {
        const result = await auth_participants.event_participate_info(
          webinar.id
        );

        if (!cancelled) {
          setIsRegistered(result.success && !!result.data);

          if (
            result.success &&
            result.data &&
            result.data.EventPRole === "committee"
          ) {
            setIsCommittee(true);
          } else {
            setIsCommittee(false);
          }
        }
      } catch {
        if (!cancelled) {
          setIsRegistered(false);
          setIsCommittee(false);
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [webinar.id]);

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
      return "Invalid date";
    }
  };

  // Check if webinar is live
  const isLive = () => {
    if (!webinar.dstart || !webinar.dend) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    const endDate = new Date(webinar.dend);
    return now >= startDate && now <= endDate;
  };

  // Check if webinar is upcoming
  const isUpcoming = () => {
    if (!webinar.dstart) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    return now < startDate;
  };

  return (
    <Link href={`/detail/${webinar.id}`}>
      <Card className="py-4 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
        <CardBody className="overflow-visible py-2">
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

            {/* Badge label: ONLINE/OFFLINE/whatever */}
            <div className="absolute top-2 left-2 z-10">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow
                ${
                  webinar.att === "online"
                    ? "bg-[#22C55E] text-white"
                    : "bg-[#F97316] text-white"
                }`}
              >
                {webinar.att === "online"
                  ? "ONLINE"
                  : webinar.att === "offline"
                    ? "OFFLINE"
                    : (webinar.att || "LABEL").toUpperCase()}
              </span>
            </div>

            {isLive() && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                🔴 LIVE
              </div>
            )}
          </div>
        </CardBody>

        {/* Card Header */}
        <CardHeader className="pb-2 pt-2 px-4 flex-col items-start">
          <h4
            className="font-bold text-large line-clamp-2"
            title={webinar.name}
          >
            {webinar.name || "Webinar Title"}
          </h4>
          <p className="text-tiny uppercase font-bold text-gray-600">
            {webinar.speaker || "Speaker Name"}
          </p>
          <small className="text-default-500 mb-2">
            {formatDate(webinar.dstart)}
          </small>

          {webinar.description && (
            <p
              className="text-sm text-gray-600 line-clamp-3 mb-3"
              title={webinar.description}
            >
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
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Days
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {countdown.hours}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Hours
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {countdown.minutes}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Min
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {countdown.seconds}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Sec
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        {/* Status Registrasi */}
        <div className="flex justify-center">
          {statusLoading ? (
            <div className="p-3 bg-gray-200 text-gray-500 rounded-lg text-center font-semibold shadow animate-pulse w-[140px]">
              Checking...
            </div>
          ) : isCommittee ? (
            <div className="p-3 bg-blue-700 text-white rounded-lg text-center font-semibold shadow">
              Committee
            </div>
          ) : isRegistered ? (
            <div className="p-3 bg-blue-600 text-white rounded-lg text-center font-semibold shadow">
              Sudah Terdaftar
            </div>
          ) : (
            <div className="p-3 bg-gray-300 text-gray-700 rounded-lg text-center font-semibold shadow">
              Belum Terdaftar
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
