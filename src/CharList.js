import AppButton from "./AppButton";
import { useAppContext } from "./AppProvider";
import Accordion from "react-bootstrap/Accordion";

function CharList() {
  const {
    db,
    charList, setCharList,
    selectedChar, setSelectedChar,
    activeChar, setActiveChar,
    showCustomNotification,
    toggleModal,
    capitalizeFirstLetter,
    taskList,
    handleTaskCheck,
    AddCircleOutlineIcon,
    RemoveCircleOutlineIcon,
    DeleteSweepIcon,
  } = useAppContext();

  const sortedCharList = [...charList].sort((a, b) => b.gearscore - a.gearscore);

  const handleCharacterSelectChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    if (selectedId === 0) {
      setSelectedChar(null);
    } else {
      const selected = sortedCharList.find((char) => char.id === selectedId);
      setSelectedChar(selected);
    }
  };

  const calculatePendingTasks = (character) => {
    return taskList.filter(
      (task) =>
        (task.profession === "all" || task.profession === character.primary) &&
        parseInt(task.gearscore) <= parseInt(character.gearscore) &&
        !character.done.includes(task.id) &&
        !task.exclude.includes(character.id)
    ).length;
  };

  const handleNewChar = () => {
    const template = {
      level: 0,
      name: "New character",
      race: "race",
      class: "class",
      mainspec: "build",
      gearscore: 0,
      primary: "profession",
      secondary: "profession",
      done: [],
    };

    db.character
    .add(template)
    .then((id) => {
      setCharList((prevList) => [...prevList, { id, ...template }]);
      setActiveChar({ id, ...template })
      setSelectedChar({ id, ...template })
      showCustomNotification("New character created");
    })
    .catch((error) => {
      showCustomNotification("Error: "+ error);
    });
  };

  const handleDeleteChar = (id) => {
    const isConfirmed = window.confirm(
      "¿Delete character?"
    );

    if (isConfirmed) {
      db.character
        .where("id")
        .equals(id)
        .delete()
        .then(() => {
          setCharList((prevList) => prevList.filter((item) => item.id !== id));
          showCustomNotification("Character deleted");
        });
    }
  };

  const resetCharList = async () => {
    const isConfirmed = window.confirm(
      "¿Delete task?"
    );

    if (isConfirmed) {
    try {
      await db.table("character").clear();

      showCustomNotification("Character list cleared");

      const newData = await db.character.toArray();
      setCharList(newData);
    } catch (error) {
      showCustomNotification("Error clearing list", error);
    }
  }

  };

  return (
    <>
      <div className="select-bar">
        <select className="charSelect" onChange={handleCharacterSelectChange}>
          <option value={0}>Lista de personajes</option>
          {sortedCharList.length > 0 ? (
            sortedCharList.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name},{" "}{character.class} {character.mainspec}{" "}
                    {character.gearscore}, {character.race} Nivel {character.level} {calculatePendingTasks(character) > 0 && ('('+calculatePendingTasks(character) + ' Pendientes)')}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Sin personajes disponibles
            </option>
          )}
        </select>
        <AppButton
          variant="danger toolbarBtn"
          type="button"
          label="Limpiar lista"
          onClick={resetCharList}
          icono={DeleteSweepIcon}
        />
        <AppButton
          variant="primary toolbarBtn"
          type="button"
          label="Nuevo Personaje"
          onClick={handleNewChar}
          icono={AddCircleOutlineIcon}
        />
      </div>
      {selectedChar && (
        <Accordion className="character-list" activeKey={activeChar}>
          {charList.map((char) => {
            if (char.id === selectedChar.id) {
              return (
                <Accordion.Item key={char.id} eventKey={char.id}>
                  <Accordion.Header>
                    {char.name},{" "}{char.class} {char.mainspec}{" "}
                    {char.gearscore}, {char.race} Nivel {char.level} {calculatePendingTasks(char) > 0 && ('('+calculatePendingTasks(char) + ' Pendientes)')}
                  </Accordion.Header>
                  <Accordion.Body className="character">
                    <div className="character-card">
                      <div className="character-info">
                        {Object.entries(char)
                          .filter(([key]) => key !== "id" && key !== "done")
                          .map(([key, value]) => {
                            const displayKey =
                              key === "primaria" || key === "secundaria"
                                ? "Prof. " + key
                                : key;
                            return (
                              <div
                                key={key}
                                onClick={() => toggleModal("char", char, key, value)}
                              >
                                <span className="character-attribute">
                                  {capitalizeFirstLetter(displayKey)}:{" "}
                                </span>
                                <span>{value}</span>
                              </div>
                            );
                          })}
                      </div>
                      <div>
                        <h6>Pending:</h6>
                        <div className="pending-task">
                          {taskList.map((task) => {
                            const isPendingTask =
                              (task.profession === "all" ||
                                task.profession === char.primary) &&
                              parseInt(task.gearscore) <= parseInt(char.gearscore) &&
                              !char.done.includes(task.id) && !task.exclude.includes(char.id);

                            if (isPendingTask) {
                              return (
                                <div key={task.id}>
                                  <input
                                    type="checkbox"
                                    id={char.id + "_" + task.id}
                                    onChange={() => handleTaskCheck(char.id, task.id)}
                                  />
                                  <label htmlFor={char.id + "_" + task.id}>
                                    {task.task}
                                  </label>
                                </div>
                              );
                            }
                            return null;
                          })}

                        </div>
                      </div>
                      <div>
                        <h6>Completed:</h6>
                        <div className="completed-task">
                        {char.done.map((taskId) => {
                          const completedTask = taskList.find((task) => task.id === taskId);
                          if (completedTask) {
                            return (
                              <div key={completedTask.id}>
                                <input
                                  type="checkbox"
                                  id={char.id + "_" + completedTask.id}
                                  checked
                                  onChange={() => handleTaskCheck(char.id, completedTask.id)}
                                />
                                <label htmlFor={char.id + "_" + completedTask.id}>
                                  {completedTask.task}
                                </label>
                              </div>
                            );
                          }
                          return null;
                        })}
                        </div>
                      </div>
                    </div>
                    <AppButton
                      variant="danger toolbarBtn"
                      type="button"
                      label="Limpiar lista"
                      onClick={() => handleDeleteChar(char.id)}
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

export default CharList;
