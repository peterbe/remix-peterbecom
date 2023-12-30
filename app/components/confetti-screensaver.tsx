import JSConfetti from "js-confetti";
import { useEffect, useState } from "react";

import { EMOJIS } from "./emojis";

// Determines how long to wait after
const STARTS_SECONDS = 130;

export default function ConfettiScreensaver() {
  const [run, setRun] = useState(false);
  const [jsConfetti] = useState(new JSConfetti());

  useEffect(() => {
    let i = Math.floor(Math.random() * EMOJIS.length);
    const interval = window.setInterval(() => {
      if (run) {
        const emojis = Array.from(EMOJIS[i++ % EMOJIS.length]).sort(
          () => Math.random() - 0.5,
        );

        jsConfetti.addConfetti({
          // emojiSize: 60, // Default is 80
          confettiNumber: 60, // Default is 40
          emojis,
        });
      }
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [run]);

  // This starts and re-starts the animation.
  // I.e. the very first time and then, after the screensaver has been
  // turned off.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRun(true);
    }, STARTS_SECONDS * 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [run]);

  useEffect(() => {
    function noticeScroll() {
      setRun(false);
    }
    function noticeAnyClick() {
      setRun(false);
    }
    function noticeMouseOver() {
      setRun(false);
    }
    window.addEventListener("scroll", noticeScroll);
    window.addEventListener("click", noticeAnyClick);
    window.addEventListener("mouseover", noticeMouseOver);
    return () => {
      window.removeEventListener("scroll", noticeScroll);
      window.removeEventListener("click", noticeAnyClick);
      window.removeEventListener("mouseover", noticeMouseOver);
    };
  }, [run]);

  return (
    <div>
      {run && <AboutScreensaver />}
      {/* <AboutScreensaver /> */}
      {/* <Debug /> */}
      {/* <button onClick={() => setRun(!run)}>Toggle</button> */}
    </div>
  );
}
function AboutScreensaver() {
  const [opacity, setOpacity] = useState(0.0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (opacity < 1) {
        setOpacity((p) => p + 0.07);
      } else if (opacity >= 1) {
        clearInterval(interval);
      }
    }, 70);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const [colors] = useState(getLetterRandomColors("Screensaver Activated"));

  return (
    <div
      style={{
        opacity,
        position: "absolute",
        zIndex: 100,
        left: "50%",
        textAlign: "center",
        top: window.scrollY,
        // backgroundColor: "white",
        // backdropFilter: "blur(10px)",
        borderRadius: 10,
        padding: 10,
      }}
    >
      <strong style={{ fontSize: "220%" }}>
        {colors.map(([char, color]) => {
          return (
            <span key={char + color} style={{ color }}>
              {char}
            </span>
          );
        })}
      </strong>
      <br />
      <em>Don't hate!</em>
    </div>
  );
}

function getLetterRandomColors(text: string) {
  return Array.from(text).map((char) => [char, getRandomBrightColor()]);
}

function getRandomBrightColor() {
  // Generate random values for RGB components
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Ensure the color is bright by setting minimum values for each component
  const minBrightness = 150;
  const brightness = (red + green + blue) / 3;
  const multiplier = Math.max(1, minBrightness / brightness);

  // Adjust the components to meet the brightness criteria
  const adjustedRed = Math.min(Math.floor(red * multiplier), 255);
  const adjustedGreen = Math.min(Math.floor(green * multiplier), 255);
  const adjustedBlue = Math.min(Math.floor(blue * multiplier), 255);

  // Convert RGB to hex format
  const hexColor = `#${componentToHex(adjustedRed)}${componentToHex(
    adjustedGreen,
  )}${componentToHex(adjustedBlue)}`;

  return hexColor;
}

function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
