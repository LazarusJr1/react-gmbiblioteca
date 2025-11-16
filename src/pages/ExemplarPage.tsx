import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Exemplar = {
  lex_cod: number;
  lex_li_cod: number;
  lex_estado: string;
  lex_disponivel: boolean;
};

export default function ExemplarPage() {
  const [items, setItems] = useState<Exemplar[]>([]);
  const [loading, setLoading] = useState(false);
  const [liCods, setLiCods] = useState<number[]>([]);
  const [form, setForm] = useState<Partial<Exemplar>>({ lex_estado: 'Novo', lex_disponivel: true });
  const nextLexCod = useMemo(()=> (items.reduce((m,i)=>Math.max(m, i.lex_cod||0),0)+1)||1, [items]);

  async function load() {
    setLoading(true);
    const [lex, liv] = await Promise.all([
      supabase.from('livro_exemplar').select('*').order('lex_cod', { ascending: true }),
      supabase.from('livro').select('li_cod').order('li_cod', { ascending: true })
    ]);
    if (!lex.error && lex.data) setItems(lex.data as any);
    if (!liv.error && liv.data) setLiCods((liv.data as any[]).map(r=>Number(r.li_cod)));
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const payload: Exemplar = {
      lex_cod: (form.lex_cod as number) ?? nextLexCod,
      lex_li_cod: Number(form.lex_li_cod ?? 0),
      lex_estado: (form.lex_estado as string) ?? 'Novo',
      lex_disponivel: Boolean(form.lex_disponivel ?? true)
    };
    if (!liCods.includes(payload.lex_li_cod)) { alert('li_cod inexistente. Crie o livro primeiro.'); return; }
    const { error } = await supabase.from('livro_exemplar').insert(payload);
    if (!error) { setForm({ lex_estado: 'Novo', lex_disponivel: true }); load(); } else alert(error.message);
  }

  async function handleDelete(lex_cod: number) {
    if (!confirm('Eliminar este exemplar?')) return;
    const { error } = await supabase.from('livro_exemplar').delete().eq('lex_cod', lex_cod);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Exemplar }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Exemplar>(row);
    async function save() {
      const patch = { ...draft } as any; delete patch.lex_cod;
      const { error } = await supabase.from('livro_exemplar').update(patch).eq('lex_cod', row.lex_cod);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{row.lex_cod}</td>
        <td>{editing ? (
          <select className="form-select form-select-sm" value={draft.lex_li_cod} onChange={e=>setDraft({...draft, lex_li_cod:Number(e.target.value)})}>
            {[draft.lex_li_cod, ...liCods.filter(c=>c!==draft.lex_li_cod)].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        ) : row.lex_li_cod}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.lex_estado} onChange={e=>setDraft({...draft, lex_estado:e.target.value})} />) : row.lex_estado}</td>
        <td>{editing ? (
          <select className="form-select form-select-sm" value={draft.lex_disponivel ? 'true' : 'false'} onChange={e=>setDraft({...draft, lex_disponivel: e.target.value === 'true'})}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        ) : (row.lex_disponivel ? 'Sim' : 'Não')}</td>
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
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.lex_cod)}><i className="bi bi-trash"/> Eliminar</button>
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
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-collection me-2"/>Registar Exemplar</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código do Exemplar</label>
              <input className="form-control" value={nextLexCod} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Livro (li_cod)</label>
              <select className="form-select" required value={form.lex_li_cod ?? ''} onChange={e=>setForm({...form, lex_li_cod:Number(e.target.value)})}>
                <option value="" disabled>Selecione</option>
                {liCods.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Estado</label>
              <input className="form-control" value={form.lex_estado ?? 'Novo'} onChange={e=>setForm({...form, lex_estado:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Disponível</label>
              <select className="form-select" value={(form.lex_disponivel ?? true) ? 'true' : 'false'} onChange={e=>setForm({...form, lex_disponivel: e.target.value === 'true'})}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-plus-circle me-2"/>Adicionar Exemplar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'1000px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Exemplares</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>lex_cod</th><th>li_cod</th><th>Estado</th><th>Disponível</th><th style={{width:'220px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-secondary">Nenhum exemplar registado.</td></tr>
                ) : (
                  items.map(it => <Row key={it.lex_cod} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


