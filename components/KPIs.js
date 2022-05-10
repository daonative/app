import {
  AdjustmentsIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/solid';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWallet } from '@/lib/useWallet';
import { useRequireAuthentication } from '../lib/authenticate';
import useMembership from '../lib/useMembership';
import { SimpleCard, SimpleCardBody } from './Card';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';

const kpiDefaults = {
  0: { icon: ChartBarIcon },
  1: { icon: AdjustmentsIcon },
  2: { icon: BeakerIcon }
}

export const mergeKPIsAndDefaults = (kpis) => {
  const myKPIs = kpis || {}
  return (
    Object.keys(kpiDefaults).sort().reduce(
      (obj, idx) => {
        return {
          [idx]: { ...kpiDefaults[idx], ...myKPIs[idx] },
          ...obj
        }
      },
      {}
    )
  )
}

const MetricModal = ({ show, onClose, onSave, defaultValues }) => {
  const { register, handleSubmit } = useForm({ defaultValues })

  const updateMetric = (data) => {
    onSave(data)
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={handleSubmit(updateMetric)}>
        <ModalTitle>Set your KPI</ModalTitle>
        <ModalBody>
          <label htmlFor="name" className="block text-sm font-medium pb-2">
            KPI Name
          </label>
          <input type="text" {...register("name")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
          <label htmlFor="name" className="block text-sm font-medium pb-2 pt-4">
            What{"'"}s the latest indicator?
          </label>
          <input type="text" {...register("indicator")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
        </ModalBody>
        <ModalActionFooter>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
          >
            Set KPI
          </button>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const Metric = ({ icon: MetricIcon, name, indicator, change, changeType, onSave, isEditable }) => {
  const [showModal, setShowModal] = useState(false)

  const handleCloseMetricModal = () => {
    setShowModal(false)
  }

  const handleOpenMetricModal = () => {
    setShowModal(true)
  }

  const handleUpdateMetric = (data) => {
    onSave(data)
    setShowModal(true)
  }

  return (
    <SimpleCard
      onClick={() => { isEditable && handleOpenMetricModal() }}
      className="cursor-pointer"
    >
      <SimpleCardBody>
        <MetricModal show={showModal} onClose={handleCloseMetricModal} onSave={handleUpdateMetric} defaultValues={{ name, indicator }} />
        <div className="flex gap-6">
          <div className="bg-blue-100 rounded-full p-3 w-min h-min">
            <MetricIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
          </div>
          <div className="flex flex-col items-baseline">
            <p className="text-sm font-medium text-gray-500 text-daonative-gray-300">{name || "Click to set KPI"}</p>
            <p className="text-xl font-semibold text-gray-900 text-daonative-gray-200">{indicator || "n/a"}</p>
          </div>
        </div>
      </SimpleCardBody>
    </SimpleCard >
  )
}

const KPIs = ({ kpis, roomId }) => {
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')
  const requireAuthentication = useRequireAuthentication()

  // merge the KPI values with the default KPI values
  const metrics = mergeKPIsAndDefaults(kpis)

  const handleUpdateMetric = async (metricId, data) => {
    await requireAuthentication()

    const oldMetric = kpis && kpis[metricId]
    const newMetric = { [metricId]: { ...oldMetric, ...data } }
    const newMetrics = { ...kpis, ...newMetric }

    const db = getFirestore()
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { kpis: newMetrics })
  }

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {Object.keys(metrics).sort().map(metricId => {
          return (
            <Metric
              key={metricId}
              {...(metrics[metricId] || {})}
              isEditable={isAdmin}
              onSave={(data) => handleUpdateMetric(metricId, data)}
            />
          )
        })}
      </dl>
    </div>
  );
};

export default KPIs