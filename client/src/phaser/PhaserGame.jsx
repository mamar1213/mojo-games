import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

export default function PhaserGame({ sceneClass, sceneData, onReady }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#081c15',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
        create: function () {
          sceneClass.prototype.create.call(this);
        },
        init: function (data) {
          sceneClass.prototype.init.call(this, sceneData || {});
        },
        update: function (time, delta) {
          if (sceneClass.prototype.update) sceneClass.prototype.update.call(this, time, delta);
        },
        preload: function () {
          if (sceneClass.prototype.preload) sceneClass.prototype.preload.call(this);
        }
      },
      input: { activePointers: 3 }
    };

    // Use proper scene instantiation
    const scene = new sceneClass();
    const gameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#081c15',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [sceneClass],
      input: { activePointers: 3 }
    };

    gameRef.current = new Phaser.Game(gameConfig);
    gameRef.current.scene.start(scene.constructor.name || 'default', sceneData || {});

    if (onReady) onReady(gameRef.current);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [sceneClass]);

  return <div ref={containerRef} className="w-full h-full" />;
}
