import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import moment from "moment";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource"; // Path to the schema generated by Amplify
import { Sanitize } from "../supportFunctions/SanitizeInput";
import { PhoneSanitize } from "../supportFunctions/SanitizePhoneNum";
import _ from "lodash"; // for binary seachability

Amplify.configure(outputs);

// Generate the Amplify client
const client = generateClient<Schema>();

const dateTimeFormat = "YYYY-MM-DD HH:mm";

// Define types for events and modal state
export interface Event {
  start: Date | null; // Allow null for start date
  end: Date | null; // Allow null for end date
  title: string;
  allDay: boolean;
}

export interface Attendee {
  id: string;
  nameFirst: string;
  nameLast: string;
  phoneNumber: string;
  email: string;
  partySize: number;
}

const useCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]); // Store events fetched from the database
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false); // RSVP Modal visibility
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [allday, setIsAllDay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  const defaultPartySize = 1;
  const [rsvpFName, setRsvpFName] = useState("");
  const [rsvpLName, setRsvpLName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpAttendeeCount, setRsvpAttendeeCount] = useState(defaultPartySize);

  const [listAttendees, setListAttendees] = useState(false);
  const [attendeesList, setAttendeesList] = useState<Attendee[]>([]);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [attendeeSearchQuery, setAttendeesSearchQuery] = useState("");
  const [selectedAttendeeSearchOptions, setAttendeesSearchOptions] =
    useState("name");
  const [partySizeTotal, setPartySizeTotal] = useState(0);

  const { sanitizeInput } = Sanitize();
  const { sanitizePhone } = PhoneSanitize();

  // Fetch events from the database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await client.models.Event.list();

        const calendarEvents = data.map((event) => {
          const startDateTime = moment(
            `${event.eventStartDate} ${event.eventStartTime || ""}`, // Concatenate date and time
            dateTimeFormat
          );
          const endDateTime = moment(
            `${event.eventEndDate} ${event.eventEndTime || ""}`, // Concatenate date and time
            dateTimeFormat
          );

          return {
            start: startDateTime.isValid() ? startDateTime.toDate() : null, // Handle null times gracefully
            end: endDateTime.isValid() ? endDateTime.toDate() : null,
            title: event.eventTitle ?? "",
            location: event.eventLocation ?? "",
            details: event.eventDetails ?? "",
            allDay: event.allday ?? false,
            id: event.id, //Hidden Database ID for editing events
          };
        });
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
    fetchEvents();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the event title is empty
    if (!eventTitle.trim()) {
      setErrorMessage("Event title cannot be empty.");
      return;
    }

    // If start or end time are empty, set them to null
    const startDateTime =
      eventStartDate && eventStartTime
        ? moment(eventStartDate + " " + eventStartTime, dateTimeFormat)
        : null;
    const endDateTime =
      eventEndDate && eventEndTime
        ? moment(eventEndDate + " " + eventEndTime, dateTimeFormat)
        : null;

    // Validate time logic only if both are provided
    if (startDateTime && endDateTime && endDateTime.isBefore(startDateTime)) {
      setErrorMessage("End date/time cannot be before start date/time.");
      return;
    }

    // Sanitize Inputs
    setEventTitle(sanitizeInput(eventTitle));
    setEventLocation(sanitizeInput(eventLocation));
    setEventDetails(sanitizeInput(eventDetails));

    try {
      if (isEditMode) {
        // Ensure eventId is not null
        if (!eventId) {
          setErrorMessage("Event ID is missing. Cannot update event.");
          return;
        }

        // Proceed with the update
        console.log("Edit mode: ", isEditMode);
        console.log("Updating event with ID:", eventId);
        await client.models.Event.update({
          id: eventId, // Use the eventId here
          eventTitle: eventTitle,
          eventStartDate: eventStartDate,
          eventEndDate: eventEndDate,
          eventStartTime: eventStartTime || null, // Allow null if no time provided
          eventEndTime: eventEndTime || null, // Allow null if no time provided
          eventLocation: eventLocation,
          eventDetails: eventDetails,
          allday: allday,
        });

        console.log("Updated Event");
      } else {
        // Create a new event if not in edit mode
        await client.models.Event.create({
          eventTitle,
          eventStartDate,
          eventEndDate,
          eventStartTime: eventStartTime || null, // Allow null if no time provided
          eventEndTime: eventEndTime || null, // Allow null if no time provided
          eventLocation,
          eventDetails,
          allday,
        });
      }

      // Fetch updated events using the newly created function
      const updatedEvents = await fetchUpdatedEvents();

      setEvents(updatedEvents);
      resetFormFields();
      setIsModalOpen(false);
      setSelectedEvent(false);
      setIsEditMode(false);
      console.log("Event created/updated successfully!");
    } catch (error) {
      console.error("Error creating/updating event: ", error);
    }
  };

  // Function to fetch and process updated events
  const fetchUpdatedEvents = async () => {
    const { data } = await client.models.Event.list();

    const updatedEvents = data.map((event) => {
      const startDateTime = moment(
        `${event.eventStartDate} ${event.eventStartTime || ""}`,
        dateTimeFormat
      );
      const endDateTime = moment(
        `${event.eventEndDate} ${event.eventEndTime || ""}`,
        dateTimeFormat
      );

      return {
        start: startDateTime.isValid() ? startDateTime.toDate() : null, // Handle null times gracefully
        end: endDateTime.isValid() ? endDateTime.toDate() : null,
        title: event.eventTitle ?? "",
        location: event.eventLocation ?? "",
        details: event.eventDetails ?? "",
        allDay: event.allday ?? false,
        id: event.id,
      };
    });

    return updatedEvents;
  };

  // Reset form fields to their initial state
  const resetFormFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventStartTime("");
    setEventEndTime("");
    setEventLocation("");
    setEventDetails("");
    setIsAllDay(false);
    setEventId("");
    setErrorMessage("");
  };

  const resetRSVPFormFields = () => {
    setRsvpFName("");
    setRsvpLName("");
    setRsvpEmail("");
    setRsvpEmail("");
    setRsvpPhone("");
    setErrorMessage("");
    setRsvpAttendeeCount(defaultPartySize);
  };

  // Map events to ensure start and end dates are undefined instead of null
  const mappedEvents = events.map((event) => ({
    ...event,
    start: event.start ?? undefined, // Convert null to undefined
    end: event.end ?? undefined, // Convert null to undefined
  }));

  const handleEventSelect = (event: any) => {
    //close and reset all feilds
    resetSelectedEvent();
    // If the same event is clicked again, close the modal by setting selectedEvent to null
    if (selectedEvent && selectedEvent.title === event.title) {
      setSelectedEvent(null); // Close the popup
    } else {
      getRsvpPartyInital(event.id);
      setSelectedEvent(event); // Open the popup with the new event's details
      try {
      } catch (error) {
        // Call the refactored function to fetch attendee data
      }
    }
  };

  const resetSelectedEvent = () => {
    setIsEditMode(false);
    setIsAttendeesModalOpen(false);
    setIsModalOpen(false);
    setPartySizeTotal(0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetFormFields();
    setPartySizeTotal(0);
    setIsEditMode(false);
    setSelectedEvent(null); // Clear selected event when modal is closed
  };

  const handleCloseModalBasic = () => {
    setIsModalOpen(false);
    setSelectedEvent(null); // Clear selected event when modal is closed
  };
  const handleCloseRSVP = () => {
    setIsRSVPModalOpen(false);
    setIsModalOpen(false);
    setIsAttendeesModalOpen(false);
    setSelectedEvent(null);
    resetRSVPFormFields();
  };

  const handleAddEventClick = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setIsEditMode(false);
    resetFormFields();
    setIsModalOpen(true);
  };

  const handleEditEventClick = () => {
    resetSelectedEvent();

    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setEventStartDate(moment(selectedEvent.start).format("YYYY-MM-DD"));
      setEventEndDate(moment(selectedEvent.end).format("YYYY-MM-DD"));
      setEventStartTime(moment(selectedEvent.start).format("HH:mm"));
      setEventEndTime(moment(selectedEvent.end).format("HH:mm"));
      setEventLocation(selectedEvent.location);
      setEventDetails(selectedEvent.details);
      setIsAllDay(selectedEvent.allDay);
      setEventId(selectedEvent.id);
      setIsModalOpen(true);
      setIsEditMode(true); // Set to edit mode when editing an existing event
    }
  };

  const handleDeleteEventClick = async () => {
    if (
      selectedEvent &&
      window.confirm("Are you sure you want to delete this event")
    ) {
      try {
        await client.models.Event.delete({ id: selectedEvent.id });
        handleCloseModal();
        const updatedEvents = await fetchUpdatedEvents();
        setEvents(updatedEvents);
        console.log("Deleted Event");
      } catch (err) {
        console.error("Error deleting event: ", err);
      }
    }
  };

  const handleRSVPEventClick = () => {
    setIsAttendeesModalOpen(false);
    setIsRSVPModalOpen(true);
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rsvpFName === "" || rsvpLName === "") {
      setErrorMessage(" * First name and last name are required.");
      return;
    }

    //sanitize inuts
    setRsvpFName(sanitizeInput(rsvpFName));
    setRsvpLName(sanitizeInput(rsvpLName));
    setRsvpEmail(sanitizeInput(rsvpEmail).toLowerCase());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rsvpEmail)) {
      setErrorMessage(` * Invalid email ex. sltfire@gmail.com`);
      return;
    }

    // Validate phone format
    const sanitizedNum = sanitizePhone(rsvpPhone);

    if (sanitizedNum === null) {
      setErrorMessage(" * Invalid phone format ex. 555-555-555.");
      return;
    }

    setRsvpPhone(sanitizedNum);

    try {
      // Fetch event-attendee relationships for the specific event
      const { data: eventAttendants } =
        await client.models.EventAttentants.list({
          filter: { eventId: { eq: selectedEvent.id } },
        });

      if (eventAttendants && eventAttendants.length > 0) {
        // Extract attendee IDs from the relationships
        const attendeeIds = eventAttendants.map(
          (relation) => relation.attendeeId
        );
        // Create an 'or' condition for all attendee IDs
        const filterCondition = attendeeIds.map((id) => ({ id: { eq: id } }));

        // Fetch attendee details based on IDs using 'or' conditions
        console.log(attendeeIds);
        const { data: attendees } = await client.models.Attendee.list({
          filter: { or: filterCondition },
        });

        const checkRsvpList = attendees.map((attendee) => ({
          id: attendee.id, // Ensure no null values
          nameFirst: attendee.nameFirst || "", // Ensure no null values
          nameLast: attendee.nameLast || "",
          phoneNumber: attendee.phoneNumber || "",
          email: attendee.email || "",
          partySize: attendee.partySize || defaultPartySize,
        }));

        //sort by Rsvp list by email address
        const sortedRsvpList = checkRsvpList.sort((a, b) => {
          if (a.email < b.email) return -1;
          if (a.email > b.email) return 1;
          return 0;
        });

        const index = _.sortedIndexOf(
          sortedRsvpList.map((attendee) => attendee.email),
          rsvpEmail //search for a matching email address
        );

        if (index !== -1) {
          // Email has been found
          setErrorMessage(
            "This Email has already been used to RSVP to this Event"
          );
          return;
        }
      }

      const attendeeResult = await client.models.Attendee.create({
        nameFirst: rsvpFName,
        nameLast: rsvpLName,
        phoneNumber: rsvpPhone,
        email: rsvpEmail,
        partySize: rsvpAttendeeCount,
      });

      const attendee = attendeeResult?.data; // Ensure the data exists
      if (attendee) {
        if (selectedEvent?.id) {
          await client.models.EventAttentants.create({
            eventId: selectedEvent.id, // Event ID from selected event
            attendeeId: attendee.id, // Link attendee by email (or use attendee.id)
          });
        }
      }
    } catch (error) {
      console.error("Error RSVP to event: ", error);
    }

    setIsRSVPModalOpen(false);
    resetRSVPFormFields();
  };

  const fetchAttendeesForEvent = async (eventId: string) => {
    try {
      // Fetch event-attendee relationships for the specific event
      const { data: eventAttendants } =
        await client.models.EventAttentants.list({
          filter: { eventId: { eq: eventId } },
        });

      if (eventAttendants && eventAttendants.length > 0) {
        // Extract attendee IDs from the relationships
        const attendeeIds = eventAttendants.map(
          (relation) => relation.attendeeId
        );

        // Create an 'or' condition for all attendee IDs
        const filterCondition = attendeeIds.map((id) => ({ id: { eq: id } }));

        // Fetch attendee details based on IDs using 'or' conditions
        const { data: attendees } = await client.models.Attendee.list({
          filter: { or: filterCondition },
        });

        // Return attendees data
        return attendees;
      } else {
        console.error("No attendees found for this event.");
        return []; // Return empty array if no attendees are found
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      return []; // Return empty array in case of error
    }
  };

  const calculateTotalAttendees = (
    attendees: { partySize: number }[]
  ): number => {
    return attendees.reduce((total, attendee) => total + attendee.partySize, 0);
  };

  const transformAttendeesData = (
    attendees: any[]
  ): {
    id: string;
    nameFirst: string;
    nameLast: string;
    phoneNumber: string;
    email: string;
    partySize: number;
  }[] => {
    return attendees.map((attendee) => ({
      id: attendee.id, // Ensure no null values
      nameFirst: attendee.nameFirst || "", // Ensure no null values
      nameLast: attendee.nameLast || "",
      phoneNumber: attendee.phoneNumber || "",
      email: attendee.email || "",
      partySize: attendee.partySize || defaultPartySize,
    }));
  };

  const getRsvpPartyInital = async (eventId: string) => {
    const attendees = await fetchAttendeesForEvent(eventId);
    if (attendees.length > 0) {
      // Use the helper function to transform the attendees data
      const transformedAttendees = transformAttendeesData(attendees);

      // Calculate total attendees using the helper function
      const totalAttendees = calculateTotalAttendees(transformedAttendees);

      setPartySizeTotal(totalAttendees);
    }
    return;
  };

  const fetchEventAttendees = async (eventId: string) => {
    try {
      // Call the refactored function to fetch attendee data
      const attendees = await fetchAttendeesForEvent(eventId);

      if (attendees.length > 0) {
        // Use the helper function to transform the attendees data
        const transformedAttendees = transformAttendeesData(attendees);

        // Set state for attendees list
        setAttendeesList(transformedAttendees);
        setIsAttendeesModalOpen(true); // Open modal to display attendees
      } else {
        setAttendeesList([]); // In case no attendees are found
        setIsAttendeesModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  // Handle the "List Attendees" button click
  const handleListAttendeesClick = async () => {
    if (selectedEvent?.id) {
      await fetchEventAttendees(selectedEvent.id); // Fetch attendees for the selected event
      setIsModalOpen(false); // Close the "Create a New Event" modal
    } else {
      console.error("No event selected for listing attendees.");
    }
  };

  // Close the attendees modal
  const handleCloseAttendeesModal = () => {
    setIsAttendeesModalOpen(false);
    setAttendeesList([]);
    setIsModalOpen(false);
    setSelectedEvent(null);
    resetFormFields();
  };

  return {
    events,
    isModalOpen,
    isRSVPModalOpen,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventStartTime,
    eventEndTime,
    eventLocation,
    eventDetails,
    allday,
    selectedEvent,
    errorMessage,
    mappedEvents,
    isEditMode,
    eventId,
    rsvpFName,
    rsvpLName,
    rsvpEmail,
    rsvpPhone,
    rsvpAttendeeCount,
    listAttendees,
    attendeesList,
    isAttendeesModalOpen,
    attendeeSearchQuery,
    selectedAttendeeSearchOptions,
    partySizeTotal,
    setPartySizeTotal,
    setAttendeesSearchOptions,
    setAttendeesSearchQuery,
    setIsAttendeesModalOpen,
    setAttendeesList,
    setListAttendees,
    setEventId,
    setIsModalOpen,
    setIsRSVPModalOpen,
    setEventTitle,
    setEventStartDate,
    setEventEndDate,
    setEventStartTime,
    setEventEndTime,
    setEventLocation,
    setEventDetails,
    setIsAllDay,
    setErrorMessage,
    setSelectedEvent,
    setRsvpFName,
    setRsvpLName,
    setRsvpEmail,
    setRsvpPhone,
    setRsvpAttendeeCount,
    handleSubmit,
    handleRSVPSubmit,
    resetFormFields,
    handleEventSelect,
    handleCloseModal,
    handleCloseRSVP,
    handleRSVPEventClick,
    handleAddEventClick,
    handleCloseModalBasic,
    handleEditEventClick,
    handleDeleteEventClick,
    handleCloseAttendeesModal,
    handleListAttendeesClick,
  };
};

export default useCalendar;
