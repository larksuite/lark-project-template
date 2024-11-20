import React from "react";
import { createRoot } from "react-dom/client";
import "./index.less";
import { Entry, FieldManager } from "../../component";
import { Filter } from "../../component/filter";

// The entry file for tab.
const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <>
    <Entry>
      <FieldManager />
      <Filter />
    </Entry>
  </>
);
