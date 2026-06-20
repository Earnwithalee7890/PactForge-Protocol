"use client";
import { useState, useEffect } from "react";

/**
 * A glassmorphic float-button that allows the user to smoothly scroll
 * back to the top of the viewport when they scroll down past 300px.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "rgba(99, 102, 241, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        color: "#ffffff",
        fontSize: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        transition: "all 0.3s ease",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.background = "rgba(99, 102, 241, 0.4)";
        e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
      }}
      aria-label="Scroll to top"
    >
      ▲
    </button>
  );
}
