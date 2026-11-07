import { useEffect, useState } from 'react'
import BookCard from '../components/BookCard'
import API_BASE_URL from '../api'

function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let ignore = false;

    const loadBooks = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/books?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();

        if (!ignore) {
          setBooks(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      ignore = true;
    };
  }, [search, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
  };

  return (
    <main className="books-page">
      <section className="catalogue-heading">
        <p className="section-eyebrow">THE BOOKSHELF</p>
        <h1>Find Your Next <span>Great Read.</span></h1>
        <p className="catalogue-description">
          Explore stories, discover new perspectives, and find books
          worth keeping.
        </p>
      </section>

      <section className="catalogue-toolbar">
        <div className="catalogue-search">
          <span className="search-symbol" aria-hidden="true">⌕</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search by title or author..."
            aria-label="Search books by title or author"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="category-select"
          aria-label="Filter books by category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Fiction">Fiction</option>
          <option value="Science">Science</option>
          <option value="Biography">Biography</option>
        </select>
      </section>

      <section className="catalogue-results">
        <div className="catalogue-results-heading">
          <div>
            <h2>Explore Our Collection</h2>
            {!loading && !error && (
              <p>
                {books.length} {books.length === 1 ? 'book' : 'books'} found
              </p>
            )}
          </div>

          {(search || category) && (
            <button
              className="clear-filters"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <p className="catalogue-message">Finding your next great read...</p>
        )}

        {error && (
          <p className="catalogue-message catalogue-error">{error}</p>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="catalogue-empty">
            <h3>No books found</h3>
            <p>Try another search term or choose a different category.</p>
            <button
              className="clear-filters"
              type="button"
              onClick={clearFilters}
            >
              View all books
            </button>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Books