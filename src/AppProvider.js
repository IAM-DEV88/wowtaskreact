import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [charList, setCharList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [editedAttr, setEditedAttr] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [pendingTasks, setPendingTasks] = useState(0);
  const [markedTasks, setMarkedTasks] = useState([]);
  const [activeChar, setActiveChar] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    axios
      .get("/api/character")
      .then((response) => {
        const data = response.data; // Obtiene los datos de la respuesta
        if (data.length === 0) {
          // Si no hay datos, realiza alguna acción, como establecer charList en un array vacío.
          setCharList([]);
        } else {
          // Si hay datos, establece charList con los datos obtenidos.
          setCharList(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Maneja cualquier error que ocurra durante la solicitud.
      });

    axios
      .get("/api/task")
      .then((response) => {
        const data = response.data; // Obtiene los datos de la respuesta
        if (data.length === 0) {
          // Si no hay datos, realiza alguna acción, como establecer charList en un array vacío.
          setTaskList([]);
        } else {
          // Si hay datos, establece charList con los datos obtenidos.
          setTaskList(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Maneja cualquier error que ocurra durante la solicitud.
      });
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const toggleModal = useCallback(
    (mode, data, key, value) => {
      setShowModal(!showModal);
      setModalMode(mode);
      switch (mode) {
        case "task":
          setSelectedTask(data);
          break;
        case "char":
          setSelectedChar(data);
          break;
        default:
          break;
      }

      setEditedAttr(key);
      setEditedValue(value);
    },
    [showModal]
  );

  const closeModal = () => {
    setShowModal(false);
    setModalMode(null);
    setSelectedTask(selectedTask);
    setSelectedChar(selectedChar);
  };

  const showCustomNotification = (message) => {
    setCustomMessage(message);
    setShowNotification(true);
  };

  const handleTaskCheck = async (charId, taskId) => {
    const character = charList.find((character) => character._id === charId);

    if (!character) {
      console.error("Character not found");
      return;
    }

    const updatedDone = [...character.completed];
    const taskIndex = updatedDone.indexOf(taskId);

    if (taskIndex !== -1) {
      updatedDone.splice(taskIndex, 1);
    } else {
      updatedDone.push(taskId);
    }

    try {
      const response = await axios.post(
        `/api/character/${charId}`,
        updatedDone
      );

      if (response.data.message === "Character updated") {
        loadCharacterList();
      }
    } catch (error) {
      console.error("Error en la solicitud de actualización:", error);
    }
  };

  useEffect(() => {
    if (selectedChar) {
      setActiveChar(selectedChar._id);
    }
    if (selectedTask) {
      setActiveTask(selectedTask._id);
    }
  }, [selectedChar, selectedTask]);

  useEffect(() => {
    const countEnabledTasksForCharacters = () => {
      const enabledTasksCounts = charList.map((character) => {
        const enabledTasksCount = taskList.reduce((count, task) => {
          if (
            (task.profession === "all" ||
              task.profession === character.primary) &&
            parseInt(task.gearscore) <= parseInt(character.gearscore) &&
            !task.exclude.includes(character._id)
          ) {
            count++;
          }
          return count;
        }, 0);
        return enabledTasksCount;
      });

      // Use reduce to calculate the sum of all enabledTasksCount values
      const sumOfEnabledTasksCounts = enabledTasksCounts.reduce(
        (sum, count) => sum + count,
        0
      );

      return sumOfEnabledTasksCounts;
    };

    const countCompletedTasksForCharacter = (characterId) => {
      const character = charList.find((char) => char._id === characterId);
      if (!character) return 0;

      return character.completed.length;
    };

    const countCompletedTasksForAllCharacters = () => {
      const totalCompletedTasks = charList.reduce((total, character) => {
        const completedTasksCount = countCompletedTasksForCharacter(
          character._id
        );
        return total + completedTasksCount;
      }, 0);

      return totalCompletedTasks;
    };

    const enabledTasksCounts = countEnabledTasksForCharacters();
    const markedTasksCount = countCompletedTasksForAllCharacters();

    setPendingTasks(enabledTasksCounts - markedTasksCount);
    setMarkedTasks(markedTasksCount);
  }, [charList, taskList]);

  const loadCharacterList = async () => {
    try {
      const response = await axios.get("/api/character");
      const data = response.data;
  
      if (data.length === 0) {
        setCharList([]);
      } else {
        setCharList(data);
      }
  
      return data; // Devuelve los datos cargados
    } catch (error) {
      showCustomNotification("Error:", error);
      throw error; // Lanza el error para que se maneje en el lugar donde se llama a loadCharacterList si es necesario.
    }
  };
  

  const loadTaskList = async () => {
    try {
      const response = await axios.get("/api/task");
      const data = response.data;
  
      if (data.length === 0) {
        setTaskList([]);
      } else {
        setTaskList(data);
      }
  
      return data; // Devuelve los datos cargados
    } catch (error) {
      showCustomNotification("Error:", error);
      throw error; // Lanza el error para que se maneje en el lugar donde se llama a loadCharacterList si es necesario.
    }
  };

  const sharedState = {
    loadCharacterList,
    loadTaskList,
    charList,
    setCharList,
    activeChar,
    setActiveChar,
    activeTask,
    setActiveTask,
    selectedChar,
    setSelectedChar,
    selectedTask,
    setSelectedTask,
    capitalizeFirstLetter,
    toggleModal,
    showModal,
    modalMode,
    closeModal,
    editedAttr,
    setEditedAttr,
    editedValue,
    setEditedValue,
    showNotification,
    setShowNotification,
    customMessage,
    setCustomMessage,
    showCustomNotification,
    taskList,
    setTaskList,
    pendingTasks,
    setPendingTasks,
    markedTasks,
    handleTaskCheck,
    AddCircleOutlineIcon,
    RemoveCircleOutlineIcon,
    DeleteSweepIcon,
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe utilizarse dentro de un AppProvider");
  }
  return context;
};

export default AppProvider;
