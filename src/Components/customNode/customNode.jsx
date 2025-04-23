import React, { useState, useEffect, useRef } from "react";
import { Handle } from "@xyflow/react";
import { Menu, Loader2 } from "lucide-react";
import styles from "./customNode.module.css";

const CustomNode = ({ id, data, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  const [priority, setPriority] = useState(() => {
    const storedNodes = JSON.parse(localStorage.getItem("nodes")) || [];
    const currentNode = storedNodes.find((node) => node.id === id);
    return currentNode?.data?.priority || data.priority || null;
  });

  const updateNodeData = (updates) => {
    const allNodes = JSON.parse(localStorage.getItem("nodes")) || [];
    const updatedNodes = allNodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
    );
    localStorage.setItem("nodes", JSON.stringify(updatedNodes));
    window.dispatchEvent(new Event("storage"));
  };

  const handleMakeParent = () => {
    const isNowParent = !data.isParent;
    updateNodeData({ isParent: isNowParent });
    setDropdownOpen(false);

    if (isNowParent) {
      const event = new CustomEvent("make-parent", {
        detail: { parentId: id },
      });
      window.dispatchEvent(event);
    } else {
      window.dispatchEvent(new Event("reset-view"));
    }
  };

  const handlePriority = (level) => {
    const newPriority = priority === level ? null : level;
    updateNodeData({ priority: newPriority });
    setPriority(newPriority);
    data.priority = newPriority;
    setDropdownOpen(false);
  };

  const handleSaveLabel = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(id, editValue);
      setEditPopupOpen(false);
      setDropdownOpen(false);
      setIsSaving(false);
    }, 600);
  };

  const nodeBackgroundColor =
    priority === "High"
      ? "#8B0000"
      : priority === "Low"
      ? "#008B00"
      : "#FFFFFF";

  const textColor =
    priority === "High" || priority === "Low" ? "#FFFFFF" : "#2d2d2d";

  const inputRef = useRef(null);

  useEffect(() => {
    if (editPopupOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editPopupOpen]);

  return (
    <>
      <div
        className={styles.customNode}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
        style={{
          backgroundColor: nodeBackgroundColor,
          color: textColor,
          border: `2px solid ${
            priority === "High"
              ? "#ff4d4d"
              : priority === "Low"
              ? "#4CAF50"
              : "#888"
          }`,
        }}
      >
        <Handle type="target" position="top" />
        <div
          className={styles.nodeContent}
          style={{ backgroundColor: nodeBackgroundColor }}
        >
          <span className={styles.nodeLabel}>{data.label}</span>

          {showMenu && (
            <div className={styles.menuWrapper}>
              <button
                className={styles.hamburgerBtn}
                onClick={() =>
                  requestAnimationFrame(() => setDropdownOpen((prev) => !prev))
                }
              >
                <Menu size={18} />
              </button>
            </div>
          )}
        </div>
        <Handle type="source" position="bottom" />
      </div>
      {dropdownOpen && (
        <div className={styles.dropdownMenu}>
          <div
            className={styles.dropdownItem}
            onClick={() => setEditPopupOpen(true)}
          >
            Edit
          </div>
          <div className={styles.dropdownItem} onClick={() => onDelete(id)}>
            Delete
          </div>
          <div className={styles.dropdownItem} onClick={handleMakeParent}>
            {data.isParent ? "Unset Parent" : "Make it as Parent"}
          </div>
          <div
            className={styles.dropdownItem}
            onClick={() => handlePriority("High")}
          >
            {priority === "High"
              ? "Unset High Priority"
              : "Set as High Priority"}
          </div>
          <div
            className={styles.dropdownItem}
            onClick={() => handlePriority("Low")}
          >
            {priority === "Low" ? "Unset Low Priority" : "Set as Low Priority"}
          </div>
        </div>
      )}

      {editPopupOpen && (
        <div className={styles.editPopup}>
          <div className={styles.editPopupContent}>
            <h4>Edit Node Label</h4>
            <input
              ref={inputRef}
              className={styles.editPopupInput}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className={styles.editPopupActions}>
              <button
                className={styles.popupUpdateBtn}
                onClick={handleSaveLabel}
              >
                {isSaving ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  "Update"
                )}
              </button>
              <button
                className={styles.popupCancelBtn}
                onClick={() => setEditPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomNode;
