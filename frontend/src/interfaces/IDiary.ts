export interface DiaryInterface {
  ID?: number;
  CreatedAt?: string;
  DeletedAt?: string;
  Title?: string;
  Content?: string;
  UpdatedAt?: string;
  TagColors?: string; // Array of color strings
  TherapyCaseID?: number;
}
