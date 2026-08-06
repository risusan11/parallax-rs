import Phaser from 'phaser';
import { MainScene } from './main-scene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 640,
  height: 480,
  backgroundColor: '#101018',
  scene: [MainScene],
});
