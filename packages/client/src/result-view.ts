/** リザルト画面に表示するクリア結果のスナップショット。 */
export interface ResultSnapshot {
  readonly clearTimeMs: number;
  readonly observerDistance: number;
  readonly retryCount: number;
}

/** ミリ秒を `分:秒`(秒は2桁ゼロ埋め)の表示用文字列に整形する。 */
export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** クリア時間・観測者の移動距離・リトライ回数を、リザルト画面表示用の行に整形する。 */
export function formatResultSummary(snapshot: ResultSnapshot): ReadonlyArray<string> {
  return [
    `クリア時間: ${formatElapsedTime(snapshot.clearTimeMs)}`,
    `観測者の移動距離: ${snapshot.observerDistance}マス`,
    `リトライ回数: ${snapshot.retryCount}回`,
  ];
}
