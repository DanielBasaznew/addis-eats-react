import { useState, useMemo, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  useTableStore,
  selectTables,
  selectAddTable,
  selectDeleteTable,
  selectResetDefaultTables,
} from './tableStore'
import AddTableModal from './AddTableModal'
import DeleteTableModal from './DeleteTableModal'
import { Skeleton } from '../skeleton'

function TableCard({ table, onDelete }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrError, setQrError] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const menuUrl = `${origin}/menu?table=${encodeURIComponent(table.number)}`

  useEffect(() => {
    let isMounted = true

    QRCode.toDataURL(menuUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1a100c',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(`Failed to generate QR for Table ${table.number}:`, err)
          setQrError(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [menuUrl, table.number])

  const isGenerating = !qrDataUrl && !qrError

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `addis-eats-table-${table.number}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="admin-table-card" id={`table-card-${table.number}`}>
      <div className="admin-table-card-header">
        <div className="admin-table-title-wrap">
          <span className="admin-table-number-badge">Table {table.number}</span>
          <h4 className="admin-table-label">{table.label || 'General Dining'}</h4>
        </div>
        <span className="admin-table-seats-pill" title={`${table.seats || 4} guest capacity`}>
          <span className="material-symbols-outlined" aria-hidden="true">
            person
          </span>
          <span>{table.seats || 4} Seats</span>
        </span>
      </div>

      <div className="admin-table-qr-container">
        {isGenerating ? (
          <div className="admin-table-qr-placeholder" style={{ position: 'relative', overflow: 'hidden' }}>
            <Skeleton variant="rectangular" width={160} height={160} borderRadius="8px" />
            <span className="qr-generating-text" style={{ marginTop: '0.6rem' }}>Generating QR...</span>
          </div>
        ) : qrDataUrl ? (
          <div className="admin-table-qr-wrap">
            <img
              src={qrDataUrl}
              alt={`Scan for Addis Eats Table ${table.number} Menu`}
              className="admin-table-qr-image"
            />
            <div className="admin-table-qr-overlay">
              <span className="qr-scan-hint">Scan for Instant Menu</span>
            </div>
          </div>
        ) : (
          <div className="admin-table-qr-placeholder error">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            <span>QR Error</span>
          </div>
        )}
      </div>

      <div className="admin-table-url-wrap">
        <div className="admin-table-url-text" title={menuUrl}>
          <code>/menu?table={table.number}</code>
        </div>
        <button
          type="button"
          className="admin-table-copy-btn"
          onClick={handleCopyLink}
          title="Copy customer menu URL"
          aria-label={`Copy menu link for table ${table.number}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="admin-table-card-footer">
        <button
          type="button"
          className="admin-btn-action download btn-download-qr"
          onClick={handleDownload}
          disabled={!qrDataUrl}
          title={`Download high-res QR code for Table ${table.number}`}
          aria-label={`Download QR code for Table ${table.number}`}
        >
          <span className="material-symbols-outlined action-icon" aria-hidden="true">
            download
          </span>
          <span>Download QR</span>
        </button>

        <button
          type="button"
          className="admin-btn-action delete btn-delete-table"
          onClick={() => onDelete(table)}
          title={`Delete Table ${table.number}`}
          aria-label={`Delete Table ${table.number}`}
        >
          <span className="material-symbols-outlined action-icon" aria-hidden="true">
            delete
          </span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}

function AdminTables() {
  const tables = useTableStore(selectTables)
  const addTable = useTableStore(selectAddTable)
  const deleteTable = useTableStore(selectDeleteTable)
  const resetDefaultTables = useTableStore(selectResetDefaultTables)

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState(null)

  const filteredTables = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return tables

    return tables.filter((table) => {
      const num = String(table.number || '').toLowerCase()
      const label = String(table.label || '').toLowerCase()
      const seats = String(table.seats || '')
      return (
        num.includes(query) ||
        label.includes(query) ||
        seats.includes(query)
      )
    })
  }, [tables, searchQuery])

  const handleAddTable = (tableData) => {
    addTable(tableData)
  }

  const handleConfirmDelete = (tableId) => {
    deleteTable(tableId)
    setTableToDelete(null)
  }

  return (
    <div className="admin-section-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Table Management &amp; QR Ordering</h2>
          <p className="panel-subtitle">
            Configure dining stations, generate unique table QR codes, and export printable QR codes for contactless dining.
          </p>
        </div>
        <div className="panel-header-actions">
          <div className="panel-header-badges">
            <span className="panel-badge panel-badge-live">
              {tables.length} {tables.length === 1 ? 'Station' : 'Stations'} Active
            </span>
          </div>
          <button
            type="button"
            className="admin-btn-primary admin-btn-add-table"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="material-symbols-outlined action-icon" aria-hidden="true">
              add
            </span>
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="admin-state-box">
          <span
            className="material-symbols-outlined admin-state-icon"
            aria-hidden="true"
          >
            table_restaurant
          </span>
          <h3 className="admin-state-title">No Dining Tables Registered</h3>
          <p className="admin-state-text">
            No tables are currently configured. Register your restaurant tables to generate scannable QR codes for direct-to-kitchen customer ordering.
          </p>
          <div className="admin-empty-actions-group">
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span className="material-symbols-outlined action-icon" aria-hidden="true">
                add
              </span>
              <span>Add First Table</span>
            </button>
            <button
              type="button"
              className="admin-btn-retry"
              onClick={resetDefaultTables}
            >
              <span className="material-symbols-outlined action-icon" aria-hidden="true">
                restart_alt
              </span>
              <span>Restore Default Tables (1-6)</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-menu-toolbar">
            <div className="admin-search-wrapper">
              <span
                className="material-symbols-outlined search-icon"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                id="admin-table-search"
                className="admin-search-input"
                placeholder="Search by table number, section (e.g. Patio, Booth), or seats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tables"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <div className="admin-toolbar-meta">
              <span>
                Showing <strong>{filteredTables.length}</strong> of{' '}
                <strong>{tables.length}</strong> tables matching &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                type="button"
                className="admin-btn-reset-filters"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </div>
          )}

          {filteredTables.length === 0 ? (
            <div className="admin-state-box">
              <span
                className="material-symbols-outlined admin-state-icon"
                aria-hidden="true"
              >
                search_off
              </span>
              <h3 className="admin-state-title">No Matching Tables</h3>
              <p className="admin-state-text">
                No tables matched your search query &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                className="admin-btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="admin-tables-grid">
              {filteredTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onDelete={(tbl) => setTableToDelete(tbl)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTable={handleAddTable}
        existingTables={tables}
      />

      {tableToDelete && (
        <DeleteTableModal
          table={tableToDelete}
          isOpen={Boolean(tableToDelete)}
          onClose={() => setTableToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default AdminTables
