import { useState, useEffect } from "react";
import { useAppState, useAppAction } from "../../context/context";
import api, { getImageURL } from "../../api/api";
import { Lang } from "../../assets/js/lang";
import { CustomLoader } from "../../components/CustomLoader";
import { FiEdit } from "react-icons/fi";
import "../../assets/css/settings.css";
import { BusinessModal } from "./components/BusinessModal";
import { EmailSettingsModal } from "./components/EmailSettingsModal";
import { AlertSettingsModal } from "./components/AlertSettingsModal";
import { EmailMessagesModal } from "./components/EmailMessagesModal";
import { InvoiceModal } from "./components/InvoiceModal";
import { InsuranceModal } from "./components/InsuranceModal";

export function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showBusinessModal, setShowBusinessModal] = useState(false);
    const [showEmailSettingsModal, setShowEmailSettingsModal] = useState(false);
    const [showAlertSettingsModal, setShowAlertSettingsModal] = useState(false);
    const [showEmailMessagesModal, setShowEmailMessagesModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showInsuranceModal, setShowInsuranceModal] = useState(false);

    const appState = useAppState();
    const appAction = useAppAction();

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings');
            if (response.data && response.data.data) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            appAction({ type: "SET_ERROR", payload: "Failed to load settings" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading && !settings) {
        return <div className="container-fluid page"><CustomLoader /></div>;
    }

    return (
        <div className="container-fluid page pb-5">
            <div className="row header-page p-0 m-2">
                <div className="col-12 p-0">
                    <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Settings</Lang></div>
                </div>
            </div>

            <div className="row m-0 p-2">
                {/* Business Infos */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold"><Lang>Business Infos</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowBusinessModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-2"><span className="settings-label"><Lang>Name</Lang>:</span> <span className="settings-value">{settings?.businessInfo?.name}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>City</Lang>:</span> <span className="settings-value">{settings?.businessInfo?.city}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Adresse</Lang>:</span> <span className="settings-value">{settings?.businessInfo?.adresse}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Phone</Lang>:</span> <span className="settings-value">{settings?.businessInfo?.phone}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Email</Lang>:</span> <span className="settings-value">{settings?.businessInfo?.email}</span></div>
                            <div className="mt-3">
                                <span className="settings-label"><Lang>Logo</Lang>:</span>
                                <div className="mt-2 text-center">
                                    <img src={getImageURL(settings?.businessInfo?.logo || "logo.png")} alt="Logo" style={{ maxHeight: "60px", maxWidth: "100%" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold"><Lang>Email Settings</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowEmailSettingsModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-2"><span className="settings-label"><Lang>Username</Lang>:</span> <span className="settings-value">{settings?.emailSettings?.username}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Password</Lang>:</span> <span className="settings-value">********</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>SMTP Server</Lang>:</span> <span className="settings-value">{settings?.emailSettings?.host}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Port</Lang>:</span> <span className="settings-value">{settings?.emailSettings?.port}</span></div>
                        </div>
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold"><Lang>Alert Settings</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowAlertSettingsModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-2"><span className="settings-label"><Lang>Auto Notification</Lang>:</span> <span className={`settings-value fw-bold ${settings?.alertSettings?.autoNotice ? 'text-success' : 'text-danger'}`}>{settings?.alertSettings?.autoNotice ? <Lang>Active</Lang> : <Lang>Disabled</Lang>}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Days before expiration</Lang>:</span> <span className="settings-value">{settings?.alertSettings?.days_before_expiration}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Pre-expire Alert Times</Lang>:</span> <span className="settings-value">{settings?.alertSettings?.pre_expire_times}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Expired alert times</Lang>:</span> <span className="settings-value">{settings?.alertSettings?.expire_times}</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Periode between alert (days)</Lang>:</span> <span className="settings-value">{settings?.alertSettings?.days_between_alerts}</span></div>
                        </div>
                    </div>
                </div>

                {/* Insurance Settings */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold"><Lang>Insurance Information</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowInsuranceModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-2"><span className="settings-label"><Lang>Insurance Amount</Lang>:</span> <span className="settings-value">{settings?.insurance?.price} DH</span></div>
                            <div className="mb-2"><span className="settings-label"><Lang>Insurance Period</Lang>:</span> <span className="settings-value">{settings?.insurance?.periode} <Lang>Months</Lang></span></div>
                        </div>
                    </div>
                </div>
                {/* </div> */}

                {/* <div className="row m-0 p-2"> */}
                {/* Email Messages */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold"><Lang>Email Messages</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowEmailMessagesModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Welcome message</Lang>:</label>
                                <div className="message-template-box">{settings?.messageTemplate?.welcome}</div>
                            </div>
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Success Payment message</Lang>:</label>
                                <div className="message-template-box">{settings?.messageTemplate?.successPayment}</div>
                            </div>
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Pre-expiration message</Lang>:</label>
                                <div className="message-template-box">{settings?.messageTemplate?.preExpiration}</div>
                            </div>
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Expiration message</Lang>:</label>
                                <div className="message-template-box">{settings?.messageTemplate?.expiration}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Settings */}
                <div className="col-12 col-md-4 p-2">
                    <div className="settings-card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-end">
                            <h5 className="mb-0 fw-bold"><Lang>Invoice</Lang></h5>
                            <FiEdit className="edit-btn" onClick={() => setShowInvoiceModal(true)} />
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Header</Lang>:</label>
                                <div className="message-template-box">{settings?.invoiceSettings?.header}</div>
                            </div>
                            <div className="mb-3">
                                <label className="settings-label small text-muted"><Lang>Footer</Lang>:</label>
                                <div className="message-template-box">{settings?.invoiceSettings?.footer}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showBusinessModal && <BusinessModal data={settings.businessInfo} onClose={() => setShowBusinessModal(false)} onUpdate={fetchSettings} />}
            {showEmailSettingsModal && <EmailSettingsModal data={settings.emailSettings} onClose={() => setShowEmailSettingsModal(false)} onUpdate={fetchSettings} />}
            {showAlertSettingsModal && <AlertSettingsModal data={settings.alertSettings} onClose={() => setShowAlertSettingsModal(false)} onUpdate={fetchSettings} />}
            {showEmailMessagesModal && <EmailMessagesModal data={settings.messageTemplate} onClose={() => setShowEmailMessagesModal(false)} onUpdate={fetchSettings} />}
            {showInvoiceModal && <InvoiceModal data={settings.invoiceSettings} onClose={() => setShowInvoiceModal(false)} onUpdate={fetchSettings} />}
            {showInsuranceModal && <InsuranceModal data={settings.insurance} onClose={() => setShowInsuranceModal(false)} onUpdate={fetchSettings} />}
        </div>
    );
}
