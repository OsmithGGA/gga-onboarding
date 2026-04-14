import { google } from "googleapis";

function getAuth() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}"
  );

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function createClientFolder(
  clientName: string,
  clientEmail: string
): Promise<{ folderId: string; folderUrl: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  // Create the folder inside the GGA parent folder
  const folder = await drive.files.create({
    requestBody: {
      name: `${clientName} — GGA Assets`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!],
    },
    fields: "id, webViewLink",
  });

  const folderId = folder.data.id!;
  const folderUrl = folder.data.webViewLink!;

  // Share with the client (commenter role so they can upload)
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: "writer",
      type: "user",
      emailAddress: clientEmail,
    },
    sendNotificationEmail: false,
  });

  return { folderId, folderUrl };
}
