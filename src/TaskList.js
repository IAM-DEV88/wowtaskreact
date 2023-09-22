import { useAppContext } from "./AppProvider";
import Accordion from "react-bootstrap/Accordion";
import AppButton from "./AppButton";

function TaskList() {
  const {
    db,
    charList,
    setCharList,
    taskList,
    setTaskList,
    selectedTask,
    setSelectedTask,
    activeTask,
    setActiveTask,
    showCustomNotification,
    toggleModal,
    DeleteSweepIcon,
    AddCircleOutlineIcon,
    RemoveCircleOutlineIcon,
    capitalizeFirstLetter,
  } = useAppContext();

  // Sort the task list by gearscore (highest to lowest)
  const sortedTaskList = [...taskList].sort(
    (a, b) => a.gearscore - b.gearscore
  );

  const handleTaskSelectChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    if (selectedId === 0) {
      setSelectedTask(null);
    } else {
      const selected = sortedTaskList.find((task) => task.id === selectedId);
      setSelectedTask(selected);
    }
  };

  const handleNewTask = () => {
    const template = {
      task: "Task",
      gearscore: 0,
      profession: "all",
      exclude: [],
    };

    db.task
      .add(template)
      .then((id) => {
        setTaskList((prevList) => [...prevList, { id, ...template }]);
        setActiveTask({ id, ...template });
        setSelectedTask({ id, ...template });
        showCustomNotification("New task created");
      })
      .catch((error) => {
        showCustomNotification("Error: " + error);
      });
  };

  const handleDeleteTask = (id) => {
    const isConfirmed = window.confirm("¿Delete task?");

    if (isConfirmed) {
      db.task
        .where("id")
        .equals(id)
        .delete()
        .then(() => {
          setTaskList((prevList) => prevList.filter((item) => item.id !== id));
        });

      showCustomNotification("Task deleted");
    }
  };

  const resetTaskTable = async () => {
    const isConfirmed = window.confirm("¿Delete all tasks?");

    if (isConfirmed) {
      try {
        await db.table("task").clear();

        showCustomNotification("Task list cleared");

        const newData = await db.task.toArray();
        setCharList(newData);
      } catch (error) {
        showCustomNotification("Error clearing list", error);
      }
    }
  };

  const handleExcludeToggle = (character, task) => {
    // Clonar el arreglo de exclude para evitar mutar el estado directamente
    const updatedExclude = [...task.exclude];
    const characterIndex = updatedExclude.indexOf(character.id);

    if (characterIndex === -1) {
      // Si characterId no está en updatedExclude, agrégalo
      updatedExclude.push(character.id);
      showCustomNotification(
        character.name + " is now excluded to do " + task.task
      );
    } else {
      // Si characterId ya está en updatedExclude, quítalo
      updatedExclude.splice(characterIndex, 1);
      showCustomNotification(
        character.name + " is now included to do " + task.task
      );
    }

    const updatedSelectedTask = { ...selectedTask, exclude: updatedExclude };

    // Actualiza la base de datos usando Dexie
    db.task
      .where("id")
      .equals(selectedTask.id)
      .modify({ exclude: updatedExclude })
      .then(() => {
        // Actualiza taskList después de la modificación
        const updatedTaskList = taskList.map((task) =>
          task.id === selectedTask.id
            ? { ...task, exclude: updatedExclude }
            : task
        );
        setTaskList(updatedTaskList);
        setSelectedTask(updatedSelectedTask);
      })
      .catch((error) => {
        showCustomNotification("Error: " + error);
      });
  };

  return (
    <>
      <div className="select-bar">
        <select className="charSelect" onChange={handleTaskSelectChange}>
          <option value={0}>Lista de tareas</option>
          {sortedTaskList.length > 0 ? (
            sortedTaskList.map((task) => (
              <option key={task.id} value={task.id}>
                {task.task}
                {task.gearscore > 0 && ", Min gearscore: " + task.gearscore}
                {task.profession !== "all" && ", Requires " + task.profession}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Sin tareas disponibles
            </option>
          )}
        </select>
        <AppButton
          variant="danger toolbarBtn"
          type="button"
          label="Limpiar lista"
          onClick={resetTaskTable}
          icono={DeleteSweepIcon}
        />
        <AppButton
          variant="primary toolbarBtn"
          type="button"
          label="Nueva tarea"
          onClick={handleNewTask}
          icono={AddCircleOutlineIcon}
        />
      </div>

      {selectedTask && (
        <Accordion className="task-list" activeKey={activeTask}>
          {taskList.map((task) => {
            if (task.id === selectedTask.id) {
              return (
                <Accordion.Item
                  key={task.id}
                  className="task-card"
                  eventKey={task.id}
                >
                  <Accordion.Header>
                    {task.task}
                    {task.gearscore > 0 && ", Min gearscore: " + task.gearscore}
                    {task.profession !== "all" &&
                      ", requires " + task.profession}
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="task-item">
                      <div className="task-info">
                        {Object.entries(task)
                          .filter(([key]) => key !== "id" && key !== "exclude")
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="task-attribute"
                              onClick={() =>
                                toggleModal("task", task, key, value)
                              }
                            >
                              <span>{capitalizeFirstLetter(key)}: </span>
                              <span>{value}</span>
                            </div>
                          ))}
                      </div>
                      <div className="task-exclude">
                        <h6>Exclude</h6>
                        <div className="exclude-list">
                          {charList.map((character) => {
                            const isEligible =
                              (selectedTask.profession === "all" ||
                                selectedTask.profession ===
                                  character.primary) &&
                              parseInt(selectedTask.gearscore) <=
                                parseInt(character.gearscore);

                            if (isEligible) {
                              return (
                                <div key={character.id}>
                                  <input
                                    type="checkbox"
                                    id={`exclude-checkbox-${character.id}`}
                                    name={`exclude-checkbox-${character.id}`}
                                    checked={selectedTask.exclude.includes(
                                      character.id
                                    )}
                                    onChange={() =>
                                      handleExcludeToggle(
                                        character,
                                        selectedTask
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`exclude-checkbox-${character.id}`}
                                  >
                                    {character.name}
                                  </label>
                                </div>
                              );
                            } else {
                              return null; // Omitir personajes que no cumplen con los requisitos
                            }
                          })}
                        </div>
                      </div>
                    </div>
                    <AppButton
                      variant="danger"
                      type="button"
                      label="Delete character"
                      onClick={() => handleDeleteTask(task.id)}
                      icono={RemoveCircleOutlineIcon}
                    />
                  </Accordion.Body>
                </Accordion.Item>
              );
            }
            return null; // Retorna null para omitir otros personajes
          })}
        </Accordion>
      )}
    </>
  );
}

export default TaskList;
