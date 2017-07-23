import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IApiRequestModel } from '../models/apiRequest.model';
import { IApiResponseModel } from '../models/apiResponse.model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class DataService {

  // Backend API server base path
  private apiBasePath = '/api';

  constructor(private readonly http: Http) { }

  /**
   * Gets log data from server at specified path and page
   * @param apiRequest {IApiRequestModel}
   * @returns {Observable<IApiResponseModel>}
   */
  getLines(apiRequest: IApiRequestModel): Observable<IApiResponseModel> {
    return this.http.get(this.apiBasePath, {params: apiRequest})
        .map((res: Response) => res.json())
        .catch((error: any) => Observable.throw(error.json().error || 'No response from server'));
    }
}
