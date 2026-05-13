export interface DataTableResponse<T> {
  data: T[];
  totalRecords: number;
  filteredRecords: number;
}