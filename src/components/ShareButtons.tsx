"use client";
import {
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
} from "react-share";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

type ShareButtonsProps = {
  title: string;
};

export default function ShareButtons({ title }: ShareButtonsProps) {
  const path = usePathname();
  const baseUrl = "https://www.the-parkhouse-kamishakujii-residence-official.site/";
  const url =
    typeof window !== "undefined"
      ? window.location.origin + path
      : baseUrl + path;

  const [copied, setCopied] = useState<boolean>(false);

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Failed to copy");
    }
  };

  // --- ここがX（旧Twitter）シェアボタン ---
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-col items-center gap-2 my-5">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <span className="text-xs text-gray-500 mr-1">Share:</span>
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
        >
          <Image
            src="/svg/logo-black.png"
            alt="Share on X"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
            priority
          />
        </a>
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
          <Image
            src="/line-icon.png"
            alt="LINE share icon"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
            priority
          />
        </a>
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className="flex items-center"
        >
          <Image
            src="/copy-icon.png"
            alt="Copy Link"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
            priority
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
