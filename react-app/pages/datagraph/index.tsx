import React, { useEffect, useState } from "react"

import { useRouter } from "next/router"
import useDimensions from "react-cool-dimensions"
import Modal from "react-modal"

import { useStoreState } from "../../store"
import { SchemaVisualizer } from "../../components/visualization"

const customModalStyles = {
  content: {
    margin: "auto",
    marginTop: "100px",
    minHeight: "350px",
    maxHeight: "400px",
    maxWidth: "600px",
    background: "#fff",
    outline: "none",
    borderRadius: "6px",
  },
  overlay: { background: "rgba(0,0,0,0.5)" },
}

export default function Datagraph() {
  const router = useRouter()
  const { ref, width, height } = useDimensions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState()
  const graphedData = useStoreState(store => store.graphedData)

  const toggleModal = () => setIsModalOpen(prev => !prev)
  const navToModel = () =>
    router.push(`/models/database/${(selectedNode as any)?.id}`)
  const onSelectNode = node => {
    setSelectedNode(node)
    toggleModal()
  }

  Modal.setAppElement("#graphmain")

  if (!graphedData) {
    return null
  }

  const closeModal = () => {
    if (isModalOpen) {
      setIsModalOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <SchemaVisualizer
        width={width}
        height={height}
        {...graphedData}
        onSelectNode={onSelectNode}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        contentLabel="details modal"
        style={customModalStyles}
        className="react-modal"
      >
        <div className="block p-6">
          <NodeDetails {...selectedNode} closeModal={closeModal} />
          <div className="flex justify-center pt-5">
            <button
              className="px-4 py-2 my-2 mr-4 font-bold text-white bg-blue-500 rounded"
              onClick={navToModel}
            >
              Detail page
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const NodeDetails = ({
  id,
  array_relationships,
  closeModal,
  object_relationships,
  remote_relationships,
  __typename,
}) => {
  return (
    <div className="flex-initial">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">{id}</h2>
        <div
          className="w-8 h-8 rouded flex items-center justify-center close-btn"
          role="button"
          onClick={closeModal}
        >
          <img src="/closeIcon.svg" alt="close-icon" className="w-3" />
        </div>
      </div>
      <div className="flex-initial">
        <p>Array relationships: {array_relationships?.length || 0}</p>
        {array_relationships?.map(ar => (
          <p key={ar.name} className="px-6">
            {ar.using.foreign_key_constraint_on
              ? `Foreign key constraint on column ${ar.using.foreign_key_constraint_on.column} of table ${ar.using.foreign_key_constraint_on.table.name}`
              : `Manual configuration: ${JSON.stringify(
                  ar.manual_configuration
                )}`}
          </p>
        ))}
        <p>Object relationships: {object_relationships?.length || 0}</p>
        {object_relationships?.map(or => (
          <p key={or.name} className="px-6">
            {or.using.foreign_key_constraint_on
              ? `Foreign key constraint on ${or.using.foreign_key_constraint_on}`
              : `Manual configuration: ${JSON.stringify(
                  or.using.manual_configuration
                )}`}
          </p>
        ))}
      </div>
    </div>
  )
}
