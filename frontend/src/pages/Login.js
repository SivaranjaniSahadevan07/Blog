import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Navigate to home if authenticated
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login({ email, password }));
  }

  return (
    <div className="container-fluid p-md-5 p-2 bg-dark-subtle h-100">

      {/* <h2>Login</h2> */}
      <form onSubmit={handleSubmit} className="p-4 border border-light bg-light rounded mx-auto" style={{width: "fit-content"}}>
        <fieldset className="border border-3 p-3 rounded">
          <legend className="float-none w-auto px-2 fw-bold">Login</legend>
          <div className="mb-3">
            <label>Email <span className='text-danger'>*</span></label>
            <input
              type="email"
              className="form-control border-secondary-subtle border-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password <span className='text-danger'>*</span></label>
            <input
              type="password"
              className="form-control border-secondary-subtle border-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <div className='d-flex justify-content-center'>
            <button className="btn btn-primary" type="submit">Login</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default Login;