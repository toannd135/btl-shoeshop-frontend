import {Row, Col} from "antd";
import CartItem from "../CardItem";
import "./Dashboard.css";
function Dashboard(){
    return(
        <>
            
            <Row gutter={[20, 20]} className="mt-20">
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                    <CartItem title="Box 0" />
                </Col>
            </Row>

            <Row gutter={[20, 20]} className="mt-20">
                <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
                    <CartItem title="Box 1" />
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
                    <CartItem title="Box 2" />
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
                    <CartItem title="Box 3" />
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
                    <CartItem title="Box 4" />
                </Col>
            </Row>

            <Row gutter={[20, 20]} className="mt-20">
                <Col xxl={16} xl={16} lg={16} md={24} sm={24} xs={24}>
                    <CartItem title="Box 5" style={{ height: "400px" }} />
                </Col>
                <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
                    <CartItem title="Box 6" style={{ height: "400px" }} />
                </Col>
            </Row>

            <Row gutter={[20, 20]} className="mt-20">
                <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
                    <CartItem title="Box 7" style={{ height: "400px" }} />
                </Col>
                <Col xxl={16} xl={16} lg={16} md={24} sm={24} xs={24}>
                    <CartItem title="Box 8" style={{ height: "400px" }} />
                </Col>
            </Row>

        </>
    )
}

export default Dashboard;