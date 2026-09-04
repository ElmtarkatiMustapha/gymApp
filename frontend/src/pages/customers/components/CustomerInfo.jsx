import { Lang } from "../../../assets/js/lang"
import { ButtonBlue } from "../../../components/ButtonBlue"
import { Spinner } from "../../../components/Spinner"
import { useAppState } from "../../../context/context"

export function CustomerInfo({ handleClose, onNext, formData, setFormData, loading, }) {
    const appState = useAppState();
    const t = (key) => appState.langData[key] || key;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleFormSubmit} className="modal-content">
            <div className="modal-header d-flex justify-content-between text-primary-c">
                <div className="modal-title">
                    <div className="title h3 m-0"><Lang>Add Customer</Lang></div>
                    <div className="sub-title"><Lang>Personal informations</Lang></div>
                </div>
                <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
            </div>
            <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label h5"><Lang>Name</Lang>* : {loading && <Spinner />}</label>
                    <input type="text" value={formData.name || ""} onChange={handleChange} required disabled={loading} name="name" className="form-control" placeholder={t("Tap Name")} id="" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>email</Lang> : {loading && <Spinner />}</label>
                    <input type="email" value={formData.email || ""} onChange={handleChange} disabled={loading} name="email" className="form-control" placeholder={t("Tap email")} id="" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>CIN</Lang> : {loading && <Spinner />}</label>
                    <input type="text" value={formData.cin || ""} onChange={handleChange} disabled={loading} name="cin" className="form-control" placeholder={t("Tap CIN")} id="" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>Adresse</Lang> : {loading && <Spinner />}</label>
                    <input type="text" value={formData.adresse || ""} onChange={handleChange} disabled={loading} name="adresse" className="form-control" placeholder={t("Tap Adresse")} id="" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>Phone</Lang> : {loading && <Spinner />}</label>
                    <input type="text" value={formData.phone || ""} onChange={handleChange} disabled={loading} name="phone" className="form-control" placeholder={t("Tap Phone")} id="" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>Birthday</Lang> : {loading && <Spinner />}</label>
                    <input type="date" value={formData.birthday || ""} onChange={handleChange} disabled={loading} name="birthday" className="form-control" />
                </div>
                <div className="mb-3">
                    <label className="form-label h5"><Lang>Sexe</Lang>* : {loading && <Spinner />}</label>
                    <div>
                        <span className="p-1">
                            <input type="radio" checked={formData.sexe === "male"} onChange={handleChange} name="sexe" value="male" className="form-check-input" id="male" required />
                            <label className="form-check-label ps-1" htmlFor="male"><Lang>Male</Lang></label>
                        </span>
                        <span className="p-1">
                            <input type="radio" checked={formData.sexe === "female"} onChange={handleChange} name="sexe" value="female" className="form-check-input" id="female" required />
                            <label className="form-check-label ps-1" htmlFor="female"><Lang>Female</Lang></label>
                        </span>
                    </div>
                </div>
            </div>
            <div className="modal-footer d-flex justify-content-end">
                <ButtonBlue label={"Next"} disabled={loading} type={"submit"} />
            </div>
        </form>
    )
}
