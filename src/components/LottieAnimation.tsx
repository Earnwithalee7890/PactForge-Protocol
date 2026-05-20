"use client";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LottieAnimationProps {
  src: string;
  style?: React.CSSProperties;
}

export default function LottieAnimation({ src, style }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch animation");
        return res.json();
      })
      .then((data) => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading Lottie animation:", err);
        setLoading(false);
      });
  }, [src]);

  if (loading || !animationData) {
    return (
      <div style={{ 
        width: style?.width || "100%", 
        height: style?.height || "300px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "#6366f1",
        fontSize: "24px"
      }} className="animate-pulse">
        🔄
      </div>
    );
  }

  return <Lottie animationData={animationData} style={style} loop={true} />;
}
