import { TestBed, async, inject } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { DataService } from './data.service';
import { IApiRequestModel } from '../models/apiRequest.model';
import { IApiResponseModel } from '../models/apiResponse.model';

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        DataService,
        { provide: XHRBackend, useClass: MockBackend },
      ]
    });
  });

  it('should be created', inject([DataService], (service: DataService) => {
    expect(service).toBeTruthy();
  }));

  describe('mock getLines()', () => {

    it('should return an successful Observable<IApiResponseModel>',
        inject([DataService, XHRBackend], (dataService, mockBackend) => {

        const mockRequest: IApiRequestModel = {
          path: '/var/test.log',
          page: 1,
          perPage: 10
        };

        const mockResponse = {
          lines: [
            'line 1',
            'line 2',
            'line 3',
          ],
          counts: {
            totalLines: 3,
            itemsPerPage: 10,
            totalPages: 1,
            currentPage: 1,
            start: 1,
            end: 3,
          }
        };

        mockBackend.connections.subscribe((connection) => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockResponse)
          })));
        });

        dataService.getLines(mockRequest).subscribe((data) => {
          expect(data).toEqual(jasmine.any(Object));
          expect(data.counts).toEqual(jasmine.any(Object));
          expect(data.lines instanceof Array).toBeTruthy();
          expect(data.lines.length).toBe(3);
          expect(data.lines[0]).toEqual('line 1');
          expect(data.counts.totalLines).toBe(3);
        });

    }));


    // add more tests here to check error responses:


  });

});
