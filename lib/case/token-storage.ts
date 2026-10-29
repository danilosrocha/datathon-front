// Token do caso anônimo (`X-Case-Token`). localStorage pode falhar em modo
// privado ou com dados bloqueados: toda leitura e escrita fica em try/catch.

const key = (caseId: string) => `ndp:case:${caseId}`;

export function saveCaseToken(caseId: string, token: string) {
  try {
    localStorage.setItem(key(caseId), token);
  } catch {
    // Sem armazenamento: o caso continua válido só nesta aba.
  }
}

export function readCaseToken(caseId: string): string | null {
  try {
    return localStorage.getItem(key(caseId));
  } catch {
    return null;
  }
}

export function clearCaseToken(caseId: string) {
  try {
    localStorage.removeItem(key(caseId));
  } catch {
    // Nada a limpar.
  }
}
