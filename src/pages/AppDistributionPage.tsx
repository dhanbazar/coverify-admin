import { useState } from "react";

export function AppDistributionPage() {
  const [copied, setCopied] = useState(false);

  // Hardcoded for now — will be dynamic when connected to EAS
  const currentVersion = "1.0.0";
  const lastBuildDate = "2026-03-18";

  // The APK download URL would come from EAS Build API or S3
  const apkDownloadUrl = "https://expo.dev/artifacts/eas/your-build-id.apk";

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">App Distribution</h1>
      <p className="text-gray-500 mb-8">
        Manage and distribute the CoVerify mobile app to field agents
      </p>

      {/* Current Version Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
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
            <p className="text-xs text-gray-500">Build Date</p>
            <p className="font-medium">{lastBuildDate}</p>
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

        {/* Download Link Section */}
        <div className="border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-2">APK Download Link</p>
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
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Direct Download */}
        <a
          href={apkDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition"
        >
          Download APK
        </a>
      </div>

      {/* Share with Agents Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Share with Agents</h2>
        <p className="text-gray-500 text-sm mb-4">
          Send the download link to agents via WhatsApp or Email
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const msg = encodeURIComponent(
                `Install CoVerify App\n\nDownload the latest version:\n${apkDownloadUrl}\n\nVersion: v${currentVersion}\n\nAfter installing, login with your credentials provided by your manager.`,
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
                `Hi,\n\nPlease download and install the CoVerify field verification app:\n\n${apkDownloadUrl}\n\nVersion: v${currentVersion}\n\nInstallation steps:\n1. Click the download link\n2. Allow "Install from unknown sources" if prompted\n3. Install the APK\n4. Open CoVerify and login with your credentials\n\nRegards,\nCoVerify Admin`,
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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Installation Guide for Agents
        </h2>
        <div className="space-y-3">
          {[
            {
              step: 1,
              text: "Click the APK download link shared by your manager",
            },
            {
              step: 2,
              text: 'If prompted, go to Settings > Security > Enable "Install from Unknown Sources"',
            },
            {
              step: 3,
              text: 'Open the downloaded APK file and tap "Install"',
            },
            {
              step: 4,
              text: "Open CoVerify and login with your email and password",
            },
            {
              step: 5,
              text: "Grant permissions for Camera, Location, and Notifications when asked",
            },
            {
              step: 6,
              text: "You're ready! Your assigned cases will appear on the dashboard",
            },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {step}
              </span>
              <p className="text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OTA Updates Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Over-the-Air Updates
        </h2>
        <p className="text-blue-700 text-sm mb-3">
          After the initial APK install, all future updates are delivered
          automatically via OTA. Agents don&apos;t need to re-download the APK
          for code updates — they&apos;ll get a prompt to restart the app.
        </p>
        <div className="bg-white/50 rounded-xl p-3 font-mono text-sm text-blue-800">
          npx eas update --branch production --message &quot;Your update
          message&quot;
        </div>
      </div>
    </div>
  );
}
