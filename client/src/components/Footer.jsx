import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>BOOKSHELF.</h2>
          <p>
            A place for readers to discover stories, explore ideas,
            and find their next favourite book.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/books">Explore Books</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/my-orders">My Orders</Link>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} BOOKSHELF. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;