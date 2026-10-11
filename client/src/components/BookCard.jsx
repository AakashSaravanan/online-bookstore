// Import Link so we can navigate to the Book Details page
import { Link } from "react-router-dom";

// This component displays information about one book.
function BookCard({ book }) {
  return (
    <div className="book-card">
      {book.image && (
        <img
            src={`/images/${book.image}`}
            alt={book.title}
            className="book-card-image"
        />
      )}

      <h2>{book.title}</h2>

      <p>Author: {book.author}</p>

      <p>Price: ₹{book.price}</p>

      <p>Category: {book.category}</p>

      <p>Stock: {book.stock}</p>

      {/* Navigate to the details page using the book's ID */}
      <Link to={`/books/${book._id}`}>
        View Details
      </Link>
    </div>
  );
}

export default BookCard;