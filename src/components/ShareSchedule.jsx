import { useState } from "react";

export default function ShareSchedule() {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = "View the Las Palmas Schedule Hub schedule.";

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function shareSchedule() {
    if (navigator.share) {
      await navigator.share({
        title: "Las Palmas Schedule Hub",
        text: shareText,
        url: shareUrl,
      });
      return;
    }

    await copyLink();
  }

  return (
    <div className="share-schedule" aria-label="Share schedule">
      <button type="button" onClick={shareSchedule}>
        Share Schedule
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        Facebook
      </a>
      <button type="button" onClick={copyLink}>
        {copied ? "Link Copied" : "Copy Link"}
      </button>
    </div>
  );
}
