/* ──────────────────────────────────────────────
   Delhi RoadWatch — Notification Service
   ────────────────────────────────────────────── */

import {
    lookupVehicle,
    createNotification,
    createViolation,
    updateCaseStatus,
    updateReportStatus,
    STATUS,
} from '../data/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKey } from '../lib/config';

async function generatePersonalizedMessage(ownerName, numberPlate, crimeType, reportId) {
    const key = getGeminiKey();
    if (!key) {
        return `A traffic violation involving your vehicle (${numberPlate}) has been verified by Delhi RoadWatch AI and Traffic Authorities. Case ID: ${reportId}. Please check the portal for evidence and further action.`;
    }
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Generate a very professional, official, and authoritative traffic violation notice for a vehicle owner in New Delhi.
Direct it to: ${ownerName}
Vehicle: ${numberPlate}
Violation: ${crimeType}
Case ID: ${reportId}

Tone: Serious, formal, but not aggressive. Mention that it has been verified by Delhi RoadWatch AI and Traffic Authorities.
Include a call to action to check the portal for evidence.
Max 50 words.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.error("Gemini Notification Error:", err);
        return `A traffic violation involving your vehicle (${numberPlate}) has been verified. Case ID: ${reportId}. Please check the RoadWatch portal for details.`;
    }
}

export async function notifyOwner(reportId, numberPlate, crimeType) {
    const vehicle = await lookupVehicle(numberPlate);

    const ownerName   = vehicle?.owner_name    || 'Vehicle Owner';
    const phoneNumber = vehicle?.phone_number  || 'Unknown';

    const message = await generatePersonalizedMessage(ownerName, numberPlate, crimeType, reportId);

    const notification = await createNotification({
        report_id:      reportId,
        target_user_id: phoneNumber,
        owner_name:     ownerName,
        phone_number:   phoneNumber,
        number_plate:   numberPlate,
        message,
    });

    await createViolation({
        report_id:      reportId,
        violator_phone: phoneNumber,
        violator_name:  ownerName,
        number_plate:   numberPlate,
        crime_type:     crimeType || 'Traffic Violation',
        status:         'Pending',
        message,
    });

    await updateCaseStatus(reportId, { notification_sent: true });
    await updateReportStatus(reportId, STATUS.OWNER_NOTIFIED);

    return notification;
}
