import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  File as FileIcon,
  Folder,
  Send,
  Save,
  X,
  MoreVertical,
  Upload,
  Download,
  Plus,
  MinusSquare,
  Trash2,
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CodeEditor from "@uiw/react-textarea-code-editor";
import JSZip from "jszip";

interface ScriptEditorProps {
  script: {
    id: string;
    name: string;
    framework: string;
  };
  onClose: () => void;
}

interface FileStructure {
  [key: string]: {
    type: "file" | "folder";
    content?: string;
    children?: FileStructure;
  };
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ script, onClose }) => {
  const [fileStructure, setFileStructure] = useState<FileStructure>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchScriptContent = async () => {
      const docRef = doc(db, "scripts", script.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFileStructure(docSnap.data().fileStructure || {});
      }
    };
    fetchScriptContent();
  }, [script.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiResponses]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const file = getFileFromPath(filePath, fileStructure);
    if (file && file.type === "file") {
      setFileContent(file.content || "");
    }
  };

  const getFileFromPath = (path: string, structure: FileStructure): any => {
    const parts = path.split("/");
    let current: any = structure;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
        if (current.type === "folder" && current.children) {
          current = current.children;
        }
      } else {
        return null;
      }
    }
    return current;
  };

  const handleSave = async () => {
    if (selectedFile) {
      const updatedStructure = { ...fileStructure };
      const file = getFileFromPath(selectedFile, updatedStructure);
      if (file && file.type === "file") {
        file.content = fileContent;
      }
      await updateFileStructure(updatedStructure);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const updateFileStructure = async (newStructure: FileStructure) => {
    setFileStructure(newStructure);
    const docRef = doc(db, "scripts", script.id);
    await updateDoc(docRef, { fileStructure: newStructure });
  };

  const createItem = (name: string, type: "file" | "folder") => {
    const newStructure = { ...fileStructure };
    let current = newStructure;
    const pathParts = currentPath.split("/").filter(Boolean);

    for (const part of pathParts) {
      if (current[part] && current[part].type === "folder") {
        current = current[part].children!;
      } else {
        console.error("Invalid path");
        return;
      }
    }

    if (type === "file") {
      current[name] = { type: "file", content: "" };
    } else {
      current[name] = { type: "folder", children: {} };
    }

    updateFileStructure(newStructure);
    setNewItemName("");
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const handleCreateFile = () => {
    setIsCreatingFile(true);
    setIsMenuOpen(false);
    setTimeout(() => newItemInputRef.current?.focus(), 0);
  };

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setIsMenuOpen(false);
    setTimeout(() => newItemInputRef.current?.focus(), 0);
  };

  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      if (isCreatingFile) {
        createItem(newItemName.trim(), "file");
      } else if (isCreatingFolder) {
        createItem(newItemName.trim(), "folder");
      }
    }
  };

  const handleDeleteItem = (path: string) => {
    const newStructure = { ...fileStructure };
    let current = newStructure;
    const parts = path.split("/");
    const itemName = parts.pop()!;

    for (const part of parts) {
      if (current[part] && current[part].type === "folder") {
        current = current[part].children!;
      } else {
        console.error("Invalid path");
        return;
      }
    }

    delete current[itemName];
    updateFileStructure(newStructure);
    if (selectedFile === path) {
      setSelectedFile(null);
      setFileContent("");
    }
  };

  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.stopPropagation();
    setDraggedItem(path);
  };

  const handleDragOver = (e: React.DragEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const newStructure = { ...fileStructure };
    const sourcePath = draggedItem;

    // Don't do anything if dropping onto itself
    if (sourcePath === targetPath) {
      setDraggedItem(null);
      return;
    }

    // Get the source item
    const sourceItem = getFileFromPath(sourcePath, newStructure);
    if (!sourceItem) return;

    // Remove the source item from its original location
    let current = newStructure;
    const sourceParts = sourcePath.split("/");
    const sourceItemName = sourceParts.pop()!;
    for (const part of sourceParts) {
      if (current[part] && current[part].type === "folder") {
        current = current[part].children!;
      }
    }
    delete current[sourceItemName];

    // Add the item to the new location
    current = newStructure;
    const targetParts = targetPath.split("/");
    for (const part of targetParts) {
      if (current[part] && current[part].type === "folder") {
        current = current[part].children!;
      } else {
        // If dropping onto a file, add it to the parent folder
        break;
      }
    }
    current[sourceItemName] = sourceItem;

    updateFileStructure(newStructure);
    setDraggedItem(null);
  };

  const handleAiSubmit = async () => {
    if (aiMessage.trim()) {
      setAiResponses((prev) => [
        ...prev,
        `You: ${aiMessage}`,
        `CFFX: ${aiMessage}`,
      ]);
      setFileContent(
        `// Generated code for ${aiMessage}\n\nfunction generatedFunction() {\n  // TODO: Implement the function\n  console.log("Hello, world!");\n}\n`,
      );
      setAiMessage("");
    }
  };

  const handleUploadFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const content = await file.text();

      const newStructure = { ...fileStructure };
      newStructure[file.name] = {
        type: "file",
        content: content,
      };

      await updateFileStructure(newStructure);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleUploadFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const newStructure = { ...fileStructure };

      const processDirectory = async (
        dirHandle: FileSystemDirectoryHandle,
        path: string,
      ) => {
        for await (const entry of dirHandle.values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            const content = await file.text();
            newStructure[`${path}${file.name}`] = {
              type: "file",
              content: content,
            };
          } else if (entry.kind === "directory") {
            newStructure[`${path}${entry.name}`] = {
              type: "folder",
              children: {},
            };
            await processDirectory(entry, `${path}${entry.name}/`);
          }
        }
      };

      await processDirectory(dirHandle, "");
      await updateFileStructure(newStructure);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error uploading folder:", error);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();

      const addToZip = (structure: FileStructure, path: string = "") => {
        Object.entries(structure).forEach(([name, item]) => {
          if (item.type === "file") {
            zip.file(path + name, item.content || "");
          } else if (item.type === "folder") {
            addToZip(item.children || {}, path + name + "/");
          }
        });
      };

      addToZip(fileStructure);

      const content = await zip.generateAsync({ type: "blob" });

      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = script.name + ".zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error downloading as ZIP:", error);
    }
  };

  const handleCollapseAll = () => {
    setExpandedFolders(new Set());
    setIsMenuOpen(false);
  };

  const renderFileTree = (structure: FileStructure, path: string = "") => {
    const entries = Object.entries(structure);

    const folders = entries
      .filter(([_, item]) => item.type === "folder")
      .sort((a, b) => a[0].localeCompare(b[0]));

    const files = entries
      .filter(([_, item]) => item.type === "file")
      .sort((a, b) => a[0].localeCompare(b[0]));

    const sortedEntries = [...folders, ...files];

    return (
      <>
        {sortedEntries.map(([name, item]) => {
          const fullPath = path ? `${path}/${name}` : name;
          if (item.type === "folder") {
            const isExpanded = expandedFolders.has(fullPath);
            return (
              <div
                key={fullPath}
                className="mb-1 relative"
                draggable
                onDragStart={(e) => handleDragStart(e, fullPath)}
                onDragOver={(e) => handleDragOver(e, fullPath)}
                onDrop={(e) => handleDrop(e, fullPath)}
              >
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors duration-200"
                  onClick={() => toggleFolder(fullPath)}
                  onMouseEnter={() => setHoveredItem(fullPath)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <Folder size={16} className="mr-1 text-blue-500" />
                  <span className="text-sm">{name}</span>
                  {hoveredItem === fullPath && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(fullPath);
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="ml-4">
                    {renderFileTree(item.children || {}, fullPath)}
                    {(isCreatingFile || isCreatingFolder) &&
                      currentPath === fullPath && (
                        <form
                          onSubmit={handleNewItemSubmit}
                          className="flex items-center mt-1"
                        >
                          <input
                            ref={newItemInputRef}
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="flex-grow text-sm p-1 border rounded"
                            placeholder={`New ${isCreatingFile ? "file" : "folder"} name`}
                          />
                          <button
                            type="submit"
                            className="ml-1 p-1 bg-blue-500 text-white rounded"
                          >
                            <Plus size={16} />
                          </button>
                        </form>
                      )}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div
                key={fullPath}
                className={`flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors duration-200 relative ${
                  selectedFile === fullPath ? "bg-blue-100" : ""
                }`}
                onClick={() => handleFileSelect(fullPath)}
                onMouseEnter={() => setHoveredItem(fullPath)}
                onMouseLeave={() => setHoveredItem(null)}
                draggable
                onDragStart={(e) => handleDragStart(e, fullPath)}
                onDragOver={(e) => handleDragOver(e, fullPath)}
                onDrop={(e) => handleDrop(e, fullPath)}
              >
                <FileIcon size={16} className="mr-1 text-gray-500" />
                <span className="text-sm">{name}</span>
                {hoveredItem === fullPath && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(fullPath);
                    }}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          }
        })}
        {(isCreatingFile || isCreatingFolder) && currentPath === path && (
          <form
            onSubmit={handleNewItemSubmit}
            className="flex items-center mt-1"
          >
            <input
              ref={newItemInputRef}
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-grow text-sm p-1 border rounded"
              placeholder={`New ${isCreatingFile ? "file" : "folder"} name`}
            />
            <button
              type="submit"
              className="ml-1 p-1 bg-blue-500 text-white rounded"
            >
              <Plus size={16} />
            </button>
          </form>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{script.name}</h1>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden p-2">
        {/* File Explorer (Left Column) */}
        <div className="w-1/4 bg-gray-100 overflow-y-auto mr-2 rounded-lg">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Files</h2>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MoreVertical size={18} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleCreateFile();
                          setCurrentPath("");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Plus size={16} className="inline-block mr-2" />
                        Create File
                      </button>
                      <button
                        onClick={() => {
                          handleCreateFolder();
                          setCurrentPath("");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Folder size={16} className="inline-block mr-2" />
                        Create Folder
                      </button>
                      <button
                        onClick={handleUploadFile}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Upload size={16} className="inline-block mr-2" />
                        Upload File
                      </button>
                      <button
                        onClick={handleUploadFolder}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Folder size={16} className="inline-block mr-2" />
                        Upload Folder
                      </button>
                      <button
                        onClick={handleDownloadZip}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Download size={16} className="inline-block mr-2" />
                        Download as ZIP
                      </button>
                      <button
                        onClick={handleCollapseAll}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <MinusSquare size={16} className="inline-block mr-2" />
                        Collapse All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">{renderFileTree(fileStructure)}</div>
          </div>
        </div>

        {/* Middle Column (AI Chat) */}
        <div className="w-1/2 flex flex-col mx-2">
          <div className="flex-grow overflow-y-auto mb-2 bg-white rounded-lg border border-gray-200 p-2">
            {aiResponses.map((response, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[80%] mb-2 ${
                  response.startsWith("You:")
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{response}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask the AI to generate code..."
                className="flex-grow px-4 py-2 text-sm bg-transparent focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleAiSubmit()}
              />
              <button
                onClick={handleAiSubmit}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Code Display) */}
        <div className="w-1/4 flex flex-col ml-2">
          <div className="flex-grow overflow-hidden bg-gray-100 rounded-lg mb-2">
            <CodeEditor
              value={fileContent}
              language="lua"
              placeholder="Select a file to view its content or generate code using AI."
              onChange={(evn) => setFileContent(evn.target.value)}
              padding={10}
              style={{
                fontSize: 14,
                backgroundColor: "#f5f5f5",
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                height: "100%",
                overflow: "auto",
              }}
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
