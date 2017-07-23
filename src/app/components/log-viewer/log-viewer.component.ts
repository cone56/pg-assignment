import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { IApiRequestModel } from '../../models/apiRequest.model';
import { IApiResponseModel } from '../../models/apiResponse.model';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.css']
})
export class LogViewerComponent implements OnInit {
  // Class members
  error: object;
  filePath: string;
  page: number;
  perPage: number;
  vm: IApiResponseModel;

  constructor(private dataService: DataService) { }

  /**
   * Angular lifecycle hook to initalise class members. Called when
   * data binding has been setup
   */
  ngOnInit(): void {
    this.page = 1;
    this.perPage = 10;
    this.error = null;
  }

  /**
   * Use the data service to get log data from the backend server
   * for the given file and at a given page number
   * @returns void
   */
  fetchLogData(): void {
    // Prepare the query string params for the HTTP fetch
    const params: IApiRequestModel = {
      path: this.filePath,
      page: this.page,
      perPage: this.perPage,
    };
    // Begin the HTTP fetch
    this.dataService.getLines(params).subscribe(data => {
      // Successfully recieved data from server
      this.vm = data;
      this.error = null;
    }, err => {
      // Failure
      console.error('An error occured when fetching log data: %o', err);
      this.error = err;
    });
  }

  /**
   * Get log data for the given filePath
   * @param evt {object} DOM click event
   */
  onViewClick(evt: any): void {
    this.page = 1;
    this.fetchLogData();
    evt.preventDefault();
  }

  /**
   * Jump to the begninning of the log file
   * @param evt {object} DOM click event
   */
  onFirstClick(evt: any): void {
    if (this.page !== 1) {
      this.page = 1;
      this.fetchLogData();
    }
  }

  /**
   * Go to the previous page
   * @param evt {object} DOM click event
   */
  onPrevClick(evt: any): void {
    if (this.page > 1) {
      this.page--;
      this.fetchLogData();
    }
  }

  /**
   * Go to the next page
   * @param evt {object} DOM click event
   */
  onNextClick(evt: any): void {
    if (this.vm.counts.currentPage < this.vm.counts.totalPages) {
      this.page++;
      this.fetchLogData();
    }
  }

  /**
   * Jump to the end of the log file
   * @param evt {object} DOM click event
   */
  onLastClick(evt: any): void {
    if (this.vm.counts.currentPage < this.vm.counts.totalPages) {
      this.page = this.vm.counts.totalPages;
      this.fetchLogData();
    }
  }
}
