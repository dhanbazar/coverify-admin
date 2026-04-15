import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export function AppDistributionPage() {
  const [copied, setCopied] = useState(false);
  const [apkUrl, setApkUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const currentVersion = "1.0.0";
  const serverBase = import.meta.env.VITE_API_URL || "https://coverify-server-production.up.railway.app";
  const apkDownloadUrl = `${serverBase}/download/apk`;

  // Fetch current APK URL from server
  useEffect(() => {
    apiClient.get("/settings/apk-url")
      .then(({ data }) => {
        const url = data?.data?.url ?? "";
        setApkUrl(url);
        setNewUrl(url);
      })
      .catch(() => {});
  }, []);

  const copyLink = (url: string) => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateUrl = async () => {
    if (!newUrl.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await apiClient.put("/settings/apk-url", { url: newUrl.trim() });
      setApkUrl(newUrl.trim());
      setSaveMsg("APK URL updated successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Failed to update URL");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">App Distribution</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and distribute the CoVerify mobile app to field agents</p>
      </div>

      {/* Update APK URL */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">APK Build URL</h2>
        <p className="text-gray-500 text-sm mb-4">
          Paste the EAS build URL here after each new APK build. Agents will always get the latest version.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://expo.dev/artifacts/eas/xxxxx.apk"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => void handleUpdateUrl()}
            disabled={saving || !newUrl.trim() || newUrl.trim() === apkUrl}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "Saving..." : "Update URL"}
          </button>
        </div>

        {saveMsg && (
          <p className={`mt-2 text-sm ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {saveMsg}
          </p>
        )}

        {apkUrl && (
          <p className="mt-3 text-xs text-gray-400 break-all">
            Current: {apkUrl}
          </p>
        )}
      </div>

      {/* Current Version Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Current Release</h2>
            <p className="text-gray-500 text-sm">Latest production build</p>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            v{currentVersion}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Platform</p>
            <p className="font-medium">Android</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Distribution</p>
            <p className="font-medium">Direct APK</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Size</p>
            <p className="font-medium">~45 MB</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Min Android</p>
            <p className="font-medium">Android 6.0+</p>
          </div>
        </div>

        {/* Download Link */}
        <div className="border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-2">Agent Download Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={apkDownloadUrl}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600"
            />
            <button
              onClick={() => copyLink(apkDownloadUrl)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this link with agents — it always redirects to the latest APK.
          </p>
        </div>

        <a
          href={apkDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition"
        >
          Download APK
        </a>
      </div>

      {/* Share with Agents */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Share with Agents</h2>
        <p className="text-gray-500 text-sm mb-4">Send the download link to agents via WhatsApp or Email</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const msg = encodeURIComponent(
                `Install CoVerify App\n\nDownload the latest version:\n${apkDownloadUrl}\n\nVersion: v${currentVersion}\n\nAfter installing, login with your credentials.`,
              );
              window.open(`https://wa.me/?text=${msg}`, "_blank");
            }}
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-600 transition"
          >
            Share via WhatsApp
          </button>

          <button
            onClick={() => {
              const subject = encodeURIComponent("Install CoVerify App");
              const body = encodeURIComponent(
                `Hi,\n\nPlease download the CoVerify app:\n\n${apkDownloadUrl}\n\nVersion: v${currentVersion}\n\nSteps:\n1. Click the download link\n2. Allow "Install from unknown sources"\n3. Install and login with your credentials\n\nRegards,\nCoVerify Admin`,
              );
              window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
            }}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition"
          >
            Share via Email
          </button>

          <button
            onClick={() => copyLink(apkDownloadUrl)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Installation Guide</h2>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Open the download link on your Android phone</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>If prompted, allow <strong>"Install from unknown sources"</strong> in Settings</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Tap the downloaded APK file to install</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Open CoVerify and login with credentials from your manager</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
