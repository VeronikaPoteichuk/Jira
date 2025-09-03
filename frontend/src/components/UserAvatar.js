import React from "react";
import "./UserAvatar.css";

const UserAvatar = ({ user, size = "medium", className = "" }) => {
  const getInitials = user => {
    if (!user) return "?";

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const username = user.username || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (username) {
      return username.charAt(0).toUpperCase();
    }

    return "?";
  };

  const getAvatarColor = user => {
    if (!user) return "#6c757d";

    const seed = user.username || user.email || "default";
    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 45 + (Math.abs(hash) % 15); // 45-60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const initials = getInitials(user);
  const backgroundColor = getAvatarColor(user);

  const sizeClass = `avatar-${size}`;
  const combinedClassName = `user-avatar ${sizeClass} ${className}`.trim();

  return (
    <div className={combinedClassName} style={{ backgroundColor }} title={user?.username || "User"}>
      <span className="avatar-text">{initials}</span>
    </div>
  );
};

export default UserAvatar;
