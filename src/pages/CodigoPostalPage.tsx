import React, { useEffect, useState } from 'react';
import { supabase } from '../main';

type CodigoPostal = { cod_postal: number; cod_localidade: string };

export default function CodigoPostalPage() {
  const [items, setItems] = useState<CodigoPostal[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CodigoPostal>({ cod_postal: 0, cod_localidade: '' });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('codigo_postal').select('*').order('cod_localidade', { ascending: true }).order('cod_postal', { ascending: true });
    if (!error && data) setItems(data as any);
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('codigo_postal').insert({ cod_postal: Number(form.cod_postal), cod_localidade: form.cod_localidade });
    if (!error) { setForm({ cod_postal: 0, cod_localidade: '' }); load(); } else alert(error.message);
  }

  async function handleDelete(row: CodigoPostal) {
    if (!confirm('Eliminar este código postal?')) return;
    const { error } = await supabase.from('codigo_postal').delete().match({ cod_postal: row.cod_postal, cod_localidade: row.cod_localidade });
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: CodigoPostal }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<CodigoPostal>(row);
    async function save() {
      // update by composite key (old values)
      const { error } = await supabase.from('codigo_postal')
        .update({ cod_postal: Number(draft.cod_postal), cod_localidade: draft.cod_localidade })
        .match({ cod_postal: row.cod_postal, cod_localidade: row.cod_localidade });
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>
          {editing ? (
            <input className="form-control form-control-sm" value={draft.cod_postal} onChange={e=>setDraft({...draft, cod_postal: Number(e.target.value)})} inputMode="numeric" pattern="[0-9]{8}" title="Insira exatamente 8 dígitos" maxLength={8} />
          ) : row.cod_postal}
        </td>
        <td>
          {editing ? (
            <input className="form-control form-control-sm" value={draft.cod_localidade} onChange={e=>setDraft({...draft, cod_localidade: e.target.value})} />
          ) : row.cod_localidade}
        </td>
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
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row)}><i className="bi bi-trash"/> Eliminar</button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mx-auto mb-4" style={{maxWidth:'540px'}}>
        <div className="card-body">
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-geo-alt me-2"/>Registar Código Postal</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código Postal</label>
              <input className="form-control" required value={form.cod_postal || ''} onChange={e=>setForm({...form, cod_postal: Number(e.target.value)})} inputMode="numeric" pattern="[0-9]{8}" title="Insira exatamente 8 dígitos" maxLength={8} minLength={8} />
            </div>
            <div className="mb-3">
              <label className="form-label">Localidade</label>
              <input className="form-control" required value={form.cod_localidade} onChange={e=>setForm({...form, cod_localidade: e.target.value})} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto" style={{maxWidth:'540px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Códigos Postais Registados</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Código Postal</th>
                  <th>Localidade</th>
                  <th style={{width:'200px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-secondary">Nenhum código postal registado.</td></tr>
                ) : (
                  items.map(it => <Row key={`${it.cod_postal}-${it.cod_localidade}`} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


