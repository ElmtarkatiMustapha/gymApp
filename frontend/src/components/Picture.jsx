import { getImageURL } from "../api/api";

export function Picture({picture}) {
    return (
        <div style={{
            backgroundImage: "url(" + getImageURL(picture) + ")",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            borderRadius: "30px",
            width: "3rem",
            height: "3rem"
        }} loading="lazy" >
        </div>
    )
}