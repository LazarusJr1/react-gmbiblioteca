import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Autor = {
  au_cod: number;
  au_nome: string;
  au_pais: string;
};

export default function AutorPage() {
  const [items, setItems] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Autor>>({});
  const nextAuCod = useMemo(()=> (items.reduce((m,i)=>Math.max(m, i.au_cod||0),0)+1)||1, [items]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('autor').select('*').order('au_nome', { ascending: true });
    if (!error && data) setItems(data as any);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const payload: Autor = {
      au_cod: (form.au_cod as number) ?? nextAuCod,
      au_nome: (form.au_nome as string) ?? '',
      au_pais: (form.au_pais as string) ?? ''
    };
    const { error } = await supabase.from('autor').insert(payload);
    if (!error) { setForm({}); load(); } else alert(error.message);
  }

  async function handleDelete(au_cod: number) {
    if (!confirm('Eliminar este autor?')) return;
    const { error } = await supabase.from('autor').delete().eq('au_cod', au_cod);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Autor }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Autor>(row);
    async function save() {
      const patch = { ...draft } as any; delete patch.au_cod;
      const { error } = await supabase.from('autor').update(patch).eq('au_cod', row.au_cod);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{row.au_cod}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.au_nome} onChange={e=>setDraft({...draft, au_nome:e.target.value})} />) : row.au_nome}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.au_pais} onChange={e=>setDraft({...draft, au_pais:e.target.value})} />) : row.au_pais}</td>
        <td>
          <div className="d-flex align-items-center gap-1 flex-wrap">
            {editing ? (
              <>
                <button className="btn btn-sm btn-success btn-action" onClick={save}><i className="bi bi-check"/> Guardar</button>
                <button className="btn btn-sm btn-outline-secondary btn-action" onClick={()=>{ setEditing(false); setDraft(row); }}>Cancelar</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-secondary btn-action" onClick={()=>setEditing(true)}><i className="bi bi-pencil-square"/> Editar</button>
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.au_cod)}><i className="bi bi-trash"/> Eliminar</button>
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
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-pen me-2"/>Registar Autor</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código</label>
              <input className="form-control" value={nextAuCod} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input className="form-control" required value={form.au_nome ?? ''} onChange={e=>setForm({...form, au_nome:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">País</label>
              <input className="form-control" required value={form.au_pais ?? ''} onChange={e=>setForm({...form, au_pais:e.target.value})} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'800px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Autores Registados</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>País</th>
                  <th style={{width:'200px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-secondary">Nenhum autor registado.</td></tr>
                ) : (
                  items.map(it => <Row key={it.au_cod} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


