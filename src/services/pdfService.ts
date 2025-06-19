import { jsPDF } from "jspdf";

export interface BookingDetails {
  name: string;
  phone: string;
  email: string;
  slotTime: string;
  bookingDate: string;
  [key: string]: string; // for any extra fields
}

export function generateBookingPDF(details: BookingDetails) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("SkyJumper Booking Confirmation", 20, 20);

  doc.setFontSize(12);
  let y = 40;
  Object.entries(details).forEach(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    doc.text(`${label}: ${value}`, 20, y);
    y += 10;
  });

  doc.save(`BookingConfirmation_${details.name}.pdf`);
} 