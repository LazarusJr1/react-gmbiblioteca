import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Utente = {
  ut_cod: number;
  ut_nome: string;
  ut_email: string;
  ut_turma: string;
  ut_ano: number;
};

export default function UtentePage() {
  const [items, setItems] = useState<Utente[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Utente>>({});
  const nextUtCod = useMemo(()=> (items.reduce((m,i)=>Math.max(m, i.ut_cod||0),0)+1)||1, [items]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('utente').select('*').order('ut_nome', { ascending: true });
    if (!error && data) setItems(data as any);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const payload: Utente = {
      ut_cod: (form.ut_cod as number) ?? nextUtCod,
      ut_nome: (form.ut_nome as string) ?? '',
      ut_email: (form.ut_email as string) ?? '',
      ut_turma: (form.ut_turma as string) ?? '',
      ut_ano: Number(form.ut_ano ?? 0)
    };
    const { error } = await supabase.from('utente').insert(payload);
    if (!error) { setForm({}); load(); } else alert(error.message);
  }

  async function handleDelete(ut_cod: number) {
    if (!confirm('Eliminar este utente?')) return;
    const { error } = await supabase.from('utente').delete().eq('ut_cod', ut_cod);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Utente }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Utente>(row);
    async function save() {
      const patch = { ...draft } as any; delete patch.ut_cod;
      const { error } = await supabase.from('utente').update(patch).eq('ut_cod', row.ut_cod);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{row.ut_cod}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_nome} onChange={e=>setDraft({...draft, ut_nome:e.target.value})} />) : row.ut_nome}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_email} onChange={e=>setDraft({...draft, ut_email:e.target.value})} />) : row.ut_email}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_turma} onChange={e=>setDraft({...draft, ut_turma:e.target.value})} />) : row.ut_turma}</td>
        <td>{editing ? (<input className="form-control form-control-sm" inputMode="numeric" pattern="[0-9]{1,4}" value={draft.ut_ano} onChange={e=>setDraft({...draft, ut_ano:Number(e.target.value)})} />) : row.ut_ano}</td>
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
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.ut_cod)}><i className="bi bi-trash"/> Eliminar</button>
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
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-person me-2"/>Registar Utente</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código</label>
              <input className="form-control" value={nextUtCod} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input className="form-control" required value={form.ut_nome ?? ''} onChange={e=>setForm({...form, ut_nome:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={form.ut_email ?? ''} onChange={e=>setForm({...form, ut_email:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Turma</label>
              <input className="form-control" required value={form.ut_turma ?? ''} onChange={e=>setForm({...form, ut_turma:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Ano</label>
              <input className="form-control" inputMode="numeric" pattern="[0-9]{1,4}" title="Ano com até 4 dígitos" value={form.ut_ano ?? ''} onChange={e=>setForm({...form, ut_ano:Number(e.target.value)})} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'900px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Utentes Registados</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Turma</th>
                  <th>Ano</th>
                  <th style={{width:'200px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-secondary">Nenhum utente registado.</td></tr>
                ) : (
                  items.map(it => <Row key={it.ut_cod} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


