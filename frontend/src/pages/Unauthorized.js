import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-danger">403 - Unauthorized</h1>
      <p className="lead">You do not have permission to access this page.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
