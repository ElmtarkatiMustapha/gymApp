import { useEffect, useRef, useState } from "react";
import { useAppAction } from "../context/context";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Lang } from "../assets/js/lang";
import { getImageURL } from "../api/api";

export function UploadImage({ loading, image }) {
    const refDrag = useRef(null);
    const refUploadText = useRef();
    const refFileInput = useRef();
    const [imageUrl, setImageUrl] = useState();
    const appAction = useAppAction();
    useEffect(() => {
        setImageUrl(getImageURL(image));
    }, [image])
    const handleDragLeave = (e) => {
        e.preventDefault();
        refDrag.current.classList.remove("active");
        refUploadText.current.innerText = "Upload File";
    }
    //handle drag over the dragArea
    const handleDragOver = (e) => {
        e.preventDefault();
        refUploadText.current.innerText = "leave to drop the file"
        refDrag.current.classList.add("active");
    }
    //handle drop file event
    const handleDrop = (e) => {
        e.preventDefault();
        refDrag.current.classList.remove("active");
        refUploadText.current.innerText = "Upload File"
        if (e.dataTransfer.files.length > 1) {
            console.log("upload just one image!!!");
            return true;
        }
        if (e.dataTransfer.files < 1) {
            console.log("Aucun image uploaded")
            return true;
        }
        let file = e.dataTransfer.files[0];
        if (checkType(file)) {
            displayFunc(file)
            refFileInput.current.files = e.dataTransfer.files;
        } else {
            appAction({
                type: "SET_ERROR",
                payload: "type not allowed"
            })
        }
    }
    //when file upload in file input
    const handleFileChan = (e) => {
        let file = e.target.files[0];
        if (checkType(file)) {
            displayFunc(file)
        } else {
            appAction({
                type: "SET_ERROR",
                payload: "type not allowed"
            })
        }
    }
    //to check extension 
    const checkType = (file) => {
        const valideExtensions = ["image/jpeg", "image/jpg", "image/png"];
        if (valideExtensions.includes(file.type)) {
            return true;
        } else {
            return false;
        }
    }
    //to display picture in background
    const displayFunc = (file) => {
        let fileReader = new FileReader();
        fileReader.onload = () => {
            let fileUrl = fileReader.result
            setImageUrl(fileUrl);
        }
        fileReader.readAsDataURL(file);
    }
    //to upload image manual
    const handleBrowse = () => {
        refFileInput.current.click();
    }
    return (
        <div style={{ backgroundImage: "url('" + imageUrl + "')" }} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="uploadIamge text-center">
            <div ref={refDrag} className="flou pt-4 pb-4 text-center">
                <div className="icon w-100 text-white"><FaCloudUploadAlt /></div>
                <div ref={refUploadText} onClick={handleBrowse} className="text"><Lang>Upload Image</Lang></div>
                <input disabled={loading} name="picture" ref={refFileInput} onChange={handleFileChan} type="file" accept="image/png,image/jpeg,image/jpg" hidden />
            </div>
        </div>
    )
}