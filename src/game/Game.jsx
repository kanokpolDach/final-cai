import { useEffect, useRef } from "react";
import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export default function Game({ onInteract }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onInteract);

  useEffect(() => {
    callbackRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 960,
      height: 640,
      parent: containerRef.current,
      backgroundColor: "#567d4b",
      pixelArt: true,
      physics: {
        default: "arcade",
        arcade: { debug: false }
      },
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    const handleInteract = (type) => callbackRef.current?.(type);
    game.events.on("game-interact", handleInteract);

    return () => {
      game.events.off("game-interact", handleInteract);
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="game-container" />;
}