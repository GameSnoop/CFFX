import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, User, PlusSquare, LogOut, Settings } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 960);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const firstName = user.displayName?.split(" ")[0] || "User";
      setUserName(firstName);
      setProfilePicture(user.photoURL || "https://via.placeholder.com/40");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 960);
    };

    window.addEventListener("resize", handleResize);
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-white shadow-lg z-10">
          <div className="flex flex-col h-full">
            <div className="flex-1 py-6 flex flex-col justify-between">
              <div>
                <div className="px-4 py-2 flex items-center">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <span className="text-xl font-black text-gray-900">
                    Hello, {userName}
                  </span>
                </div>
                <nav className="mt-5 px-3 space-y-1">
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                      `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-yellow-100 text-yellow-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <Home className="mr-3 h-6 w-6" />
                    Home
                  </NavLink>
                  <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                      `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-yellow-100 text-yellow-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <User className="mr-3 h-6 w-6" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/dashboard/add-post"
                    className={({ isActive }) =>
                      `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-yellow-100 text-yellow-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <PlusSquare className="mr-3 h-6 w-6" />
                    Add Post
                  </NavLink>
                </nav>
              </div>
              <div className="px-3 mt-6 space-y-2">
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
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm h-14 flex items-center justify-center">
          <div className="flex items-center justify-center">
            <img
              src="https://i.ibb.co/yBTXZXL/svgviewer-png-output-3.png"
              alt="Logo"
              className="h-9 w-auto"
            />
            {/* Add any additional nav bar content here */}
          </div>
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
