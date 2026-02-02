export interface SignatureData {
  fullName: string;
  jobTitle: string;
  businessUnit: string;
  officePhone: string;
  extension: string;
  faxNumber: string;
  mobileNumber: string;
  email: string;
  websiteUrl: string;
  address: string;
  logoUrl: string;
  qrUrl: string; // The URL the QR code points to
  branchEmail: string; // The generic email for the branch (e.g. info@, salesme@)
}

export interface GeneratedSignature {
    id: string;
    user_id: string;
    full_name: string;
    job_title: string;
    department: string;
    mobile: string;
    email: string;
    created_at: string;
}
