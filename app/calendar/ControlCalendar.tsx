import React, { useState } from "react";
import CalendarLocal, { localizer } from "./CalendarLocal";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import useCalendar from "./Calendar"; // Import the hook
import moment from "moment";
import logoImage from "../navbarAssets/Logo-CutOut.png";
import Image from "next/image";
import { SelectItem } from "@nextui-org/react";

const DndDCalendar = withDragAndDrop(CalendarLocal);

const ControlCalendar: React.FC = () => {
  const {
    isModalOpen,
    isEditMode,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventStartTime,
    eventEndTime,
    eventLocation,
    eventDetails,
    allday,
    errorMessage,
    selectedEvent,
    mappedEvents,
    listAttendees,
    attendeesList,
    isAttendeesModalOpen,
    setAttendeesList,
    setEventTitle,
    setEventStartDate,
    setEventEndDate,
    setEventStartTime,
    setEventEndTime,
    setEventLocation,
    setEventDetails,
    setIsAllDay,
    handleSubmit,
    handleEventSelect,
    handleCloseModal,
    handleAddEventClick,
    handleEditEventClick, // New function to handle edit
    handleDeleteEventClick,
    handleCloseAttendeesModal,
    handleListAttendeesClick,
  } = useCalendar(); // Use the custom hook to get the calendar logic

  return (
    <>
      <DndDCalendar
        localizer={localizer}
        events={mappedEvents} // Pass the mapped events
        draggableAccessor={(event) => true}
        onSelectEvent={handleEventSelect} // Update the handler to store the selected event
      />
      <div className="divButton2">
        <button onClick={handleAddEventClick}>Add Event</button>
      </div>

      {/* Modal for adding a new event */}
      {isModalOpen && !isEditMode && (
        <div className="divPopUp">
          <h3>Create a New Event</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Event Title:</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event Title"
                className="popUpInputBox"
              />
            </div>
            <div className="allDayToggle">
              <label>All Day</label>
              <input
                type="checkbox"
                checked={allday}
                onChange={() => setIsAllDay((prev) => !prev)}
              />
            </div>
            <div className="popUpInputRow">
              <div className="popUpInputColumn">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="popUpInputBox"
                />
              </div>
              <div className="popUpInputColumn">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="popUpInputBox"
                  disabled={allday}
                />
              </div>
            </div>
            <div className="popUpInputRow">
              <div className="popUpInputColumn">
                <label>End Date:</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="popUpInputBox"
                />
              </div>
              <div className="popUpInputColumn">
                <label>End Time:</label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="popUpInputBox"
                  disabled={allday}
                />
              </div>
            </div>
            <div>
              <label>Location</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location"
                className="popUpInputBox"
              />
            </div>
            <div>
              <label>Event Details</label>
              <textarea
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Details"
                className="popUpInputBox-Deatils"
              />
            </div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div className="divButton">
              <button
                type="button"
                onClick={handleCloseModal}
                className="popUpCancelButton"
              >
                Cancel
              </button>
              <button type="submit" className="popUpSaveButton">
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for viewing event details */}
      {selectedEvent && !isEditMode && !isAttendeesModalOpen && (
        <div className="divPopUp">
          <Image src={logoImage} alt="Logo" className="logo" />
          <h3 className="h3-title">Event Details</h3>
          <p>
            <strong className="strong-title">Title:</strong>{" "}
            {selectedEvent.title}
          </p>
          <p>
            <strong className="strong-title">All Day Event:</strong>{" "}
            {selectedEvent.allDay ? "Yes" : "No"}
          </p>
          <p>
            <strong className="strong-title">Start:</strong>{" "}
            {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")}
          </p>
          <p>
            <strong className="strong-title">End:</strong>{" "}
            {moment(selectedEvent.end).format("YYYY-MM-DD HH:mm")}
          </p>
          <p>
            <strong className="strong-title">Location:</strong>{" "}
            {selectedEvent.location}
          </p>
          <p>
            <strong className="strong-title">Details:</strong>{" "}
            {selectedEvent.details}
          </p>
          <div className="divButton">
            <button type="button" className="popUpCancelButton">
              Email all Attendees
            </button>
            <button
              type="button"
              className="popUpCancelButton"
              onClick={handleListAttendeesClick}
            >
              List Attendees
            </button>
            <button
              type="button"
              onClick={handleEditEventClick}
              className="popUpCancelButton"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteEventClick}
              className="popUpDeleteButton"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="popUpCancelButton"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isAttendeesModalOpen && (
        <div className="divTablePopUp">
          <div>
            <h3>Attendees for {selectedEvent.title}</h3>
            {attendeesList.length > 0 ? (
              <div className="table-container">
                <div>
                  <input>
                  </input>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Party Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendeesList.map((attendee) => (
                      <tr key={attendee.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              setAttendeesList((prevAttendees) =>
                                prevAttendees.map((att) =>
                                  att.id === attendee.id
                                    ? { ...att, selected: e.target.checked }
                                    : att
                                )
                              );
                            }}
                          />
                        </td>
                        <td>
                          {attendee.nameFirst} {attendee.nameLast}
                        </td>
                        <td>{attendee.email}</td>
                        <td>{attendee.phoneNumber}</td>
                        <td>{attendee.partySize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No attendees found for this event.</p>
            )}
            <button onClick={handleCloseAttendeesModal}>Close</button>
          </div>
        </div>
      )}

      {/* Modal for editing an event */}
      {isModalOpen && isEditMode && selectedEvent && (
        <div className="divPopUp">
          <h3 className="h3-title">Edit Event</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="strong-title">Event Title:</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event Title"
                className="popUpInputBox"
              />
            </div>
            <div className="allDayToggle">
              <label className="strong-title">All Day</label>
              <input
                type="checkbox"
                checked={allday}
                onChange={() => setIsAllDay((prev) => !prev)}
              />
            </div>
            <div className="popUpInputRow">
              <div className="popUpInputColumn">
                <label className="strong-title">Start Date:</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="popUpInputBox"
                />
              </div>
              <div className="popUpInputColumn">
                <label className="strong-title">Start Time:</label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="popUpInputBox"
                  disabled={allday}
                />
              </div>
            </div>
            <div className="popUpInputRow">
              <div className="popUpInputColumn">
                <label className="strong-title">End Date:</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="popUpInputBox"
                />
              </div>
              <div className="popUpInputColumn">
                <label className="strong-title">End Time:</label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="popUpInputBox"
                  disabled={allday}
                />
              </div>
            </div>
            <div>
              <label className="strong-title">Location</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location"
                className="popUpInputBox"
              />
            </div>
            <div>
              <label className="strong-title">Event Details</label>
              <textarea
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Details"
                className="popUpInputBox-Deatils"
              />
            </div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div className="divButton">
              <button
                type="button"
                onClick={handleCloseModal}
                className="popUpCancelButton"
              >
                Cancel
              </button>
              <button type="submit" className="popUpSaveButton">
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ControlCalendar;
