import { SearchOutlined } from "@ant-design/icons";
import "./Search.css";
function Search() {

    return (
        <>
            <div className="header__search">
                <SearchOutlined className="search__icon" />
                <input
                    type="text"
                    className="search__input"
                    placeholder="Search topics..."
                />
            </div>

        </>
    )
}

export default Search;