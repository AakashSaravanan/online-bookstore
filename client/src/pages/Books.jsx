// useState is used to store and update data in the component.
// useEffect is used to run code when the component loads or when specific data changes.
import { useEffect, useState } from 'react'
import BookCard from '../components/BookCard'
import API_BASE_URL from "../api";

function Books() {
  const [books, setBooks] = useState([])        //The useState hook is used to create a state variable called books, which is initialized as an empty array. This state will hold the list of books fetched from the server.
  const [loading, setLoading] = useState(true)  //loading tracks whether the books are still being fetched.
  const [error, setError] = useState('')        //error stores an error message if fetching books fails.
  const [search, setSearch] = useState('')      //search stores the text entered by the user.
  const [category, setCategory] = useState('')  //category stores the category selected by the user.
  
  useEffect(() => {
    fetch(
      `${API_BASE_URL}/api/books?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        return response.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to connect to the server.");
        setLoading(false);
      });
  }, [search, category]);

  return (
    <div className="books-page">
        <h1>Books</h1>
        <input
        className="search-input"
        type="text"
        placeholder="Search books..."
        value={search}
        onChange={(event) => {
          setLoading(true);
          setError("");
          setSearch(event.target.value);
        }}
        />
        <select
            className="category-select"
            value={category}
            onChange={(event) => {
              setLoading(true);
              setError("");
              setCategory(event.target.value);
            }}
        >
            <option value="">All Categories</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Fiction">Fiction</option>
            <option value="Science">Science</option>
            <option value="Biography">Biography</option>
        </select>

        {loading && <p>Loading books...</p>}     

        {error && <p>{error}</p>}

        {books.length === 0 && !loading && !error && (
            <p>No books found.</p>
        )}

        <div className="books-grid">
            {books.map((book) => (
                <BookCard key={book._id} book={book} />
            ))}
        </div>    
    </div>
  )
}

export default Books