import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Globe, Shield, CreditCard } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

// Mock data for development
const mockUserSettings = {
  contactDetails: '123 Main St, Anytown, USA',
  twoFAEnabled: false,
  emailNotifications: true,
  newsletterSubscription: true,
  language: 'en',
  timeZone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  securityQuestions: [],
  loginActivity: ['Logged in from Chrome on Windows - 2023-05-01 14:30:00'],
  connectedDevices: ['Chrome on Windows', 'Mobile App on iPhone'],
  currentPlan: 'Free',
  paymentMethods: ['Visa ending in 1234'],
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(auth.currentUser);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.photoURL || '');
  const [contactDetails, setContactDetails] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newsletterSubscription, setNewsletterSubscription] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timeZone, setTimeZone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        // For development, use mock data
        // In production, replace this with an actual API call
        // const response = await fetch('/api/user-settings');
        // const settings = await response.json();
        const settings = mockUserSettings;

        setContactDetails(settings.contactDetails);
        setTwoFAEnabled(settings.twoFAEnabled);
        setEmailNotifications(settings.emailNotifications);
        setNewsletterSubscription(settings.newsletterSubscription);
        setLanguage(settings.language);
        setTimeZone(settings.timeZone);
        setDateFormat(settings.dateFormat);
        setSecurityQuestions(settings.securityQuestions);
        setLoginActivity(settings.loginActivity);
        setConnectedDevices(settings.connectedDevices);
        setCurrentPlan(settings.currentPlan);
        setPaymentMethods(settings.paymentMethods);
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setMessage({ type: 'error', content: 'Failed to load user settings. Using default values.' });
      }
    };

    fetchUserSettings();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSaveProfile = async () => {
    try {
      if (user) {
        await updateProfile(user, { displayName: name, photoURL: profilePicture });
        if (email !== user.email) {
          await updateEmail(user, email);
        }
        await axios.post('/api/update-profile', { contactDetails });
        setMessage({ type: 'success', content: 'Profile updated successfully' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', content: 'Failed to update profile' });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match' });
      return;
    }
    try {
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setMessage({ type: 'success', content: 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', content: 'Failed to change password' });
    }
  };

  const handleToggle2FA = async () => {
    try {
      await axios.post('/api/toggle-2fa', { enabled: !twoFAEnabled });
      setTwoFAEnabled(!twoFAEnabled);
      setMessage({ type: 'success', content: `Two-factor authentication ${twoFAEnabled ? 'disabled' : 'enabled'}` });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setMessage({ type: 'error', content: 'Failed to toggle two-factor authentication' });
    }
  };

  const handleSaveEmailPreferences = async () => {
    try {
      await axios.post('/api/update-email-preferences', { emailNotifications, newsletterSubscription });
      setMessage({ type: 'success', content: 'Email preferences updated successfully' });
    } catch (error) {
      console.error('Error updating email preferences:', error);
      setMessage({ type: 'error', content: 'Failed to update email preferences' });
    }
  };

  const handleSaveLocalization = async () => {
    try {
      await axios.post('/api/update-localization', { language, timeZone, dateFormat });
      setMessage({ type: 'success', content: 'Localization settings updated successfully' });
    } catch (error) {
      console.error('Error updating localization settings:', error);
      setMessage({ type: 'error', content: 'Failed to update localization settings' });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await axios.post('/api/update-security', { securityQuestions });
      setMessage({ type: 'success', content: 'Security settings updated successfully' });
    } catch (error) {
      console.error('Error updating security settings:', error);
      setMessage({ type: 'error', content: 'Failed to update security settings' });
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    try {
      await axios.post('/api/change-plan', { plan: newPlan });
      setCurrentPlan(newPlan);
      setMessage({ type: 'success', content: 'Subscription plan updated successfully' });
    } catch (error) {
      console.error('Error changing plan:', error);
      setMessage({ type: 'error', content: 'Failed to change subscription plan' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      {message.content && (
        <div className={`mb-4 p-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.content}
        </div>
      )}
      <div className="flex">
        <div className="w-1/4 pr-4">
          <ul className="space-y-2">
            {['profile', 'password', 'email', 'localization', 'security', 'billing'].map((tab) => (
              <li key={tab}>
                <button
                  className={`flex items-center p-2 w-full ${activeTab === tab ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab === 'profile' && <User className="mr-2" />}
                  {tab === 'password' && <Lock className="mr-2" />}
                  {tab === 'email' && <Bell className="mr-2" />}
                  {tab === 'localization' && <Globe className="mr-2" />}
                  {tab === 'security' && <Shield className="mr-2" />}
                  {tab === 'billing' && <CreditCard className="mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 pl-4">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
                    Profile Picture URL
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="profilePicture"
                    type="text"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactDetails">
                    Contact Details
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="contactDetails"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                  />
                </div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Password Management</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Change Password
                </button>
              </form>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
                <button
                  className={`${twoFAEnabled ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                  onClick={handleToggle2FA}
                >
                  {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'email' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Email Preferences</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEmailPreferences(); }}>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      className="form-checkbox h-5 w-5 text-yellow-600"
                    />
                    <span className="ml-2 text-gray-700">Receive email notifications</span>
                  </label>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newsletterSubscription}
                      onChange={() => setNewsletterSubscription(!newsletterSubscription)}
                      className="form-checkbox h-5 w-5 text-yellow-600"
                    />
                    <span className="ml-2 text-gray-700">Subscribe to newsletter</span>
                  </label>
                </div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Email Preferences
                </button>
              </form>
            </div>
          )}
          {activeTab === 'localization' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Language & Localization</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveLocalization(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language">
                    Language
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    {/* Add more language options as needed */}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeZone">
                    Time Zone
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="timeZone"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time</option>
                    <option value="PST">Pacific Standard Time</option>
                    {/* Add more time zone options as needed */}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateFormat">
                    Date Format
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="dateFormat"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Localization Settings
                </button>
              </form>
            </div>
          )}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Security Settings</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveSecurity(); }}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Security Questions</h3>
                  {/* Add UI for security questions here */}
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Login Activity</h3>
                  <ul>
                    {loginActivity.map((activity, index) => (
                      <li key={index} className="mb-2">{activity}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Connected Devices</h3>
                  <ul>
                    {connectedDevices.map((device, index) => (
                      <li key={index} className="mb-2">{device}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Security Settings
                </button>
              </form>
            </div>
          )}
          {activeTab === 'billing' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Billing & Subscription</h2>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
                <p className="text-gray-600">Your current plan: {currentPlan}</p>
                <button
                  className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleChangePlan('Premium')}
                >
                  Upgrade to Premium
                </button>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Payment Methods</h3>
                <ul>
                  {paymentMethods.map((method, index) => (
                    <li key={index} className="mb-2">{method}</li>
                  ))}
                </ul>
                <button
                  className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Payment Method
                </button>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Billing History</h3>
                {/* Add billing history UI here */}
              </div>
            </div>
          )}
          </div>
          </div>
          </div>
          );
          };

          export default Settings;