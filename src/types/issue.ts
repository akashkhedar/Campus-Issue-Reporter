export type IssueStatus = "Reported" | "Assigned" | "In Progress" | "Resolved";

export type IssueCategory = 
  | "Infrastructure" 
  | "Safety" 
  | "Cleanliness" 
  | "Academics" 
  | "Hostel" 
  | "Other";

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface IssueMedia {
  id: string;
  issueId: string;
  url: string;
  type: "image" | "video";
  uploadedAt: Date;
}

export interface StatusHistoryEntry {
  id: string;
  issueId: string;
  from: IssueStatus | null;
  to: IssueStatus;
  changedAt: Date;
  changedBy?: string;
}

export interface Resolver {
  name: string;
  department: string;
  contact?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
  media: IssueMedia[];
  statusHistory: StatusHistoryEntry[];
  resolver?: Resolver;
  resolutionProof?: IssueMedia[];
  adminNotes?: string; // Private, only visible to admins
}

export interface IssueFormData {
  title: string;
  description: string;
  category: IssueCategory;
  location: Location;
  images: File[];
  video?: File;
}
