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
  <div className="bg-white dark:bg-daonative-dark-100 p-4 shadow rounded-lg">
    <h3 className="dark:text-daonative-gray-200">Members</h3>
    <p className="text-sm font-medium text-gray-500 dark:text-daonative-gray-400">2</p>
    <ul role="list" className="divide-y divide-gray-200 w-full">
      {members.map((member, memberIdx) => (
        <li key={memberIdx} className="py-4 flex justify-between">
          <div className="">
            <p className="text-sm font-medium text-gray-900 dark:text-daonative-gray-200">{member.name}</p>
            <p className="text-xs text-gray-500 dark:text-daonative-gray-400">Praise received this week</p>
          </div>
          <div className="place-self-end">
            <p className="text-sm text-gray-500 dark:text-daonative-gray-400">{member.totalPraise}</p>
            <p className="text-xs font-medium text-green-500">{member.praiseThisWeek}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default Members