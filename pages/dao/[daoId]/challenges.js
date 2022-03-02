import { LayoutWrapper } from '../../../components/LayoutWrapper'

const Challenges = ({ }) => {
  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between">
          <h2 className="text-2xl">Active challenges</h2>
          <span>Add a challenge</span>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default Challenges