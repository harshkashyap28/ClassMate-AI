import React from "react";

const AddToCalendarButton = ({ assignment, userEmail }) => {
  const handleAddToCalendar = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/calendar.events",
      hint: userEmail,
      prompt: "",
      callback: (response) => {
        createEvent(response.access_token);
      },
    });

    client.requestAccessToken();
  };

  const createEvent = async (accessToken) => {
    const event = {
      summary: assignment.title,
      description: assignment.description,
      start: {
        dateTime: new Date(assignment.dueDate).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(new Date(assignment.dueDate).getTime() + 3600000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (response.ok) {
        alert(" Assignment added to your Google Calendar!");
      } else {
        alert(" Failed to add to calendar.");
        console.error(await response.json());
      }
    } catch (err) {
      console.error("Calendar error:", err);
    }
  };

  return (
    <button onClick={handleAddToCalendar} className="btn-calendar">
      📅 Add to Calendar
    </button>
  );
};

export default AddToCalendarButton;
