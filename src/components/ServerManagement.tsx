import React from "react";
import { Server, Activity, Upload, List } from "lucide-react";

const ServerManagement: React.FC = () => {
  const servers = [
    {
      name: "Production Server",
      status: "Online",
      lastDeployed: "2023-05-15 14:30",
    },
    {
      name: "Staging Server",
      status: "Online",
      lastDeployed: "2023-05-14 09:15",
    },
    {
      name: "Development Server",
      status: "Offline",
      lastDeployed: "2023-05-13 17:45",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Server Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="h-6 w-6 text-indigo-500 mr-2" />
                <h2 className="text-xl font-semibold">{server.name}</h2>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  server.status === "Online"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {server.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Last Deployed: {server.lastDeployed}
            </p>
            <div className="flex justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Monitor
              </button>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Deploy
              </button>
              <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <List className="mr-2 h-4 w-4" />
                Logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerManagement;
