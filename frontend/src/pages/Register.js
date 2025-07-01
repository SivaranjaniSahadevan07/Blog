import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(register({ username: name, email, password }));
    navigate('/login');
  };

  return (
    <div className="container-fluid p-md-5 p-2 bg-dark-subtle">
      <form onSubmit={handleSubmit} className="p-4 border border-light bg-light rounded mx-auto" style={{ width: "fit-content" }}>
        <fieldset className="border border-3 p-3 rounded">
          <legend className="float-none w-auto px-2 fw-bold">Register</legend>
          <div className="mb-3">
            <label>Name <span className='text-danger'>*</span></label>
            <input
              type="text"
              className="form-control border-secondary-subtle border-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className='d-flex justify-content-center'>
            <button className="btn btn-primary" type="submit">Register</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default Register;