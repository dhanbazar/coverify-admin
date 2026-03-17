import { useState, type FormEvent } from "react";
import { HiOutlineSave, HiOutlineKey, HiOutlineBell, HiOutlineGlobe } from "react-icons/hi";
import { apiClient } from "../api/client";
import { getStoredAuth } from "../store/authStore";

export function SettingsPage() {
  const auth = getStoredAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "system">("profile");

  // Profile state
  const [fullName, setFullName] = useState(auth.user?.fullName ?? "");
  const [email] = useState(auth.user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [tatAlerts, setTatAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: <HiOutlineGlobe size={18} /> },
    { key: "password" as const, label: "Password", icon: <HiOutlineKey size={18} /> },
    { key: "notifications" as const, label: "Notifications", icon: <HiOutlineBell size={18} /> },
    { key: "system" as const, label: "System", icon: <HiOutlineGlobe size={18} /> },
  ];

  return (
    <div className="max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMessage(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Profile Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={auth.user?.role ?? ""}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 capitalize"
            />
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Change Password</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {message && (
            <div className={`text-sm rounded-lg px-4 py-2 ${message.includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <HiOutlineSave size={16} />
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
          <div className="space-y-3">
            <ToggleRow
              label="Email Notifications"
              description="Receive case updates via email"
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
            <ToggleRow
              label="Push Notifications"
              description="Receive real-time push notifications"
              checked={pushNotifs}
              onChange={setPushNotifs}
            />
            <ToggleRow
              label="TAT Breach Alerts"
              description="Get notified when cases breach TAT deadline"
              checked={tatAlerts}
              onChange={setTatAlerts}
            />
            <ToggleRow
              label="Daily Digest"
              description="Summary of daily operations sent at 9 AM"
              checked={dailyDigest}
              onChange={setDailyDigest}
            />
          </div>
          <p className="text-xs text-gray-400">
            Notification preferences will be connected in Phase 3.
          </p>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Application Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">App Name</p>
                <p className="font-medium text-gray-900">CoVerify Admin</p>
              </div>
              <div>
                <p className="text-gray-500">Version</p>
                <p className="font-medium text-gray-900">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-500">Environment</p>
                <p className="font-medium text-gray-900">{import.meta.env.MODE}</p>
              </div>
              <div>
                <p className="text-gray-500">API Server</p>
                <p className="font-medium text-gray-900 truncate">{import.meta.env.VITE_API_URL ?? "http://localhost:4000"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Security</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>JWT token expiry: 15 minutes</p>
              <p>Refresh token expiry: 7 days</p>
              <p>PII encryption: AES-256-GCM</p>
              <p>Password hashing: bcrypt (cost 12)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
