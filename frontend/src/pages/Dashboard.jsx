import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Play, BookOpen, Trash2 } from 'lucide-react';

const API_BASE = '';

function Dashboard() {
    const [problems, setProblems] = useState([]);
    const [newId, setNewId] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const res = await axios.get(`${API_BASE}/problems`);
            setProblems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addProblem = async (e) => {
        e.preventDefault();
        if (!newId) return;

        // Support comma or space separated IDs (e.g. "1, 2, 3" or "1 2 3")
        const ids = newId.split(/[,，\s]+/).filter(id => id.trim().length > 0);

        try {
            // Add each ID sequentially
            for (const id of ids) {
                await axios.post(`${API_BASE}/problems`, { id: id.trim(), title: newTitle });
            }
            setNewId('');
            setNewTitle('');
            fetchProblems();
        } catch (err) {
            alert('Failed to add problems');
        }
    };

    const deleteProblem = async (id, e) => {
        e.stopPropagation(); // Prevent entering the problem
        if (!window.confirm(`Are you sure you want to delete Problem #${id}?`)) return;

        try {
            await axios.delete(`${API_BASE}/problems/${id}`);
            fetchProblems();
        } catch (err) {
            alert('Failed to delete problem');
        }
    };

    return (
        <div className="container">
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

                {/* Add Problem Section */}
                <section className="card">
                    <h2><Plus size={20} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Add Problem</h2>
                    <form onSubmit={addProblem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Problem ID / Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 1, 206, 42"
                                value={newId}
                                onChange={e => setNewId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Two Sum"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Add to Library</button>
                    </form>
                </section>

                {/* Problem List Section */}
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Library ({problems.length})</h2>
                        <button className="btn btn-ghost" onClick={() => {
                            if (problems.length > 0) {
                                const random = problems[Math.floor(Math.random() * problems.length)];
                                window.location.href = `/review/${random.id}`;
                            }
                        }}>
                            <Play size={18} /> Review Random
                        </button>
                    </div>

                    {loading ? <p>Loading...</p> : (
                        <div className="problem-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {problems.map(p => (
                                <div key={p.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', minWidth: '30px' }}>#{p.id}</span>
                                        <span>{p.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
                                            onClick={(e) => deleteProblem(p.id, e)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <Link to={`/review/${p.id}`} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                                            <Play size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {problems.length === 0 && <p className="text-secondary">No problems added yet.</p>}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Dashboard;

