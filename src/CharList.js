import AppButton from "./AppButton";
import { useAppContext } from "./AppProvider";
import Accordion from "react-bootstrap/Accordion";
import axios from "axios";

function CharList() {
  const {
    charList,
    loadCharacterList,
    // loadTaskList,
    setCharList,
    selectedChar,
    setSelectedChar,
    activeChar,
    setActiveChar,
    showCustomNotification,
    toggleModal,
    capitalizeFirstLetter,
    taskList,
    handleTaskCheck,
    AddCircleOutlineIcon,
    RemoveCircleOutlineIcon,
    DeleteSweepIcon,
  } = useAppContext();

  const sortedCharList = [...charList].sort(
    (a, b) => b.gearscore - a.gearscore
  );

  const handleCharacterSelectChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === 0) {
      setSelectedChar(null);
    } else {
      const selected = sortedCharList.find((char) => char._id === selectedId);
      setSelectedChar(selected);
    }
  };

  const calculatePendingTasks = (character) => {
    return taskList.filter(
      (task) =>
        (task.profession === "all" || task.profession === character.primary) &&
        parseInt(task.gearscore) <= parseInt(character.gearscore) &&
        !character.completed.includes(task._id) &&
        !task.exclude.includes(character._id)
    ).length;
  };

  const handleNewChar = async () => {
    try {
      const response = await axios.post(`/api/newcharacter`);
      if (response.status === 201) {
        const updatedCharList = await loadCharacterList();
        const activeCharacter = response.data.newCharacter;
        const foundCharacter = updatedCharList.find(
          (char) => char._id === activeCharacter
        );
        setSelectedChar(foundCharacter);
        setActiveChar(foundCharacter);
      }
      showCustomNotification(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteChar = async (characterId) => {
    const isConfirmed = window.confirm("¿Delete character?");
    if (isConfirmed) {
      try {
        const response = await axios.delete(
          `/api/deletecharacter/${characterId}`
        );
        if (response.status === 201) {
          const updatedCharList = await loadCharacterList();
          setCharList(updatedCharList);
          setSelectedChar(null);
          setActiveChar(null);
        }
        showCustomNotification(response.data.message);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const resetCharList = async () => {
    try {
      const response = await axios.delete("/api/deletecharacters");
      if (response.status === 200) {
        const updatedCharList = await loadCharacterList();
        setCharList(updatedCharList);
      }
      showCustomNotification(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="select-bar">
        <select className="charSelect" onChange={handleCharacterSelectChange}>
          <option value={0}>Lista de personajes</option>
          {sortedCharList.length > 0 ? (
            sortedCharList.map((character) => (
              <option key={character._id} value={character._id}>
                {character.name}, {character.class} {character.mainspec}{" "}
                {character.gearscore}, {character.race} Nivel {character.level}{" "}
                {calculatePendingTasks(character) > 0 &&
                  "(" + calculatePendingTasks(character) + " Pendientes)"}
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
            if (char._id === selectedChar._id) {
              return (
                <Accordion.Item key={char._id} eventKey={char._id}>
                  <Accordion.Header>
                    {char.name}, {char.class} {char.mainspec} {char.gearscore},{" "}
                    {char.race} Nivel {char.level}{" "}
                    {calculatePendingTasks(char) > 0 &&
                      "(" + calculatePendingTasks(char) + " Pendientes)"}
                  </Accordion.Header>
                  <Accordion.Body className="character">
                    <div className="character-card">
                      <div className="character-info">
                        {Object.entries(char)
                          .filter(
                            ([key]) => key !== "_id" && key !== "completed"
                          )
                          .map(([key, value]) => {
                            const displayKey =
                              key === "primaria" || key === "secundaria"
                                ? "Prof. " + key
                                : key;
                            return (
                              <div
                                key={key}
                                onClick={() =>
                                  toggleModal("char", char, key, value)
                                }
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
                              parseInt(task.gearscore) <=
                                parseInt(char.gearscore) &&
                              !char.completed.includes(task._id) &&
                              !task.exclude.includes(char._id);

                            if (isPendingTask) {
                              return (
                                <div key={task._id}>
                                  <input
                                    type="checkbox"
                                    id={char._id + "_" + task._id}
                                    onChange={() =>
                                      handleTaskCheck(char._id, task._id)
                                    }
                                  />
                                  <label htmlFor={char._id + "_" + task._id}>
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
                          {char.completed.map((taskId) => {
                            const completedTask = taskList.find(
                              (task) => task._id === taskId
                            );
                            if (completedTask) {
                              return (
                                <div key={completedTask._id}>
                                  <input
                                    type="checkbox"
                                    id={char._id + "_" + completedTask._id}
                                    checked
                                    onChange={() =>
                                      handleTaskCheck(
                                        char._id,
                                        completedTask._id
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={char._id + "_" + completedTask._id}
                                  >
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
                      onClick={() => handleDeleteChar(char._id)}
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
