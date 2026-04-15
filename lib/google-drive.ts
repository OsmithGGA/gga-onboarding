import { google } from "googleapis";

function getAuth() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}"
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

// ─── Create full folder structure for a new client ────────────────────────────
// Creates:
//   /Clients/{ClientName}/
//     /{ClientName} Assets/   ← shared with client (writer), link goes in Step 4
//     /Contracts/             ← not shared with client, signed PDFs stored here
//     Lead Tracker — {ClientName}  ← Google Sheet with pre-populated headers

export async function createClientFolderStructure(
  clientName: string,
  clientEmail: string
): Promise<{
  assetsFolderId: string;
  assetsFolderUrl: string;
  contractsFolderId: string;
  sheetUrl: string;
}> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!;

  // 1. Create main client folder /Clients/{ClientName}/
  const clientFolder = await drive.files.create({
    requestBody: {
      name: clientName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });
  const clientFolderId = clientFolder.data.id!;

  // 2. Create Assets subfolder — share with client
  const assetsFolder = await drive.files.create({
    requestBody: {
      name: `${clientName} Assets`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [clientFolderId],
    },
    fields: "id, webViewLink",
  });
  const assetsFolderId = assetsFolder.data.id!;
  const assetsFolderUrl = assetsFolder.data.webViewLink!;

  // Share assets folder with client (writer — can upload)
  await drive.permissions.create({
    fileId: assetsFolderId,
    requestBody: {
      role: "writer",
      type: "user",
      emailAddress: clientEmail,
    },
    sendNotificationEmail: false,
  });

  // 3. Create Contracts subfolder — not shared with client
  const contractsFolder = await drive.files.create({
    requestBody: {
      name: "Contracts",
      mimeType: "application/vnd.google-apps.folder",
      parents: [clientFolderId],
    },
    fields: "id",
  });
  const contractsFolderId = contractsFolder.data.id!;

  // 4. Create Lead Tracker Google Sheet
  const sheetUrl = await createLeadTrackerSheet(
    clientName,
    clientFolderId,
    drive,
    sheets
  );

  return { assetsFolderId, assetsFolderUrl, contractsFolderId, sheetUrl };
}

// ─── Create Lead Tracker Sheet ────────────────────────────────────────────────

async function createLeadTrackerSheet(
  clientName: string,
  parentFolderId: string,
  drive: ReturnType<typeof google.drive>,
  sheets: ReturnType<typeof google.sheets>
): Promise<string> {
  // Create the spreadsheet (lands in root Drive initially)
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `Lead Tracker — ${clientName}` },
    },
    fields: "spreadsheetId, spreadsheetUrl",
  });
  const spreadsheetId = spreadsheet.data.spreadsheetId!;
  const spreadsheetUrl = spreadsheet.data.spreadsheetUrl!;

  // Move into the client folder
  const fileMetadata = await drive.files.get({
    fileId: spreadsheetId,
    fields: "parents",
  });
  const previousParents = (fileMetadata.data.parents || []).join(",");
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: parentFolderId,
    removeParents: previousParents,
    fields: "id, parents",
  });

  const sheetId = 0; // default Sheet1

  // Set up headers, formatting, and data validation
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Set header values
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 14,
            },
            rows: [
              {
                values: [
                  "Lead #",
                  "Date Delivered",
                  "Name",
                  "Phone",
                  "Email",
                  "Area",
                  "Owns Property",
                  "Last Electricity Bill",
                  "Reason for Enquiry",
                  "Lead Quality",
                  "Status",
                  "Closed Amount",
                  "Notes",
                  "Last Updated",
                ].map((title) => ({
                  userEnteredValue: { stringValue: title },
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.067, green: 0.067, blue: 0.067 },
                    horizontalAlignment: "CENTER",
                  },
                })),
              },
            ],
            fields: "userEnteredValue,userEnteredFormat",
          },
        },
        // Freeze header row
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: "gridProperties.frozenRowCount",
          },
        },
        // Data validation — Status column (index 10 = column K)
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 10,
              endColumnIndex: 11,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: [
                  { userEnteredValue: "Can't Get Through" },
                  { userEnteredValue: "Assessment Scheduled" },
                  { userEnteredValue: "Quoted" },
                  { userEnteredValue: "Quoted Lost" },
                  { userEnteredValue: "Waste of Time" },
                  { userEnteredValue: "Won" },
                ],
              },
              showCustomUi: true,
              strict: false,
            },
          },
        },
        // Data validation — Lead Quality column (index 9 = column J)
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 9,
              endColumnIndex: 10,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: [
                  { userEnteredValue: "Poor" },
                  { userEnteredValue: "Fair" },
                  { userEnteredValue: "Good" },
                  { userEnteredValue: "Very Good" },
                ],
              },
              showCustomUi: true,
              strict: false,
            },
          },
        },
        // Auto-resize all columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 14,
            },
          },
        },
      ],
    },
  });

  return spreadsheetUrl;
}

// ─── Upload contract PDF to Drive ─────────────────────────────────────────────

export async function uploadContractPdf(
  contractsFolderId: string,
  fileName: string,
  pdfBytes: Uint8Array
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const { Readable } = await import("stream");
  const stream = Readable.from(Buffer.from(pdfBytes));

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/pdf",
      parents: [contractsFolderId],
    },
    media: {
      mimeType: "application/pdf",
      body: stream,
    },
    fields: "id, webViewLink",
  });

  return file.data.webViewLink!;
}

// ─── Legacy single-folder creator (kept for backwards compat) ─────────────────

export async function createClientFolder(
  clientName: string,
  clientEmail: string
): Promise<{ folderId: string; folderUrl: string }> {
  const result = await createClientFolderStructure(clientName, clientEmail);
  return {
    folderId: result.assetsFolderId,
    folderUrl: result.assetsFolderUrl,
  };
}
