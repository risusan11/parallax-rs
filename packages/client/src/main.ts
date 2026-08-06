import Phaser from 'phaser';
import { runLobby } from './lobby.js';
import { MainScene } from './main-scene.js';

async function bootstrap(): Promise<void> {
  const lobbyEl = document.querySelector<HTMLElement>('#lobby');
  if (lobbyEl === null) throw new Error('#lobby 要素が見つかりません');

  const room = await runLobby(lobbyEl);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: 640,
    height: 480,
    backgroundColor: '#101018',
  });
  game.scene.add('main', MainScene, true, { room });
}

void bootstrap();
