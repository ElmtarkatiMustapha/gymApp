import { format, isValid } from "date-fns";
import { getImageURL } from "../api/api";

function safeFormatDate(value, fallback = "-") {
    if (!value || (typeof value === "string" && value.trim() === "")) {
        return fallback;
    }
    const date = new Date(value);
    return isValid(date) ? format(date, "dd/MM/yyyy") : fallback;
}

export function printCustomerFile({
    customerData,
    subscriptionsHistory,
    insurancesHistory,
    settings,
    langData,
    currentLang,
}) {
    if (!customerData) return;

    const business = settings?.businessInfo || {};
    const logoUrl = business.logo ? getImageURL(business.logo) : "";
    const now = new Date();

    // Determine subscriptions to show
    const sortedSubs = [...(subscriptionsHistory || [])].sort(
        (a, b) => new Date(b.start_at) - new Date(a.start_at)
    );
    const activeOrUpcomingSubs = sortedSubs.filter((sub) => {
        const start = new Date(sub.start_at);
        const expire = new Date(sub.expire_at);
        const isExpired = expire < now;
        const isUpcoming = start > now;
        return !isExpired || isUpcoming;
    });
    const subsToShow =
        activeOrUpcomingSubs.length > 0
            ? activeOrUpcomingSubs
            : sortedSubs.length > 0
                ? [sortedSubs[0]]
                : [];
    const subsSectionTitle =
        activeOrUpcomingSubs.length > 0
            ? langData["Subscriptions"] || "Subscriptions"
            : langData["Last Subscription"] || "Last Subscription";

    const subsRows = subsToShow
        .map((sub) => {
            const start = new Date(sub.start_at);
            const expire = new Date(sub.expire_at);
            let state = "Active";
            let badgeClass = "badge-success";
            if (start > now) {
                state = "Upcoming";
                badgeClass = "badge-warning";
            } else if (expire < now) {
                state = "Expired";
                badgeClass = "badge-danger";
            } else if (
                Math.ceil((expire - now) / (1000 * 60 * 60 * 24)) <= 7
            ) {
                state = "Pre-expire";
                badgeClass = "badge-warning";
            }
            const startStr = safeFormatDate(sub.start_at);
            const expireStr = safeFormatDate(sub.expire_at);
            return `
                <tr>
                    <td>${sub.plan?.title || sub.plan?.description || "N/A"}</td>
                    <td>${sub.duration || 0} ${langData["Month"] || "Month"}</td>
                    <td>${sub.price || 0} DH</td>
                    <td>${Number(sub.paid_amount || 0).toFixed(2)} DH</td>
                    <td>${Number(sub.remaining_amount || 0).toFixed(2)} DH</td>
                    <td>${startStr}</td>
                    <td>${expireStr}</td>
                    <td><span class="badge ${badgeClass}">${state}</span></td>
                </tr>
            `;
        })
        .join("");

    // Determine insurances to show
    const sortedIns = [...(insurancesHistory || [])].sort(
        (a, b) => new Date(b.start_at) - new Date(a.start_at)
    );
    const insRows = sortedIns
        .map((ins) => {
            const expire = new Date(ins.expire_at);
            const isActive = expire > now;
            const startStr = safeFormatDate(ins.start_at);
            const expireStr = safeFormatDate(ins.expire_at);
            return `
                <tr>
                    <td>${ins.price || 0} DH</td>
                    <td>${ins.periode || ins.peride || 12} ${langData["Month"] || "Month"}</td>
                    <td>${startStr}</td>
                    <td>${expireStr}</td>
                    <td><span class="badge ${isActive ? "badge-success" : "badge-danger"}">${isActive ? langData["Active"] || "Active" : langData["Expired"] || "Expired"}</span></td>
                </tr>
            `;
        })
        .join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="${currentLang?.replace(".json", "") || "fr"}">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
            line-height: 1.4;
        }
        .page {
            max-width: 210mm;
            margin: 0 auto;
            padding: 5mm;
        }
        .gym-header {
            display: flex;
            align-items: center;
            gap: 15px;
            border-bottom: 2px solid #0E456B;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .gym-header img {
            max-height: 50px;
            max-width: 80px;
            object-fit: contain;
        }
        .gym-header .gym-info h2 {
            margin: 0;
            color: #0E456B;
            font-size: 18px;
        }
        .gym-header .gym-info p {
            margin: 1px 0 0 0;
            color: #555;
            font-size: 11px;
        }
        .section {
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        .section-title {
            background: #0E456B;
            color: white;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 13px;
        }
        .customer-grid {
            display: flex;
            flex-wrap: wrap;
            padding: 8px 10px;
            gap: 4px 0;
        }
        .customer-grid .info-cell {
            width: 50%;
            display: flex;
            gap: 6px;
            padding: 3px 0;
        }
        .customer-grid .info-label {
            font-weight: 600;
            color: #0E456B;
            white-space: nowrap;
        }
        .customer-grid .info-value {
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        th, td {
            padding: 6px 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f4f7f9;
            color: #0E456B;
            font-weight: 600;
        }
        tr:last-child td { border-bottom: none; }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .no-data { color: #888; font-style: italic; text-align: center; padding: 10px; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="gym-header">
            ${logoUrl ? `<img id="gym-logo" src="${logoUrl}" alt="Logo" onerror="this.style.display='none'" />` : ""}
            <div class="gym-info">
                <h2>${business.name || "GYM"}</h2>
                <p>${[business.adresse, business.city].filter(Boolean).join(", ") || ""}${business.phone ? " &nbsp;&bull;&nbsp; Tel: " + business.phone : ""}${business.email ? " &nbsp;&bull;&nbsp; Email: " + business.email : ""}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">${langData["Customer Information"] || "Customer Information"}</div>
            <div class="customer-grid">
                <div class="info-cell"><span class="info-label">ID:</span> <span class="info-value">#${customerData.id}</span></div>
                <div class="info-cell"><span class="info-label">${langData["Name"] || "Name"}:</span> <span class="info-value">${customerData.name}</span></div>
                <div class="info-cell"><span class="info-label">${langData["CIN"] || "CIN"}:</span> <span class="info-value">${customerData.cin || "N/A"}</span></div>
                <div class="info-cell"><span class="info-label">${langData["Phone"] || "Phone"}:</span> <span class="info-value">${customerData.phone || "N/A"}</span></div>
                <div class="info-cell"><span class="info-label">${langData["Email"] || "Email"}:</span> <span class="info-value">${customerData.email || "N/A"}</span></div>
                <div class="info-cell"><span class="info-label">${langData["Sexe"] || "Sexe"}:</span> <span class="info-value">${customerData.sexe || "N/A"}</span></div>
                <div class="info-cell"><span class="info-label">${langData["Birthday"] || "Birthday"}:</span> <span class="info-value">${safeFormatDate(customerData.birthday, "N/A")}</span></div>
                <div class="info-cell"><span class="info-label">${langData["State"] || "State"}:</span> <span class="info-value"><span class="badge ${customerData.state === "Active" ? "badge-success" : "badge-danger"}">${customerData.state}</span></span></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">${subsSectionTitle}</div>
            ${subsToShow.length
            ? `
            <table>
                <thead>
                    <tr>
                        <th>${langData["Plan"] || "Plan"}</th>
                        <th>${langData["Duration"] || "Duration"}</th>
                        <th>${langData["Price"] || "Price"}</th>
                        <th>${langData["Paid"] || "Paid"}</th>
                        <th>${langData["Remaining"] || "Remaining"}</th>
                        <th>${langData["Start At"] || "Start At"}</th>
                        <th>${langData["Expire At"] || "Expire At"}</th>
                        <th>${langData["Status"] || "Status"}</th>
                    </tr>
                </thead>
                <tbody>${subsRows}</tbody>
            </table>
            `
            : `<div class="no-data">${langData["No subscriptions found"] || "No subscriptions found"}</div>`}
        </div>

        <div class="section">
            <div class="section-title">${langData["Insurances"] || "Insurances"}</div>
            ${sortedIns.length
            ? `
            <table>
                <thead>
                    <tr>
                        <th>${langData["Price"] || "Price"}</th>
                        <th>${langData["Duration"] || "Duration"}</th>
                        <th>${langData["Start at"] || "Start at"}</th>
                        <th>${langData["Expire at"] || "Expire at"}</th>
                        <th>${langData["Status"] || "Status"}</th>
                    </tr>
                </thead>
                <tbody>${insRows}</tbody>
            </table>
            `
            : `<div class="no-data">${langData["No insurances found"] || "No insurances found"}</div>`}
        </div>
    </div>
</body>
</html>`;

    // Re-use a single hidden iframe so we don't leak DOM nodes
    let iframe = document.getElementById("print-iframe");
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.position = "fixed";
        iframe.style.top = "-10000px";
        iframe.style.left = "-10000px";
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
    }

    iframe.srcdoc = htmlContent;

    let printed = false;
    let fallbackTimer = null;

    const triggerPrint = () => {
        if (printed) return;
        printed = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);

        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch {
            // Fallback for very strict environments
            window.print();
        }
    };

    iframe.onload = () => {
        const doc = iframe.contentWindow.document;
        const logoImg = doc.getElementById("gym-logo");

        if (!logoImg) {
            setTimeout(triggerPrint, 200);
            return;
        }

        if (logoImg.complete) {
            setTimeout(triggerPrint, 200);
        } else {
            logoImg.onload = () => {
                if (fallbackTimer) clearTimeout(fallbackTimer);
                setTimeout(triggerPrint, 200);
            };
            logoImg.onerror = () => {
                if (fallbackTimer) clearTimeout(fallbackTimer);
                setTimeout(triggerPrint, 200);
            };
            fallbackTimer = setTimeout(() => {
                triggerPrint();
            }, 3000);
        }
    };
}
