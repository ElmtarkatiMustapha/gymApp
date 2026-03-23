import { useEffect, useState } from "react";
import { LoginContainer } from "./components/LoginContainer";
import { APP_NAME } from "../../assets/js/global";
import Logo from "../../assets/logo.png"
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAppAction, useAppState } from "../../context/context";
import { Lang } from "../../assets/js/lang";
import { motion } from "motion/react";
import { ButtonBlue } from "../../components/ButtonBlue";

export function LoginForm() {
    const state = useAppState();
    const dispatch = useAppAction();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        dispatch({ type: "SET_LOADING", payload: true })
        //login request
        api({
            method: "post",
            url: "/login",
            data: {
                username: userName,
                password: password
            },
            // withCredentials:true
        })
            .then(async (res) => {
                //set the state of login
                dispatch({ type: "SET_SUCCESS", payload: res.data.message });
                dispatch({ type: "SET_USER", payload: res.data.user });
                dispatch({ type: "SET_ROLE", payload: res.data.user.role.title });
                dispatch({ type: "SET_LOADING", payload: false })
                const token = res.data.token;
                localStorage.setItem("auth_token", token);
                // Set it in the default Axios headers
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const resSettings = await api({
                    method: "get",
                    url: "/settings",
                    // withCredentials:true
                })
                dispatch({
                    type: "SET_SETTINGS",
                    payload: resSettings.data.data
                })
                //redirect to the rigth page
                navigate("/", { replace: true });
            }).catch((err) => {
                dispatch({ type: "SET_LOADING", payload: false })
                dispatch({ type: "SET_ERROR", payload: err.response.data.message });
            })
    }
    function resetPasword(e) {
        e.preventDefault();
        if (!userName) {
            dispatch({ type: "SET_ERROR", payload: "Enter the UserName or Email" });
        } else {
            dispatch({ type: "SET_LOADING", payload: true })
            api({
                method: "post",
                url: "/validateUser",
                data: {
                    username: userName
                },
                // withCredentials:true
            }).then((res) => {
                dispatch({ type: "SET_LOADING", payload: false })
                dispatch({ type: "SET_USERNAME", payload: res.data.user[0].username })
                dispatch({ type: "SET_EMAIL", payload: res.data.user[0].email })
                navigate("/login/resetpass")
            }).catch((err) => {
                dispatch({ type: "SET_LOADING", payload: false })
                dispatch({ type: "SET_ERROR", payload: err.response.data.message });
            })
        }
    }
    useEffect(() => {
        if (state.currentUser) {
            navigate("/");
        }
    }, [])
    return (
        <LoginContainer>
            <>
                <div className="logo">
                    <img src={Logo} alt="" fetchPriority="high" />
                </div>
                <div className="title p-2 h2">
                    <Lang>Welcome to</Lang> {APP_NAME}
                </div>
                <form onSubmit={handleSubmit} className="loginForm  ps-4 pe-4 " action="" >
                    <div className="userName ps-2 pe-2 pt-3 pb-2">
                        <motion.input
                            required
                            className="form-control form-control-lg"
                            type="text"
                            name="userName"
                            onChange={(e) => { setUserName(e.target.value) }}
                            // placeholder={Lang({ children: "UserName or E-mail Adresse" })}
                            placeholder={state.langData["UserName or E-mail Adresse"]}
                            whileFocus={{ scale: 1.05 }}

                        />
                    </div>
                    <div className="password ps-2 pe-2 pt-3 pb-2">
                        <motion.input
                            required
                            className="form-control form-control-lg"
                            type="password"
                            name="password"
                            onChange={(e) => { setPassword(e.target.value) }}
                            // placeholder={Lang({ children: "Password" })}
                            placeholder={state.langData["Password"]}
                            whileFocus={{ scale: 1.05 }}
                        />
                    </div>
                    <div className="passForgot text-end pe-2">
                        <span className="text-primary" style={{cursor: 'pointer'}} onClick={resetPasword}>
                            <Lang>I Forgot password</Lang>
                        </span>
                    </div>
                    <div className="submitBtn p-2">
                        <ButtonBlue type="submit" label="Connect" />
                    </div>
                </form>
            </>
        </LoginContainer>
    )
} 