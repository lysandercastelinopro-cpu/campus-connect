export function formatMessageDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  
  // Format Date: "Oct 28, 2026"
  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format Time: "4:18 PM"
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
}

export function formatMessageTime(date) {
  return formatMessageDateTime(date);
}
