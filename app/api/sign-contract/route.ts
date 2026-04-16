import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { uploadContractPdf } from "@/lib/google-drive";
import { sendContractSignedNotification, notifyStepComplete } from "@/lib/email";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Allow up to 30s for PDF generation + Drive upload
export const maxDuration = 30;

function generatePaymentSection(client: Record<string, unknown>): string {
  const currency = (client.currency as string) || "€";
  const isPaidInFull = !client.month2_amount && !client.month3_amount && client.deposit_amount;

  if (isPaidInFull) {
    return `PAID IN FULL\nTotal amount: ${currency}${client.deposit_amount} — paid in full prior to or at time of signing.\nNo further payments are due for the duration of this agreement.`;
  }

  const dueDate = (client.payment_due_date as string)?.toString() || "TBD";
  const lines = [
    client.deposit_amount ? `Deposit: ${currency}${client.deposit_amount} — Due at signing` : "",
    client.month1_remainder ? `Month 1 Remainder: ${currency}${client.month1_remainder} — Due ${dueDate} of Month 1` : "",
    client.month2_amount ? `Month 2: ${currency}${client.month2_amount} — Due ${dueDate} of Month 2` : "",
    client.month3_amount ? `Month 3: ${currency}${client.month3_amount} — Due ${dueDate} of Month 3` : "",
  ].filter(Boolean).join("\n");

  return lines + "\n\nNote: Late payments may result in the campaign being paused until the outstanding balance is cleared.";
}

// Strip HTML tags for plain-text PDF rendering
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Replace non-ASCII characters that pdf-lib StandardFonts can't render
function sanitizeForPdf(text: string): string {
  return text
    .replace(/[—–]/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/…/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[^\x00-\xFF]/g, "");
}

// Wrap text into lines that fit within maxWidth
function wrapText(text: string, font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(test, fontSize);
      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export async function POST(request: Request) {
  try {
    const { clientId, signatureName, signatureImage } = await request.json();

    if (!clientId || !signatureName?.trim()) {
      return NextResponse.json(
        { error: "Client ID and signature name are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch client record
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check not already signed
    const { data: existing } = await supabase
      .from("step_completions")
      .select("id")
      .eq("client_id", clientId)
      .eq("step_number", 0)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Agreement already signed" }, { status: 409 });
    }

    // Capture IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const signedAt = new Date();
    const signatureTimestamp = signedAt.toLocaleString("en-IE", {
      timeZone: "Europe/Dublin",
      dateStyle: "long",
      timeStyle: "medium",
    });

    // Fetch contract template (use admin client — RLS restricts service-role-only write)
    const adminSupabase = createAdminClient();
    const { data: templateRow } = await adminSupabase
      .from("contract_templates")
      .select("body")
      .eq("name", "Master Contract")
      .single();

    const templateBody = templateRow?.body || "";

    // Interpolate variables
    const startDate = client.contract_start_date
      ? new Date(client.contract_start_date).toLocaleDateString("en-IE")
      : new Date().toLocaleDateString("en-IE");

    const contractEndDate = client.contract_start_date
      ? new Date(
          new Date(client.contract_start_date).getTime() + 90 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-IE")
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IE");

    const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || client.name;
    const businessName = client.business_name || clientName;
    const countryLabel =
      client.country === "ireland"
        ? "Ireland"
        : client.country === "united_kingdom"
        ? "United Kingdom"
        : "United States";

    const interpolated = templateBody
      .replace(/\{ClientName\}/g, clientName)
      .replace(/\{BusinessName\}/g, businessName)
      .replace(/\{Country\}/g, countryLabel)
      .replace(/\{StartDate\}/g, startDate)
      .replace(/\{ContractEndDate\}/g, contractEndDate)
      .replace(/\{SignatureDate\}/g, signatureTimestamp)
      .replace(/\{SignatureIP\}/g, ip)
      .replace(/\{Currency\}/g, client.currency || "€")
      .replace(/\{DailyAdBudget\}/g, client.daily_ad_budget?.toString() || "TBD")
      .replace(/\{DepositAmount\}/g, client.deposit_amount?.toString() || "TBD")
      .replace(/\{Month1Remainder\}/g, client.month1_remainder?.toString() || "TBD")
      .replace(/\{Month2Amount\}/g, client.month2_amount?.toString() || "TBD")
      .replace(/\{Month3Amount\}/g, client.month3_amount?.toString() || "TBD")
      .replace(/\{PaymentDueDate\}/g, client.payment_due_date?.toString() || "TBD")
      .replace(/\{PaymentSection\}/g, generatePaymentSection(client as Record<string, unknown>));

    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;
    const green = rgb(0.133, 0.773, 0.369);
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    function checkPageBreak(needed: number) {
      if (y - needed < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    }

    // Header
    page.drawText("Green Growth Agency", {
      x: margin,
      y,
      font: helveticaBold,
      size: 18,
      color: green,
    });
    y -= 22;
    page.drawText("Client Agreement", {
      x: margin,
      y,
      font: helvetica,
      size: 12,
      color: gray,
    });
    y -= 8;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: green,
    });
    y -= 24;

    // Contract body (plain text)
    const plainText = sanitizeForPdf(htmlToPlainText(interpolated));
    const bodyLines = wrapText(plainText, helvetica, 10, contentWidth);
    const lineHeight = 14;

    for (const line of bodyLines) {
      checkPageBreak(lineHeight);
      if (line.trim()) {
        page.drawText(line, {
          x: margin,
          y,
          font: helvetica,
          size: 10,
          color: black,
        });
      }
      y -= lineHeight;
    }

    // Signature block
    checkPageBreak(160);
    y -= 20;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.5,
      color: gray,
    });
    y -= 20;

    page.drawText("ELECTRONIC SIGNATURE", {
      x: margin,
      y,
      font: helveticaBold,
      size: 10,
      color: gray,
    });
    y -= 18;

    // Embed drawn signature image if provided
    if (signatureImage) {
      try {
        const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
        const imgBytes = Buffer.from(base64Data, "base64");
        const embeddedImg = await pdfDoc.embedPng(imgBytes);
        const sigWidth = 220;
        const sigHeight = (embeddedImg.height / embeddedImg.width) * sigWidth;
        checkPageBreak(sigHeight + 10);
        // Draw light box behind signature
        page.drawRectangle({
          x: margin,
          y: y - sigHeight,
          width: sigWidth,
          height: sigHeight,
          color: rgb(0.97, 0.97, 0.97),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });
        page.drawImage(embeddedImg, {
          x: margin,
          y: y - sigHeight,
          width: sigWidth,
          height: sigHeight,
        });
        y -= sigHeight + 12;
      } catch (imgErr) {
        console.warn("Could not embed signature image:", imgErr);
      }
    }

    page.drawText(`Signed by: ${sanitizeForPdf(signatureName)}`, {
      x: margin,
      y,
      font: helveticaBold,
      size: 11,
      color: black,
    });
    y -= 16;

    page.drawText(`Date & Time: ${signatureTimestamp}`, {
      x: margin,
      y,
      font: helvetica,
      size: 10,
      color: black,
    });
    y -= 16;

    page.drawText(`IP Address: ${ip}`, {
      x: margin,
      y,
      font: helvetica,
      size: 10,
      color: black,
    });
    y -= 16;

    page.drawText(`Client: ${sanitizeForPdf(clientName)} | Business: ${sanitizeForPdf(businessName)}`, {
      x: margin,
      y,
      font: helvetica,
      size: 10,
      color: gray,
    });

    const pdfBytes = await pdfDoc.save();

    // Upload to Google Drive
    let pdfUrl = "";
    if (client.drive_contracts_folder_id) {
      const safeDate = signedAt.toISOString().split("T")[0];
      const fileName = `${clientName}_Contract_${safeDate}.pdf`;
      try {
        pdfUrl = await uploadContractPdf(
          client.drive_contracts_folder_id,
          fileName,
          pdfBytes
        );
      } catch (driveErr) {
        console.error("PDF upload to Drive failed:", driveErr);
      }
    }

    // Record step 0 completion
    const { error: insertError } = await adminSupabase
      .from("step_completions")
      .insert({
        client_id: clientId,
        step_number: 0,
        signature_name: signatureName,
        signature_ip: ip,
        pdf_drive_url: pdfUrl || null,
        completed_by: "client",
      });

    if (insertError) {
      console.error("step_completions insert failed:", insertError);
      return NextResponse.json(
        { error: `Failed to save signature: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Log to activity
    await adminSupabase.from("client_activity_log").insert({
      client_id: clientId,
      event_type: "contract_signed",
      event_data: {
        signature_name: signatureName,
        ip,
        pdf_url: pdfUrl,
        signed_at: signedAt.toISOString(),
      },
    });

    // Send notifications (fire and forget)
    sendContractSignedNotification(
      {
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        business_name: businessName,
        email: client.email,
        country: client.country,
      },
      {
        signedAt: signatureTimestamp,
        ip,
        signatureName,
        pdfUrl: pdfUrl || "#",
      }
    ).catch(console.error);

    notifyStepComplete(
      {
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        business_name: businessName,
        email: client.email,
      },
      0
    ).catch(console.error);

    return NextResponse.json({ success: true, pdfUrl });
  } catch (err) {
    console.error("sign-contract error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
