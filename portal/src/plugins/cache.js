const cache = {
  session: {
    set(key, value) {
      sessionStorage.setItem(key, value)
    },
    get(key) {
      return sessionStorage.getItem(key)
    },
    remove(key) {
      sessionStorage.removeItem(key)
    },
    clear() {
      sessionStorage.clear()
    },
    setJSON(key, value) {
      sessionStorage.setItem(key, JSON.stringify(value))
    },
    getJSON(key) {
      const value = sessionStorage.getItem(key)
      try {
        return JSON.parse(value)
      } catch (e) {
        return null
      }
    }
  },
  local: {
    set(key, value) {
      localStorage.setItem(key, value)
    },
    get(key) {
      return localStorage.getItem(key)
    },
    remove(key) {
      localStorage.removeItem(key)
    },
    clear() {
      localStorage.clear()
    },
    setJSON(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    getJSON(key) {
      const value = localStorage.getItem(key)
      try {
        return JSON.parse(value)
      } catch (e) {
        return null
      }
    }
  }
}

export default cache 