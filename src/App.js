import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import CharList from "./CharList";
import TaskList from "./TaskList";
import AppProvider from "./AppProvider";
import AttrModal from "./AttrModal";
import TaskTable from "./TaskTable";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

function App() {
  return (
    <>
        <AppProvider>
        <Tabs
          defaultActiveKey="tabla"
          id="uncontrolled-tab-example"
        >
          <Tab eventKey="personaje" title="Personajes">
            <CharList />
          </Tab>
          <Tab eventKey="tarea" title="Tareas">
            <TaskList />
          </Tab>
          <Tab eventKey="tabla" title="Tabla">
            <TaskTable />
          </Tab>
        </Tabs>
        <AttrModal />
      </AppProvider>
    </>
  );
}

export default App;
