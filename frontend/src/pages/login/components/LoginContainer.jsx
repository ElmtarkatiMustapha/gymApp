import { LoginNav } from "./LoginNav"
import { motion } from "framer-motion"
import "../../../assets/css/login.css"
export function LoginContainer({children}) {
    return (
        <>
            <div className="loginBackground">
                <div className="blur"></div>
            </div>
            <div style={{height:"100vh"}} className="container-fluid mainContainer pt-5">
                <LoginNav/>
                <main className="d-flex align-items-center h-100" >
                    <div className="container-fluid text-center">
                        <div className="row justify-content-center">
                            <div className="col-md-8 col-lg-6 col-xxl-5">
                                <motion.div className="loginBox p-5 "
                                    initial={{  y: 100 ,opacity:0}}
                                    animate={{  y: 0 ,opacity:1}}
                                    transition={{duration:0.5}}
                                >
                                    {children}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
        
    )
}