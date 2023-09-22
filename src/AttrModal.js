import React from "react";
import Modal from "react-bootstrap/Modal";
import { useRef, useEffect } from "react";
import { useAppContext } from "./AppProvider";
import { toast, ToastContainer } from "react-toastify";
import AppButton from "./AppButton";

const AttrModal = () => {
  const {
    db,
    setCharList,
    setSelectedChar,
    selectedChar,
    selectedTask,
    setSelectedTask,
    setTaskList,
    showModal,
    modalMode,
    closeModal,
    editedAttr,
    editedValue,
    setEditedValue,
    showNotification,
    customMessage,
    setCustomMessage,
    setShowNotification,
  } = useAppContext();

  const inputRef = useRef(null);

  useEffect(() => {
    // Cuando el modal se muestra, enfoca y selecciona el input
    if (showModal) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showModal]);

  useEffect(() => {
    if (showNotification) {
      toast.info(customMessage, {
        autoClose: 2000,
        position: "top-right",
        hideProgressBar: true,
        onClose: () => {
          setShowNotification(false);
          setCustomMessage("");
        },
      });
    }
  }, [setShowNotification, showNotification, setCustomMessage, customMessage]);

  
  const updateCharHandler = (e) => {
    e.preventDefault();
    const isConfirmed = window.confirm(
      "¿Update character?"
    );

    if (isConfirmed) {
      db.character
        .where("id")
        .equals(selectedChar.id)
        .modify((character) => {
          character[editedAttr] = editedValue;
        })
        .then(() => {
          setCharList((prevList) =>
            prevList.map((character) =>
              character.id === selectedChar.id
                ? { ...character, [editedAttr]: editedValue }
                : character
            )
          );
        });
    }
    closeModal();
    setSelectedChar(selectedChar);
  };

  const updateTaskHandler = (e) => {
    e.preventDefault();
    const isConfirmed = window.confirm(
      "¿Update task?"
    );

    if (isConfirmed) {
      db.task
        .where("id")
        .equals(selectedTask.id)
        .modify((task) => {
          task[editedAttr] = editedValue;
        })
        .then(() => {
          setTaskList((prevList) =>
            prevList.map((task) =>
              task.id === selectedTask.id
                ? { ...task, [editedAttr]: editedValue }
                : task
            )
          );
        });
    }
    closeModal();
    setSelectedTask(selectedTask);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalMode === "char") {
      updateCharHandler(e);
    } else if (modalMode === "task") {
      updateTaskHandler(e);
    }
  };


  return (
    <>
      <Modal size="sm" show={showModal} onHide={closeModal}>
        <form onSubmit={(e) => handleSubmit(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar {editedAttr}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modalBody">
            <input
              ref={inputRef}
              className="attrInput"
              type={editedAttr === "gearscore" || editedAttr === "level" ? "number" : "text"} // Define el tipo de input según el atributo
              value={editedValue} // Establece el valor del input
              onChange={(e) => setEditedValue(e.target.value)} // Maneja los cambios en el valor
            />
          </Modal.Body>
          <Modal.Footer>
            <AppButton
              variant="primary"
              type="submit"
              label="Actualizar"
              onClick={(e) => handleSubmit(e)}
            />
            <AppButton
              variant="secondary"
              type="button"
              label="Cancelar"
              onClick={closeModal}
            />
          </Modal.Footer>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default AttrModal;
