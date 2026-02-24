import { Dropdown, Button, Badge } from "antd";
import {
  BellOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./Notify.css";

function Notify() {
  return (
    <Dropdown
      trigger={["click"]}
      popupRender={() => (
        <div className="notify__dropdown">
          
          <div className="notify__header">
            <div className="notify__header-title">
              4 New Notifications
            </div>
          </div>

          
          <div className="notify__body">
            <div className="notify__item">
              <div className="notify__item-icon">
                <BellOutlined />
              </div>
              <div className="notify__item-content">
                <div className="notify__item-title">Update complete</div>
                <div className="notify__item-desc">
                  Restart server to complete update.
                </div>
              </div>
            </div>

            <div className="notify__item">
              <div className="notify__item-icon">
                <UserOutlined />
              </div>
              <div className="notify__item-content">
                <div className="notify__item-title">New connection</div>
                <div className="notify__item-desc">
                  Anna accepted your request.
                </div>
              </div>
            </div>

            <div className="notify__item">
              <div className="notify__item-icon">
                <BellOutlined />
              </div>
              <div className="notify__item-content">
                <div className="notify__item-title">Lorem ipsum</div>
                <div className="notify__item-desc">
                  Aliquam ex eros, imperdiet vulputate hendrerit.
                </div>
              </div>
            </div>

            <div className="notify__item">
              <div className="notify__item-icon">
                <HomeOutlined />
              </div>
              <div className="notify__item-content">
                <div className="notify__item-title">New login</div>
                <div className="notify__item-desc">
                  Login from 192.186.1.1
                </div>
              </div>
            </div>
          </div>

          
          <div className="notify__footer">
            Show all notifications
          </div>
        </div>
      )}
    >
      <Badge dot>
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
}

export default Notify;
