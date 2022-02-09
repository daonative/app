import Link from "next/link";
import ComingSoonBadge from "./ComingSoonBadge";

const events = [
  {
    name: 'ETHDenver',
    date: new Date("2022-02-11T00:00:00+00:00"),
    link: 'https://ethdenver.com'
  },
  {
    name: 'MΞTAPOD pitch',
    date: new Date("2022-02-16T00:00:00+00:00"),
    link: 'https://metapod.gg'
  },
];

const UpcomingEvents = () => (
  <div className="">
    <h3 className="dark:text-daonative-gray-300">
      Upcoming Events
    </h3>
    <ul role="list" className="w-full py-4 text-sm dark:text-daonative-gray-100">
      {events.map((event, eventIdx) => (
        <li key={eventIdx} className="py-2">
          <Link href={event.link}>
            <a>{event.date.toDateString()} - {event.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default UpcomingEvents