import React from "react";
import { AppContainer } from "../../common/components/AppContainer";
import { FieldManager } from "./components/FieldManager";
import { WorkItemFinder } from "./components/WorkItemFinder";

const App: React.FC = () => {
  return (
    <AppContainer>
      <FieldManager />
      <WorkItemFinder />
    </AppContainer>
  );
};

export default App;
