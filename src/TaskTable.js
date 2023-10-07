import { useAppContext } from "./AppProvider";
import axios from "axios";

function TaskTable() {
  const {
    loadCharacterList,
    showCustomNotification,
    charList,
    setCharList,
    taskList,
    handleTaskCheck,
    pendingTasks,
    markedTasks,
    toggleModal,
  } = useAppContext();

  // Sort the task list by gearscore (highest to lowest) and then by level (highest to lowest)
  const sortedCharList = [...charList].sort((a, b) => {
    if (b.gearscore !== a.gearscore) {
      return b.gearscore - a.gearscore;
    }
    // Si los gearscores son iguales, compara por level
    return a.level - b.level;
  });
  // Sort the task list by gearscore (highest to lowest)
  const sortedTaskList = [...taskList].sort(
    (a, b) => a.gearscore - b.gearscore
  );

  const handleCharacterCheck = async (characterId) => {
    try {
      const character = charList.find((char) => char._id === characterId);
      const updatedDone = [...character.completed]; // Create a copy of the character's completed array
      for (const task of taskList) {
        if (
          (task.profession === "all" || task.profession === character.primary) &&
          parseInt(task.gearscore) <= parseInt(character.gearscore) &&
          !task.exclude.includes(character._id)
        ) {
          const taskIndex = updatedDone.indexOf(task._id);
          if (taskIndex !== -1) {
            // Si ya está marcada, la desmarcamos
            updatedDone.splice(taskIndex, 1);
          } else {
            // Si no está marcada, la marcamos
            updatedDone.push(task._id);
          }
        }
      }
      const response = await axios.post(`/api/character/${character._id}`, updatedDone);
      if (response.status === 200) {
        const updatedCharList = await loadCharacterList();
        setCharList(updatedCharList);
      }
      showCustomNotification(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleTaskCheckAllCharacters = (taskId) => {
    const task = taskList.find((task) => task._id === taskId);
    charList.forEach(async (character) => {
      if (
        (task.profession === "all" || task.profession === character.primary) &&
        parseInt(task.gearscore) <= parseInt(character.gearscore) &&
        !task.exclude.includes(character._id)
      ) {
        if (character.completed.includes(taskId)) {
          const taskIndex = character.completed.indexOf(taskId);
          if (taskIndex !== -1) {
            character.completed.splice(taskIndex, 1);
          }
        } else {
          character.completed.push(taskId);
        }
        const updatedDone = character.completed;
        try {
          const response = await axios.post(`/api/character/${character._id}`, updatedDone);
  
          if (response.status === 200) {
            const updatedCharList = await loadCharacterList();
            setCharList(updatedCharList);
          }
          showCustomNotification(response.data.message);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  };

  const isTaskFullfilled = (task) => {
    // Filtrar la lista de personajes que cumplen los requisitos para la tarea
  const eligibleCharacters = sortedCharList.filter((character) => (
    (task.profession === "all" || task.profession === character.primary) &&
    parseInt(task.gearscore) <= parseInt(character.gearscore) &&
    !task.exclude.includes(character._id)
  ));

  // Verificar si la tarea está marcada en todos los personajes elegibles
  const taskIsMarkedInAllCharacters = eligibleCharacters.every((character) => (
    character.completed.includes(task._id)
  ));

  return taskIsMarkedInAllCharacters;
  }

  const isCharFullfilled = (character) => {
    const eligibleTasks = sortedTaskList.filter((task) => (
      (task.profession === "all" || task.profession === character.primary) &&
      parseInt(task.gearscore) <= parseInt(character.gearscore) &&
      !task.exclude.includes(character._id)
    ));
  
    const allTasksMarked = eligibleTasks.every((task) => (
      character.completed.includes(task._id)
    ));
  
    return allTasksMarked;
  }

  return (
    <div>
      <table className="tabla-tareas">
        <thead>
          <tr>
            <th>
              Task
              <div>Pending: {pendingTasks}</div>
              <div>Completed: {markedTasks}</div>
            </th>
            {sortedCharList.map((character) => (
              <th className="char-cell" key={character._id}>
                <input
                  type="checkbox"
                  id={"char-cell" + character._id}
                  checked={isCharFullfilled(character)}
                  onChange={() => handleCharacterCheck(character._id)}
                />
                <label htmlFor={"char-cell" + character._id}>
                  {character.name}
                </label>
                <div
                  onClick={() =>
                    toggleModal("char", character, "level", character.level)
                  }
                >
                  Lvl. {character.level}
                </div>
                <div
                  onClick={() =>
                    toggleModal(
                      "char",
                      character,
                      "gearscore",
                      character.gearscore
                    )
                  }
                >
                  ({character.gearscore})
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTaskList.map((task) => (
            <tr key={task._id}>
              <td className="task-cell">
                <input
                  type="checkbox"
                  id={"task-cell" + task._id}
                  checked={isTaskFullfilled(task)}
                  onChange={() => handleTaskCheckAllCharacters(task._id)}
                />
                <label htmlFor={"task-cell" + task._id}>{task.task}</label>
              </td>
              {sortedCharList.map((character) => (
                <td className="check" key={character._id}>
                  {(task.profession === "all" ||
                    task.profession === character.primary) &&
                  parseInt(task.gearscore) <= parseInt(character.gearscore) &&
                  !task.exclude.includes(character._id) ? (
                    <input
                      type="checkbox"
                      checked={character.completed.includes(task._id)}
                      onChange={() => {
                        handleTaskCheck(character._id, task._id);
                      }}
                    />
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div></div>
    </div>
  );
}

export default TaskTable;
