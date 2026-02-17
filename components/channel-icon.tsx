import { CHANNEL_INFO, EXTRA_CHANNELS, type ChannelKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image, { type StaticImageData } from "next/image";

import airbnbIcon from "@assets/integerations/airbnb.jpeg";
import bookingIcon from "@assets/integerations/booking.jpeg";
import tripAdvisorIcon from "@assets/integerations/TripAdvisor.jpeg";
import gathernIcon from "@assets/integerations/gathern.webp";
import goldenHostIcon from "@assets/integerations/goldenhost.png";
import estra7aIcon from "@assets/integerations/estra7a.png";
import wasaltIcon from "@assets/integerations/wasalt.jpeg";
import mabeetIcon from "@assets/integerations/mabeet.png";

interface ChannelIconProps {
  channelKey: ChannelKey | string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

function ExpediaLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FBAF17" />
      <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#1C3160" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="14" r="2.5" fill="#1C3160" />
    </svg>
  );
}

function GenericChannelLogo({ size = 16, color = "#888", letter = "?" }: { size?: number; color?: string; letter?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill={color} />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">{letter}</text>
    </svg>
  );
}

const imageMap: Partial<
  Record<ChannelKey | string, { src: StaticImageData; alt: string }>
> = {
  AIRBNB: { src: airbnbIcon, alt: "Airbnb" },
  BOOKING: { src: bookingIcon, alt: "Booking.com" },
  TRIPADVISOR: { src: tripAdvisorIcon, alt: "TripAdvisor" },
  GATHERN: { src: gathernIcon, alt: "Gathern" },
  GOLDENHOST: { src: goldenHostIcon, alt: "Golden Host" },
  ESTRAHA: { src: estra7aIcon, alt: "Estraha" },
  WASALT: { src: wasaltIcon, alt: "Wasalt" },
  MABET: { src: mabeetIcon, alt: "Mabeet" },
};

function ChannelImage({
  src,
  alt,
  size,
}: {
  src: StaticImageData;
  alt: string;
  size: number;
}) {
  return (
    <Image
      src={src}
      alt={`${alt} logo`}
      width={size}
      height={size}
      className="object-contain"
      priority={false}
    />
  );
}

function ChannelMark({
  channelKey,
  size,
}: {
  channelKey: ChannelKey | string;
  size: number;
}) {
  const img = imageMap[channelKey];
  if (img) return <ChannelImage src={img.src} alt={img.alt} size={size} />;
  if (channelKey === "EXPEDIA") return <ExpediaLogo size={size} />;
  return <GenericChannelLogo size={size} letter="?" />;
}

export function ChannelIcon({
  channelKey,
  size = 16,
  className,
  showLabel = false,
}: ChannelIconProps) {
  const info = CHANNEL_INFO[channelKey as ChannelKey];
  const extraInfo = EXTRA_CHANNELS[channelKey];

  if (info) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <ChannelMark channelKey={channelKey} size={size} />
        {showLabel && (
          <span className={cn("text-sm font-medium", info.textColor)}>
            {info.name}
          </span>
        )}
      </span>
    );
  }

  if (extraInfo) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        {imageMap[channelKey] ? (
          <ChannelMark channelKey={channelKey} size={size} />
        ) : (
          <GenericChannelLogo
            size={size}
            color={extraInfo.color}
            letter={extraInfo.name[0].toUpperCase()}
          />
        )}
        {showLabel && (
          <span className="text-sm font-medium">{extraInfo.name}</span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <ChannelMark channelKey={channelKey} size={size} />
    </span>
  );
}

export function ChannelBadge({
  channelKey,
  className,
}: {
  channelKey: ChannelKey;
  className?: string;
}) {
  const info = CHANNEL_INFO[channelKey];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        info.bgColor,
        className
      )}
    >
      <ChannelMark channelKey={channelKey} size={12} />
      <span className={info.textColor}>{info.name}</span>
    </span>
  );
}

export function ChannelLogoCircle({
  channelKey,
  size = 20,
  className,
}: {
  channelKey: ChannelKey;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-background border border-border flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <ChannelMark channelKey={channelKey} size={Math.round(size * 0.65)} />
    </span>
  );
}
