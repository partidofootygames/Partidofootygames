/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import HomePage from './components/HomePage';
import CreateMatch from './components/CreateMatch';
import Bingo from './components/Bingo';
import Leaderboard from './components/Leaderboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-match" element={<CreateMatch />} />
        <Route path="/bingo" element={<Bingo />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<><HomePage /><Login /></>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
