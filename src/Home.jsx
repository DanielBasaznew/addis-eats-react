import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchDishes } from './api/dishes'
import DishCard from './menu/DishCard'
import { DishGridSkeleton } from './skeleton'

function Home() {
  const [featuredDishes, setFeaturedDishes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadHighlights() {
      try {
        const dishes = await fetchDishes()
        if (isMounted) {
          // Display top 3 real dishes from menu data
          setFeaturedDishes(dishes.slice(0, 5))
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadHighlights()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="home-container">
      {/* 1. Warm Heritage Hero */}
      <section className="hero-section" aria-label="Welcome hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-eyebrow">Authentic Ethiopian Dining</span>
            <h1 className="hero-title">
              Handcrafted stews, fresh teff injera, and highland specialties.
            </h1>
            <p className="hero-description">
              Savor the rich culinary heritage of Addis Ababa — slow-simmered wats,
              sizzling tibs, and vibrant vegetarian combinations prepared fresh daily
              and delivered straight to your door.
            </p>

            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">
                <span>Browse Full Menu</span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
              <Link to="/favorites" className="btn btn-secondary btn-lg">
                View Favorites
              </Link>
            </div>

            {/* Clean Trust Perks Strip */}
            <div className="trust-strip">
              <div className="trust-item">
                <span className="material-symbols-outlined trust-icon" aria-hidden="true">
                  schedule
                </span>
                <div>
                  <span className="trust-title">25–45 Mins</span>
                  <span className="trust-sub">Fast City Delivery</span>
                </div>
              </div>

              <div className="trust-item">
                <span className="material-symbols-outlined trust-icon" aria-hidden="true">
                  restaurant
                </span>
                <div>
                  <span className="trust-title">100% Teff</span>
                  <span className="trust-sub">Clay Mitad Baked</span>
                </div>
              </div>

              <div className="trust-item">
                <span className="material-symbols-outlined trust-icon" aria-hidden="true">
                  payments
                </span>
                <div>
                  <span className="trust-title">Easy Payments</span>
                  <span className="trust-sub">Telebirr • CBE • Cash</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Food Visual */}
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2CBwphdwTCIey-bHnUUK-7kjRw-lp7pDZ8b1flmzlCZsqdOuA5-kbTMGFJYmCgUJHppqm06HM3qi6Eyab_WOgrUTee_oXlbiQk_a9kwMhBY_InKOooJFa1ISGJ3HvuwOtl5nJTA5x_-FpffQA7pDimQGMQVC9fdTeU5nVcv_SrgAtPGwTW5w9TQGLbZy7jGxKOXmHOx-Y7frSpWeTbrKAGW81bmhyq4u04uQ-rlx7aqM46A-9piKO"
                alt="Traditional Ethiopian dining feast featuring Doro Wat, Tibs, and Injera rolls"
                className="hero-image"
                loading="eager"
              />
              <div className="hero-image-badge">
                <span className="material-symbols-outlined" aria-hidden="true">
                  stars
                </span>
                <span>Highland Specialty Recipe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Quick Filter */}
      <section className="categories-section" aria-label="Browse by category">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Explore Our Kitchen</span>
            <h2 className="section-title">Popular Categories</h2>
          </div>
          <Link to="/menu" className="link-view-all">
            View All Dishes &rarr;
          </Link>
        </div>

        <div className="category-chips-grid">
          <Link to="/menu" className="category-chip">
            <span className="material-symbols-outlined chip-icon" aria-hidden="true">
              dinner_dining
            </span>
            <span>All Dishes</span>
          </Link>
          <Link to="/menu?category=traditional" className="category-chip">
            <span className="material-symbols-outlined chip-icon" aria-hidden="true">
              soup_kitchen
            </span>
            <span>Traditional Wat</span>
          </Link>
          <Link to="/menu?category=meat+%26+grill" className="category-chip">
            <span className="material-symbols-outlined chip-icon" aria-hidden="true">
              skillet
            </span>
            <span>Meat &amp; Grill</span>
          </Link>
          <Link to="/menu?category=vegetarian" className="category-chip">
            <span className="material-symbols-outlined chip-icon" aria-hidden="true">
              eco
            </span>
            <span>Vegetarian &amp; Fasting</span>
          </Link>
          <Link to="/menu?category=breakfast" className="category-chip">
            <span className="material-symbols-outlined chip-icon" aria-hidden="true">
              bakery_dining
            </span>
            <span>Breakfast &amp; Firfir</span>
          </Link>
        </div>
      </section>

      {/* 3. Featured Dishes Showcase */}
      <section className="featured-section" aria-label="Featured dishes">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Chef&apos;s Highlights</span>
            <h2 className="section-title">Featured Delicacies</h2>
            <p className="section-subtitle">
              Customer favorites made with authentic highland berbere and clarified spiced butter.
            </p>
          </div>
          <Link to="/menu" className="btn btn-secondary">
            Browse Full Menu
          </Link>
        </div>

        {loading ? (
          <DishGridSkeleton count={5} />
        ) : (
          <div className="dish-grid">
            {featuredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Culinary Pillars Trust Cards */}
      <section className="pillars-section" aria-label="Why Addis Eats">
        <div className="pillar-card">
          <div className="pillar-icon-box">
            <span className="material-symbols-outlined" aria-hidden="true">
              agriculture
            </span>
          </div>
          <h3 className="pillar-title">100% Pure Teff</h3>
          <p className="pillar-desc">
            Naturally fermented for 3 days and baked on traditional clay mitads for the
            fluffiest, authentic eyelet texture.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <span className="material-symbols-outlined" aria-hidden="true">
              local_fire_department
            </span>
          </div>
          <h3 className="pillar-title">Artisan Niter Kibbeh</h3>
          <p className="pillar-desc">
            Highland clarified butter slowly infused with korarima cardamom, koseret,
            and 12 heirloom herbs.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <span className="material-symbols-outlined" aria-hidden="true">
              moped
            </span>
          </div>
          <h3 className="pillar-title">Hot &amp; Fresh Delivery</h3>
          <p className="pillar-desc">
            Dispatched in insulated packaging from our central Bole hub to keep your
            meal warm and ready to serve.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home
