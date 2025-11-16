import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function SidebarLayout() {
  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-3 col-lg-2 d-md-block sidebar" style={{background:'#fff',borderRight:'2px solid #812f2b',paddingTop:'2rem',minHeight:'100vh'}}>
          <div className="position-sticky">
            <ul className="nav flex-column">
              <li className="nav-item">
                <NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/">
                  <i className="bi bi-house me-2"></i>Home
                </NavLink>
              </li>
              <li className="nav-item">
                <div className="nav-link" data-bs-toggle="collapse" data-bs-target="#submenu-livros" role="button" aria-expanded="true" aria-controls="submenu-livros">
                  <i className="bi bi-journal-plus me-2"></i>Livros <i className="bi bi-caret-down float-end"></i>
                </div>
                <div className="collapse show" id="submenu-livros">
                  <ul className="nav flex-column ms-3 mt-1">
                    <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/livro">Registar Livro</NavLink></li>
                    <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/exemplar">Gerir Exemplares</NavLink></li>
                  </ul>
                </div>
              </li>
              <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/codigo-postal"><i className="bi bi-geo-alt me-2"></i>Código Postal</NavLink></li>
              <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/editora"><i className="bi bi-building me-2"></i>Editora</NavLink></li>
              <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/utente"><i className="bi bi-person me-2"></i>Utente</NavLink></li>
              <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/autor"><i className="bi bi-pen me-2"></i>Autor</NavLink></li>
              <li className="nav-item"><NavLink className={({isActive})=>`nav-link ${isActive?'active':''}`} to="/genero"><i className="bi bi-tag me-2"></i>Género</NavLink></li>
            </ul>
          </div>
        </nav>
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


