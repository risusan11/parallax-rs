/**
 * サーバー(@parallax-rs/server の ParallaxRoomState)が送るルーム状態の形。
 * クライアントは server パッケージに依存しないため、デコード結果の形を
 * ここで独立に定義する。
 */
export interface ParallaxPlayerState {
  readonly sessionId: string;
  readonly roleId: string;
  readonly x: number;
  readonly y: number;
}

export interface ParallaxRoomState {
  readonly status: string;
  readonly clearTimeMs: number;
  readonly observerDistance: number;
  readonly retryCount: number;
  readonly players: {
    readonly size: number;
    forEach(callback: (player: ParallaxPlayerState, sessionId: string) => void): void;
  };
}
