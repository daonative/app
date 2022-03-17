import Moment from 'react-moment';
import { classNames } from '../lib/utils';
import PFP from './PFP';
import ShortAddress from './ShortAddress';

const TasksTable = ({ title = "Tasks", showAssignee = false, showWeight = false, tasks = [], onTaskStatusChange, onTaskClick }) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 border-daonative-gray-900">
            <table className="table-fixed min-w-full divide-y divide-gray-200 divide-daonative-gray-900">
              <thead className="text-gray-500 bg-daonative-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {title}
                  </th>
                  {showWeight && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Weight
                    </th>
                  )}
                  {showAssignee && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Assignee
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                  {onTaskStatusChange && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Done
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  return (
                    <tr key={task.taskId} className=" bg-daonative-component-bg text-gray-900 text-daonative-gray-200">
                      <td
                        className={classNames(
                          "px-6 py-4 whitespace-nowrap text-sm font-medium",
                          onTaskClick && "hover:cursor-pointer"
                        )}
                        onClick={() => onTaskClick && onTaskClick(task.taskId)}
                      >
                        {task.description}
                      </td>
                      {showWeight && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {task.weight}
                        </td>
                      )}
                      {showAssignee && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-4">
                            <PFP address={task.assigneeAccount} size={40} />
                            {/* <img className="h-10 w-10 rounded-full" src="https://ipfs.io/ipfs/QmbvBgaAqGVAs3KiEgsuDY2u4BUnuA9ueG96NFSPK4z6b6" alt="" />*/}
                            {task.assigneeName ? (
                              <>{task.assigneeName}</>
                            ) : (
                              <ShortAddress>{task.assigneeAccount}</ShortAddress>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Moment date={task.deadline} fromNowDuring={24 * 60 * 60 * 1000} format="yyyy-MM-DD" />
                      </td>
                      {onTaskStatusChange && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            name="done"
                            type="checkbox"
                            className="bg-daonative-dark-300 border-gray-700 focus:ring-indigo-500 h-6 w-6 text-indigo-600 border-gray-300 rounded"
                            checked={task.status === "done"}
                            onChange={(event) => onTaskStatusChange(task.taskId, event.target.checked ? "done" : "todo")}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasksTable;