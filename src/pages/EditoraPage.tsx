import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Editora = {
  ed_cod: number;
  ed_nome: string;
  ed_pais: string;
  ed_morada: string;
  ed_cod_postal: number;
  ed_email: string;
  ed_tlm: number;
};

export default function EditoraPage() {
  const [items, setItems] = useState<Editora[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Editora>>({});
  const [cpList, setCpList] = useState<number[]>([]);
  const nextEdCod = useMemo(()=>{
    const max = items.reduce((m, it)=> Math.max(m, it.ed_cod||0), 0);
    return (max||0) + 1;
  }, [items]);

  async function load() {
    setLoading(true);
    const [{ data, error }, cpRes] = await Promise.all([
      supabase.from('editora').select('*').order('ed_nome', { ascending: true }),
      supabase.from('codigo_postal').select('cod_postal').order('cod_postal', { ascending: true })
    ]);
    if (!error && data) setItems(data as any);
    if (!cpRes.error && cpRes.data) setCpList((cpRes.data as any[]).map(r => Number(r.cod_postal)));
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const payload: Editora = {
      ed_cod: (form.ed_cod as number) ?? nextEdCod,
      ed_nome: (form.ed_nome as string) ?? '',
      ed_pais: (form.ed_pais as string) ?? '',
      ed_morada: (form.ed_morada as string) ?? '',
      ed_cod_postal: Number(form.ed_cod_postal ?? 0),
      ed_email: (form.ed_email as string) ?? '',
      ed_tlm: Number(form.ed_tlm ?? 0),
    };
    if (!cpList.includes(payload.ed_cod_postal)) {
      alert('Código Postal inexistente. Primeiro crie o Código Postal na página "Código Postal".');
      return;
    }
    const { error } = await supabase.from('editora').insert(payload);
    if (!error) { setForm({}); load(); }
    else alert(error.message);
  }

  async function handleDelete(ed_cod: number) {
    if (!confirm('Eliminar esta editora?')) return;
    const { error } = await supabase.from('editora').delete().eq('ed_cod', ed_cod);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Editora }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Editora>(row);
    async function save() {
      const patch = { ...draft } as any; delete patch.ed_cod;
      const { error } = await supabase.from('editora').update(patch).eq('ed_cod', row.ed_cod);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{row.ed_cod}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ed_nome} onChange={e=>setDraft({...draft, ed_nome:e.target.value})} />) : row.ed_nome}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ed_email} onChange={e=>setDraft({...draft, ed_email:e.target.value})} />) : row.ed_email}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.ed_tlm} onChange={e=>setDraft({...draft, ed_tlm:Number(e.target.value)})} />) : row.ed_tlm}</td>
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
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.ed_cod)}><i className="bi bi-trash"/> Eliminar</button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mx-auto" style={{maxWidth:'640px'}}>
        <div className="card-body">
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-building me-2"/>Registar Editora</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código</label>
              <input className="form-control" value={nextEdCod} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Nome da Editora</label>
              <input className="form-control" required value={form.ed_nome ?? ''} onChange={e=>setForm({...form, ed_nome: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">País</label>
              <input className="form-control" required value={form.ed_pais ?? ''} onChange={e=>setForm({...form, ed_pais: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Morada</label>
              <input className="form-control" required value={form.ed_morada ?? ''} onChange={e=>setForm({...form, ed_morada: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Código Postal</label>
              {cpList.length > 0 ? (
                <select className="form-select" value={form.ed_cod_postal ?? ''} onChange={e=>setForm({...form, ed_cod_postal: Number(e.target.value)})} required>
                  <option value="" disabled>Selecione</option>
                  {cpList.map(cp => (<option key={cp} value={cp}>{cp}</option>))}
                </select>
              ) : (
                <input className="form-control" inputMode="numeric" pattern="[0-9]{8}" title="Insira exatamente 8 dígitos" maxLength={8} minLength={8} value={form.ed_cod_postal ?? ''} onChange={e=>setForm({...form, ed_cod_postal: Number(e.target.value)})} />
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={form.ed_email ?? ''} onChange={e=>setForm({...form, ed_email: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Telemóvel</label>
              <input className="form-control" inputMode="numeric" pattern="[0-9]{9}" title="Insira exatamente 9 dígitos" maxLength={9} minLength={9} value={form.ed_tlm ?? ''} onChange={e=>setForm({...form, ed_tlm: Number(e.target.value)})} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'640px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Editoras Registadas</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telemóvel</th>
                  <th style={{width:'140px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-secondary">Nenhuma editora registada.</td></tr>
                ) : (
                  items.map(it => <Row key={it.ed_cod} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


