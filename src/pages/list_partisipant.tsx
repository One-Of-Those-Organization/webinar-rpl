import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth_participants } from "@/api/auth_participants";
import { toast } from "react-toastify";
import DefaultLayout from "@/layouts/default";
import { auth_webinar } from "@/api/auth_webinar";

export default function ListPartisipantPage() {
  // Get event ID from URL parameters
  const { eventId } = useParams<{ eventId: string }>();
  const parsedId = eventId ? parseInt(eventId, 10) : null;

  // Check committee status
  const [isCommittee, setIsCommittee] = useState(false);

  // List Participant state
  const [participants, setParticipants] = useState<any[]>([]);

  // Instant check for committee status from event id that is passed in URL
  useEffect(() => {
    if (parsedId) {
      const checkCommittee = async () => {
        try {
          const result =
            await auth_participants.event_participate_info(parsedId);
          if (
            result.success &&
            result.data &&
            result.data.EventPRole === "committee"
          ) {
            setIsCommittee(true);
          } else {
            setIsCommittee(false);
          }
        } catch (error) {
          setIsCommittee(false);
          toast.error("Failed to check committee status.");
        }
      };
      checkCommittee();
    }
  }, [parsedId]);

  // Get the Participant List
  useEffect(() => {
    try {
      const fetchParticipants = async () => {
        if (parsedId) {
          const response =
            await auth_participants.get_participants_by_event(parsedId);
          if (response.success) {
            setParticipants(response.data);
            console.log("Participants:", response.data);
          } else {
            toast.error("Failed to fetch participants.");
          }
        }
      };
      fetchParticipants();
    } catch (error) {
      toast.error("An error occurred while fetching participants.");
    }
  }, [parsedId]);

  // Get Webinar Data
  useEffect(() => {
    try {
      const fetchWebinarData = async () => {
        if (parsedId) {
          const response = await auth_webinar.get_webinar_by_id(parsedId);
          console.log("Webinar Data:", response);
        }
      };
      fetchWebinarData();
    } catch (error) {
      toast.error("An error occurred while fetching webinar data.");
    }
  }, [parsedId]);

  return (
    <DefaultLayout>
      <section>
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold">List Partisipant</h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
