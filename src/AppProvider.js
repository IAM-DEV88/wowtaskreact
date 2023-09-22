import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import db from "./Database";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

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
    db.character.toArray().then((data) => {
      if (data.length === 0) {
        db.character.bulkAdd([]).then(() => {
          setCharList([]);
        });
      } else {
        setCharList(data);
      }
    });

    db.task.toArray().then((data) => {
      if (data.length === 0) {
        db.task.bulkAdd([]).then(() => {
          setTaskList([]);
        });
      } else {
        setTaskList(data);
      }
    });
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const toggleModal = useCallback((mode, data, key, value) => {
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
  }, [showModal]);

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

  const handleTaskCheck = (charId, taskId) => {
    const character = charList.find((character) => character.id === charId);
  
    if (!character) {
      console.error("Character not found");
      return;
    }

    const updatedDone = [...character.done];
    const taskIndex = updatedDone.indexOf(taskId);

    if (taskIndex !== -1) {
      updatedDone.splice(taskIndex, 1);
    } else {
      updatedDone.push(taskId);
    }

    db.character
      .where("id")
      .equals(charId)
      .modify({ done: updatedDone })
      .then(() => {
        const updatedCharList = charList.map((char) =>
          char.id === charId ? { ...char, done: updatedDone } : char
        );
        setCharList(updatedCharList);
      })
      .catch((error) => {
        console.error("Error updating task status", error);
      });
  };

  useEffect(() => {
    if (selectedChar) {
      setActiveChar(selectedChar.id);
    }
    if (selectedTask) {
      setActiveTask(selectedTask.id);
    }
  }, [selectedChar, selectedTask]);

  useEffect(() => {
    const countEnabledTasksForCharacters = () => {
      const enabledTasksCounts = charList.map((character) => {
        const enabledTasksCount = taskList.reduce((count, task) => {
          if (
            (task.profession === "all" || task.profession === character.primary) &&
            parseInt(task.gearscore) <= parseInt(character.gearscore) &&
             !task.exclude.includes(character.id)
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
      const character = charList.find((char) => char.id === characterId);
      if (!character) return 0;
  
      return character.done.length;
    };
  
    const countCompletedTasksForAllCharacters = () => {
      const totalCompletedTasks = charList.reduce((total, character) => {
        const completedTasksCount = countCompletedTasksForCharacter(character.id);
        return total + completedTasksCount;
      }, 0);
  
      return totalCompletedTasks;
    };
  
    const enabledTasksCounts = countEnabledTasksForCharacters();
    const markedTasksCount = countCompletedTasksForAllCharacters();
  
    setPendingTasks(enabledTasksCounts - markedTasksCount);
    setMarkedTasks(markedTasksCount);
  }, [charList, taskList]);
  
  const sharedState = {
    db,
    charList, setCharList,
    activeChar, setActiveChar,
    activeTask, setActiveTask,
    selectedChar, setSelectedChar,
    selectedTask, setSelectedTask,
    capitalizeFirstLetter,
    toggleModal, showModal, modalMode, closeModal,
    editedAttr, setEditedAttr,
    editedValue, setEditedValue,
    showNotification, setShowNotification,
    customMessage, setCustomMessage,
    showCustomNotification,
    taskList, setTaskList,
    pendingTasks, setPendingTasks,
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
