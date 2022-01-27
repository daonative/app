import DAOnativeLogo from "../public/DAOnativeLogo.svg"

const Dashboard = () => (
  <div className="overflow-hidden bg-daonative-dark-300 text-daonative-gray-100 w-full h-screen">
    <main className="flex flex-col items-center justify-center">
      <img src="./DAOnativeLogo.svg" className="w-32 h-32 m-6" />
      <input
        type="text"
        name="work"
        className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
        placeholder="What should we call you?"
      />
    </main>
  </div>
)

export default Dashboard