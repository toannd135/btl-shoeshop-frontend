import { Button, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content, Header } from 'antd/es/layout/layout';
import MenuSider from '../../components/MenuSider';
import { Outlet } from 'react-router-dom';
import "./LayoutDefault.css";
import logo_shoeshop_removebg_preview from "../../images/logo_shoeshop_removebg_preview.png";
import Notify from '../../components/Notify';
import Message from '../../components/Message';
import Profile from '../../components/Profile';
import Search from '../../components/Search';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function LayoutDefault() {
    const [collapse, setCollapse] = useState(false);
    const navigate = useNavigate();

    const siderWidth = collapse ? 80 : 200;

    return (
        <Layout className="layout-default">
            <Header className="header">
                <div className='header__left'>
                    <div className='header__logo' onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src={logo_shoeshop_removebg_preview} alt="logo" />
                    </div>

                    <div className='header__collapse'>
                        <Button
                            type='text'
                            icon={collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapse(!collapse)}
                        />
                    </div>
                </div>

                <div className='header__right'>
                    <div className='header__icon'><Message /></div>
                    <div className='header__icon'><Notify /></div>
                    <div className='header__profile'><Profile /></div>
                </div>
            </Header>

            <Layout>
                <Sider
                    width={200}
                    collapsedWidth={80}
                    collapsible
                    collapsed={collapse}
                    trigger={null}
                    className="sider"
                    style={{
                        width: siderWidth,
                        minWidth: siderWidth,
                        maxWidth: siderWidth
                    }}
                >
                    <div className='menu-box'>
                        <MenuSider className="menu-sider" />
                    </div>
                </Sider>

                <Content
                    className="content"
                    style={{ marginLeft: siderWidth }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default LayoutDefault;