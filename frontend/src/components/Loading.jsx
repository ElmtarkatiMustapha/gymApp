import { motion} from "framer-motion";
import { useAppState } from "../context/context";

const loadVariants = {
    open: {
        height: "100vh",
        transition: {
            delay: 0,
            ease: "easeIn",
            duration: 1
        }
    },
    close: {
        height: "0vh",
        transition: {
            delay: 0.4,
            duration: 1,
            ease: "easeOut"
        }
    }
}
const boxVariante = {
    open: {
        opacity: 1,
        transition: {
            delay: 1,
            ease: "easeIn",
            duration: 0.5
        }
    },
    close: {
        opacity: 0,
        transition: {
            delay: 0,
            ease: "easeOut",
            duration: 0.5
        }
    }
}
export function Loading() {
    const {loading} = useAppState();
    return (
        <motion.div 
            style={{height:"100vh",zIndex:5}}
            className="position-fixed d-flex justify-content-center align-items-center w-100 bg-dark"
            animate={loading?"open":"close"}
            variants={loadVariants}
        >
            <motion.div
                className="h-100 w-100 d-flex justify-content-center align-items-center w-100"
                animate={loading ? "open" : "close"}
                variants={boxVariante}
            >
                <Dot loading={loading} delay={0}/>
                <Dot loading={loading} delay={0.3}/>
                <Dot loading={loading} delay={0.6}/>
            </motion.div>
        </motion.div>
    )
}

function Dot({ delay, loading }) {
    const variants = {
        open: {
            scale: [1, 1.3, 1],
            transition: {
                duration: 2,
                type: "tween",
                delay:delay,
                ease: "easeInOut",
                repeat: Infinity
            }
        },
        close: {
            scale: 0,
            transition: {
                duration: 2,
                type: "tween",
                delay:delay,
                ease: "easeInOut"
            }
        }
    }
    return (
        <motion.div
            style={{ width: "30px", height: "30px", borderRadius: "50%" }}
            className="p-5 m-4 d-flex justify-content-center align-items-center bg-white"
            animate={loading ? "open" : "close"}
            variants={variants}
            >
                {/* <span className="h3">Loading...</span> */}
        </motion.div>
    )
}