import { motion } from "framer-motion"
import { Lang } from "../assets/js/lang"
export function ButtonBlue({label,handleClick = null,type,disabled= false}) {
    return (
        disabled?<motion.button
            type={type}
            onClick={handleClick}
            className="btn rounded-pill btn-blue pt-1 pb-1 fw-bold"
            whileHover={{scale:1.1}}
            whileTap={{ scale: 0.9 }}
            disabled
        >
            <Lang>{label}</Lang>
        </motion.button>:<motion.button
            type={type}
            onClick={handleClick}
            className="btn rounded-pill btn-blue pt-1 pb-1 fw-bold"
            whileHover={{scale:1.1}}
            whileTap={{ scale: 0.9 }}
        >
            <Lang>{label}</Lang>
        </motion.button> 
    )
}