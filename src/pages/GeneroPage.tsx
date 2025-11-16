import React, { useEffect, useState } from 'react';
import { supabase } from '../main';

type Genero = { ge_genero: string };

export default function GeneroPage() {
  const [items, setItems] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('genero').select('*').order('ge_genero', { ascending: true });
    if (!error && data) setItems(data as any);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('genero').insert({ ge_genero: nome });
    if (!error) { setNome(''); load(); } else alert(error.message);
  }

  async function handleDelete(ge_genero: string) {
    if (!confirm('Eliminar este género?')) return;
    const { error } = await supabase.from('genero').delete().eq('ge_genero', ge_genero);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Genero }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(row.ge_genero);
    async function save() {
      const { error } = await supabase.from('genero').update({ ge_genero: draft }).eq('ge_genero', row.ge_genero);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft} onChange={e=>setDraft(e.target.value)} />) : row.ge_genero}</td>
        <td style={{width:'200px'}}>
          <div className="d-flex align-items-center gap-1 flex-wrap">
            {editing ? (
              <>
                <button className="btn btn-sm btn-success btn-action" onClick={save}><i className="bi bi-check"/> Guardar</button>
                <button className="btn btn-sm btn-outline-secondary btn-action" onClick={()=>{ setEditing(false); setDraft(row.ge_genero); }}>Cancelar</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-secondary btn-action" onClick={()=>setEditing(true)}><i className="bi bi-pencil-square"/> Editar</button>
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.ge_genero)}><i className="bi bi-trash"/> Eliminar</button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mx-auto" style={{maxWidth:'540px'}}>
        <div className="card-body">
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-tag me-2"/>Registar Género</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Nome do Género</label>
              <input className="form-control" required value={nome} onChange={e=>setNome(e.target.value)} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'640px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Géneros Registados</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th style={{width:'200px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-secondary">Nenhum género registado.</td></tr>
                ) : (
                  items.map(it => <Row key={it.ge_genero} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


