import { SignatureData } from '../types';
import { FIXED_CONFIG } from '../constants';

/**
 * Generates the raw HTML string for the email signature.
 * Redesigned to match the specific reference image provided.
 */
export const generateSignatureHTML = (data: SignatureData): string => {
  // Helper to extract domain for display
  const getDisplayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const websiteDisplay = getDisplayUrl(FIXED_CONFIG.websiteUrl);
  
  // Helper to encode URL for QR code API
  const encodedQrUrl = encodeURIComponent(data.qrUrl || FIXED_CONFIG.websiteUrl);

  // Helper to convert textarea newlines to HTML breaks
  const formattedAddress = data.address.replace(/\n/g, '<br/>');

  // Brand Colors
  const colors = {
    darkBlue: '#4b4b9d', // Name, Logo Text
    lightBlue: '#008ccf', // Title, Icons, QR Border
    textGray: '#555555',
    bgGray: '#f3f4f6'
  };

  // CSS Filter to match #008ccf (Light Blue) for icons
  // Generated using: https://codepen.io/sosuke/pen/Pjoqqp
  const iconFilter = "filter: invert(39%) sepia(85%) saturate(2250%) hue-rotate(177deg) brightness(96%) contrast(101%);";

  // Logic to determine the Phone/Fax/Mobile rows
  // Adjusted alignment for icons to ensure they center vertically with text
  
  let faxMobileRow = '';
  
  if (data.faxNumber && data.faxNumber.trim() !== '') {
      faxMobileRow = `
        <tr>
            <td style="width: 25px; vertical-align: middle; padding-bottom: 4px;">
                <img src="https://cdn-icons-png.flaticon.com/512/3306/3306714.png" width="14" height="14" alt="Fax" style="vertical-align: middle; ${iconFilter}" crossorigin="anonymous">
            </td>
            <td style="vertical-align: middle; white-space: nowrap; padding-bottom: 4px;">
                <span style="margin-right: 12px; vertical-align: middle;">${data.faxNumber}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/15/15874.png" width="12" height="14" alt="Mobile" style="vertical-align: middle; margin-right: 6px; ${iconFilter}" crossorigin="anonymous">
                <span style="vertical-align: middle;">${data.mobileNumber}</span>
            </td>
        </tr>
      `;
  } else {
      faxMobileRow = `
        <tr>
            <td style="width: 25px; vertical-align: middle; padding-bottom: 4px;">
                <img src="https://cdn-icons-png.flaticon.com/512/15/15874.png" width="12" height="14" alt="Mobile" style="vertical-align: middle; ${iconFilter}" crossorigin="anonymous">
            </td>
            <td style="vertical-align: middle; white-space: nowrap; padding-bottom: 4px;">
                <span style="vertical-align: middle;">${data.mobileNumber}</span>
            </td>
        </tr>
      `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Signature</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <!-- Wrapper Table with Strict Width (740px total = 700px content + 40px padding) -->
    <!-- Setting strict width helps html2canvas capture the exact area without whitespace -->
    <table cellpadding="0" cellspacing="0" border="0" width="740" style="width: 740px; margin: 0; padding: 0; border-collapse: collapse; background-color: #ffffff;">
        <tr>
            <td style="padding: 20px; background-color: #ffffff;">
                <!-- Main Content Table (700px) -->
                <table cellpadding="0" cellspacing="0" border="0" width="700" style="width: 700px; background-color: #ffffff; margin: 0; border-collapse: collapse;">
                    
                    <!-- TOP SECTION: Details & Logo -->
                    <tr>
                        <td style="padding-bottom: 12px; vertical-align: top;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <!-- LEFT COL: Personal Info (Width 65% of 700 = 455px) -->
                                    <td style="vertical-align: top; width: 455px; padding-right: 15px;">
                                        <!-- Name -->
                                        <div style="font-size: 20px; font-weight: 700; color: ${colors.darkBlue}; text-transform: uppercase; line-height: 1.2; margin-bottom: 4px; white-space: nowrap;">
                                            ${data.fullName}
                                        </div>
                                        <!-- Title -->
                                        <div style="font-size: 13px; line-height: 1.4; margin-bottom: 12px;">
                                            <span style="color: ${colors.lightBlue}; font-weight: 600;">${data.jobTitle}</span>, <span style="color: #444;">${data.businessUnit}</span>
                                        </div>
                                        
                                        <!-- Contact Info Table -->
                                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: ${colors.textGray}; line-height: 1.6;">
                                            <!-- Phone -->
                                            <tr>
                                                <td style="width: 25px; vertical-align: middle; padding-bottom: 4px;">
                                                    <img src="https://cdn-icons-png.flaticon.com/512/126/126509.png" width="12" height="12" alt="Phone" style="vertical-align: middle; ${iconFilter}" crossorigin="anonymous">
                                                </td>
                                                <td style="vertical-align: middle; white-space: nowrap; padding-bottom: 4px;">
                                                    <span style="vertical-align: middle;">${data.officePhone}</span> 
                                                    <span style="font-weight: 700; color: #222; margin-left: 5px; font-size: 11px; vertical-align: middle;">EXT - ${data.extension}</span>
                                                </td>
                                            </tr>
                                            
                                            <!-- Dynamic Fax/Mobile Row -->
                                            ${faxMobileRow}

                                            <!-- Email -->
                                            <tr>
                                                <td style="width: 25px; vertical-align: middle; padding-bottom: 4px;">
                                                    <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" width="12" height="12" alt="Email" style="vertical-align: middle; ${iconFilter}" crossorigin="anonymous">
                                                </td>
                                                <td style="vertical-align: middle; padding-bottom: 4px;">
                                                    <a href="mailto:${data.email}" style="color: ${colors.textGray}; text-decoration: none; vertical-align: middle;">${data.email}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>

                                    <!-- RIGHT COL: Logo Area (Width 35% of 700 = 245px) -->
                                    <td style="vertical-align: bottom; width: 245px; text-align: right;">
                                        <img src="${FIXED_CONFIG.logoUrl}" width="120" alt="Powerline Solutions" style="display: inline-block; margin-bottom: 8px; border: 0;" crossorigin="anonymous">
                                        <div style="font-size: 9px; font-weight: 700; color: ${colors.darkBlue}; letter-spacing: 1.2px; opacity: 0.9; white-space: nowrap;">
                                            KSA &nbsp;|&nbsp; UAE &nbsp;|&nbsp; QATAR &nbsp;|&nbsp; INDIA
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER LINE -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; height: 16px;"></td>
                    </tr>

                    <!-- BOTTOM SECTION: Address, Footer, QR -->
                    <tr>
                        <td style="vertical-align: top;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <!-- LEFT: Address & Gray Box -->
                                    <td style="vertical-align: top; padding-right: 15px;">
                                        <!-- Address -->
                                        <div style="font-size: 12px; color: ${colors.textGray}; line-height: 1.5; margin-bottom: 12px;">
                                            ${formattedAddress}
                                        </div>
                                        
                                        <!-- Gray Footer Box -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${colors.bgGray}; border-radius: 6px; border: 1px solid #f0f0f0;">
                                            <tr>
                                                <td style="padding: 10px 14px;">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <!-- Website -->
                                                            <td style="vertical-align: middle;">
                                                                <table cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td style="padding-right: 8px; vertical-align: middle;">
                                                                            <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="14" height="14" style="vertical-align: middle; opacity: 0.6; display: block;" crossorigin="anonymous">
                                                                        </td>
                                                                        <td style="vertical-align: middle; white-space: nowrap;">
                                                                            <a href="${FIXED_CONFIG.websiteUrl}" style="font-size: 11px; color: #333; text-decoration: none; font-weight: 500; display: inline-block;">${websiteDisplay}</a>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <!-- Branch Email -->
                                                            <td style="vertical-align: middle; text-align: right;">
                                                                <table cellpadding="0" cellspacing="0" border="0" align="right">
                                                                    <tr>
                                                                        <td style="padding-right: 8px; vertical-align: middle;">
                                                                            <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" width="14" height="14" style="vertical-align: middle; opacity: 0.6; display: block;" crossorigin="anonymous">
                                                                        </td>
                                                                        <td style="vertical-align: middle; white-space: nowrap;">
                                                                            <a href="mailto:${data.branchEmail}" style="font-size: 11px; color: #333; text-decoration: none; font-weight: 500; display: inline-block;">${data.branchEmail}</a>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>

                                    <!-- RIGHT: QR Code -->
                                    <td style="vertical-align: bottom; width: 80px; text-align: right;">
                                        <div style="border: 1px solid ${colors.lightBlue}; border-radius: 8px; padding: 4px; display: inline-block; background-color: #fff;">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedQrUrl}" width="72" height="72" alt="QR" style="display: block;" crossorigin="anonymous">
                                            <div style="font-size: 6px; color: ${colors.lightBlue}; font-weight: 700; text-align: center; margin-top: 4px; line-height: 1.2; white-space: nowrap;">
                                                SCAN QR CODE<br>TO DISCOVER MORE..
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};