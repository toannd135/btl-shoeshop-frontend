import { Layout } from 'antd';
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
function LayoutDefault() {
    return (
        <Layout className="layout-default">
            <Sider className="sider">
                <div className='sider__logo'>
                    <img src={logoPtitShoesShoppng} alt="logo" />
                </div>
                <MenuSider />
            </Sider>

            <Layout>
                <Header className="header">
                    <div className='header__left'>
                        <div className='header__search'><Search /></div>
                    </div>
                    <div className='header__right'>
                        <div className='header__icon'><Message/></div>
                        <div className='header__icon'><Notify /></div>
                        <div className='header__profile'><Profile/></div>
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
