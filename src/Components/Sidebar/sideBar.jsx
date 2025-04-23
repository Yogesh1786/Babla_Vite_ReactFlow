import React from "react";
import { useDnD } from "../dndContext/DnDContext";
import styles from "./sidebar.module.css";

const Sidebar = () => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Toolbox</h2>
      <p className={styles.description}>
        Drag and drop a node onto the canvas.
      </p>

      <div
        className={`${styles.dndnode} ${styles.input}`}
        onDragStart={(event) => onDragStart(event, "input")}
        draggable
      >
        Input Node
      </div>
    
      <div
        className={styles.dndnode}
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default Node
      </div>

      <div
        className={`${styles.dndnode} ${styles.output}`}
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output Node
      </div>
    </aside>
  );
};

export default Sidebar;
