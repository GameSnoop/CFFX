import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, X, Edit, Trash2, Code } from "lucide-react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import ScriptEditor from "./ScriptEditor";

interface Script {
  id: string;
  name: string;
  framework: string;
  status: string;
  lastEdited: string;
  userId: string;
}

interface FileStructure {
  [key: string]: {
    type: "file" | "folder";
    content?: string;
    children?: FileStructure;
  };
}

const Scripts: React.FC = () => {
  const [isNewScriptModalOpen, setIsNewScriptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [newScriptFramework, setNewScriptFramework] = useState("");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [user, setUser] = useState(auth.currentUser);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "scripts"),
      where("userId", "==", user.uid),
      orderBy("lastEdited", "desc"),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const scriptsData: Script[] = [];
      querySnapshot.forEach((doc) => {
        scriptsData.push({ id: doc.id, ...doc.data() } as Script);
      });
      setScripts(scriptsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNewScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newScriptName && newScriptFramework && user) {
      const newScript = {
        name: newScriptName,
        framework: newScriptFramework,
        status: "Active",
        lastEdited: new Date().toISOString(),
        userId: user.uid,
        fileStructure: {
          "fxmanifest.lua": {
            type: "file",
            content: `fx_version 'cerulean'
game 'gta5'
author 'CFFX AI'
description '${newScriptName}'
version '1.0.0'

-- Config file
shared_script 'config.lua'

-- Client scripts
client_scripts {
    'client/*.lua'  -- This includes all .lua files in the client folder
}

-- Server scripts
server_scripts {
    'server/*.lua'  -- This includes all .lua files in the server folder
}`,
          },
          "config.lua": {
            type: "file",
            content: "-- Configuration settings\n",
          },
          server: {
            type: "folder",
            children: {
              "server.lua": {
                type: "file",
                content: "-- Server-side code here\n",
              },
            },
          },
          client: {
            type: "folder",
            children: {
              "client.lua": {
                type: "file",
                content: "-- Client-side code here\n",
              },
            },
          },
        },
      };
      await addDoc(collection(db, "scripts"), newScript);
      setIsNewScriptModalOpen(false);
      setNewScriptName("");
      setNewScriptFramework("");
    }
  };

  const handleDeleteScript = async () => {
    if (selectedScript && user) {
      await deleteDoc(doc(db, "scripts", selectedScript.id));
      setIsDeleteModalOpen(false);
      setSelectedScript(null);
    }
  };

  const handleRenameScript = async () => {
    if (selectedScript && user && newName) {
      await updateDoc(doc(db, "scripts", selectedScript.id), {
        name: newName,
        lastEdited: new Date().toISOString(),
      });
      setIsRenameModalOpen(false);
      setSelectedScript(null);
      setNewName("");
    }
  };

  const handleOpenScript = (script: Script) => {
    setSelectedScript(script);
    setIsEditorOpen(true);
  };

  if (isEditorOpen && selectedScript) {
    return (
      <ScriptEditor
        script={selectedScript}
        onClose={() => setIsEditorOpen(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Scripts</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsNewScriptModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            <Plus className="inline-block mr-2" size={20} />
            New Script
          </button>
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow transition duration-300 ease-in-out">
            <Filter className="inline-block mr-2" size={20} />
            Filter
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search scripts..."
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <div className="absolute top-0 left-0 mt-3 ml-3">
            <Search className="text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Scripts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Framework
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Edited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {script.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {script.framework}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        script.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {script.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(script.lastEdited).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenScript(script)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Code size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedScript(script);
                        setIsRenameModalOpen(true);
                        setNewName(script.name);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedScript(script);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Script Modal */}
      {isNewScriptModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="new-script-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Script
              </h3>
              <form className="mt-2 px-7 py-3" onSubmit={handleNewScript}>
                <input
                  type="text"
                  placeholder="Script Name"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
                <select
                  value={newScriptFramework}
                  onChange={(e) => setNewScriptFramework(e.target.value)}
                  className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select Framework</option>
                  <option value="ESX">ESX</option>
                  <option value="QBCore">QBCore</option>
                  <option value="Standalone">Standalone</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  Create Script
                </button>
              </form>
            </div>
            <button
              onClick={() => setIsNewScriptModalOpen(false)}
              className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="delete-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the script "{selectedScript?.name}
              "? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteScript}
                className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="rename-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rename Script
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="New script name"
              required
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameScript}
                className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scripts;
