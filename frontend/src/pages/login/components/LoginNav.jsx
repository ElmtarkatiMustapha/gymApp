import { APP_NAME } from "../../../assets/js/global";
import Logo from "../../../assets/logo.png"
import { Link } from "react-router-dom";
import { LangSelect } from "../../../components/LangSelect";
export function LoginNav() {
    return (
        <nav id="loginNavBar" className="loginNavBar position-fixed top-0 start-0 w-100">
                <div className="row">
                    <div className="col-6  align-self-center">
                        <Link to="/" className="brand">
                            <img src={Logo} alt="" className="logo" fetchPriority="high" />
                        <span className="title">{APP_NAME }</span>
                        </Link>
                    </div>
                    <div className="col-6  align-self-center ">
                        <div className="d-inline-block float-end pe-2">
                            <LangSelect  />
                        </div>
                    </div>
                </div>
            </nav>
    )
}