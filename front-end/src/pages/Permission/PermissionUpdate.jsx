import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getPermissionDetail,
    updatePermission
} from "../../services/permissionService";

function PermissionUpdate() {
    const { id } = useParams();
    const [form, setForm] = useState({
        name: "",
        module: ""
    });

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;

            try {
                const res = await getPermissionDetail(id);

                if (!res || !res.data) {
                    console.error("Permission not found");
                    return;
                }

                setForm({
                    name: res.data.name ?? "",
                    module: res.data.module ?? ""
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchDetail();
    }, [id]);


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        await updatePermission(id, form);
        alert("Updated permission");
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

                    <button className="btn-primary full" onClick={handleSubmit}>Update</button>
                </div>
            </div>

        </>
    );
}

export default PermissionUpdate;
