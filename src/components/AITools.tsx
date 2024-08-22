import React from 'react';
import { Bot, Zap, AlertTriangle } from 'lucide-react';

const AITools: React.FC = () => {
  const tools = [
    { name: 'Script Generator', icon: Bot, description: 'Automatically generate scripts based on your requirements.' },
    { name: 'Error Detection', icon: AlertTriangle, description: 'Analyze your scripts and detect potential errors or issues.' },
    { name: 'Performance Optimizer', icon: Zap, description: 'Optimize your scripts for better performance and efficiency.' },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <tool.icon className="h-8 w-8 text-indigo-500 mr-3" />
              <h2 className="text-xl font-semibold">{tool.name}</h2>
            </div>
            <p className="text-gray-600">{tool.description}</p>
            <button className="mt-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
              Use Tool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITools;