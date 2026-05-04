import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VetXLanding from './pages/VetXLanding';
import Login from './pages/Login';
import OwnerHome from './pages/owner/Home';
import Pets from './pages/owner/Pets';
import PetsAdd from './pages/owner/PetsAdd';
import PetsView from './pages/owner/PetsView';
import Appointments from './pages/owner/Appointments';
import Vets from './pages/owner/Vets';
import VetView from './pages/owner/VetView';
import AppointmentView from './pages/owner/AppointmentView';
import MedicalRecords from './pages/owner/MedicalRecords';
import Settings from './pages/owner/Settings';

// vet routes 
import VetRegistrationForm from './pages/vet/Form';
import VetLogin from './pages/vet/Login';
import VetLayout from './pages/vet/Layout';
import VetDashboardHome from './pages/vet/DashboardHome';
import VetAppointments from './pages/vet/Appointments';
import VetProfile from './pages/vet/Profile';
import VetAppointmentView from './pages/vet/AppointmentView';
import VetChoice from './pages/vet/VetChoice';


import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VetXLanding />} />
        <Route path="/login" element={<Login />} />
        
        {/* Owner routes */}
        <Route path="/owner" element={<ProtectedRoute><OwnerHome /></ProtectedRoute>} />
        <Route path="/owner/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
        <Route path="/owner/pets/add" element={<ProtectedRoute><PetsAdd /></ProtectedRoute>} />
        <Route path="/owner/pets/:id" element={<ProtectedRoute><PetsView /></ProtectedRoute>} />
        <Route path="/owner/pets/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
        <Route path="/owner/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/owner/vets" element={<ProtectedRoute><Vets /></ProtectedRoute>} />
        <Route path="/owner/vets/:id" element={<ProtectedRoute><VetView /></ProtectedRoute>} />
        <Route path="/owner/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/owner/appointments/:id" element={<ProtectedRoute><AppointmentView /></ProtectedRoute>} />

        {/* Vet routes */}
        <Route path="/vet" element={<VetChoice />} />
        <Route path="/vet/register" element={<VetRegistrationForm />} />
        <Route path="/vet/login" element={<VetLogin />} />
        <Route path="/vet/dashboard" element={
          <ProtectedRoute>
            <VetLayout />
          </ProtectedRoute>
        }>
          <Route index element={<VetDashboardHome />} />
          <Route path="appointments" element={<VetAppointments />} />
          <Route path="appointments/:id" element={<VetAppointmentView />} />
          <Route path="profile" element={<VetProfile />} />
        </Route>

        <Route path="*" element={<VetXLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
