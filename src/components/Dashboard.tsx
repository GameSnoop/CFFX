import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Bot,
  Server,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 960);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 960);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const firstName = user.displayName?.split(" ")[0] || "User";
      setUserName(firstName);
      setProfilePicture(user.photoURL || "");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < 960;
      setIsSmallScreen(smallScreen);
      setIsSidebarOpen(!smallScreen);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getProfilePicture = () => {
    if (profilePicture) {
      return (
        <img
          src={profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <Home className="h-6 w-6 text-gray-600" />
        </div>
      );
    }
  };

  const navItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Scripts", icon: FileText, path: "/dashboard/scripts" },
    { name: "AI Tools", icon: Bot, path: "/dashboard/ai-tools" },
    {
      name: "Server Management",
      icon: Server,
      path: "/dashboard/server-management",
    },
    { name: "Branding", icon: Palette, path: "/dashboard/branding" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay for small screens when sidebar is open */}
      {isSmallScreen && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Left sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSmallScreen ? "shadow-10xl" : ""}`}
      >
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center">
              {getProfilePicture()}
              <span className="text-xl font-black text-gray-900 ml-3">
                Hello, {userName}
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 py-6 flex flex-col justify-between overflow-y-auto">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-yellow-100 text-yellow-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 mt-6 space-y-1">
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-yellow-100 text-yellow-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Settings className="mr-3 h-6 w-6" />
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-900 rounded-md w-full"
              >
                <LogOut className="mr-3 h-6 w-6" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${!isSmallScreen && isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        {/* Top navigation */}
        <header className="bg-white shadow-sm h-14 flex items-center px-4">
          <div className="flex-1 flex items-center">
            {(!isSidebarOpen || isSmallScreen) && (
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://i.ibb.co/yBTXZXL/svgviewer-png-output-3.png"
              alt="Logo"
              className="h-9 w-auto"
            />
          </div>
          <div className="flex-1"></div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
