import Moment from 'react-moment';

const tasks = [
  { description: 'Deploy static version of the dashboard', deadline: new Date("2022-01-31T00:00:00+00:00") },
  { description: 'Add authentication', deadline: new Date("2022-02-01T00:00:00+00:00") },
  { description: 'Allow membership minting', deadline: new Date("2022-02-10T00:00:00+00:00") },
]

const Tasks = () => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 dark:border-daonative-gray-900 rounded-lg">
            <table className="table-fixed min-w-full divide-y divide-gray-200 dark:divide-daonative-gray-900">
              <thead className="bg-gray-50 dark:bg-daonative-dark-100 text-gray-500 dark:text-daonative-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    My tasks
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 w-48 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, taskIdx) => (
                  <tr key={taskIdx} className="bg-white dark:bg-daonative-dark-100 text-gray-900 dark:text-daonative-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Moment date={task.deadline} fromNowDuring={24 * 60 * 60 * 1000} format="yyyy-MM-DD"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;