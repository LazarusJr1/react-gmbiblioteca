import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../main';

type Livro = {
  li_cod: number;
  li_isbn: string; // varchar
  li_titulo: string;
  li_autor: number; // FK -> autor.au_cod
  li_genero: string; // varchar
  li_ano: number; // int2
  li_edicao: string; // varchar
  li_editora: number; // FK -> editora.ed_cod
};

type Autor = { au_cod: number; au_nome: string };
type Editora = { ed_cod: number; ed_nome: string };

export default function LivroPage() {
  const [items, setItems] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Livro>>({});
  const [numExemplares, setNumExemplares] = useState<number>(1);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [editoras, setEditoras] = useState<Editora[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);

  const nextLiCod = useMemo(()=> (items.reduce((m,i)=>Math.max(m, i.li_cod||0),0)+1)||1, [items]);

  async function load() {
    setLoading(true);
    const [liv, au, ed, ge] = await Promise.all([
      supabase.from('livro').select('*').order('li_titulo', { ascending: true }),
      supabase.from('autor').select('au_cod, au_nome').order('au_nome', { ascending: true }),
      supabase.from('editora').select('ed_cod, ed_nome').order('ed_nome', { ascending: true }),
      supabase.from('genero').select('ge_genero').order('ge_genero', { ascending: true })
    ]);
    if (!liv.error && liv.data) setItems(liv.data as any);
    if (!au.error && au.data) setAutores(au.data as Autor[]);
    if (!ed.error && ed.data) setEditoras(ed.data as Editora[]);
    if (!ge.error && ge.data) setGeneros((ge.data as any[]).map(r=>r.ge_genero));
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const isbnDigits = String(form.li_isbn ?? '').replace(/[^0-9]/g, '').slice(0, 13);
    if (isbnDigits.length !== 13) { alert('ISBN deve ter exatamente 13 dígitos.'); return; }
    const payload: Livro = {
      li_cod: (form.li_cod as number) ?? nextLiCod,
      li_isbn: isbnDigits,
      li_titulo: (form.li_titulo as string) ?? '',
      li_autor: Number(form.li_autor ?? 0),
      li_genero: (form.li_genero as string) ?? '',
      li_ano: Number(form.li_ano ?? 0),
      li_edicao: String(form.li_edicao ?? ''),
      li_editora: Number(form.li_editora ?? 0)
    };
    const { error } = await supabase.from('livro').insert(payload);
    if (error) { alert(error.message); return; }
    // create exemplares
    const lexBase = await supabase.from('livro_exemplar').select('lex_cod').order('lex_cod', { ascending:false }).limit(1);
    let nextLex = (!lexBase.error && lexBase.data && lexBase.data[0]?.lex_cod) ? Number(lexBase.data[0].lex_cod) + 1 : 1;
    const rows = Array.from({ length: Math.max(1, numExemplares) }).map((_,i)=>({
      lex_cod: nextLex + i,
      lex_li_cod: payload.li_cod,
      lex_estado: 'Novo',
      lex_disponivel: true
    }));
    const insLex = await supabase.from('livro_exemplar').insert(rows);
    if (insLex.error) { alert('Livro criado, mas falha ao criar exemplares: ' + insLex.error.message); }
    setForm({}); setNumExemplares(1); load();
  }

  async function handleDelete(keyVal: number) {
    if (!confirm('Eliminar este livro?')) return;
    const { error } = await supabase.from('livro').delete().eq('li_cod', keyVal);
    if (!error) load(); else alert(error.message);
  }

  function Row({ row }: { row: Livro }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Livro>(row);
    async function save() {
      const patch = { ...draft } as any; delete patch.li_cod;
      const { error } = await supabase.from('livro').update(patch).eq('li_cod', row.li_cod);
      if (!error) { setEditing(false); load(); } else alert(error.message);
    }
    return (
      <tr>
        <td>{row.li_cod}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.li_titulo} onChange={e=>setDraft({...draft, li_titulo:e.target.value})} />) : row.li_titulo}</td>
        <td>{editing ? (
          <select className="form-select form-select-sm" value={draft.li_autor} onChange={e=>setDraft({...draft, li_autor:Number(e.target.value)})}>
            {[draft.li_autor, ...autores.filter(a=>a.au_cod!==draft.li_autor).map(a=>a.au_cod)].map(code=> {
              const a = autores.find(x=>x.au_cod===code)!; return <option key={code} value={code}>{a?.au_nome ?? code}</option>;
            })}
          </select>
        ) : (autores.find(a=>a.au_cod===row.li_autor)?.au_nome ?? row.li_autor)}</td>
        <td>{editing ? (
          <select className="form-select form-select-sm" value={draft.li_genero} onChange={e=>setDraft({...draft, li_genero:e.target.value})}>
            {[draft.li_genero, ...generos.filter(g=>g!==draft.li_genero)].map(g=> <option key={g} value={g}>{g}</option>)}
          </select>
        ) : row.li_genero}</td>
        <td>{editing ? (
          <select className="form-select form-select-sm" value={draft.li_editora} onChange={e=>setDraft({...draft, li_editora:Number(e.target.value)})}>
            {[draft.li_editora, ...editoras.filter(ed=>ed.ed_cod!==draft.li_editora).map(ed=>ed.ed_cod)].map(code=> {
              const ed = editoras.find(x=>x.ed_cod===code)!; return <option key={code} value={code}>{ed?.ed_nome ?? code}</option>;
            })}
          </select>
        ) : (editoras.find(e=>e.ed_cod===row.li_editora)?.ed_nome ?? row.li_editora)}</td>
        <td>{editing ? (<input className="form-control form-control-sm" inputMode="numeric" pattern="[0-9]{4}" title="Ano com 4 dígitos" maxLength={4} value={draft.li_ano} onChange={e=>setDraft({...draft, li_ano:Number(e.target.value)})} />) : row.li_ano}</td>
        <td>{editing ? (<input className="form-control form-control-sm" value={draft.li_edicao} onChange={e=>setDraft({...draft, li_edicao:e.target.value})} />) : row.li_edicao}</td>
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
                <button className="btn btn-sm btn-outline-danger btn-action" onClick={()=>handleDelete(row.li_cod)}><i className="bi bi-trash"/> Eliminar</button>
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
          <h2 className="h5 mb-4 text-center" style={{color:'#812f2b'}}><i className="bi bi-journal-plus me-2"/>Registar Livro</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Código</label>
              <input className="form-control" value={nextLiCod} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input className="form-control" required value={form.li_titulo ?? ''} onChange={e=>setForm({...form, li_titulo:e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Autor</label>
            <select className="form-select" required value={form.li_autor ?? ''} onChange={e=>setForm({...form, li_autor:Number(e.target.value)})}>
                <option value="" disabled>Selecione</option>
              {autores.map(a=> <option key={a.au_cod} value={a.au_cod}>{a.au_nome}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Género</label>
              <select className="form-select" required value={form.li_genero ?? ''} onChange={e=>setForm({...form, li_genero:e.target.value})}>
                <option value="" disabled>Selecione</option>
                {generos.map(g=> <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Ano</label>
              <input className="form-control" inputMode="numeric" pattern="[0-9]{4}" title="Ano com 4 dígitos" maxLength={4} value={form.li_ano ?? ''} onChange={e=>setForm({...form, li_ano:Number(e.target.value)})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Edição</label>
            <input className="form-control" value={form.li_edicao ?? ''} onChange={e=>setForm({...form, li_edicao:String(e.target.value)})} />
            </div>
            <div className="mb-3">
              <label className="form-label">ISBN</label>
            <input
              className="form-control"
              inputMode="numeric"
              pattern="[0-9]{13}"
              maxLength={13}
              placeholder="13 dígitos"
              value={(form.li_isbn ?? '').toString()}
              onChange={e=>{
                const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
                setForm({...form, li_isbn: digits});
              }}
            />
            </div>
            <div className="mb-3">
              <label className="form-label">Editora</label>
            <select className="form-select" required value={form.li_editora ?? ''} onChange={e=>setForm({...form, li_editora:Number(e.target.value)})}>
                <option value="" disabled>Selecione</option>
              {editoras.map(ed=> <option key={ed.ed_cod} value={ed.ed_cod}>{ed.ed_nome}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Número de Exemplares</label>
              <input className="form-control" type="number" min={1} max={100} value={numExemplares} onChange={e=>setNumExemplares(Math.max(1, Math.min(100, Number(e.target.value))))} />
            </div>
            <button type="submit" className="btn w-100" style={{backgroundColor:'#812f2b', color:'#fff'}}><i className="bi bi-save me-2"/>Registar</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mx-auto mt-4" style={{maxWidth:'1000px'}}>
        <div className="card-body">
          <h3 className="h6 mb-3 text-center" style={{color:'#812f2b'}}><i className="bi bi-list-ul me-2"/>Livros Registados</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Código</th><th>Título</th><th>Autor</th><th>Género</th><th>Editora</th><th>Ano</th><th>Edição</th><th style={{width:'220px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center text-secondary">A carregar…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-secondary">Nenhum livro registado.</td></tr>
                ) : (
                  items.map(it => <Row key={it.li_cod} row={it} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


