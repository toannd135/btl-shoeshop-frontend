import { DeleteOutlined} from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import {deleteProduct} from "../../services/productService";
function ProductDelete(props) {
    const {record, onReload} = props;
    const handleDelete = async () => {
        const response = await deleteProduct(record.id);
        if(response){
            onReload();
            alert("Successfully deleted!");
        }
        else{
            alert("Failed deleted");
        }
    }
    return(
        <>
            <Popconfirm title="Sure to delete?" onConfirm={handleDelete}>
                <Button danger size="small" icon={<DeleteOutlined />}/>
            </Popconfirm>
        </>
    )
}

export default ProductDelete;