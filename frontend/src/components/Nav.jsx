import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './nav.module.css';

export default function Nav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand} onClick={() => navigate('/habits')}>HabitFlow</div>
      <nav className={styles.links}>
        <Link to="/habits">Hábitos</Link>
        <Link to="/logs">Registros</Link>
      </nav>
      <div className={styles.right}>
        {user && <span className={styles.user}>Olá, {user.name}</span>}
        <button onClick={logout} className={styles.logout}>Sair</button>
      </div>
    </header>
  );
}
