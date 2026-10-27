import type { JSONContent } from '@tiptap/core';
import { getSupabaseBrowserClient } from './supabase';

export type BlogVisibility = 'public' | 'private';
export type BlogStatus = 'draft' | 'published';

export interface BlogCategory { id: string; name: string; slug: string; }

export interface BlogPost {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  body_html: string;
  body_json: JSONContent;
  thumbnail_url: string | null;
  visibility: BlogVisibility;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
}

export type BlogPostInput = Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'body_html' | 'body_json' | 'thumbnail_url' | 'category_id' | 'visibility' | 'status' | 'published_at'>;

function requireClient() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error('Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_KEY.');
  return client;
}

export const blogRepository = {
  async session() {
    const { data, error } = await requireClient().auth.getSession();
    if (error) throw error;
    return data.session;
  },
  async signIn(email: string, password: string) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },
  async signOut() {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  },
  async listPosts(): Promise<BlogPost[]> {
    const { data, error } = await requireClient().from('blog_posts').select('*, category:blog_categories(id,name,slug)').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BlogPost[];
  },
  async listCategories(): Promise<BlogCategory[]> {
    const { data, error } = await requireClient().from('blog_categories').select('id,name,slug').order('name');
    if (error) throw error;
    return (data ?? []) as BlogCategory[];
  },
  async savePost(input: BlogPostInput, id?: string): Promise<BlogPost> {
    const client = requireClient();
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) throw new Error('Sesi admin sudah berakhir. Silakan masuk lagi.');
    const query = id
      ? client.from('blog_posts').update(input).eq('id', id)
      : client.from('blog_posts').insert({ ...input, author_id: userData.user.id });
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data as BlogPost;
  },
  async deletePost(id: string) {
    const { error } = await requireClient().from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  },
  async uploadThumbnail(file: File): Promise<string> {
    const client = requireClient();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from('blog-images').upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });
    if (error) throw error;
    return client.storage.from('blog-images').getPublicUrl(path).data.publicUrl;
  },
};
