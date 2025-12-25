import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Add from './pages/Add';
import ThesisDetails from './pages/details/ThesisDetails';
import PersonDetails from './pages/details/PersonDetails';
import UniversityDetails from './pages/details/UniversityDetails';
import InstituteDetails from './pages/details/InstituteDetails';
import ThesisEdit from './pages/edit/ThesisEdit';
import PersonEdit from './pages/edit/PersonEdit';
import UniversityEdit from './pages/edit/UniversityEdit';
import InstituteEdit from './pages/edit/InstituteEdit';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/add" element={<Add />} />
        
        {/* Details Pages */}
        <Route path="/details/thesis/:id" element={<ThesisDetails />} />
        <Route path="/details/person/:id" element={<PersonDetails />} />
        <Route path="/details/university/:id" element={<UniversityDetails />} />
        <Route path="/details/institute/:id" element={<InstituteDetails />} />
        
        {/* Edit Pages */}
        <Route path="/edit/thesis/:id" element={<ThesisEdit />} />
        <Route path="/edit/person/:id" element={<PersonEdit />} />
        <Route path="/edit/university/:id" element={<UniversityEdit />} />
        <Route path="/edit/institute/:id" element={<InstituteEdit />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
