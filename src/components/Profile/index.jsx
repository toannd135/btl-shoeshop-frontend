import { Button, Dropdown } from "antd";
import "./Profile.css";
function Profile() {
    return (
        <>


            <Dropdown
                trigger={["click"]}
                popupRender={() => (
                    <div className="profile__dropdown">
                        <div className="profile__up">
                            <div className="item">Profile</div>
                            <div className="item">Settings & Privacy</div>
                        </div>
                        <div className="profile__down">
                            <div className="item">Help</div>
                            <div className="item">Sign out</div>
                        </div>
                    </div>
                )}
            >
                <Button type="text" className="profile__btn">
                    <div className="profile__avatar">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTp3E05PU096A0sYK811kyRs0MwZNqZNpGOQ&s"
                            alt="avatar"
                        />
                    </div>
                </Button>

            </Dropdown>
        </>
    )
}

export default Profile;