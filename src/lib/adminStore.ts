export type DesignBlock = 
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'image'; url: string; caption?: string }
  | { id: string; type: 'gallery'; urls: string[]; columns: 2 | 3 }
  | { id: string; type: 'embed'; url: string };

export interface BaseProject {
  id: string;
  title: string;
  year: number | string;
  client: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  type: 'normal' | 'design';
}

export interface NormalProject extends BaseProject {
  type: 'normal';
  background: string;
  content: string;
}

export interface DesignProject extends BaseProject {
  type: 'design';
  blocks: DesignBlock[];
}

export type Project = NormalProject | DesignProject;

const STORAGE_KEY = 'admin_projects_mock';

// Generate a random ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial mock data
const initialProjects: Project[] = [
  {
    id: 'proj1',
    type: 'normal',
    title: 'Design System Reboot',
    year: 2025,
    client: 'Acme Corp',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop',
    background: '<p>The client needed a complete overhaul of their aging design system to support a new suite of mobile applications.</p>',
    content: '<h2>The Process</h2><p>We started with an extensive audit of their existing components...</p>',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'proj2',
    type: 'design',
    title: 'Visual Identity Exploration',
    year: 2024,
    client: 'Creative Studio',
    thumbnail: 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?q=80&w=600&auto=format&fit=crop',
    blocks: [
      { id: 'b1', type: 'text', content: '<p>A deep dive into visual identities using bold colors.</p>' },
      { id: 'b2', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', caption: 'Initial Sketches' },
      { id: 'b3', type: 'gallery', columns: 2, urls: ['https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop'] }
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const adminStore = {
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjects));
      return initialProjects;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse projects from localStorage', e);
      return [];
    }
  },

  getProject: (id: string): Project | undefined => {
    const projects = adminStore.getProjects();
    return projects.find(p => p.id === id);
  },

  saveProject: (projectData: Partial<Project>): Project => {
    const projects = adminStore.getProjects();
    const now = new Date().toISOString();
    
    if (projectData.id) {
      // Update
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        const updatedProject = {
          ...projects[index],
          ...projectData,
          updatedAt: now
        } as Project;
        projects[index] = updatedProject;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return updatedProject;
      }
    }
    
    // Create
    const newId = generateId();
    let newProject: Project;
    
    if (projectData.type === 'design') {
      newProject = {
        id: newId,
        type: 'design',
        title: projectData.title || 'Untitled Project',
        year: projectData.year || new Date().getFullYear(),
        client: projectData.client || '',
        thumbnail: projectData.thumbnail || '',
        blocks: (projectData as DesignProject).blocks || [],
        createdAt: now,
        updatedAt: now,
      };
    } else {
      newProject = {
        id: newId,
        type: 'normal',
        title: projectData.title || 'Untitled Project',
        year: projectData.year || new Date().getFullYear(),
        client: projectData.client || '',
        thumbnail: projectData.thumbnail || '',
        background: (projectData as NormalProject).background || '',
        content: (projectData as NormalProject).content || '',
        createdAt: now,
        updatedAt: now,
      };
    }
    
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  },

  deleteProject: (id: string): void => {
    const projects = adminStore.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
