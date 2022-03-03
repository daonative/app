import Link from "next/link";
import ComingSoonBadge from "./ComingSoonBadge";

const events = [
//  {
//    name: 'ETHDenver',
//    date: new Date("2022-02-11T09:00:00-0700"),
//    link: 'https://ethdenver.com'
//  },
//  {
//    name: 'MΞTAPOD pitch',
//    date: new Date("2022-02-16T16:00:00-0700"),
//    link: 'https://metapod.gg'
//  },
  {
    name: 'LI.FI meeting',
    date: new Date("2022-02-23T14:00:00+0100"),
    link: 'https://li.finance'
  },
  {
    name: 'Hyperscale meeting',
    date: new Date("2022-02-23T14:00:00+0100"),
    link: 'https://www.hyperscalefund.com/'
  },
];

const UpcomingEvents = () => (
  <div className="">
    <h3 className="text-daonative-gray-300">
      Upcoming Events
    </h3>
    <ul role="list" className="w-full py-4 text-sm text-daonative-gray-100">
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