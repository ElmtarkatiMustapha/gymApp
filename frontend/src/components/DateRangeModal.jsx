import { Lang } from "../assets/js/lang";
import { ButtonBlue } from "./ButtonBlue";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
export function DateRangeModal({ state, handleChange, handleSubmit, handleClose }) {
    return (
        <div className="editModal modal z-3 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down  modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h3 m-0"><Lang>Chose Range Date</Lang> :</div>
                            {/* <div className="sub-title"><Lang>Fill in the fields</Lang> :</div> */}
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" data-bs-dismiss="modal"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body text-center">
                        <DateRange
                            moveRangeOnFirstSelection={false}
                            editableDateInputs={true}
                            ranges={state}
                            dateDisplayFormat={"dd-MM-Y"}
                            onChange={handleChange} />

                    </div>
                    <div className="modal-footer">
                        <ButtonBlue label={"Save"} handleClick={handleSubmit} type={"submit"} />
                    </div>
                </form>
            </div>
        </div>

    )
}
