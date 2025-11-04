export type PositionCategory = "cátedra" | "corrección" | "laboratorio";

export type PositionStatus = "open" | "closed";

export type Section = "200" | "201";

export interface Position {
  id: string;
  title: string;
  department: string;
  categories?: PositionCategory[];
  status: PositionStatus;
  description: string;
  requirements: string[];
  currentApplicants?: number; // 5-20
  availableSlots?: number; // 2-6
  acceptedApplicants?: number; // menor que availableSlots
}

export interface Application {
  id: string;
  positionId: string;
  positionTitle: string;
  department: string;
  category?: PositionCategory;
  section: Section;
  reason: string;
  submittedAt: Date;
  status: "pending" | "cancelled";
  priority: number;
}
