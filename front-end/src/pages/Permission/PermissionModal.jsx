import { useEffect, useState } from "react";
import { createPermission, updatePermission } from "../../services/permissionService";

function PermissionModal({ open, onClose, onReload, editingData }) {
    const [form, setForm] = useState({
        name: "",
        apiPath: "",
        method: "",
        module: ""
    });

    useEffect(() => {
        if (editingData) {
            setForm(editingData);
        } else {
            setForm({
                name: "",
                apiPath: "",
                method: "",
                module: ""
            });
        }
    }, [editingData, open]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (editingData) {
            await updatePermission(editingData.permissionId, form);
        } else {
            await createPermission(form);
        }

        onReload();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>{editingData ? "Edit Permission" : "Create Permission"}</h3>

                <div className="form-group">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>API Path</label>
                    <input name="apiPath" value={form.apiPath} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Method</label>
                    <select name="method" value={form.method} onChange={handleChange}>
                        <option value="">-- Select --</option>
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Module</label>
                    <input name="module" value={form.module} onChange={handleChange} />
                </div>

                <div className="modal-actions">
                    <button className="btn-danger" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        {editingData ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PermissionModal;
