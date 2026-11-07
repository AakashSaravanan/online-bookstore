import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load books.");
        }
        return response.json();
      })
      .then((data) => {
        setBooks(data.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">
            THE WORLD OF BOOKS AWAITS
          </span>

          <h1>
            Find your next <span>great read.</span>
          </h1>

          <p>
            Explore stories, discover new perspectives, and find
            the books that stay with you long after the final page.
          </p>

          <Link to="/books" className="hero-button">
            Explore Collection <span>↗</span>
          </Link>
        </div>

        <div className="hero-visual">
          <img
            src="/images/hobbit.jpg"
            alt="Featured book"
            className="hero-book-image"
          />
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <div>
            <span className="section-kicker">CURATED FOR READERS</span>
            <h2>Discover your next read.</h2>
            <p>Explore books selected for curious minds.</p>
          </div>

          <Link to="/books" className="text-link">
            View all books ↗
          </Link>
        </div>

        {loading && <p>Loading featured books...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p>No books are currently available.</p>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <article className="book-card" key={book._id}>
                {book.image && (
                  <img
                    src={`/images/${book.image}`}
                    alt={book.title}
                    className="book-card-image"
                  />
                )}

                <h2>{book.title}</h2>
                <p>{book.author}</p>
                <p>₹{book.price}</p>

                <Link to={`/books/${book._id}`}>
                  View Details ↗
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="category-section">
        <div className="home-section">
          <div className="home-section-header">
            <div>
              <span className="section-kicker">FIND YOUR INTEREST</span>
              <h2>Explore by category.</h2>
            </div>
          </div>

          <div className="category-grid">
            {["Fantasy", "Fiction", "Science", "Biography"].map(
              (category) => (
                <Link
                  key={category}
                  to="/books"
                  className="category-tile"
                >
                  {category}
                  <span>↗</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="promo-banner">
          <div>
            <span className="section-kicker" style={{ color: "#E7AAB8" }}>
              YOUR NEXT CHAPTER
            </span>
            <h2>A good book changes everything.</h2>
            <p>Find your next favourite book in our collection.</p>
          </div>

          <Link to="/books" className="hero-button">
            Start Exploring ↗
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;