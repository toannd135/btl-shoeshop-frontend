import { useState } from "react";
import { createPermission } from "../../services/permissionService";

function PermissionCreate() {
    const [form, setForm] = useState({
        name: "",
        apiPath: "",
        method: "",
        module: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        await createPermission(form);
        alert("Created permission");
    };

    return (
        <>
            <div className="admin-container">
                <h2 className="admin-title">Create Permission</h2>

                <div className="form-card">
                    <div className="form-group">
                        <label>Name</label>
                        <input name="name" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>API Path</label>
                        <input name="apiPath" placeholder="/api/v1/users" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Method</label>
                        <select name="method" onChange={handleChange}>
                            <option value="">-- Select --</option>
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Module</label>
                        <input name="module" placeholder="USER" onChange={handleChange} />
                    </div>

                    <button className="btn-primary full" onClick={handleSubmit}>Create</button>
                </div>
            </div>

        </>
    );
}

export default PermissionCreate;
