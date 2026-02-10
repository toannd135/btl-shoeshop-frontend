import { useEffect, useState } from "react";
import { getPermissionList, deletePermission } from "../../services/permissionService";
import "./Permisson.css";

function PermissionList() {
    const [permissions, setPermissions] = useState([]);

    const fetchAPI = async () => {
        const res = await getPermissionList();
        setPermissions(res.data.permissions || []);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this permission?")) return;
        await deletePermission(id);
        fetchAPI();
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2 className="admin-title">Permission Management</h2>
            </div>

            <div className="permission-grid">
                {permissions.map(item => (
                    <div key={item.permissionId} className="permission-card">
                        <div className="permission-top">
                            <span className="permission-name">{item.name}</span>
                            <span className={`status ${item.status?.toLowerCase()}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="permission-body">
                            <code>{item.method}</code>
                            <span>{item.apiPath}</span>
                        </div>

                        <div className="permission-footer">
                            <span className="module">{item.module}</span>
                            <button
                                className="btn-danger"
                                onClick={() => handleDelete(item.permissionId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PermissionList;
