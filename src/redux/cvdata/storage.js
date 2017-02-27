// Side effects Services
export function getCachedData(key) {
  return JSON.parse(localStorage.getItem(key))
}

export function setCachedData(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
