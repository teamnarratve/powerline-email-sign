import { SignatureData } from '../types';
import { FIXED_CONFIG } from '../constants';
import { getColoredIcon, Icons } from './icons';
import { qrCodeBase64 } from './qrCode';

/**
 * Generates the raw HTML string for the email signature.
 * Redesigned to match the specific reference image provided.
 */
export const generateSignatureHTML = (data: SignatureData): string => {
  // Helper to extract domain for display
  const getDisplayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const websiteDisplay = getDisplayUrl(FIXED_CONFIG.websiteUrl);
  
  // Helper to encode URL for QR code API (Fallback if needed, but we use static now)
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

  // Generate colored icons strings
  const phoneIcon = getColoredIcon(Icons.phone, colors.lightBlue);
  const mobileIcon = getColoredIcon(Icons.mobile, colors.lightBlue);
  const faxIcon = getColoredIcon(Icons.fax, colors.lightBlue);
  const emailIcon = getColoredIcon(Icons.email, colors.lightBlue);
  const websiteIcon = getColoredIcon(Icons.website, colors.lightBlue);

  /**
   * Helper function to generate a strictly aligned row using pure tables.
   * RULES:
   * - One TR, Two TDs.
   * - TD 1: Icon. Fixed width (20px). Vertical Align Middle.
   * - TD 2: Content. No fixed width/height. Vertical Align Middle.
   * - No absolute positioning. No overflow hidden.
   * - Fixed line-height (1.5 approx for 13px font = ~20px).
   */
  const createRow = (iconSrc: string, contentHtml: string) => {
      return `
        <tr>
            <!-- Icon Cell: Fixed Width, Vertical Align Middle -->
            <td style="width: 20px; vertical-align: middle; padding: 0; margin: 0; line-height: 1;">
                <img src="${iconSrc}" width="14" height="14" style="vertical-align: middle; display: block; margin: 0;">
            </td>
            <!-- Content Cell: Fluid, Vertical Align Middle -->
            <td style="vertical-align: middle; padding-left: 8px; line-height: 1.5;">
                ${contentHtml}
            </td>
        </tr>
      `;
  };

  // Logic for Fax/Mobile Row
  let faxMobileRow = '';
  if (data.faxNumber && data.faxNumber.trim() !== '') {
      // Content HTML for fax/mobile:
      // We align the inline mobile icon to the middle as well.
      const content = `
        <span style="vertical-align: middle;">${data.faxNumber}</span>
        <span style="display: inline-block; width: 10px;"></span> 
        <img src="${mobileIcon}" width="12" height="14" style="vertical-align: middle; display: inline-block;">
        <span style="display: inline-block; margin-left: 6px; vertical-align: middle;">${data.mobileNumber}</span>
      `;
      faxMobileRow = createRow(faxIcon, content);
  } else {
      faxMobileRow = createRow(mobileIcon, `<span style="vertical-align: middle;">${data.mobileNumber}</span>`);
  }

  // Rows for other items
  // Note: Line-height 1.5 is set on the TD, so spans inside will inherit or can be explicit.
  const phoneRow = createRow(phoneIcon, `
    <span style="vertical-align: middle;">${data.officePhone}</span> 
    <span style="font-weight: 700; color: #222; margin-left: 5px; font-size: 11px; vertical-align: middle; line-height: 1.5;">EXT - ${data.extension}</span>
  `);
  
  const emailRow = createRow(emailIcon, `<a href="mailto:${data.email}" style="color: ${colors.textGray}; text-decoration: none; vertical-align: middle;">${data.email}</a>`);

  // Footer Rows (Website, Branch Email)
  // These are side-by-side cells. We will use an inner table for each to strictly enforce the icon/text layout
  // just like the main rows, but inside a TD.
  const createFooterTable = (iconSrc: string, contentHtml: string, alignRight: boolean = false) => {
      return `
        <table cellpadding="0" cellspacing="0" border="0" align="${alignRight ? 'right' : 'left'}">
            <tr>
                <!-- Icon Cell -->
                <td style="width: 20px; vertical-align: middle; padding: 0; margin: 0; line-height: 1;">
                    <img src="${iconSrc}" width="14" height="14" style="vertical-align: middle; display: block; margin: 0;">
                </td>
                <!-- Content Cell -->
                <td style="vertical-align: middle; padding-left: 8px; line-height: 1.5; white-space: nowrap;">
                    ${contentHtml}
                </td>
            </tr>
        </table>
      `;
  };

  const websiteTable = createFooterTable(websiteIcon, `<a href="${FIXED_CONFIG.websiteUrl}" style="font-size: 12px; color: #333; text-decoration: none; font-weight: 500; vertical-align: middle;">${websiteDisplay}</a>`, false);
  
  const branchEmailTable = createFooterTable(emailIcon, `<a href="mailto:${data.branchEmail}" style="font-size: 12px; color: #333; text-decoration: none; font-weight: 500; vertical-align: middle;">${data.branchEmail}</a>`, true);


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
                                        <!-- PURE TABLE ALIGNMENT (No Absolute Positioning) -->
                                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: ${colors.textGray}; width: 100%;">
                                            ${phoneRow}
                                            ${faxMobileRow}
                                            ${emailRow}
                                        </table>
                                    </td>

                                    <!-- RIGHT COL: Logo Area (Width 35% of 700 = 245px) -->
                                    <td style="vertical-align: bottom; width: 245px; text-align: right;">
                                        <!-- Explicit width/height for Outlook (1024x1024 scaled to 120x120) -->
                                        <img src="${FIXED_CONFIG.logoUrl}" width="120" height="120" alt="Powerline Solutions" style="display: inline-block; margin-bottom: 8px; border: 0; width: 120px; height: 120px;">
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
                        <td style="border-top: 1px solid #e5e7eb; height: 16px; line-height: 16px; font-size: 1px;">&nbsp;</td>
                    </tr>

                    <!-- BOTTOM SECTION: Address, Footer, QR -->
                    <tr>
                        <td style="vertical-align: top;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <!-- LEFT: Address & Gray Box -->
                                    <td style="vertical-align: bottom; padding-right: 15px;">
                                        <!-- Address -->
                                        <div style="font-size: 13px; color: ${colors.textGray}; line-height: 1.5; margin-bottom: 12px;">
                                            ${formattedAddress}
                                        </div>
                                        
                                        <!-- Gray Footer Box -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${colors.bgGray}; border-radius: 6px; border: 1px solid #f0f0f0;">
                                            <tr>
                                                <td style="padding: 10px 14px;">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <!-- Website -->
                                                            <td style="width: 48%; vertical-align: middle;">
                                                                ${websiteTable}
                                                            </td>
                                                            <!-- Branch Email -->
                                                            <td style="width: 48%; vertical-align: middle; text-align: right;">
                                                                ${branchEmailTable}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>

                                    <!-- RIGHT: QR Code -->
                                    <!-- Using Table for Border/Padding instead of Div for Outlook support -->
                                    <td style="vertical-align: bottom; width: 82px; text-align: right;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="82" style="border: 1px solid ${colors.lightBlue}; border-collapse: separate; background-color: #fff;">
                                            <tr>
                                                <td style="padding: 4px; text-align: center;">
                                                    <img src="${qrCodeBase64}" width="72" height="72" alt="QR" style="display: block; margin: 0 auto;">
                                                    <div style="font-size: 6px; color: ${colors.lightBlue}; font-weight: 700; text-align: center; margin-top: 4px; line-height: 1.2; white-space: nowrap; font-family: 'Segoe UI', Arial, sans-serif;">
                                                        SCAN QR CODE<br>TO DISCOVER MORE..
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
            </td>
        </tr>
    </table>
</body>
</html>`;
};