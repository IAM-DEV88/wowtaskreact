import { useAppContext } from "./AppProvider";

function TaskTable() {
  const {
    db,
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

  const handleCharacterCheck = (characterId) => {
    const character = charList.find((char) => char.id === characterId);

    if (!character) {
      console.error("Character not found");
      return;
    }

    const updatedDone = character.done.slice(); // Create a copy of the character's done array

    // Recorrer taskList y marcar o desmarcar tareas según el criterio
    taskList.forEach((task) => {
      if (
        (task.profession === "all" || task.profession === character.primary) &&
                          parseInt(task.gearscore) <= parseInt(character.gearscore) &&
        !task.exclude.includes(character.id)
      ) {
        const taskIndex = updatedDone.indexOf(task.id);

        if (taskIndex !== -1) {
          // Si ya está marcada, la desmarcamos
          updatedDone.splice(taskIndex, 1);
        } else {
          // Si no está marcada, la marcamos
          updatedDone.push(task.id);
        }
      }
    });

    db.character
      .where("id")
      .equals(characterId)
      .modify({ done: updatedDone })
      .then(() => {
        const updatedCharList = charList.map((char) =>
          char.id === characterId ? { ...char, done: updatedDone } : char
        );
        setCharList(updatedCharList);
      })
      .catch((error) => {
        console.error("Error updating task status", error);
      });
  };

  const handleTaskCheckAllCharacters = (taskId) => {
    const task = taskList.find((task) => task.id === taskId);

    charList.forEach((character) => {
      if (
        (task.profession === "all" || task.profession === character.primary) &&
                          parseInt(task.gearscore) <= parseInt(character.gearscore) &&
        !task.exclude.includes(character.id)
      ) {
        if (character.done.includes(taskId)) {
          const taskIndex = character.done.indexOf(taskId);
          if (taskIndex !== -1) {
            character.done.splice(taskIndex, 1);
          }
        } else {
          character.done.push(taskId);
        }

        db.character
          .where("id")
          .equals(character.id)
          .modify({ done: character.done })
          .then(() => {
            const updatedCharList = charList.map((char) =>
              char.id === character.id
                ? { ...char, done: character.done }
                : char
            );
            setCharList(updatedCharList);
          })
          .catch((error) => {
            console.error("Error updating task status", error);
          });
      }
    });
  };

  const isTaskFullfilled = (task) => {
    // Filtrar la lista de personajes que cumplen los requisitos para la tarea
  const eligibleCharacters = sortedCharList.filter((character) => (
    (task.profession === "all" || task.profession === character.primary) &&
    parseInt(task.gearscore) <= parseInt(character.gearscore) &&
    !task.exclude.includes(character.id)
  ));

  // Verificar si la tarea está marcada en todos los personajes elegibles
  const taskIsMarkedInAllCharacters = eligibleCharacters.every((character) => (
    character.done.includes(task.id)
  ));

  return taskIsMarkedInAllCharacters;
  }

  const isCharFullfilled = (character) => {
    const eligibleTasks = sortedTaskList.filter((task) => (
      (task.profession === "all" || task.profession === character.primary) &&
      parseInt(task.gearscore) <= parseInt(character.gearscore) &&
      !task.exclude.includes(character.id)
    ));
  
    const allTasksMarked = eligibleTasks.every((task) => (
      character.done.includes(task.id)
    ));
  
    return allTasksMarked;
  }

  return (
    <div>
      <table className="tabla-tareas">
        <thead>
          <tr>
            <th>
              Tarea
              <div>Pendientes: {pendingTasks}</div>
              <div>Marcadas: {markedTasks}</div>
            </th>
            {sortedCharList.map((character) => (
              <th className="char-cell" key={character.id}>
                <input
                  type="checkbox"
                  id={"char-cell" + character.id}
                  checked={isCharFullfilled(character)}
                  onChange={() => handleCharacterCheck(character.id)}
                />
                <label htmlFor={"char-cell" + character.id}>
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
            <tr key={task.id}>
              <td className="task-cell">
                <input
                  type="checkbox"
                  id={"task-cell" + task.id}
                  checked={isTaskFullfilled(task)}
                  onChange={() => handleTaskCheckAllCharacters(task.id)}
                />
                <label htmlFor={"task-cell" + task.id}>{task.task}</label>
              </td>
              {sortedCharList.map((character) => (
                <td className="check" key={character.id}>
                  {(task.profession === "all" ||
                    task.profession === character.primary) &&
                  parseInt(task.gearscore) <= parseInt(character.gearscore) &&
                  !task.exclude.includes(character.id) ? (
                    <input
                      type="checkbox"
                      checked={character.done.includes(task.id)}
                      onChange={() => {
                        handleTaskCheck(character.id, task.id);
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
