import { useEffect, useState } from "react";
import { useAppAction, useAppState } from "../context/context";
import { motion } from "framer-motion";
import { Lang } from "../assets/js/lang";
export function Alert() {
    const state = useAppState();
    const dispatch = useAppAction();
    const [codeSetTimeOutErr, setCodeSetTimeOutErr] = useState(null);
    const [codeSetTimeOutSucc, setcodeSetTimeOutSucc] = useState(null);
    const [codeSetTimeOutWarning, setcodeSetTimeOutWarning] = useState(null);
    useEffect(() => {
        if (codeSetTimeOutErr) {
            clearTimeout(codeSetTimeOutErr);
        }
        if (state.errorMsg) {
            setCodeSetTimeOutErr(
                setTimeout(() => {
                dispatch({type: "SET_ERROR",payload: ""})
                }, 5000)
            )
            
        }
    },[state.errorMsg])
    useEffect(() => {
        if (codeSetTimeOutSucc) {
            clearTimeout(codeSetTimeOutSucc);
        }
        if (state.successMsg) {
            setcodeSetTimeOutSucc(
                setTimeout(() => {
                dispatch({type: "SET_SUCCESS",payload: ""})
                }, 5000)
            )
            
        }
    },[state.successMsg])
    useEffect(() => {
        if (codeSetTimeOutWarning) {
            clearTimeout(codeSetTimeOutWarning);
        }
        if (state.warningMsg) {
            setcodeSetTimeOutWarning(
                setTimeout(() => {
                dispatch({type: "SET_WARNING",payload: ""})
                }, 5000)
            )
            
        }
    },[state.warningMsg])
    
    return (
        <>
            {state.successMsg &&<SuccessMsg>{state.successMsg}</SuccessMsg>}
            {state.errorMsg && <ErrorMsg>{ state.errorMsg}</ErrorMsg>}
            {state.warningMsg && <WarningMsg>{ state.warningMsg}</WarningMsg>}
        </>
    )
}
const initAnimation = {
    opacity: 0,
    scale: 0.9,
    y:40
}
const animation = {
    opacity: 1,
    scale: 1,
    y:0
}

function ErrorMsg({children}) {
    return (
        <motion.div 
        style={{ width: "fit-content" }} 
        className="container-fluid position-fixed bottom-0 z-3  start-0 p-2"
        initial={initAnimation}
        animate={animation}
        transition={{
            duration: 0.3
        }}
        >
            <div className="toast align-items-center m-1 z-3 text-bg-danger border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body h6">
                        <Lang>{children}</Lang>
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                </div>
            </div>
        </motion.div>
    )
}
function SuccessMsg({children}) {
    return (
        <motion.div 
            style={{ width: "fit-content" }} 
            className="container-fluid position-fixed z-3 bottom-0 end-0 p-2"
            initial={initAnimation}
            animate={animation}
            transition={{
                duration: 0.3
            }}

        >
            <div className="toast align-items-center m-1  text-bg-success border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body h6">
                        <Lang>{children}</Lang>
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                </div>
            </div>
        </motion.div>
    )
}
function WarningMsg({children}) {
    return (
        <motion.div 
            style={{ width: "fit-content" }} 
            className="container-fluid position-fixed z-3 bottom-0 end-0 p-2"
            initial={initAnimation}
            animate={animation}
            transition={{
                duration: 0.3
            }}

        >
            <div className="toast align-items-center m-1  text-bg-warning border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body h6">
                        <Lang>{children}</Lang>
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                </div>
            </div>
        </motion.div>
    )
}
