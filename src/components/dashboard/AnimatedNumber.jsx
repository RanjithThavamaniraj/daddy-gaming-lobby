import { useEffect, useState } from "react";

function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof end !== "number") return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

export default function AnimatedNumber({ value, duration = 2000 }) {
  const count = useCounter(value, duration);
  return <>{count}</>;
}
