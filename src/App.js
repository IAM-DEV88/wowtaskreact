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
          defaultActiveKey="character"
          id="wowtask-tab"
        >
          <Tab eventKey="character" title="Characters">
            <CharList />
          </Tab>
          <Tab eventKey="task" title="Tasks">
            <TaskList />
          </Tab>
          <Tab eventKey="table" title="Table">
            <TaskTable />
          </Tab>
        </Tabs>
        <AttrModal />
      </AppProvider>
    </>
  );
}

export default App;
