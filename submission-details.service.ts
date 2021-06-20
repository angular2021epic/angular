import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';
import { AnnDevSubmissionDetailsModel } from '../models/ann-dev-submission-details-model';
import { TopicAreaCopyModel } from '../models/topic-area-copy-model';
import { StepValidationErrorMessagesModel } from '../models/step-validation-error-messages-model';
import { ValidationRequestModel } from '../models/validation-request-model';

@Injectable({
  providedIn: 'root'
})
export class SubmissionDetailsService extends BaseService {

  constructor(config:  ApiConfiguraton, http: HttpClient) { super(config, http); }
}
 /**
   * @param request undefined
   * @return Success
   */

 GetSubmissionDetailsInformationResponse(request?: number): Observable<StrictHttpResponse<AnnDevSubmissionDetailsModel>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    if (request != null) __params = __params.set('request', request.toString());

    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/am/AnnDevSubmissionDetails/GetSubmissionDetailsInformation`,
      __body,
     {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });
    return this.http.request<any>(req).pipe(
                                      __filter(_r => _r instanceof HttpResponse),
                                      __map((_r) => {
        return _r as StrictHttpResponse<AnnDevSubmissionDetailsModel>;
      })
    );
  }

  GetSubmissionDetailsInformation(request?: number): Observable<AnnDevSubmissionDetailsModel> {
     return this.GetSubmissionDetailsInformationResponse(request).pipe(
           __map(_r => _r.body as AnnDevSubmissionDetailsModel)
    );
  }

  /** @param request undefined */

  SaveSubmissionDetailsInformationResponse(request?: AnnDevSubmissionDetailsModel): Observable<StrictHttpResponse<null>> {

    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = request;

    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/am/AnnDevSubmissionDetails/SaveSubmissionDetailsInformation`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });
    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as StrictHttpResponse<null>;
      })
    );
  }


  /*** @param request undefined */
  SaveSubmissionDetailsInformation(request?: AnnDevSubmissionDetailsModel): Observable<null> {
    return this.SaveSubmissionDetailsInformationResponse(request).pipe(
      __map(_r => _r.body as null)
    );
  }


  /** @param request undefined  */
  CopyAnnDevSubmissionInfoResponse(request?: TopicAreaCopyModel): Observable<StrictHttpResponse<null>> {

    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = request;
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/am/AnnDevSubmissionDetails/CopyAnnDevSubmissionInfo`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as StrictHttpResponse<null>;
      })
    );
  }

}
