import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Movies from './components/Movies';
import MovieDetail from './components/MovieDetail';
import Directors from './components/Directors';
import Actors from './components/Actors';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/directors" element={<Directors />} />
        <Route path="/actors" element={<Actors />} />
        <Route path="/" element={<Navigate to="/movies" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
