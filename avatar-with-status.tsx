import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type UserStatus = "online" | "offline" | "away";

interface AvatarWithStatusProps {
  src: string;
  alt: string;
  status: UserStatus;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export function AvatarWithStatus({
  src,
  alt,
  status,
  size = "md",
  fallback,
}: AvatarWithStatusProps) {
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "offline":
        return "bg-offline";
      case "away":
        return "bg-warning";
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "md":
        return "w-10 h-10";
      case "lg":
        return "w-12 h-12";
      default:
        return "w-10 h-10";
    }
  };

  const getStatusSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "md":
        return "w-2.5 h-2.5";
      case "lg":
        return "w-3 h-3";
      default:
        return "w-2.5 h-2.5";
    }
  };

  return (
    <div className="relative">
      <Avatar className={getSizeClass(size)}>
        <AvatarImage src={src} alt={alt} className="object-cover" />
        <AvatarFallback>{fallback || alt.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span
        className={`absolute bottom-0 right-0 ${getStatusSizeClass(size)} ${getStatusColor(
          status
        )} rounded-full border-2 border-white`}
      ></span>
    </div>
  );
}
