"use client";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
} from "react-share";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // ←ここだけ修正

export default function ShareButtons({ title }: { title: string }) {
  const path = usePathname();
  const baseUrl = "https://wmi-official-room.vercel.app";
  const url =
    typeof window !== "undefined"
      ? window.location.origin + path
      : baseUrl + path;

  const [copied, setCopied] = useState(false);
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    url
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 my-5">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <span className="text-xs text-gray-500 mr-1">Share:</span>
        <TwitterShareButton url={url} title={title}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={url} title={title}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <FacebookShareButton url={url}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <a
          href={lineShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LINE"
        >
          <img
            src="/line-icon.png"
            alt="LINE"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
          />
        </a>
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className="flex items-center"
        >
          <img
            src="/copy-icon.png"
            alt="Copy Link"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
          />
        </button>
        {copied && (
          <span className="text-xs text-green-500 ml-2 animate-fade-in">
            Copied!
          </span>
        )}
      </div>
      <div className="flex flex-col items-center mt-2">
        <span className="text-xs text-gray-500 mb-1">
          Scan to share (for mobile, Instagram, TikTok)
        </span>
        <QRCodeSVG value={url} size={88} bgColor="#fff" fgColor="#222" />
      </div>
    </div>
  );
}
