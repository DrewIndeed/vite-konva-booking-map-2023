import { clsx, type ClassValue } from "clsx";
import { ALL_SEAT_STATUS } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = (func: any, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  const debounced = (...args: []) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
  return debounced;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = (func: any, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  let lastExecutedTime = 0;
  const throttled = (...args: []) => {
    const currentTime = Date.now();
    const timeSinceLastExecution = currentTime - lastExecutedTime;
    if (timeSinceLastExecution >= delay) {
      func.apply(this, args);
      lastExecutedTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecutedTime = currentTime;
      }, delay - timeSinceLastExecution);
    }
  };
  return throttled;
};

export const getOS = (forDesktop: boolean = true): string => {
  const userAgent = navigator.userAgent;
  if (forDesktop) {
    if (/Macintosh/i.test(userAgent)) {
      return "MacOS";
    }
    if (/Windows/i.test(userAgent)) {
      return "Windows";
    }
  }
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "WindowsPhone";
  }
  if (/android/i.test(userAgent)) {
    return "Android";
  }
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return "iOS";
  }
  return "unknown";
};

export const getSeatStatusStr = (status: number = 1) =>
  !(status < 1 || status > 6) ? ALL_SEAT_STATUS[status - 1] : "available";

export const getViewBoxRect = (viewBox: string) => {
  const values = viewBox?.split(" ");
  return {
    width: parseInt(values[2]),
    height: parseInt(values[3]),
    x: 0,
    y: 0,
  };
};

type Point = { x: number; y: number };
export const getCenter = (p1: Point, p2: Point) => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

export const getDistance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const cn = (...inputs: ClassValue[]) => {
  // console.log({ test: clsx(inputs) });
  return clsx(inputs);
};
