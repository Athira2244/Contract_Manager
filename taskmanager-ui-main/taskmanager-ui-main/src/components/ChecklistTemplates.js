import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";


function ChecklistTemplates() {
    const [templates, setTemplates] = useState([]);
    const [name, setName] = useState("");
    const [items, setItems] = useState([""]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (user?.emp_pkey) {
            loadTemplates();
        }
    }, [user]);

    const loadTemplates = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/checklists/templates/user/${user.emp_pkey}`);
            const data = await res.json();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load templates", e);
        }
    };

    const addItemField = () => setItems([...items, ""]);

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const removeItemField = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim() || items.filter(i => i.trim()).length === 0) return;

        const payload = {
            name,
            createdBy: user.emp_pkey,
            items: items.filter(i => i.trim())
        };

        try {
            await fetch(`${API_BASE_URL}/checklists/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            setName("");
            setItems([""]);
            loadTemplates();
            alert("Template saved!");
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this template?")) return;
        await fetch(`${API_BASE_URL}/checklists/templates/${id}`, { method: "DELETE" });
        loadTemplates();
    };

    return (
        <div className="checklist-templates">
            <div className="card" style={{ marginBottom: "30px", padding: "20px" }}>
                <h3>Create Checklist Template</h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Template Heading (e.g. Development)</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter heading..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Checklist Steps</label>
                        {items.map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    value={item}
                                    onChange={e => handleItemChange(index, e.target.value)}
                                    placeholder={`Step ${index + 1}`}
                                />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItemField(index)} className="close-btn" style={{ background: "#fee2e2", color: "#ef4444" }}>×</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addItemField} className="btn-secondary" style={{ padding: "8px 15px", fontSize: "12px" }}>+ Add Step</button>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>Save Template</button>
                </form>
            </div>

            <div className="card" style={{ padding: "20px" }}>
                <h3>Existing Templates</h3>
                <div className="templates-list">
                    {templates.length === 0 ? <p>No templates created yet.</p> : (
                        <table style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.name}</td>
                                        <td>
                                            <button onClick={() => handleDelete(t.id)} className="btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "5px 10px" }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChecklistTemplates;
