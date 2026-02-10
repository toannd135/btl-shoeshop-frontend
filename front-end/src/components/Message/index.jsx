import { Dropdown, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import "./Message.css";

function Message() {
  return (
    <Dropdown
      trigger={["click"]}
      popupRender={() => (
        <div className="message__dropdown">

          <div className="message__header">
            <div className="message__header-title">
              3 New Messages
            </div>
          </div>

          <div className="message__body">
            <div className="message__item">
              <div className="message__avatar">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7VSt1X3PEGucY8BR2xkLmusuBdXqZtPPzng&s"
                  alt="avatar"
                />
              </div>
              <div className="message__content">
                <div className="message__name">Lucy Lavender</div>
                <div className="message__text">
                  Nam pretium turpis et arcu. Duis arcu tortor.
                </div>
              </div>
            </div>

            <div className="message__item">
              <div className="message__avatar">
                <img
                  src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/avatar_vo_tri_a49436c5de.jpg"
                  alt="avatar"
                />
              </div>
              <div className="message__content">
                <div className="message__name">Remy Sharp</div>
                <div className="message__text">
                  Curabitur ligula sapien euismod vitae.
                </div>
              </div>
            </div>

            <div className="message__item">
              <div className="message__avatar">
                <img
                  src="https://haycafe.vn/wp-content/uploads/2021/11/Anh-avatar-dep-chat-lam-hinh-dai-dien.jpg"
                  alt="avatar"
                />
              </div>
              <div className="message__content">
                <div className="message__name">Cassandra Mixon</div>
                <div className="message__text">
                  Pellentesque auctor neque nec urna.
                </div>
              </div>
            </div>
          </div>

          <div className="message__footer">
            Show all messages
          </div>
        </div>
      )}
    >
      <Button type="text" icon={<MessageOutlined />} />
    </Dropdown>
  );
}

export default Message;
