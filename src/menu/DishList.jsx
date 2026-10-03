import DishCard from './DishCard'

function DishList({ dishes, tableNumber }) {
  if (!dishes || dishes.length === 0) {
    return (
      <div className="no-dishes-box">
        <p className="no-dishes-message">No dishes found.</p>
      </div>
    )
  }

  return (
    <div className="dish-grid">
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={dish} tableNumber={tableNumber} />
      ))}
    </div>
  )
}

export default DishList
