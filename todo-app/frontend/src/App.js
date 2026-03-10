import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [todos, setTodos] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/todos`);
            setTodos(res.data);
        } catch (err) {
            setError('Failed to connect to backend.');
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const res = await axios.post(`${API_URL}/api/todos`, { title: newTitle.trim() });
            setTodos([res.data, ...todos]);
            setNewTitle('');
        } catch {
            setError('Failed to add todo.');
        }
    };

    const toggleComplete = async (todo) => {
        try {
            const res = await axios.put(`${API_URL}/api/todos/${todo.id}`, {
                completed: !todo.completed,
            });
            setTodos(todos.map((t) => (t.id === todo.id ? res.data : t)));
        } catch {
            setError('Failed to update todo.');
        }
    };

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditingTitle(todo.title);
    };

    const saveEdit = async (id) => {
        if (!editingTitle.trim()) return;
        try {
            const res = await axios.put(`${API_URL}/api/todos/${id}`, { title: editingTitle.trim() });
            setTodos(todos.map((t) => (t.id === id ? res.data : t)));
            setEditingId(null);
        } catch {
            setError('Failed to edit todo.');
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/todos/${id}`);
            setTodos(todos.filter((t) => t.id !== id));
        } catch {
            setError('Failed to delete todo.');
        }
    };

    return (
        <div className="app-container">
            <div className="card">
                <h1>📝 Todo List</h1>

                {error && <div className="error-banner">{error} <button onClick={() => setError('')}>✕</button></div>}

                <form onSubmit={addTodo} className="add-form">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <button type="submit">Add</button>
                </form>

                {loading ? (
                    <p className="loading">Loading...</p>
                ) : todos.length === 0 ? (
                    <p className="empty">No tasks yet. Add one above!</p>
                ) : (
                    <ul className="todo-list">
                        {todos.map((todo) => (
                            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleComplete(todo)}
                                />

                                {editingId === todo.id ? (
                                    <div className="edit-group">
                                        <input
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                                            autoFocus
                                        />
                                        <button className="btn-save" onClick={() => saveEdit(todo.id)}>Save</button>
                                        <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                ) : (
                                    <span className="todo-title">{todo.title}</span>
                                )}

                                {editingId !== todo.id && (
                                    <div className="actions">
                                        <button className="btn-edit" onClick={() => startEdit(todo)}>✏️</button>
                                        <button className="btn-delete" onClick={() => deleteTodo(todo.id)}>🗑️</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <p className="count">
                    {todos.filter((t) => !t.completed).length} task(s) remaining
                </p>
            </div>
        </div>
    );
}

export default App;
