import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loginApi } from "../../api/api";
import { useAppAction, useAppState } from "../../context/context";
import {
    FiUser, FiMail, FiLock, FiTrello, FiPhone, FiMapPin,
    FiCheckCircle, FiChevronRight, FiChevronLeft, FiSettings,
    FiBell, FiMessageSquare, FiFileText, FiShield
} from "react-icons/fi";

const InstallPage = () => {
    const dispatch = useAppAction();
    const { langData } = useAppState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);

    const t = (key) => langData[key] || key;

    const [formData, setFormData] = useState({
        // Admin
        name: "", email: "", username: "", password: "",
        // Business
        businessInfo: { name: "", city: "", adresse: "", phone: "", email: "" },
        // Email Settings
        emailSettings: { host: "", port: "", username: "", password: "" },
        // Alert Settings
        alertSettings: { autoNotice: true, days_before_expiration: 7, pre_expire_times: 2, expire_times: 2, days_between_alerts: 2 },
        // Message Templates
        messageTemplate: { successPayment: "", welcome: "", preExpiration: "", expiration: "" },
        // Invoice
        invoiceSettings: { header: "", footer: "" },
        // Insurance
        insurance: { price: 0, periode: 12 }
    });

    const steps = [
        { id: 1, title: t("Admin Account"), icon: <FiUser /> },
        { id: 2, title: t("Business Infos"), icon: <FiTrello /> },
        { id: 3, title: t("Email Server"), icon: <FiMail /> },
        { id: 4, title: t("Alerts & Msgs"), icon: <FiBell /> },
        { id: 5, title: t("Invoice & Ins."), icon: <FiFileText /> }
    ];

    const handleBaseChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (category, field, value) => {
        setFormData({
            ...formData,
            [category]: { ...formData[category], [field]: value }
        });
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.name || !formData.email || !formData.username || !formData.password) {
                dispatch({ type: "SET_ERROR", payload: t("Please fill all Admin Account fields correctly.") });
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.businessInfo.name) {
                dispatch({ type: "SET_ERROR", payload: t("Gym / Business Name is required.") });
                return false;
            }
        }
        if (currentStep === 3) {
            // Email server is optional, but if they enter some, maybe they should enter host
            // I'll keep it optional to avoid blocking users without SMTP
        }
        if (currentStep === 4) {
            if (formData.alertSettings.days_before_expiration < 1) {
                dispatch({ type: "SET_ERROR", payload: t("Alert Days must be at least 1.") });
                return false;
            }
        }
        // Step 5 is also mostly optional
        return true;
    };

    const nextStep = () => {
        dispatch({ type: "SET_ERROR", payload: "" });
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        dispatch({ type: "SET_ERROR", payload: "" });
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: "SET_ERROR", payload: "" });
        if (!validateStep()) return;
        setLoading(true);
        try {
            const payload = {
                ...formData,
                businessInfo: { ...formData.businessInfo, name: formData.businessInfo.name || "Gym Name" },
                // Map main fields for validation rules in backend
                name: formData.name,
                email: formData.email,
                username: formData.username,
                password: formData.password,
            };

            const res = await loginApi.post("/install", payload);
            if (res.data.data.installed) {
                dispatch({ type: "TOGGLE_INSTALLED", payload: true });
            }
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err?.response?.data?.message || err.message || "An error occurred during installation." });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        background: "#ffffff",
        border: "1px solid #ced4da",
        borderRadius: "12px",
        color: "#5C5C68",
        padding: "12px 12px 12px 45px",
        width: "100%",
        transition: "all 0.3s ease",
        outline: "none"
    };

    const textAreaStyle = { ...inputStyle, padding: "12px", minHeight: "80px" };

    const iconStyle = {
        position: "absolute", left: "15px", top: "50%",
        transform: "translateY(-50%)", color: "#027CC5", fontSize: "1.2rem",
    };

    // --- Step Renderers ---
    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="row g-4">
            <div className="col-md-6"><div style={{ position: "relative" }}><FiUser style={iconStyle} />
                <input type="text" name="name" placeholder={t("Full Name")} required style={inputStyle} value={formData.name} onChange={handleBaseChange} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiMail style={iconStyle} />
                <input type="email" name="email" placeholder={t("Admin Email")} required style={inputStyle} value={formData.email} onChange={handleBaseChange} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiUser style={iconStyle} />
                <input type="text" name="username" placeholder={t("Username")} required style={inputStyle} value={formData.username} onChange={handleBaseChange} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiLock style={iconStyle} />
                <input type="password" name="password" placeholder={t("Password")} required style={inputStyle} value={formData.password} onChange={handleBaseChange} /></div></div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="row g-4">
            <div className="col-12"><div style={{ position: "relative" }}><FiTrello style={iconStyle} />
                <input type="text" placeholder={t("Gym / Business Name")} required style={inputStyle} value={formData.businessInfo.name} onChange={(e) => handleNestedChange('businessInfo', 'name', e.target.value)} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiPhone style={iconStyle} />
                <input type="text" placeholder={t("Phone")} style={inputStyle} value={formData.businessInfo.phone} onChange={(e) => handleNestedChange('businessInfo', 'phone', e.target.value)} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiMapPin style={iconStyle} />
                <input type="text" placeholder={t("City")} style={inputStyle} value={formData.businessInfo.city} onChange={(e) => handleNestedChange('businessInfo', 'city', e.target.value)} /></div></div>
            <div className="col-12"><div style={{ position: "relative" }}><FiMapPin style={iconStyle} />
                <input type="text" placeholder={t("Address")} style={inputStyle} value={formData.businessInfo.adresse} onChange={(e) => handleNestedChange('businessInfo', 'adresse', e.target.value)} /></div></div>
            <div className="col-12"><div style={{ position: "relative" }}><FiMail style={iconStyle} />
                <input type="email" placeholder={t("Email")} style={inputStyle} value={formData.businessInfo.email} onChange={(e) => handleNestedChange('businessInfo', 'email', e.target.value)} /></div></div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="row g-4">
            <div className="col-12"><p style={{ color: "#5C5C68", fontSize: "0.9rem" }}>{t("Configure SMTP for sending notifications to customers.")}</p></div>
            <div className="col-md-8"><div style={{ position: "relative" }}><FiSettings style={iconStyle} />
                <input type="text" placeholder={t("SMTP Host")} style={inputStyle} value={formData.emailSettings.host} onChange={(e) => handleNestedChange('emailSettings', 'host', e.target.value)} /></div></div>
            <div className="col-md-4"><div style={{ position: "relative" }}><FiSettings style={iconStyle} />
                <input type="number" placeholder={t("Port")} style={inputStyle} value={formData.emailSettings.port} onChange={(e) => handleNestedChange('emailSettings', 'port', e.target.value)} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiUser style={iconStyle} />
                <input type="text" placeholder={t("SMTP Username")} style={inputStyle} value={formData.emailSettings.username} onChange={(e) => handleNestedChange('emailSettings', 'username', e.target.value)} /></div></div>
            <div className="col-md-6"><div style={{ position: "relative" }}><FiLock style={iconStyle} />
                <input type="password" placeholder={t("SMTP Password")} style={inputStyle} value={formData.emailSettings.password} onChange={(e) => handleNestedChange('emailSettings', 'password', e.target.value)} /></div></div>
        </motion.div>
    );

    const renderStep4 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="row g-4">
            <div className="col-md-6 d-flex align-items-center">
                <div className="form-check form-switch ms-2">
                    <input className="form-check-input" type="checkbox" id="autoNotice" checked={formData.alertSettings.autoNotice} onChange={(e) => handleNestedChange('alertSettings', 'autoNotice', e.target.checked)} style={{ cursor: "pointer" }} />
                    <label className="form-check-label ms-2" htmlFor="autoNotice" style={{ color: "#5C5C68", cursor: "pointer", fontWeight: "500" }}>{t("Auto Notification")}</label>
                </div>
            </div>
            <div className="col-md-6"><div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "15px", top: "12px", color: "#5C5C68", fontSize: "0.8rem", fontWeight: "500" }}>{t("Days before expiration")}</span>
                <input type="number" style={{ ...inputStyle, paddingTop: "30px", paddingLeft: "15px" }} value={formData.alertSettings.days_before_expiration} onChange={(e) => handleNestedChange('alertSettings', 'days_before_expiration', e.target.value)} /></div></div>
            <div className="col-12"><hr style={{ borderColor: "#ced4da" }} /></div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Welcome message")}</label>
                <textarea style={textAreaStyle} placeholder={t("Variables: {plan_name}, {expiry_date}")} value={formData.messageTemplate.welcome} onChange={(e) => handleNestedChange('messageTemplate', 'welcome', e.target.value)} />
            </div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Welcome message")}</label>
                <textarea style={textAreaStyle} placeholder={t("Variables: {plan_name}, {expiry_date}")} value={formData.messageTemplate.successPayment} onChange={(e) => handleNestedChange('messageTemplate', 'successPayment', e.target.value)} />
            </div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Pre-expiration message")}</label>
                <textarea style={textAreaStyle} placeholder={t("Variables: {plan_name}, {expiry_date}")} value={formData.messageTemplate.preExpiration} onChange={(e) => handleNestedChange('messageTemplate', 'preExpiration', e.target.value)} />
            </div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Expiration message")}</label>
                <textarea style={textAreaStyle} placeholder={t("Variables: {plan_name}, {expiry_date}")} value={formData.messageTemplate.expiration} onChange={(e) => handleNestedChange('messageTemplate', 'expiration', e.target.value)} />
            </div>
        </motion.div>
    );

    const renderStep5 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="row g-4">
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Header")}</label>
                <textarea style={textAreaStyle} placeholder={`${t("Gym Name")}\n${t("Address")}\n${t("Phone")}`} value={formData.invoiceSettings.header} onChange={(e) => handleNestedChange('invoiceSettings', 'header', e.target.value)} />
            </div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Footer")}</label>
                <textarea style={textAreaStyle} placeholder={t("Thank you for your business!")} value={formData.invoiceSettings.footer} onChange={(e) => handleNestedChange('invoiceSettings', 'footer', e.target.value)} />
            </div>
            <div className="col-12"><hr style={{ borderColor: "#ced4da" }} /></div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Insurance Price")}</label>
                <input type="number" style={{ ...inputStyle, paddingLeft: "15px" }} value={formData.insurance.price} onChange={(e) => handleNestedChange('insurance', 'price', e.target.value)} />
            </div>
            <div className="col-md-6">
                <label style={{ color: "#027CC5", fontSize: "0.9rem", marginBottom: "5px", fontWeight: "600" }}>{t("Periode")}</label>
                <input type="number" style={{ ...inputStyle, paddingLeft: "15px" }} value={formData.insurance.periode} onChange={(e) => handleNestedChange('insurance', 'periode', e.target.value)} />
            </div>
        </motion.div>
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#EDECF2", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", color: "#5C5C68", fontFamily: "'Inter', sans-serif" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                style={{ backgroundColor: "white", borderRadius: "35px", padding: "40px", width: "100%", maxWidth: "800px", boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.08)", overflow: "hidden" }} >

                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px", color: "#333" }}>
                        {t("Gym Setup Wizard")}
                    </h1>
                    <p style={{ color: "#5C5C68", fontSize: "1rem" }}>{t("Configure your application settings")}</p>
                </div>

                {/* Stepper Header */}
                <div className="d-flex justify-content-between mb-5 position-relative" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <div style={{ position: "absolute", top: "15px", left: "0", right: "0", height: "2px", background: "#e9ecef", zIndex: 0 }}>
                        <motion.div style={{ height: "100%", background: "#027CC5" }} initial={{ width: "0%" }} animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>
                    {steps.map((step) => (
                        <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <motion.div animate={{ background: currentStep >= step.id ? "#027CC5" : "white", borderColor: currentStep >= step.id ? "#027CC5" : "#e9ecef" }}
                                style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", color: currentStep >= step.id ? "white" : "#5C5C68", marginBottom: "8px", transition: "all 0.3s", backgroundColor: "white" }}>
                                {step.id < currentStep ? <FiCheckCircle /> : step.id}
                            </motion.div>
                            <span style={{ fontSize: "0.75rem", color: currentStep >= step.id ? "#027CC5" : "#5C5C68", fontWeight: currentStep === step.id ? "600" : "500" }}>{step.title}</span>
                        </div>
                    ))}
                </div>

                <form>
                    <div style={{ minHeight: "320px" }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                {currentStep === 1 && renderStep1()}
                                {currentStep === 2 && renderStep2()}
                                {currentStep === 3 && renderStep3()}
                                {currentStep === 4 && renderStep4()}
                                {currentStep === 5 && renderStep5()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#dc3545", marginTop: "20px", textAlign: "center", padding: "10px", background: "rgba(220, 53, 69, 0.1)", borderRadius: "8px", border: "1px solid rgba(220, 53, 69, 0.2)", fontWeight: "500" }}>
                            {error}
                        </motion.div>
                    )}

                    <div className="d-flex justify-content-between mt-4 pt-4" style={{ borderTop: "1px solid #e9ecef" }}>
                        <button type="button" onClick={prevStep} disabled={currentStep === 1}
                            style={{ padding: "10px 24px", borderRadius: "12px", background: "transparent", border: "1px solid #ced4da", color: currentStep === 1 ? "#adb5bd" : "#5C5C68", cursor: currentStep === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", fontWeight: "500" }}>
                            <FiChevronLeft /> {t("Back")}
                        </button>

                        {currentStep < steps.length ? (
                            <button type="button" onClick={nextStep}
                                style={{ padding: "10px 24px", borderRadius: "12px", background: "#027CC5", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(2, 124, 197, 0.2)", fontWeight: "500" }}>
                                {t("Next")} <FiChevronRight />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading}
                                style={{ padding: "10px 24px", borderRadius: "12px", background: "#198754", border: "none", color: "white", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(25, 135, 84, 0.2)", fontWeight: "600" }}>
                                {loading ? t("Saving...") : <><FiCheckCircle /> {t("Complete Setup")}</>}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InstallPage;

