import { createContext, useContext, useReducer } from "react";
//context of satate
const StateContext = createContext();
//context of action
const ActionContext = createContext();

//reducer function for init reducer hook
//all the logic here
function reducer(state, action) {
    //change lang
    if (action.type === "CHG_LANG") {
        localStorage.setItem("lang", action.payload)
        return {
            ...state,
            currentLang: action.payload
        }
    }
    if (action.type === "CHG_LANG_DATA") {
        return {
            ...state,
            langData: action.payload
        }
    }
    //set error msg
    if (action.type === "SET_ERROR") {
        return {
            ...state,
            errorMsg: action.payload
        }
    }
    //set success
    if (action.type === "SET_SUCCESS") {
        return {
            ...state,
            successMsg: action.payload
        }
    }
    //set success
    if (action.type === "SET_WARNING") {
        return {
            ...state,
            warningMsg: action.payload
        }
    }
    //set user on login and signup
    if (action.type === "SET_USER") {
        return {
            ...state,
            currentUser: action.payload
        }
    }
    //if the user admin
    if (action.type === "SET_ROLE") {
        return {
            ...state,
            userRole: action.payload
        }
    }
    //counter of forgot password
    if (action.type === "DEC_RESENT_COUNTER") {
        if (state.counterResent > 0) {
            return {
                ...state,
                counterResent: state.counterResent - 1
            }
        } else {
            return {
                ...state
            }
        }
    }
    //reset the counter
    if (action.type === "RESTAR_RESENT_COUNTER") {
        return {
            ...state,
            counterResent: 60
        }
    }
    //set username 
    if (action.type === "SET_USERNAME") {
        sessionStorage.setItem("username", action.payload);
        return {
            ...state,
            username: action.payload
        }
    }
    //set email
    if (action.type === "SET_EMAIL") {
        sessionStorage.setItem("email", action.payload);
        return {
            ...state,
            emailAdress: action.payload
        }
    }
    //set loading
    if (action.type === "SET_LOADING") {
        return {
            ...state,
            loading: action.payload
        }
    }
    //set device is mobile
    if (action.type === "SET_DEVICE") {
        return {
            ...state,
            isMobile: action.payload
        }
    }
    //set settings
    if (action.type === "SET_SETTINGS") {
        return {
            ...state,
            settings: action.payload
        }
    }
    //update settings
    if (action.type === "UPDATE_SETTINGS") {
        return {
            ...state,
            settings: action.payload
        }
    }
    //UPDATE USER INFO
    if (action.type === "UPDATE_CURRENT_USER") {
        return {
            ...state,
            currentUser: {
                ...state.currentUser,
                name: action.payload.name,
                phone: action.payload.phone,
                cin: action.payload.cin,
                email: action.payload.email,
                picture: action.payload.picture,
                username: action.payload.username,
                sectors: action.payload.sectors,
                cashier: action.payload.cashier,
                roles: action.payload.roles
            }
        }
    }
    //toggle Installed
    if (action.type === "TOGGLE_INSTALLED") {
        return {
            ...state,
            installed: action.payload
        }
    }
}



//get language stored in localStorage
const langStorage = localStorage.getItem("lang");
var initState = {
    currentLang: langStorage ? langStorage : "fr.json",
    langData: [],
    errorMsg: "",
    successMsg: "",
    warningMsg: "",
    counterResent: 60,
    emailAdress: sessionStorage.getItem("email"),
    username: sessionStorage.getItem("username"),
    currentUser: null,
    installed: false,
    isAdmin: false,
    userRole: [],
    loading: true,
    isMobile: false,
    settings: null,
    tableStyle: {
        headRow: {
            style: {
                fontSize: "1rem",
                fontFamily: "var(--bs-font-sans-serif)"
            }
        },
        rows: {
            style: {
                backgroundColor: "white",
                "&:nth-child(2n)": {
                    backgroundColor: "#e8fbff",
                },
                border: "0px",
                fontFamily: "var(--bs-font-sans-serif)"
            },
        }
    },
    selectData: [
        {
            name: "View",
            value: "view"
        },
        {
            name: "Remove",
            value: "remove"
        },
        {
            name: "Edit",
            value: "edit"
        }
    ]
}


//App Context
export default function AppContext({ children }) {
    const [state, dispatch] = useReducer(reducer, initState)
    return (

        <StateContext.Provider value={state}>
            <ActionContext.Provider value={dispatch}>
                {children}
            </ActionContext.Provider>
        </StateContext.Provider>
    )
}

// this hook for sharing States context
export function useAppState() {
    return useContext(StateContext);
}

// this hook for sharing Actions context
export function useAppAction() {
    return useContext(ActionContext);
}
