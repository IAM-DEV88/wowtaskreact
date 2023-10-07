import { useAppContext } from "./AppProvider";
import Accordion from "react-bootstrap/Accordion";
import AppButton from "./AppButton";
import axios from "axios";

function TaskList() {
  const {
    charList,
    taskList,
    loadTaskList,
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
    const selectedId = e.target.value;
    if (selectedId === 0) {
      setSelectedTask(null);
    } else {
      const selected = sortedTaskList.find((task) => task._id === selectedId);
      setSelectedTask(selected);
    }
  };

  const handleNewTask = async () => {
    try {
      const response = await axios.post(`/api/newtask`);
      if (response.status === 201) {
        const updatedTaskList = await loadTaskList();
        const newTask = response.data.newTask;
        const foundTask = updatedTaskList.find((task) => task._id === newTask);
        setSelectedTask(foundTask);
        setActiveTask(foundTask);
      }
      showCustomNotification(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("¿Delete task?");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`/api/deletetask/${taskId}`);
        if (response.status === 201) {
          const updatedTaskList = await loadTaskList();
          setTaskList(updatedTaskList);
          setSelectedTask(null);
          setActiveTask(null);
        }
        showCustomNotification(response.data.message);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const resetTaskTable = async () => {
    const isConfirmed = window.confirm("¿Delete all tasks?");
    if (isConfirmed) {
      try {
        const response = await axios.delete("/api/deletetasks");
        if (response.status === 201) {
          const updatedTaskList = await loadTaskList();
          setTaskList(updatedTaskList);
        }
        showCustomNotification(response.data.message);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleExcludeToggle = async (character, task) => {
    const updatedExclude = [...task.exclude];
    const characterIndex = updatedExclude.indexOf(character._id);
    if (characterIndex === -1) {
      updatedExclude.push(character._id);
      showCustomNotification(
        character.name + " is now excluded to do " + task.task
      );
    } else {
      updatedExclude.splice(characterIndex, 1);
      showCustomNotification(
        character.name + " is now included to do " + task.task
      );
    }
    const updatedSelectedTask = { ...selectedTask, exclude: updatedExclude };
    try {
      const response = await axios.post(
        `/api/task/${selectedTask._id}`,
        updatedExclude
      );
      if (response.status === 201) {
        const updatedTaskList = await loadTaskList();
        setTaskList(updatedTaskList);
        setSelectedTask(updatedSelectedTask);
      }
      showCustomNotification(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="select-bar">
        <select className="charSelect" onChange={handleTaskSelectChange}>
          <option value={0}>Lista de tareas</option>
          {sortedTaskList.length > 0 ? (
            sortedTaskList.map((task) => (
              <option key={task._id} value={task._id}>
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
            if (task._id === selectedTask._id) {
              return (
                <Accordion.Item
                  key={task._id}
                  className="task-card"
                  eventKey={task._id}
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
                          .filter(([key]) => key !== "_id" && key !== "exclude")
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
                                <div key={character._id}>
                                  <input
                                    type="checkbox"
                                    id={`exclude-checkbox-${character._id}`}
                                    name={`exclude-checkbox-${character._id}`}
                                    checked={selectedTask.exclude.includes(
                                      character._id
                                    )}
                                    onChange={() =>
                                      handleExcludeToggle(
                                        character,
                                        selectedTask
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`exclude-checkbox-${character._id}`}
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
                      onClick={() => handleDeleteTask(task._id)}
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
