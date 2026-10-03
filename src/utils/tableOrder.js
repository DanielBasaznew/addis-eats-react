const TABLE_SESSION_KEY = 'addis_eats_table_session'

export function getTableNumber(searchParams) {
  let queryTable = null
  if (searchParams) {
    if (typeof searchParams.get === 'function') {
      queryTable = searchParams.get('table')
    } else if (typeof searchParams === 'object' && searchParams.table) {
      queryTable = searchParams.table
    }
  }

  if (!queryTable && typeof window !== 'undefined' && window.location) {
    try {
      const params = new URLSearchParams(window.location.search)
      queryTable = params.get('table')
    } catch {}
  }

  if (queryTable && String(queryTable).trim()) {
    const cleanTable = String(queryTable).trim()
    try {
      sessionStorage.setItem(TABLE_SESSION_KEY, cleanTable)
    } catch {}
    return cleanTable
  }

  try {
    if (typeof sessionStorage !== 'undefined') {
      const sessionTable = sessionStorage.getItem(TABLE_SESSION_KEY)
      if (sessionTable && String(sessionTable).trim()) {
        return String(sessionTable).trim()
      }
    }
  } catch {}

  return null
}

export function setTableSession(tableNumber) {
  if (!tableNumber) return
  try {
    sessionStorage.setItem(TABLE_SESSION_KEY, String(tableNumber).trim())
  } catch {}
}

export function clearTableSession() {
  try {
    sessionStorage.removeItem(TABLE_SESSION_KEY)
  } catch {}
}

export function appendTableQuery(path, tableNumber) {
  if (!path || !tableNumber) return path

  const [baseAndQuery, hash] = path.split('#')
  const separator = baseAndQuery.includes('?') ? '&' : '?'
  const updatedPath = `${baseAndQuery}${separator}table=${encodeURIComponent(String(tableNumber).trim())}`

  return hash !== undefined ? `${updatedPath}#${hash}` : updatedPath
}
