import {
  type CursorEffectResult,
  emojiCursor,
  fairyDustCursor,
  rainbowCursor,
  springyEmojiCursor,
} from "cursor-effects";
import { useEffect, useState } from "react";

import { EMOJIS } from "./emojis";

const shorterEmojis: string[][] = [];
for (const array of EMOJIS) {
  const copy = structuredClone(array);
  copy.sort(() => Math.random() - 0.5);
  shorterEmojis.push(copy.slice(0, 10));
}

type Keys = keyof typeof possibleCursors;
const possibleCursors = {
  emoji: () => {
    const emoji =
      shorterEmojis[Math.floor(Math.random() * shorterEmojis.length)];
    return new (emojiCursor as any)({ emoji }) as CursorEffectResult;
  },
  rainbow: () => {
    return new (rainbowCursor as any)({}) as CursorEffectResult;
  },
  springy: () => {
    const emojis =
      shorterEmojis[Math.floor(Math.random() * shorterEmojis.length)];
    emojis.sort(() => Math.random() - 0.5);
    const randomEmoji = emojis[0];
    return new (springyEmojiCursor as any)({
      emoji: randomEmoji,
    }) as CursorEffectResult;
  },
  fairyDust: () => new (fairyDustCursor as any)({}) as CursorEffectResult,
};

function getRandomCursor(before: string = "") {
  const keys = Object.keys(possibleCursors) as Keys[];
  let randomKey = keys[Math.floor(Math.random() * keys.length)];
  while (randomKey === before) {
    randomKey = keys[Math.floor(Math.random() * keys.length)];
  }
  return randomKey;
}

export default function ConfettiScreensaver() {
  const [run, setRun] = useState(false);
  const [cursorName, setCursorName] = useState<Keys | null>(null);
  const [cursor, setCursor] = useState<CursorEffectResult | null>(null);

  useEffect(() => {
    setCursorName(getRandomCursor());
  }, []);

  useEffect(() => {
    if (cursorName) {
      setCursor(possibleCursors[cursorName]());
    }
  }, [cursorName]);

  useEffect(() => {
    if (cursor) {
      setRun(true);
    }
  }, [cursor]);

  return (
    <div>
      {run && (
        <AboutScreensaver
          stopScreensaver={() => {
            setRun(false);
            console.log("BEFORE", document.querySelectorAll("canvas"));
            if (cursor) cursor.destroy();
            console.log("AFTER", document.querySelectorAll("canvas"));
          }}
          changeCursor={() => {
            if (cursor) cursor.destroy();
            setCursorName(getRandomCursor(cursorName ? cursorName : ""));
          }}
        />
      )}
    </div>
  );
}
function AboutScreensaver({
  stopScreensaver,
  changeCursor,
}: {
  stopScreensaver: () => void;
  changeCursor: () => void;
}) {
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

  const [colors] = useState(getLetterRandomColors("Cursor activated!"));

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
      <strong style={{ fontSize: "150%" }}>
        {colors.map(([char, color]) => {
          return (
            <span key={char + color} style={{ color }}>
              {char}
            </span>
          );
        })}
      </strong>
      <br />
      <button
        style={{ padding: "5px 10px", fontSize: "90%" }}
        onClick={() => stopScreensaver()}
      >
        Stop this silliness
      </button>{" "}
      <button
        style={{ padding: "5px 10px", fontSize: "90%" }}
        onClick={() => changeCursor()}
      >
        Change cursor
      </button>
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
