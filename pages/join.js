import DAOnativeLogo from "../public/DAOnativeLogo.svg"

const Dashboard = () => (
  <div className="overflow-hidden bg-daonative-dark-300 text-daonative-gray-100 w-full h-screen">
    <main className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center ">
        <img src="./DAOnativeLogo.svg" className="w-32 h-32 m-6" />
        <h1 className="text-3xl text-daonative-gray-300">DAOnative</h1>
        <p className="py-6 text-gray-200">We help you focus on your community by making it easy to create, fund, and manage a DAO.</p>
        <div className="flex">
          <input
            type="text"
            name="work"
            className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
            placeholder="What should we call you?"
          />
          <button
            type="button"
            className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join the DAO
          </button>
        </div>
      </div>
    </main>
  </div >
)

export default Dashboard