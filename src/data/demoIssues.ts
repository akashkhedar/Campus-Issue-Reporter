import type { Issue, IssueStatus, IssueCategory } from "@/types/issue";

// Demo data for the public issue feed
export const demoIssues: Issue[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Broken street light near Library Building",
    description: "The street light near the main library entrance has been flickering for weeks and now completely stopped working. This poses a safety risk for students walking at night.",
    category: "Infrastructure",
    status: "In Progress",
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: "Main Library, North Campus",
    },
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-18T14:20:00"),
    media: [
      {
        id: "m1",
        issueId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-15T10:30:00"),
      },
    ],
    statusHistory: [
      {
        id: "sh1",
        issueId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-15T10:30:00"),
      },
      {
        id: "sh2",
        issueId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        from: "Reported",
        to: "Assigned",
        changedAt: new Date("2024-01-16T09:00:00"),
        changedBy: "Admin",
      },
      {
        id: "sh3",
        issueId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        from: "Assigned",
        to: "In Progress",
        changedAt: new Date("2024-01-18T14:20:00"),
        changedBy: "Maintenance Team",
      },
    ],
    resolver: {
      name: "Electrical Maintenance Team",
      department: "Campus Infrastructure",
      contact: "maintenance@campus.edu",
    },
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    title: "Overflowing garbage bins at Sports Complex",
    description: "The garbage bins near the sports complex entrance have been overflowing for three days. The smell is terrible and it's attracting pests.",
    category: "Cleanliness",
    status: "Assigned",
    location: {
      lat: 28.6145,
      lng: 77.2105,
      address: "Sports Complex, East Wing",
    },
    createdAt: new Date("2024-01-17T16:45:00"),
    updatedAt: new Date("2024-01-18T08:30:00"),
    media: [
      {
        id: "m2",
        issueId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-17T16:45:00"),
      },
    ],
    statusHistory: [
      {
        id: "sh4",
        issueId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-17T16:45:00"),
      },
      {
        id: "sh5",
        issueId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        from: "Reported",
        to: "Assigned",
        changedAt: new Date("2024-01-18T08:30:00"),
        changedBy: "Admin",
      },
    ],
    resolver: {
      name: "Sanitation Department",
      department: "Campus Services",
    },
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    title: "Water leakage in Women's Hostel Block B",
    description: "There's a significant water leakage from the ceiling on the second floor of Women's Hostel Block B. The water is dripping into the corridor making it slippery and dangerous.",
    category: "Hostel",
    status: "Resolved",
    location: {
      lat: 28.6125,
      lng: 77.2085,
      address: "Women's Hostel, Block B",
    },
    createdAt: new Date("2024-01-10T08:15:00"),
    updatedAt: new Date("2024-01-14T17:00:00"),
    media: [
      {
        id: "m3",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-10T08:15:00"),
      },
    ],
    statusHistory: [
      {
        id: "sh6",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-10T08:15:00"),
      },
      {
        id: "sh7",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        from: "Reported",
        to: "Assigned",
        changedAt: new Date("2024-01-11T09:00:00"),
        changedBy: "Admin",
      },
      {
        id: "sh8",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        from: "Assigned",
        to: "In Progress",
        changedAt: new Date("2024-01-12T11:30:00"),
        changedBy: "Plumbing Team",
      },
      {
        id: "sh9",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        from: "In Progress",
        to: "Resolved",
        changedAt: new Date("2024-01-14T17:00:00"),
        changedBy: "Plumbing Team",
      },
    ],
    resolver: {
      name: "Plumbing & Maintenance",
      department: "Hostel Services",
      contact: "hostel-maint@campus.edu",
    },
    resolutionProof: [
      {
        id: "rp1",
        issueId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-14T17:00:00"),
      },
    ],
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    title: "Unsafe electrical wiring in Chemistry Lab",
    description: "Exposed electrical wires spotted near workstation 12 in the Chemistry Lab. This is extremely dangerous and needs immediate attention before someone gets hurt.",
    category: "Safety",
    status: "Reported",
    location: {
      lat: 28.6150,
      lng: 77.2095,
      address: "Science Building, Chemistry Lab",
    },
    createdAt: new Date("2024-01-19T11:00:00"),
    updatedAt: new Date("2024-01-19T11:00:00"),
    media: [
      {
        id: "m4",
        issueId: "d4e5f6a7-b8c9-0123-defa-234567890123",
        url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-19T11:00:00"),
      },
    ],
    statusHistory: [
      {
        id: "sh10",
        issueId: "d4e5f6a7-b8c9-0123-defa-234567890123",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-19T11:00:00"),
      },
    ],
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    title: "Projector not working in Lecture Hall 3",
    description: "The main projector in Lecture Hall 3 has stopped working since last week. Multiple professors have complained about this affecting their lectures.",
    category: "Academics",
    status: "Assigned",
    location: {
      lat: 28.6135,
      lng: 77.2100,
      address: "Academic Block, Lecture Hall 3",
    },
    createdAt: new Date("2024-01-16T14:20:00"),
    updatedAt: new Date("2024-01-17T10:00:00"),
    media: [],
    statusHistory: [
      {
        id: "sh11",
        issueId: "e5f6a7b8-c9d0-1234-efab-345678901234",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-16T14:20:00"),
      },
      {
        id: "sh12",
        issueId: "e5f6a7b8-c9d0-1234-efab-345678901234",
        from: "Reported",
        to: "Assigned",
        changedAt: new Date("2024-01-17T10:00:00"),
        changedBy: "Admin",
      },
    ],
    resolver: {
      name: "IT Department",
      department: "Academic Services",
    },
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    title: "Parking area needs better signage",
    description: "The student parking area lacks proper signage. New students often park in faculty spots by mistake because the signs are faded and unclear.",
    category: "Other",
    status: "Reported",
    location: {
      lat: 28.6142,
      lng: 77.2080,
      address: "Main Parking Area, South Gate",
    },
    createdAt: new Date("2024-01-18T09:30:00"),
    updatedAt: new Date("2024-01-18T09:30:00"),
    media: [
      {
        id: "m5",
        issueId: "f6a7b8c9-d0e1-2345-fabc-456789012345",
        url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
        type: "image",
        uploadedAt: new Date("2024-01-18T09:30:00"),
      },
    ],
    statusHistory: [
      {
        id: "sh13",
        issueId: "f6a7b8c9-d0e1-2345-fabc-456789012345",
        from: null,
        to: "Reported",
        changedAt: new Date("2024-01-18T09:30:00"),
      },
    ],
  },
];

export const getIssueById = (id: string): Issue | undefined => {
  return demoIssues.find((issue) => issue.id === id);
};

export const getFilteredIssues = (
  statusFilter: IssueStatus | "all",
  categoryFilter: IssueCategory | "all",
  sortOrder: "latest" | "oldest"
): Issue[] => {
  let filtered = [...demoIssues];

  if (statusFilter !== "all") {
    filtered = filtered.filter((issue) => issue.status === statusFilter);
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((issue) => issue.category === categoryFilter);
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
  });

  return filtered;
};
