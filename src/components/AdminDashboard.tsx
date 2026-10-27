import React, { useState, useEffect } from 'react';
import { adminStore, type Project, type NormalProject, type DesignProject } from '../lib/adminStore';
import AdminEditor from './AdminEditor';
import DesignBuilder from './DesignBuilder';
import BlogManager from './BlogManager';
import { configureSupabaseBrowserClient } from '../lib/supabase';

// ── UI Components ──

function ButtonPrimary({ children, onClick, type = "button", className = "", disabled = false }: any) {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#b77912] border-t-[#d89205] bg-[#f7a501] px-5 py-2.5 text-sm font-extrabold leading-tight text-[#23251d] shadow-[0_3px_0_#b77912,0_4px_0_rgba(35,37,29,0.14)] transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:border-t-[#7c5311] hover:shadow-[0_4px_0_#a4680e,0_5px_0_rgba(35,37,29,0.12)] active:translate-y-[4px] active:shadow-[0_1px_0_#b77912,0_2px_0_rgba(35,37,29,0.12)] disabled:opacity-70 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

function ButtonSecondary({ children, onClick, type = "button", className = "", disabled = false }: any) {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#4d4f46] bg-[#23251d] px-5 py-2.5 text-sm font-bold text-[#eeefe9] shadow-sm transition-all duration-150 ease-out hover:bg-[#33342d] hover:border-[#6c6e63] active:scale-95 disabled:opacity-70 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm" }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-sm bg-[#23251d] border border-[#4d4f46] rounded-xl shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-[#eeefe9] mb-2">{title}</h3>
        <p className="text-[#9b9c92] text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <ButtonSecondary onClick={onCancel}>Cancel</ButtonSecondary>
          <ButtonPrimary onClick={onConfirm} className="!bg-red-500 !border-red-700 !border-t-red-400 !text-white !shadow-[0_3px_0_#991b1b,0_4px_0_rgba(35,37,29,0.14)] hover:!bg-red-600 hover:!border-t-red-700 hover:!shadow-[0_4px_0_#7f1d1d,0_5px_0_rgba(35,37,29,0.12)]">
            {confirmText}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──

interface AdminDashboardProps {
  supabaseUrl?: string;
  supabaseKey?: string;
}

export default function AdminDashboard({ supabaseUrl, supabaseKey }: AdminDashboardProps) {
  configureSupabaseBrowserClient(supabaseUrl, supabaseKey);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'blog' | 'notes' | 'research'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<'list' | 'type-select' | 'form'>('list');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal State
  const [modalState, setModalState] = useState<{isOpen: boolean; idToDelete: string | null}>({ isOpen: false, idToDelete: null });

  useEffect(() => {
    setProjects(adminStore.getProjects());
    
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adm_sn');
    sessionStorage.removeItem('adm_magic');
    window.location.reload();
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      adminStore.saveProject(editingProject);
      setProjects(adminStore.getProjects());
      setView('list');
      setEditingProject(null);
    }
  };

  const confirmDelete = (id: string) => {
    setModalState({ isOpen: true, idToDelete: id });
  };

  const executeDelete = () => {
    if (modalState.idToDelete) {
      adminStore.deleteProject(modalState.idToDelete);
      setProjects(adminStore.getProjects());
    }
    setModalState({ isOpen: false, idToDelete: null });
  };

  const NavItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => { setActiveTab(id as any); setView('list'); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        activeTab === id 
          ? 'bg-[#f7a501]/10 text-[#f7a501]' 
          : 'text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9]'
      }`}
    >
      <span className={activeTab === id ? 'opacity-100' : 'opacity-70'}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#1a1b16] text-[#eeefe9] font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Removed right border on the header so it connects with main topbar seamlessly */}
      <aside className={`fixed md:static inset-y-0 left-0 w-[260px] flex-shrink-0 bg-[#23251d] flex flex-col z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Sidebar Header - connected seamlessly to topbar (no border-r) */}
        <div className="h-[60px] flex items-center gap-3 px-5 border-b border-[#3a3b34] flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 48 48" role="img" aria-hidden="true">
            <path d="M9 28c0-9 7-16 17-16 8 0 14 5 14 13 0 8-6 13-15 13H12c-2 0-3-1-3-3v-7Z" fill="#f7a501" />
            <path d="M16 15 12 8m10 4-1-8m9 10 5-7" stroke="#23251d" strokeLinecap="round" strokeWidth="3" />
            <path d="M12 32c4-7 6-9 8-5 2 1 7-5 8-3 1 1-1 4-1 5 4-2 7-6 12-9" fill="none" stroke="#23251d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-[#eeefe9]">Admin Panel</span>
        </div>

        {/* Sidebar Body - this part has the right border */}
        <div className="flex-1 overflow-y-auto flex flex-col border-r border-[#3a3b34]">
          <nav className="flex-1 p-3 flex flex-col gap-1">
            <div className="text-[11px] font-bold text-[#6c6e63] uppercase tracking-wider px-3 pt-3 pb-1">Menu</div>
            <NavItem 
              id="dashboard" 
              label="Dashboard" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>}
            />
            <NavItem 
              id="projects" 
              label="Projects" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
            />
            <NavItem 
              id="blog" 
              label="Blog Posts" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
            />
            
            <div className="h-px bg-[#3a3b34] mx-3 my-4"></div>
            
            <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors">
              <span className="opacity-70">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </span>
              Open Site
            </a>
          </nav>

          <div className="p-3 border-t border-[#3a3b34] shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#9b9c92] hover:bg-red-500/10 hover:text-[#cd4239] transition-colors"
            >
              <span className="opacity-70">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1b16] relative w-full">
        {/* Topbar */}
        <header className="h-[60px] flex items-center justify-between px-4 md:px-6 bg-[#23251d] border-b border-[#3a3b34] shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-[#9b9c92] hover:bg-[#33342d] rounded-md transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 className="text-lg font-bold text-[#eeefe9] capitalize hidden sm:block">{activeTab}</h1>
            {view === 'form' && (
              <>
                <span className="text-[#6c6e63] hidden sm:inline">/</span>
                <span className="text-sm font-medium text-[#9b9c92]">
                  {editingProject?.id ? 'Edit Project' : 'New Project'}
                </span>
              </>
            )}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6e63]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-[180px] sm:w-[240px] pl-9 pr-4 py-1.5 bg-[#1a1b16] border border-[#3a3b34] rounded-md text-sm text-[#eeefe9] placeholder-[#6c6e63] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501] transition-all"
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'blog' ? (
            <BlogManager />
          ) : activeTab === 'projects' ? (
            
            // ── LIST VIEW ──
            view === 'list' ? (
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                  <ButtonPrimary onClick={() => setView('type-select')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Project
                  </ButtonPrimary>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-[#23251d] border border-[#3a3b34] rounded-lg overflow-hidden group hover:border-[#f7a501] transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col">
                      <div className="aspect-video bg-[#2d2e27] relative overflow-hidden flex-shrink-0">
                        {project.thumbnail ? (
                          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6c6e63]">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                          <button 
                            onClick={() => { setEditingProject(project); setView('form'); }}
                            className="bg-white text-black p-2.5 rounded-full hover:scale-110 transition-transform"
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button 
                            onClick={() => confirmDelete(project.id)}
                            className="bg-red-500 text-white p-2.5 rounded-full hover:scale-110 transition-transform"
                            title="Delete"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                        
                        {/* Project Type Badge */}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                          {project.type}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#6c6e63] uppercase tracking-wider mb-1">
                          <span>{project.year}</span>
                          <span className="w-1 h-1 rounded-full bg-[#6c6e63]"></span>
                          <span className="truncate">{project.client}</span>
                        </div>
                        <h3 className="font-bold text-[#eeefe9] line-clamp-2">{project.title}</h3>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => setView('type-select')}
                    className="bg-[#f7a501]/5 border-2 border-dashed border-[#4d4f46] rounded-lg flex flex-col items-center justify-center min-h-[240px] text-[#9b9c92] hover:text-[#f7a501] hover:border-[#f7a501] hover:bg-[#f7a501]/10 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#33342d] group-hover:bg-[#f7a501]/20 flex items-center justify-center mb-3 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <span className="font-bold">Create New Project</span>
                  </div>
                </div>
              </div>
            ) : view === 'type-select' ? (
              
              // ── TYPE SELECT VIEW ──
              <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3">Choose Project Type</h2>
                  <p className="text-[#9b9c92]">Select the format that best fits your case study content.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Normal Project Option */}
                  <div 
                    onClick={() => { setEditingProject({ type: 'normal' }); setView('form'); }}
                    className="bg-[#23251d] border-2 border-[#3a3b34] rounded-xl p-8 cursor-pointer transition-all hover:border-[#f7a501] hover:-translate-y-1 hover:shadow-xl group flex flex-col"
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#33342d] group-hover:bg-[#f7a501]/20 flex items-center justify-center mb-6 text-[#9b9c92] group-hover:text-[#f7a501] transition-colors">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Normal Project</h3>
                    <p className="text-[#9b9c92] text-sm leading-relaxed mb-6 flex-1">
                      Traditional article format. Best for text-heavy case studies. Uses standard WYSIWYG editor for content formatting.
                    </p>
                    <div className="font-bold text-[#f7a501] text-sm group-hover:underline">Select Format &rarr;</div>
                  </div>

                  {/* Design Project Option */}
                  <div 
                    onClick={() => { setEditingProject({ type: 'design', blocks: [] } as any); setView('form'); }}
                    className="bg-[#23251d] border-2 border-[#3a3b34] rounded-xl p-8 cursor-pointer transition-all hover:border-[#f7a501] hover:-translate-y-1 hover:shadow-xl group flex flex-col"
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#33342d] group-hover:bg-[#f7a501]/20 flex items-center justify-center mb-6 text-[#9b9c92] group-hover:text-[#f7a501] transition-colors">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Design Project</h3>
                    <p className="text-[#9b9c92] text-sm leading-relaxed mb-6 flex-1">
                      Behance-style visual builder. Best for image-heavy portfolios. Stack and reorder images, galleries, text, and videos block by block.
                    </p>
                    <div className="font-bold text-[#f7a501] text-sm group-hover:underline">Select Format &rarr;</div>
                  </div>
                </div>
                
                <div className="text-center mt-10">
                  <ButtonSecondary onClick={() => setView('list')}>
                    Back to Projects
                  </ButtonSecondary>
                </div>
              </div>

            ) : (
              
              // ── FORM VIEW ──
              <div className="max-w-4xl mx-auto pb-12">
                <div className="bg-[#23251d] border border-[#3a3b34] rounded-xl p-5 md:p-8 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b border-[#3a3b34] gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{editingProject?.id ? 'Edit Project' : 'New Project'}</h2>
                      <p className="text-sm text-[#9b9c92] capitalize mt-1 border border-[#4d4f46] inline-block px-2 py-0.5 rounded bg-[#1a1b16]">{editingProject?.type} Format</p>
                    </div>
                    <ButtonSecondary onClick={() => { setView('list'); setEditingProject(null); }}>
                      Cancel
                    </ButtonSecondary>
                  </div>

                  <form onSubmit={handleSaveProject} className="flex flex-col gap-8">
                    
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#b6b7af]">Project Title <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={editingProject?.title || ''}
                          onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                          className="px-4 py-2.5 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-[#b6b7af]">Year</label>
                          <input 
                            type="number" 
                            value={editingProject?.year || new Date().getFullYear()}
                            onChange={(e) => setEditingProject({...editingProject, year: e.target.value})}
                            className="px-4 py-2.5 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-[#b6b7af]">Client</label>
                          <input 
                            type="text" 
                            value={editingProject?.client || ''}
                            onChange={(e) => setEditingProject({...editingProject, client: e.target.value})}
                            className="px-4 py-2.5 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[#b6b7af]">Thumbnail URL <span className="text-red-500">*</span></label>
                      <div className="flex gap-3">
                        <input 
                          type="url" 
                          required
                          placeholder="https://..."
                          value={editingProject?.thumbnail || ''}
                          onChange={(e) => setEditingProject({...editingProject, thumbnail: e.target.value})}
                          className="flex-1 px-4 py-2.5 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                        />
                        {editingProject?.thumbnail && (
                          <div className="w-11 h-11 rounded overflow-hidden shrink-0 border border-[#4d4f46] bg-[#1a1b16]">
                            <img src={editingProject.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-px bg-[#3a3b34]"></div>

                    {/* Conditional Editor Fields based on Type */}
                    {editingProject?.type === 'normal' ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-[#b6b7af]">Background / Overview</label>
                          <AdminEditor 
                            initialValue={(editingProject as NormalProject).background || ''} 
                            onChange={(val) => setEditingProject({...editingProject, background: val})}
                            placeholder="Project background context..."
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-[#b6b7af]">Main Content / Case Study</label>
                          <AdminEditor 
                            initialValue={(editingProject as NormalProject).content || ''} 
                            onChange={(val) => setEditingProject({...editingProject, content: val})}
                            placeholder="Detailed project content, images, videos..."
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-sm font-semibold text-[#b6b7af]">Design Blocks Builder</label>
                          <span className="text-xs text-[#9b9c92]">Drag or reorder blocks vertically</span>
                        </div>
                        <DesignBuilder 
                          blocks={(editingProject as DesignProject).blocks || []}
                          onChange={(blocks) => setEditingProject({ ...editingProject, blocks } as any)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#3a3b34] mt-2">
                      <ButtonSecondary onClick={() => { setView('list'); setEditingProject(null); }}>
                        Cancel
                      </ButtonSecondary>
                      <ButtonPrimary type="submit">
                        Save Project
                      </ButtonPrimary>
                    </div>
                  </form>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto opacity-60">
              <div className="w-16 h-16 bg-[#33342d] rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9b9c92]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 className="text-xl font-bold mb-2 capitalize">{activeTab} Module</h2>
              <p className="text-[#9b9c92] text-sm">This module is currently under construction and will be available in a future update.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Custom Modals */}
      <ConfirmModal 
        isOpen={modalState.isOpen}
        title="Delete Project?"
        message="This action cannot be undone. This will permanently delete the project and all its data."
        confirmText="Yes, delete it"
        onConfirm={executeDelete}
        onCancel={() => setModalState({ isOpen: false, idToDelete: null })}
      />
    </div>
  );
}
