import React, { useState } from 'react';
import { generateId, type DesignBlock } from '../lib/adminStore';
import AdminEditor from './AdminEditor';

interface DesignBuilderProps {
  blocks: DesignBlock[];
  onChange: (blocks: DesignBlock[]) => void;
}

export default function DesignBuilder({ blocks, onChange }: DesignBuilderProps) {
  const addBlock = (type: DesignBlock['type']) => {
    let newBlock: DesignBlock;
    const id = generateId();
    switch (type) {
      case 'text':
        newBlock = { id, type: 'text', content: '' };
        break;
      case 'image':
        newBlock = { id, type: 'image', url: '', caption: '' };
        break;
      case 'gallery':
        newBlock = { id, type: 'gallery', urls: ['', ''], columns: 2 };
        break;
      case 'embed':
        newBlock = { id, type: 'embed', url: '' };
        break;
      default:
        return;
    }
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<DesignBlock>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } as DesignBlock : b));
  };

  const removeBlock = (id: string) => {
    if (confirm('Remove this block?')) {
      onChange(blocks.filter(b => b.id !== id));
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="flex flex-col gap-6">
      {blocks.length === 0 ? (
        <div className="py-12 px-6 border-2 border-dashed border-[#4d4f46] rounded-xl text-center flex flex-col items-center justify-center bg-[#23251d]">
          <div className="w-16 h-16 bg-[#33342d] rounded-full flex items-center justify-center mb-4 text-[#9b9c92]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <h3 className="text-[#eeefe9] font-bold text-lg mb-2">Canvas is empty</h3>
          <p className="text-[#9b9c92] text-sm mb-6 max-w-sm">Start building your design project by adding blocks. You can reorder them anytime.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BlockAddButtons onAdd={addBlock} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="relative group bg-[#23251d] border border-[#3a3b34] rounded-lg p-5 transition-colors focus-within:border-[#f7a501]">
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1a1b16] p-1 rounded-md border border-[#4d4f46] z-10">
                <button 
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-[#9b9c92] hover:text-[#eeefe9] hover:bg-[#33342d] rounded disabled:opacity-30 transition-colors"
                  title="Move Up"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 text-[#9b9c92] hover:text-[#eeefe9] hover:bg-[#33342d] rounded disabled:opacity-30 transition-colors"
                  title="Move Down"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div className="w-px h-4 bg-[#4d4f46] mx-1"></div>
                <button 
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Remove Block"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>

              <div className="text-[10px] uppercase font-bold tracking-wider text-[#6c6e63] mb-3">
                {block.type} Block
              </div>

              {block.type === 'text' && (
                <AdminEditor 
                  initialValue={block.content} 
                  onChange={(val) => updateBlock(block.id, { content: val })}
                  placeholder="Type your content here..."
                />
              )}

              {block.type === 'image' && (
                <div className="flex flex-col gap-3">
                  <input 
                    type="url" 
                    placeholder="Image URL (https://...)" 
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                  />
                  <input 
                    type="text" 
                    placeholder="Caption (optional)" 
                    value={block.caption || ''}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                  />
                  {block.url && (
                    <div className="mt-2 rounded-md overflow-hidden bg-[#1a1b16] border border-[#4d4f46] max-h-[400px]">
                      <img src={block.url} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              )}

              {block.type === 'gallery' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#b6b7af]">Columns:</span>
                    <select 
                      value={block.columns} 
                      onChange={(e) => {
                        const cols = parseInt(e.target.value) as 2 | 3;
                        let newUrls = [...block.urls];
                        while (newUrls.length < cols) newUrls.push('');
                        updateBlock(block.id, { columns: cols, urls: newUrls });
                      }}
                      className="h-8 pl-3 pr-8 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] appearance-none outline-none focus:border-[#f7a501]"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%239b9c92\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                    </select>
                    
                    <button 
                      type="button"
                      onClick={() => updateBlock(block.id, { urls: [...block.urls, ''] })}
                      className="ml-auto text-xs font-bold text-[#f7a501] hover:text-[#dd9001] bg-[#f7a501]/10 px-3 py-1.5 rounded transition-colors"
                    >
                      + Add Image to Gallery
                    </button>
                  </div>
                  
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))` }}>
                    {block.urls.map((url, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="url" 
                            placeholder="Image URL" 
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...block.urls];
                              newUrls[i] = e.target.value;
                              updateBlock(block.id, { urls: newUrls });
                            }}
                            className="w-full px-2 py-1.5 bg-[#1a1b16] border border-[#4d4f46] rounded text-xs text-[#eeefe9] focus:outline-none focus:border-[#f7a501]"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newUrls = [...block.urls];
                              newUrls.splice(i, 1);
                              updateBlock(block.id, { urls: newUrls });
                            }}
                            disabled={block.urls.length <= 2}
                            className="p-1.5 text-[#6c6e63] hover:text-red-400 hover:bg-red-500/10 rounded disabled:opacity-30"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        </div>
                        <div className="aspect-square bg-[#1a1b16] border border-[#4d4f46] rounded overflow-hidden">
                          {url ? (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6c6e63] text-xs">No Image</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.type === 'embed' && (
                <div className="flex flex-col gap-3">
                  <input 
                    type="url" 
                    placeholder="YouTube or Vimeo URL" 
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1b16] border border-[#4d4f46] rounded-md text-sm text-[#eeefe9] focus:outline-none focus:border-[#f7a501] focus:ring-1 focus:ring-[#f7a501]"
                  />
                  {block.url && (
                    <div className="text-xs text-[#9b9c92] bg-[#1a1b16] p-3 rounded border border-[#4d4f46]">
                      Embed preview will be generated on the frontend.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="mt-4 p-4 border border-dashed border-[#4d4f46] rounded-lg flex items-center justify-center gap-3 bg-[#1a1b16]">
            <span className="text-sm font-medium text-[#9b9c92]">Add Block:</span>
            <BlockAddButtons onAdd={addBlock} />
          </div>
        </div>
      )}
    </div>
  );
}

function BlockAddButtons({ onAdd }: { onAdd: (type: DesignBlock['type']) => void }) {
  const btnClass = "flex items-center gap-2 px-3 py-1.5 bg-[#23251d] border border-[#4d4f46] rounded-md text-sm font-medium text-[#eeefe9] hover:bg-[#33342d] hover:border-[#6c6e63] transition-colors shadow-sm";
  
  return (
    <>
      <button type="button" onClick={() => onAdd('text')} className={btnClass}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
        Text
      </button>
      <button type="button" onClick={() => onAdd('image')} className={btnClass}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        Image
      </button>
      <button type="button" onClick={() => onAdd('gallery')} className={btnClass}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
        Gallery
      </button>
      <button type="button" onClick={() => onAdd('embed')} className={btnClass}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        Video
      </button>
    </>
  );
}
