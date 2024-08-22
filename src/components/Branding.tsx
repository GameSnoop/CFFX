import React, { useState } from "react";
import { Palette, Image, Type, Layout } from "lucide-react";

const Branding: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [logo, setLogo] = useState("");
  const [font, setFont] = useState("Inter");
  const [layout, setLayout] = useState("default");

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Branding</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Palette className="mr-2" /> Color Scheme
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="primaryColor"
            >
              Primary Color
            </label>
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-10 rounded"
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Image className="mr-2" /> Logo
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="logo"
            >
              Upload Logo
            </label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full"
            />
          </div>
          {logo && (
            <div className="mt-4">
              <img
                src={logo}
                alt="Uploaded Logo"
                className="max-w-full h-auto"
              />
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Type className="mr-2" /> Typography
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="font"
            >
              Font Family
            </label>
            <select
              id="font"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Layout className="mr-2" /> Layout
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="layout"
            >
              Default Layout
            </label>
            <select
              id="layout"
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Branding Settings
        </button>
      </div>
    </div>
  );
};

export default Branding;
