import React, { useRef, useState } from 'react';
import useUrdfStore from '../store/urdfStore';
import { Download, Upload, Plus, Trash2, ChevronRight, ChevronDown, Box, Circle, Cylinder } from 'lucide-react';

export default function EditorPanel() {
    const { urdf, setUrdf, addLink, removeLink, updateLink, addJoint, removeJoint, loadUrdfXml, getUrdfXml } = useUrdfStore();
    const fileInputRef = useRef(null);
    const [selectedLinkIndex, setSelectedLinkIndex] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            loadUrdfXml(e.target.result);
            setSelectedLinkIndex(null);
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        const xml = getUrdfXml();
        const blob = new Blob([xml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${urdf.name}.urdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddLink = () => {
        const name = `link_${urdf.links.length + 1}`;
        addLink({
            name,
            visual: {
                geometry: { type: 'box', size: '1 1 1' },
                material: { name: 'gray', color: '0.5 0.5 0.5 1' }
            }
        });
        setSelectedLinkIndex(urdf.links.length);
    };

    const handleAddJoint = () => {
        const name = `joint_${urdf.joints.length + 1}`;
        addJoint({
            name,
            type: 'fixed',
            parent: urdf.links[0]?.name || '',
            child: urdf.links[1]?.name || ''
        });
    };

    const updateLinkProperty = (key, value) => {
        if (selectedLinkIndex === null) return;
        const link = urdf.links[selectedLinkIndex];
        const newLink = { ...link, [key]: value };
        updateLink(selectedLinkIndex, newLink);
    };

    const updateVisualGeometry = (key, value) => {
        if (selectedLinkIndex === null) return;
        const link = urdf.links[selectedLinkIndex];
        const newVisual = { ...link.visual, geometry: { ...link.visual.geometry, [key]: value } };
        updateLink(selectedLinkIndex, { ...link, visual: newVisual });
    };

    const updateVisualOrigin = (key, value) => {
        if (selectedLinkIndex === null) return;
        const link = urdf.links[selectedLinkIndex];
        const currentOrigin = link.visual?.origin || { xyz: '0 0 0', rpy: '0 0 0' };
        const newVisual = { ...link.visual, origin: { ...currentOrigin, [key]: value } };
        updateLink(selectedLinkIndex, { ...link, visual: newVisual });
    };

    const selectedLink = selectedLinkIndex !== null ? urdf.links[selectedLinkIndex] : null;

    return (
        <div style={{ padding: '1rem', color: '#e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>URDF Editor</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => fileInputRef.current.click()} title="Import URDF" style={{ background: '#444', border: 'none', color: 'white', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <Upload size={16} />
                    </button>
                    <button onClick={handleDownload} title="Export URDF" style={{ background: '#444', border: 'none', color: 'white', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <Download size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".urdf,.xml"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            <div>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>Robot Name</label>
                <input
                    type="text"
                    value={urdf.name}
                    onChange={(e) => setUrdf({ ...urdf, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#333', border: '1px solid #555', color: 'white', marginTop: '0.2rem' }}
                />
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3>Links</h3>
                    <button onClick={handleAddLink} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: '#444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                        <Plus size={14} /> Add
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {urdf.links.map((link, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedLinkIndex(idx)}
                            style={{
                                background: selectedLinkIndex === idx ? '#444' : '#2a2a2a',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                border: selectedLinkIndex === idx ? '1px solid #646cff' : '1px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>{link.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeLink(idx); if (selectedLinkIndex === idx) setSelectedLinkIndex(null); }} style={{ color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {urdf.links.length === 0 && <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>No links</p>}
                </div>
            </div>

            {selectedLink && (
                <div style={{ background: '#252525', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#aaa' }}>Link Properties</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block' }}>Name</label>
                        <input type="text" value={selectedLink.name} onChange={(e) => updateLinkProperty('name', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block' }}>Geometry Type</label>
                        <select
                            value={selectedLink.visual?.geometry?.type || 'box'}
                            onChange={(e) => updateVisualGeometry('type', e.target.value)}
                            style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }}
                        >
                            <option value="box">Box</option>
                            <option value="cylinder">Cylinder</option>
                            <option value="sphere">Sphere</option>
                        </select>
                    </div>
                    {selectedLink.visual?.geometry?.type === 'box' && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block' }}>Size (x y z)</label>
                            <input type="text" value={selectedLink.visual.geometry.size || '1 1 1'} onChange={(e) => updateVisualGeometry('size', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                        </div>
                    )}
                    {selectedLink.visual?.geometry?.type === 'cylinder' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>Radius</label>
                                <input type="text" value={selectedLink.visual.geometry.radius || '0.5'} onChange={(e) => updateVisualGeometry('radius', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>Length</label>
                                <input type="text" value={selectedLink.visual.geometry.length || '1'} onChange={(e) => updateVisualGeometry('length', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                            </div>
                        </div>
                    )}
                    {selectedLink.visual?.geometry?.type === 'sphere' && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block' }}>Radius</label>
                            <input type="text" value={selectedLink.visual.geometry.radius || '0.5'} onChange={(e) => updateVisualGeometry('radius', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                        </div>
                    )}
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block' }}>Origin XYZ</label>
                        <input type="text" value={selectedLink.visual?.origin?.xyz || '0 0 0'} onChange={(e) => updateVisualOrigin('xyz', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block' }}>Origin RPY</label>
                        <input type="text" value={selectedLink.visual?.origin?.rpy || '0 0 0'} onChange={(e) => updateVisualOrigin('rpy', e.target.value)} style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '0.2rem' }} />
                    </div>
                </div>
            )}

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3>Joints</h3>
                    <button onClick={handleAddJoint} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: '#444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                        <Plus size={14} /> Add
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {urdf.joints.map((joint, idx) => (
                        <div key={idx} style={{ background: '#2a2a2a', padding: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{joint.name}</span>
                            <button onClick={() => removeJoint(idx)} style={{ color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {urdf.joints.length === 0 && <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>No joints</p>}
                </div>
            </div>
        </div>
    );
}
