const events = [
  {
    name: 'Community call',
    date: new Date("2022-02-01T00:00:00+00:00")
  },
  {
    name: 'Chill & Shill',
    date: new Date("2022-02-10T00:00:00+00:00")
  },
];

const UpcomingEvents = () => (
  <div className="">
    <h3 className="dark:text-daonative-gray-300">Upcoming Events</h3>
    <ul role="list" className="w-full py-4 text-sm dark:text-daonative-gray-100">
      {events.map((event, eventIdx) => (
        <li key={eventIdx} className="py-2">
            {event.date.toDateString()} - {event.name}
        </li>
      ))}
    </ul>
  </div>
);

export default UpcomingEvents