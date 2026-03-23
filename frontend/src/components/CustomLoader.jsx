import { Lang } from "../assets/js/lang";

export function CustomLoader() {
    return (
        <div style={{ alignContent: "center" }} className="w-100 h-100 text-center" >
            <div className="spinner-border m-2" style={{ width: "5rem", height: "5rem" }} role="status">
                <span className="sr-only"></span>
            </div>
            <div className="display-5 d-none d-md-block"><Lang>Loading...</Lang></div>
        </div>
    )
}