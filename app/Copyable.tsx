import { Children, ReactNode, useEffect, useState } from "react";

type Props = {
  className: string;
  children: ReactNode;
};

export default function Copyable({ className, children }: Props) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (showNotification) {
      const handle = setTimeout(() => setShowNotification(false), 1000);
      return () => clearTimeout(handle);
    }
  }, [showNotification]);

  return (
    <div
      className={className}
      onClick={() => {
        if (children) {
          window.navigator.clipboard.writeText(
            Children.toArray(children).join("")
          );
          setShowNotification(true);
        }
      }}
    >
      {showNotification ? "Copied!" : children}
    </div>
  );
}
