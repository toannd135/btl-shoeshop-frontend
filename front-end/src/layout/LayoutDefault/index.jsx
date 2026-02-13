import { Button, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content, Header } from 'antd/es/layout/layout';
import MenuSider from '../../components/MenuSider';
import { Outlet } from 'react-router-dom';
import "./LayoutDefault.css";
import logoPtitShoesShoppng from "../../images/logoPtitShoesShoppng.png";
import Notify from '../../components/Notify';
import Message from '../../components/Message';
import Profile from '../../components/Profile';
import Search from '../../components/Search';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useState } from 'react';
function LayoutDefault() {
    const [collapse, setCollapse] = useState(false);
    return (
        <Layout className="layout-default" >
            <Sider width={250} collapsible
                collapsed={collapse}
                onCollapse={(value) => setCollapse(value)}
                trigger={null}
                className="sider">
                <div className={collapse ? "logo-collapse" : "logo"}>
                    <div className='logo-icon'>
                        <img src={logoPtitShoesShoppng} alt="logo" />
                    </div>
                </div>
                <div className='menu-box'>
                    <MenuSider className="menu-sider" />
                </div>
            </Sider>

            <Layout>
                <Header className="header">
                    <div className='header__left'>
                        <div className='header__collapse'>
                            <Button type='text' icon={collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapse(!collapse)} />
                        </div>
                        <div className='header__search'><Search /></div>
                    </div>
                    <div className='header__right'>
                        <div className='header__icon'><Message /></div>
                        <div className='header__icon'><Notify /></div>
                        <div className='header__profile'><Profile /></div>
                    </div>
                </Header>

                <Content className="content">
                    <Outlet />
                </Content>


            </Layout>
        </Layout>
    );
}

export default LayoutDefault;
