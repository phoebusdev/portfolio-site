import { NavLink } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">
          Portfolio
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/press"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Press
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/resources"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Resources
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
