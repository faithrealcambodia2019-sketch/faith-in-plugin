/**
 * Faith In private Google Drive upload endpoint v5.5.188.
 * Deploy as Web App: Execute as Me; Who has access: Anyone.
 * Files remain private. WordPress authenticates with this shared secret.
 *
 * Required Apps Script services/scopes:
 * - DriveApp: https://www.googleapis.com/auth/drive
 * - UrlFetchApp: https://www.googleapis.com/auth/script.external_request
 */
const CURATED_VAULT_DRIVE_FOLDER_ID = '13EeE--U74k_82pdFfAqMd5CptIi3jh-_';
const CURATED_VAULT_UPLOAD_SECRET = 'PASTE_SHARED_SECRET_FROM_WORDPRESS_SETTINGS';

function doGet(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const action = String(p.action || '');

    if (action === 'upload' || action === 'curated_vault_upload') {
      return jsonResponse({ success: false, error: 'Upload requests must use POST.', version: '5.5.188' });
    }

    if (action === 'download') {
      const id = String(p.id || '').replace(/[^A-Za-z0-9_-]/g, '');
      const secret = String(p.secret || '');
      if (!id || secret !== CURATED_VAULT_UPLOAD_SECRET) {
        return jsonResponse({ success: false, error: 'Unauthorized download request.' });
      }
      const file = DriveApp.getFileById(id);
      const blob = file.getBlob();
      return jsonResponse({
        success: true,
        id: id,
        name: file.getName(),
        mimeType: blob.getContentType(),
        fileData: Utilities.base64Encode(blob.getBytes()),
        version: '5.5.188'
      });
    }

    return jsonResponse({
      success: true,
      message: 'Faith In private Google Drive endpoint is running.',
      folderId: CURATED_VAULT_DRIVE_FOLDER_ID,
      version: '5.5.188'
    });
  } catch (err) {
    return jsonResponse({ success: false, error: errorText_(err), version: '5.5.188' });
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    return handleUpload_(payload);
  } catch (err) {
    return jsonResponse({ success: false, error: errorText_(err), version: '5.5.188' });
  }
}

function handleUpload_(payload) {
  payload = payload || {};

  if (!payload.secret || String(payload.secret) !== CURATED_VAULT_UPLOAD_SECRET) {
    return jsonResponse({ success: false, error: 'Unauthorized upload request.', version: '5.5.188' });
  }

  const sourceUrl = String(payload.sourceUrl || payload.url || '');
  const fileData = payload.fileData || payload.file || payload.data || payload.content;
  const fileName = payload.fileName || payload.filename || payload.name || ('faith-in-' + Date.now());
  let mimeType = payload.mimeType || payload.mime || payload.type || 'application/octet-stream';
  let blob;

  if (sourceUrl) {
    const res = UrlFetchApp.fetch(sourceUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'User-Agent': 'FaithInDriveUploader/5.5.188' }
    });
    const code = res.getResponseCode();
    if (code < 200 || code >= 300) {
      return jsonResponse({ success: false, error: 'Could not fetch temporary upload file from WordPress. HTTP ' + code, version: '5.5.188' });
    }
    blob = res.getBlob();
    if (!mimeType || mimeType === 'application/octet-stream') {
      mimeType = blob.getContentType() || mimeType;
    }
    blob = blob.setName(sanitizeName(fileName)).setContentType(mimeType);
  } else if (fileData) {
    const bytes = Utilities.base64Decode(String(fileData));
    blob = Utilities.newBlob(bytes, mimeType, sanitizeName(fileName));
  } else {
    return jsonResponse({ success: false, error: 'No sourceUrl or fileData received.', version: '5.5.188' });
  }

  const folder = CURATED_VAULT_DRIVE_FOLDER_ID ? DriveApp.getFolderById(CURATED_VAULT_DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
  const file = folder.createFile(blob);

  return jsonResponse({
    success: true,
    id: file.getId(),
    name: file.getName(),
    mimeType: file.getMimeType(),
    path: folder.getName(),
    private: true,
    version: '5.5.188'
  });
}

function parsePayload_(e) {
  let payload = {};
  const contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  if (contents) {
    try { payload = JSON.parse(contents); } catch (err) { payload = (e && e.parameter) ? e.parameter : {}; }
  } else {
    payload = (e && e.parameter) ? e.parameter : {};
  }
  return payload || {};
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sanitizeName(name) {
  return String(name || 'faith-in-file').replace(/[\/\\:*?"<>|]/g, '-').slice(0, 180);
}

function errorText_(err) {
  return String(err && err.message ? err.message : err);
}

/**
 * Run this once from the Apps Script editor before deploying a new version.
 * It forces Google to ask permission for DriveApp and UrlFetchApp.
 */
function testAuthorize() {
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
  const folderName = DriveApp.getFolderById(CURATED_VAULT_DRIVE_FOLDER_ID).getName();
  Logger.log('Authorization OK. Folder: ' + folderName);
}
