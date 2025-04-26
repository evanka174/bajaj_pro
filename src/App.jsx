import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorListing from './components/DoctorListing';
import DoctorProfile from './components/DoctorProfile';
import Background from './components/Background';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Background />
        <div className="content-wrapper">
          <Routes>
            
            <Route path="/" element={<DoctorListing />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App; 