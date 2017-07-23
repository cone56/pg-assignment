export interface IApiResponseModel {
  lines: string[];
  counts: {
    totalLines: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    start: number;
    end: number;
  };
}
