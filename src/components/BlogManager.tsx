import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import AdminEditor from './AdminEditor';
import { blogRepository, type BlogCategory, type BlogPost, type BlogPostInput } from '../lib/blogRepository';

const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const toLocalInput = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const newPost = (): Partial<BlogPost> => ({
  title: '', slug: '', excerpt: '', body_html: '', body_json: emptyDocument,
  thumbnail_url: null, category_id: null, visibility: 'public', status: 'draft',
  published_at: new Date().toISOString(),
});

function ActionButton({ children, onClick, type = 'button', disabled = false, primary = false }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; primary?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${primary ? 'border-2 border-[#b77912] bg-[#f7a501] text-[#23251d] shadow-[0_3px_0_#b77912]' : 'border border-[#4d4f46] bg-[#23251d] text-[#eeefe9] hover:bg-[#33342d]'}`}>{children}</button>;
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [query, setQuery] = useState('');
  const editorContentRef = useRef<{ html: string; json: JSONContent }>({ html: '', json: emptyDocument });

  const startEditing = (post: Partial<BlogPost>) => {
    editorContentRef.current = {
      html: post.body_html || '',
      json: post.body_json || emptyDocument,
    };
    setMessage(null);
    setEditing(post);
  };

  const loadData = async (preserveMessage = false) => {
    setLoading(true);
    if (!preserveMessage) setMessage(null);
    try {
      const session = await blogRepository.session();
      setAuthenticated(Boolean(session));
      if (session) {
        const [nextPosts, nextCategories] = await Promise.all([blogRepository.listPosts(), blogRepository.listCategories()]);
        setPosts(nextPosts);
        setCategories(nextCategories);
      }
    } catch (error) {
      setAuthenticated(false);
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Gagal memuat blog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? posts.filter((post) => `${post.title} ${post.slug} ${post.category?.name ?? ''}`.toLowerCase().includes(needle)) : posts;
  }, [posts, query]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await blogRepository.signIn(email, password);
      setPassword('');
      await loadData();
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Login gagal.' });
    } finally { setBusy(false); }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!editing?.title?.trim()) {
      setMessage({ kind: 'error', text: 'Judul tulisan wajib diisi.' });
      return;
    }
    const bodyHtml = editorContentRef.current.html || editing.body_html || '';
    const bodyText = bodyHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&[a-z0-9#]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!bodyText) {
      setMessage({ kind: 'error', text: 'Isi tulisan wajib diisi.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const input: BlogPostInput = {
        title: editing.title.trim(),
        slug: editing.slug?.trim() || slugify(editing.title),
        excerpt: editing.excerpt?.trim() || '',
        body_html: bodyHtml,
        body_json: editorContentRef.current.json || editing.body_json || emptyDocument,
        thumbnail_url: editing.thumbnail_url || null,
        category_id: editing.category_id || null,
        visibility: editing.visibility || 'public',
        status,
        published_at: editing.published_at ? new Date(editing.published_at).toISOString() : new Date().toISOString(),
      };
      await blogRepository.savePost(input, editing.id);
      setEditing(null);
      setMessage({ kind: 'success', text: status === 'published' ? 'Tulisan berhasil dipublikasikan.' : 'Draft berhasil disimpan.' });
      await loadData(true);
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Gagal menyimpan tulisan.' });
    } finally { setBusy(false); }
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setMessage({ kind: 'error', text: 'Thumbnail harus berupa gambar dengan ukuran maksimum 5 MB.' });
      return;
    }
    setBusy(true);
    try {
      const url = await blogRepository.uploadThumbnail(file);
      setEditing((current) => current ? { ...current, thumbnail_url: url } : current);
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Upload gagal.' });
    } finally { setBusy(false); }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Hapus “${post.title}”? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await blogRepository.deletePost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Gagal menghapus tulisan.' });
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-[#9b9c92]">Memuat Blog…</div>;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md py-12">
        <form onSubmit={handleSignIn} className="rounded-xl border border-[#3a3b34] bg-[#23251d] p-7 shadow-xl">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#f7a501]">Supabase Auth</p>
          <h2 className="mb-2 text-2xl font-bold">Hubungkan akun admin</h2>
          <p className="mb-6 text-sm leading-relaxed text-[#9b9c92]">Gate halaman melindungi tampilan. Login ini memberi sesi aman untuk menulis, upload, dan publikasi melalui RLS.</p>
          {message && <div className="mb-4 rounded-md border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-200">{message.text}</div>}
          <label className="mb-2 block text-sm font-semibold">Email</label>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mb-4 w-full rounded-md border border-[#4d4f46] bg-[#1a1b16] px-4 py-2.5 outline-none focus:border-[#f7a501]" />
          <label className="mb-2 block text-sm font-semibold">Password</label>
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mb-6 w-full rounded-md border border-[#4d4f46] bg-[#1a1b16] px-4 py-2.5 outline-none focus:border-[#f7a501]" />
          <ActionButton type="submit" primary disabled={busy}>{busy ? 'Menghubungkan…' : 'Masuk ke Blog'}</ActionButton>
        </form>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-7xl pb-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-[#f7a501]">Editor</p><h2 className="text-2xl font-bold">{editing.id ? 'Edit tulisan' : 'Tulisan baru'}</h2></div>
          <ActionButton onClick={() => setEditing(null)}>Kembali ke daftar</ActionButton>
        </div>
        {message && <div className={`mb-5 rounded-md border p-3 text-sm ${message.kind === 'error' ? 'border-red-800/50 bg-red-900/20 text-red-200' : 'border-green-800/50 bg-green-900/20 text-green-200'}`}>{message.text}</div>}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5 rounded-xl border border-[#3a3b34] bg-[#23251d] p-5 md:p-7">
            <div><label className="mb-2 block text-sm font-semibold">Judul</label><input autoFocus value={editing.title || ''} onChange={(event) => setEditing({ ...editing, title: event.target.value, slug: editing.id ? editing.slug : slugify(event.target.value) })} placeholder="Judul tulisan" className="w-full border-0 border-b border-[#4d4f46] bg-transparent px-0 py-3 text-3xl font-extrabold outline-none focus:border-[#f7a501]" /></div>
            <div><label className="mb-2 block text-sm font-semibold">Ringkasan</label><textarea value={editing.excerpt || ''} onChange={(event) => setEditing({ ...editing, excerpt: event.target.value })} rows={3} maxLength={320} placeholder="Ringkasan singkat untuk kartu blog dan SEO…" className="w-full resize-y rounded-md border border-[#4d4f46] bg-[#1a1b16] px-4 py-3 outline-none focus:border-[#f7a501]" /></div>
            <div><label className="mb-2 block text-sm font-semibold">Isi tulisan</label><AdminEditor initialValue={editing.body_html || ''} onChange={(body_html, body_json) => { const nextJson = body_json || emptyDocument; editorContentRef.current = { html: body_html, json: nextJson }; setEditing((current) => current ? { ...current, body_html, body_json: nextJson } : current); }} placeholder="Mulai menulis cerita Anda…" /></div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-xl border border-[#3a3b34] bg-[#23251d] p-5">
              <h3 className="mb-4 font-bold">Publikasi</h3>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b9c92]">Visibilitas</label>
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-[#1a1b16] p-1">
                {(['public', 'private'] as const).map((visibility) => <button key={visibility} type="button" onClick={() => setEditing({ ...editing, visibility })} className={`rounded-md px-3 py-2 text-sm font-bold capitalize ${editing.visibility === visibility ? 'bg-[#f7a501] text-[#23251d]' : 'text-[#9b9c92]'}`}>{visibility}</button>)}
              </div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b9c92]">Tanggal terbit</label>
              <input type="datetime-local" value={toLocalInput(editing.published_at)} onChange={(event) => setEditing({ ...editing, published_at: event.target.value })} className="mb-5 w-full rounded-md border border-[#4d4f46] bg-[#1a1b16] px-3 py-2 text-sm outline-none focus:border-[#f7a501]" />
              <div className="flex flex-col gap-3"><ActionButton onClick={() => void handleSave('published')} primary disabled={busy}>{busy ? 'Menyimpan…' : 'Publikasikan'}</ActionButton><ActionButton onClick={() => void handleSave('draft')} disabled={busy}>Simpan draft</ActionButton></div>
            </div>
            <div className="rounded-xl border border-[#3a3b34] bg-[#23251d] p-5">
              <h3 className="mb-4 font-bold">Pengaturan</h3>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b9c92]">Slug</label>
              <input value={editing.slug || ''} onChange={(event) => setEditing({ ...editing, slug: slugify(event.target.value) })} className="mb-5 w-full rounded-md border border-[#4d4f46] bg-[#1a1b16] px-3 py-2 text-sm outline-none focus:border-[#f7a501]" />
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b9c92]">Kategori</label>
              <select value={editing.category_id || ''} onChange={(event) => setEditing({ ...editing, category_id: event.target.value || null })} className="mb-5 w-full rounded-md border border-[#4d4f46] bg-[#1a1b16] px-3 py-2 text-sm outline-none focus:border-[#f7a501]"><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b9c92]">Thumbnail</label>
              {editing.thumbnail_url && <img src={editing.thumbnail_url} alt="Preview thumbnail" className="mb-3 aspect-video w-full rounded-md object-cover" />}
              <label className="block cursor-pointer rounded-md border border-dashed border-[#6c6e63] p-4 text-center text-sm text-[#9b9c92] hover:border-[#f7a501] hover:text-[#f7a501]">Pilih gambar (maks. 5 MB)<input type="file" accept="image/*" className="hidden" onChange={(event) => void handleUpload(event.target.files?.[0])} /></label>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#f7a501]">Content</p><h2 className="text-2xl font-bold">Blog Posts</h2><p className="mt-1 text-sm text-[#9b9c92]">{posts.length} tulisan tersimpan</p></div><div className="flex gap-3"><ActionButton onClick={() => void blogRepository.signOut().then(() => setAuthenticated(false))}>Putuskan sesi</ActionButton><ActionButton primary onClick={() => startEditing(newPost())}>+ Tulis baru</ActionButton></div></div>
      {message && <div className={`mb-5 rounded-md border p-3 text-sm ${message.kind === 'error' ? 'border-red-800/50 bg-red-900/20 text-red-200' : 'border-green-800/50 bg-green-900/20 text-green-200'}`}>{message.text}</div>}
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, slug, atau kategori…" className="mb-5 w-full rounded-md border border-[#3a3b34] bg-[#23251d] px-4 py-3 outline-none focus:border-[#f7a501]" />
      <div className="overflow-hidden rounded-xl border border-[#3a3b34] bg-[#23251d]">
        {visiblePosts.length === 0 ? <div className="p-12 text-center text-[#9b9c92]">Belum ada tulisan. Mulai dengan “Tulis baru”.</div> : visiblePosts.map((post) => (
          <div key={post.id} className="grid gap-4 border-b border-[#3a3b34] p-4 last:border-0 sm:grid-cols-[96px_1fr_auto] sm:items-center">
            <div className="aspect-video overflow-hidden rounded-md bg-[#1a1b16]">{post.thumbnail_url ? <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[#6c6e63]">No image</div>}</div>
            <div><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-bold">{post.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-500/15 text-green-300' : 'bg-[#6c6e63]/20 text-[#b6b7af]'}`}>{post.status}</span><span className="rounded-full bg-[#f7a501]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#f7a501]">{post.visibility}</span></div><p className="text-xs text-[#9b9c92]">{post.category?.name || 'Tanpa kategori'} · {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p></div>
            <div className="flex gap-2"><ActionButton onClick={() => startEditing(post)}>Edit</ActionButton><button type="button" onClick={() => void handleDelete(post)} className="rounded-lg px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10">Hapus</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
