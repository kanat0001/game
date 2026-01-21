import { updateGameScore } from "./api";

const LS_USER = "user";

// gameName: "labyrinth" | "treasure" | "find_different"
export async function awardPoint(gameName, { onLocalUpdate, onSavingChange, onError } = {}) {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;

  let u;
  try {
    u = JSON.parse(raw);
  } catch {
    return null;
  }

  const current = u?.scores?.[gameName] ?? 0;
  const next = current + 1;

  // локально обновляем сразу
  const mergedLocal = {
    ...u,
    scores: { ...u.scores, [gameName]: next },
  };

  localStorage.setItem(LS_USER, JSON.stringify(mergedLocal));
  onLocalUpdate?.(mergedLocal, next);
  onSavingChange?.(true);
  onError?.("");

  try {
    const updatedFromServer = await updateGameScore({
      userId: u.id,
      gameName,
      score: next,
    });

    // ⚠️ бэк сейчас возвращает 0 — НЕ даём ему затирать локальные очки
    const merged = {
      ...updatedFromServer,
      scores: { ...updatedFromServer.scores, [gameName]: next },
    };

    localStorage.setItem(LS_USER, JSON.stringify(merged));
    onLocalUpdate?.(merged, next);

    return merged;
  } catch (e) {
    onError?.(e?.message || "Не удалось сохранить очко");
    return mergedLocal;
  } finally {
    onSavingChange?.(false);
  }
}
