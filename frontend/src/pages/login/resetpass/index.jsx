import { useEffect, useState } from "react";
import { LoginContainer } from "../components/LoginContainer";
import { APP_NAME } from "../../../assets/js/global";
import Logo from "../../../assets/logo.png";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { motion } from "motion/react";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function ResetPass() {
    const state = useAppState();
    const dispatch = useAppAction();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (!state.username) {
            navigate("/login");
            return;
        }
        // Automatically send OTP upon entering the verification step
        
        api({
            method: "post",
            url: "/sendVerCode",
            data: { username: state.username }
        }).then((res) => {
            
            dispatch({ type: "SET_SUCCESS", payload: res.data.message || "Verification code sent to your email." });
        }).catch(err => {
            
            dispatch({ type: "SET_ERROR", payload: err.response?.data?.message || "Failed to send code" });
        });
    }, [state.username]);

    function verifyOtp(e) {
        e.preventDefault();
        
        api({
            method: "post",
            url: "/validateCode",
            data: { username: state.username, code: otp }
        }).then((res) => {
            dispatch({ type: "SET_SUCCESS", payload: res.data.message });
            dispatch({ type: "SET_USER", payload: res.data.user });
            dispatch({ type: "SET_ROLE", payload: res.data.user.role.title });

            const token = res.data.token;
            localStorage.setItem("auth_token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            
            setStep(2); // Move to the change password step
        }).catch(err => {
            
            dispatch({ type: "SET_ERROR", payload: err.response?.data?.message || "Invalid Code" });
        });
    }

    function changePassword(e) {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            dispatch({ type: "SET_ERROR", payload: "Passwords do not match." });
            return;
        }
        
        api({
            method: "post",
            url: "/resetPassword",
            data: { password: newPassword }
        }).then(async (res) => {
            dispatch({ type: "SET_SUCCESS", payload: res.data.message || "Password changed successfully." });

            // At this point we are successfully authenticated and have changed password
            // We fetch the settings just like the login flow does
            const resSettings = await api({
                method: "get",
                url: "/settings",
            });
            dispatch({
                type: "SET_SETTINGS",
                payload: resSettings.data.data
            });

            
            navigate("/", { replace: true });
        }).catch(err => {
            
            dispatch({ type: "SET_ERROR", payload: err.response?.data?.message || "Failed to change password" });
        });
    }

    return (
        <LoginContainer>
            <>
                <div className="logo">
                    <img src={Logo} alt="" fetchPriority="high" />
                </div>
                <div className="title p-2 h2">
                    {step === 1 ? <Lang>Verify OTP</Lang> : <Lang>Change Password</Lang>}
                </div>
                {step === 1 ? (
                    <form onSubmit={verifyOtp} className="loginForm ps-4 pe-4" action="">
                        <div className="text-center p-2 text-muted">
                            <Lang>Enter the verification code sent to your email.</Lang>
                        </div>
                        <div className="otp ps-2 pe-2 pt-3 pb-2">
                            <motion.input
                                required
                                className="form-control form-control-lg"
                                type="text"
                                name="otp"
                                onChange={(e) => { setOtp(e.target.value) }}
                                placeholder={state.langData && state.langData["Verification Code"] ? state.langData["Verification Code"] : "Verification Code"}
                                whileFocus={{ scale: 1.05 }}
                            />
                        </div>
                        <div className="submitBtn p-2">
                            <ButtonBlue type="submit" label="Verify" />
                        </div>
                    </form>
                ) : (
                    <form onSubmit={changePassword} className="loginForm ps-4 pe-4" action="">
                        <div className="text-center p-2 text-muted">
                            <Lang>Please enter your new password.</Lang>
                        </div>
                        <div className="newPassword ps-2 pe-2 pt-3 pb-2">
                            <motion.input
                                required
                                className="form-control form-control-lg"
                                type="password"
                                name="newPassword"
                                onChange={(e) => { setNewPassword(e.target.value) }}
                                placeholder={state.langData && state.langData["New Password"] ? state.langData["New Password"] : "New Password"}
                                whileFocus={{ scale: 1.05 }}
                            />
                        </div>
                        <div className="confirmPassword ps-2 pe-2 pt-3 pb-2">
                            <motion.input
                                required
                                className="form-control form-control-lg"
                                type="password"
                                name="confirmPassword"
                                onChange={(e) => { setConfirmPassword(e.target.value) }}
                                placeholder={state.langData && state.langData["Confirm Password"] ? state.langData["Confirm Password"] : "Confirm Password"}
                                whileFocus={{ scale: 1.05 }}
                            />
                        </div>
                        <div className="submitBtn p-2">
                            <ButtonBlue type="submit" label="Change Password" />
                        </div>
                    </form>
                )}
            </>
        </LoginContainer>
    )
}
