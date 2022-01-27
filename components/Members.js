const members = [
  {
    name: 'Laurent',
    totalPraise: '8.2k',
    praiseThisWeek: '230'
  },
  {
    name: 'Ben',
    totalPraise: '8.2k',
    praiseThisWeek: '230'
  },
];

const Members = () => (
  <div className="bg-white rounded-md p-4 shadow rounded-lg">
    <h3>Members</h3>
    <ul role="list" className="divide-y divide-gray-200 w-full">
      {members.map((member) => (
        <li key={member.email} className="py-4 flex justify-between">
          <div className="">
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-500">Praise received this week</p>
          </div>
          <div className="place-self-end">
            <p className="text-sm font-medium text-gray-500">{member.totalPraise}</p>
            <p className="text-xs font-medium text-green-500">{member.praiseThisWeek}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default Members