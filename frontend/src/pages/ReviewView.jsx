import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { ArrowLeft, CheckCircle, XCircle, Loader, MessageSquare } from 'lucide-react';

const API_BASE = '';

function ReviewView({ apiKey, baseUrl, model }) {
    const { problemId } = useParams();
    const [description, setDescription] = useState('');
    const [code, setCode] = useState(`# Write your solution for Problem #${problemId} here\n\nclass Solution:\n    def solve(self, ...):\n        pass`);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (apiKey) fetchProblem();
    }, [problemId, apiKey, baseUrl, model]);

    const fetchProblem = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/fetch/${problemId}`, {
                headers: {
                    'X-LLM-Key': apiKey,
                    'X-LLM-Base-Url': baseUrl,
                    'X-LLM-Model': model
                }
            });
            setDescription(res.data.markdown);
        } catch (err) {
            setDescription(`Error fetching problem: ${err.message}. \n\nCheck your API Key/Model.`);
        } finally {
            setLoading(false);
        }
    };

    const checkSolution = async () => {
        setChecking(true);
        setResult(null);
        try {
            const res = await axios.post(`${API_BASE}/check`,
                { problem_id: problemId, user_code: code },
                {
                    headers: {
                        'X-LLM-Key': apiKey,
                        'X-LLM-Base-Url': baseUrl,
                        'X-LLM-Model': model
                    }
                }
            );
            setResult(res.data);
        } catch (err) {
            setResult({ correct: false, feedback: `Error: ${err.message}` });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="review-container" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
            {/* Left Panel: Description */}
            <div className="panel left" style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
                <Link to="/" className="btn btn-ghost" style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                {loading ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Fetching problem from LLM...</div>
                ) : (
                    <div className="markdown-body">
                        <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Right Panel: Editor & Feedback */}
            <div className="panel right" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="editor-wrapper" style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                        }}
                    />
                </div>

                {/* Actions & Result */}
                <div className="action-bar" style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    minHeight: '150px'
                }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-primary"
                            onClick={checkSolution}
                            disabled={checking || !apiKey}
                        >
                            {checking ? <><Loader className="spin" size={16} /> Checking...</> : <><CheckCircle size={16} /> Submit & Check</>}
                        </button>
                    </div>

                    {result && (
                        <div className={`result-box ${result.correct ? 'success' : 'fail'}`} style={{
                            marginTop: '1rem', // Added spacing
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: result.correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${result.correct ? 'var(--success)' : 'var(--error)'}`
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: result.correct ? 'var(--success)' : 'var(--error)' }}>
                                {result.correct ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                <span>{result.correct ? 'Correct Solution' : 'Incorrect Solution'}</span>
                            </div>
                            <div className="markdown-body" style={{ fontSize: '0.95rem' }}>
                                <ReactMarkdown>{result.feedback}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {!apiKey && <p style={{ color: 'var(--text-secondary)' }}>Please set your API Key in the top menu to enable features.</p>}
                </div>
            </div>
        </div>
    );
}

export default ReviewView;
