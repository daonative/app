import { AdvancedSettingsForm, DAOProfileForm } from "@/components/DAOProfileModal"
import { LayoutWrapper } from "@/components/LayoutWrapper"
import { ModalBody, ModalTabs, ModalTitle } from "@/components/Modal"
import { computeTabStyling } from "@/lib/computeTabStyling"
import { Tab } from "@headlessui/react"
import { getRoom } from "."


const DAOSettings = ({ room, roomId }) => {

    return (
        <LayoutWrapper>
            <Tab.Group>
                <ModalTitle>DAO Settings</ModalTitle>
                <ModalTabs>
                    <Tab.List className={'flex gap-3'}>
                        <Tab className={({ selected }) => computeTabStyling(selected)}
                        >
                            Profile
                        </Tab>

                        <Tab className={({ selected }) => computeTabStyling(selected)}
                        >
                            Token-gating
                        </Tab>
                    </Tab.List>
                </ModalTabs>
                <Tab.Panels>
                    <Tab.Panel>
                        <ModalBody>
                            <DAOProfileForm roomId={roomId} room={room} />
                        </ModalBody>
                    </Tab.Panel>
                    <Tab.Panel>
                        <ModalBody>
                            <AdvancedSettingsForm roomId={roomId} />
                        </ModalBody>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group >
        </LayoutWrapper>

    )
}

export const getServerSideProps = async ({ params }) => {
    const { daoId: roomId } = params
    const room = await getRoom(roomId)

    if (!room) return {
        notFound: true
    }

    const { created, ...dao } = room;

    return {
        props: { room: dao, roomId }
    }
}


export default DAOSettings