import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Utente = {
  ut_cod: number;
  ut_nome: string;
  ut_nif: string;
  ut_email: string;
  ut_tlm: string;
  ut_morada: string;
  ut_cod_postal: string;
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
      ut_nif: (form.ut_nif as string) ?? '',
      ut_email: (form.ut_email as string) ?? '',
      ut_tlm: (form.ut_tlm as string) ?? '',
      ut_morada: (form.ut_morada as string) ?? '',
      ut_cod_postal: (form.ut_cod_postal as string) ?? '',
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
        <td>{editing ? (<input className="form-control form-control-sm" maxLength={9} value={draft.ut_nif} onChange={e=>setDraft({...draft, ut_nif:e.target.value})} />) : row.ut_nif}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_email} onChange={e=>setDraft({...draft, ut_email:e.target.value})} />) : row.ut_email}</td>
        <td>{editing ? (<input className="form-control form-control-sm" maxLength={9} value={draft.ut_tlm} onChange={e=>setDraft({...draft, ut_tlm:e.target.value})} />) : row.ut_tlm}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_morada} onChange={e=>setDraft({...draft, ut_morada:e.target.value})} />) : row.ut_morada}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ut_cod_postal} onChange={e=>setDraft({...draft, ut_cod_postal:e.target.value})} />) : row.ut_cod_postal}</td>
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
              <label className="form-label">NIF</label>
              <input className="form-control" maxLength={9} value={form.ut_nif ?? ''} onChange={e=>setForm({...form, ut_nif:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={form.ut_email ?? ''} onChange={e=>setForm({...form, ut_email:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Telemóvel</label>
              <input className="form-control" maxLength={9} value={form.ut_tlm ?? ''} onChange={e=>setForm({...form, ut_tlm:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Morada</label>
              <input className="form-control" value={form.ut_morada ?? ''} onChange={e=>setForm({...form, ut_morada:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Cód. Postal</label>
              <input className="form-control" value={form.ut_cod_postal ?? ''} onChange={e=>setForm({...form, ut_cod_postal:e.target.value})} />
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
                  <th>NIF</th>
                  <th>Email</th>
                  <th>Telemóvel</th>
                  <th>Morada</th>
                  <th>Cód. Postal</th>
                  <th style={{width:'200px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-secondary">Nenhum utente registado.</td></tr>
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


