import { useEffect, useState } from "react";
import { getPermissionList, deletePermission } from "../../services/permissionService";
import PermissionModal from "./PermissionModal";

import "./Permisson.css";

function PermissionList() {
    const [openModal, setOpenModal] = useState(false);
    const [editingData, setEditingData] = useState(null);


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
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingData(null);
                        setOpenModal(true);
                    }}
                >
                    Create
                </button>
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
                            <div>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setEditingData(item);
                                        setOpenModal(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDelete(item.permissionId)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <PermissionModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onReload={fetchAPI}
                editingData={editingData}
            />
        </div>
    );
}

export default PermissionList;
