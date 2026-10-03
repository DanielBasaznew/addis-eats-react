import Skeleton from './Skeleton'

/**
 * AdminDishTableSkeleton renders placeholder rows matching the Admin dishes catalog table.
 * @param {Object} props
 * @param {number} [props.rowCount=5] Number of table rows to render
 */
function AdminDishTableSkeleton({ rowCount = 5 }) {
  const rows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div
      className="admin-table-container admin-table-skeleton-container"
      role="status"
      aria-label="Loading dishes catalog..."
      aria-busy="true"
    >
      <table className="admin-dishes-table" aria-hidden="true">
        <thead>
          <tr>
            <th scope="col" className="col-dish">Dish Name</th>
            <th scope="col" className="col-category">Category</th>
            <th scope="col" className="col-price">Price</th>
            <th scope="col" className="col-status">Availability</th>
            <th scope="col" className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rowKey) => (
            <tr key={rowKey} className="admin-table-row">
              <td className="col-dish">
                <div className="admin-dish-cell">
                  <Skeleton
                    variant="rectangular"
                    className="admin-dish-thumb"
                    width={52}
                    height={52}
                  />
                  <div className="admin-dish-info" style={{ flexGrow: 1 }}>
                    <Skeleton
                      variant="text"
                      className="admin-table-skeleton-dish-name"
                      width={`${55 + (rowKey % 3) * 15}%`}
                    />
                    <Skeleton
                      variant="text"
                      className="admin-table-skeleton-dish-desc"
                      width={`${70 + (rowKey % 2) * 15}%`}
                    />
                  </div>
                </div>
              </td>
              <td className="col-category">
                <Skeleton variant="pill" className="admin-table-skeleton-badge" />
              </td>
              <td className="col-price">
                <Skeleton variant="text" className="admin-table-skeleton-price" />
              </td>
              <td className="col-status">
                <Skeleton variant="pill" className="admin-table-skeleton-status" />
              </td>
              <td className="col-actions">
                <div className="admin-actions-group" style={{ display: 'flex', gap: '0.5rem' }}>
                  <Skeleton variant="rectangular" width="4.5rem" height="2rem" borderRadius="6px" />
                  <Skeleton variant="rectangular" width="3.5rem" height="2rem" borderRadius="6px" />
                  <Skeleton variant="rectangular" width="2rem" height="2rem" borderRadius="6px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDishTableSkeleton
