import { Link } from 'react-router-dom'

function BookCard({ book }) {
  const inStock = book.stock > 0

  return (
    <article className="book-card">
      <Link
        to={`/books/${book._id}`}
        className="book-card-cover-link"
        aria-label={`View ${book.title}`}
      >
        <div className="book-card-cover">
          {book.image ? (
            <img
              src={`/images/${book.image}`}
              alt={book.title}
              className="book-card-image"
              loading="lazy"
            />
          ) : (
            <div className="book-image-placeholder">
              <span>BOOK</span>
            </div>
          )}
        </div>
      </Link>

      <div className="book-card-content">
        <span className="book-card-category">{book.category}</span>

        <h2>
          <Link to={`/books/${book._id}`}>
            {book.title}
          </Link>
        </h2>

        <p className="book-card-author">by {book.author}</p>

        <div className="book-card-bottom">
          <span className="book-card-price">₹{book.price}</span>

          <span className={`book-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        <Link
          to={`/books/${book._id}`}
          className="book-card-button"
        >
          View Details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default BookCard