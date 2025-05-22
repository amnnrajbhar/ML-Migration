import { AuthData } from './../auth/auth.model';
import { APIURLS } from './api-url';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';

import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

@Injectable()
export class HttpService {

    constructor(private http: HttpClient) {

    }
 getHeaderForLogin(): { headers: HttpHeaders } {
  const headers = new HttpHeaders({
    'Accept': 'application/json; charset=utf-8',
    'Content-Type': 'application/json'
    // If you want to use 'application/x-www-form-urlencoded', replace the Content-Type here
    // 'Content-Type': 'application/x-www-form-urlencoded'
  });

  return { headers };
}
  getHeaderForForgotPwd(): { headers: HttpHeaders } {
  const headers = new HttpHeaders({
    'Accept': 'application/json; charset=utf-8',
    'Content-Type': 'application/json'
  });

  return { headers };
}

   getHeader(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

getHeaderForFileUpload(): { headers: HttpHeaders } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  let headers = new HttpHeaders({
    'Accept': 'application/json; charset=utf-8'
    // Do NOT set 'Content-Type' here for file uploads (multipart/form-data)
  });

  if (authData && authData.token) {
    headers = headers.set('Authorization', 'Bearer ' + authData.token);
  }

  return { headers };
}


    postLogin(postParams): any {
        var data = {
            employeeId: postParams.username,
            password: postParams.password,
            tenantId: 1,
            ip:postParams.ip
        }
     const promise = new Promise((resolve, reject) => {
  this.http.post(
    APIURLS.BR_BASE_URL + APIURLS.BR_AUTH_API,
    data,
    { ...this.getHeaderForLogin(), observe: 'response' as 'response' }
  )
  .toPromise()
  .then(
    res => {
      if (res.status !== 401) {
        resolve(res.body);  // res.body is parsed JSON
      } else {
      resolve((res as any).status);
      }
    },
    err => {
      reject(err.status);
    }
  );
});

        return promise;
    }

    postFileUpload(apiKey: string, id: number, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    forgotpassword(apiKey: string, id: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            //this.http.post(APIURLS.BR_BASE_URL + apiKey + '/' + mailid + '/', this.getHeaderForForgotPwd())
            this.http.put(APIURLS.BR_BASE_URL + apiKey + '/' + id + '/', postParams, this.getHeaderForForgotPwd())
                .toPromise()
                .then(
                    res => { // Success
                        // //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        // //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    get(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    //http://localhost:52217/api/DepartmentMaster/GetPaged?page=2&pageSize=10
    //DepartmentMaster/GetPaged?page=

    getPaged(apiKey: string, page: number, pageSize: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + page + "&pageSize=" + pageSize, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getEntityList(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getById(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getImgHeader(): Headers {
        var headers = new Headers({
            'responseType': 'application/blob'
        });
        return headers;
    }

   getImageFile(apiKey: string, id: number, filename: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(`${APIURLS.BR_BASE_URL}${apiKey}?filename=${id},${filename}.jpeg`, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers
    })
    .toPromise()
    .then(
      res => {
        resolve(res); // already a Blob
      },
      err => {
        reject(err);
      }
    );
  });
}


getFile(apiKey: string, id: string, filename: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(`${APIURLS.BR_BASE_URL}${apiKey}?filename=${id},${filename}`, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers // If you're using a custom header method
    }).toPromise().then(
      res => {
        resolve(res); // Already a Blob
      },
      err => {
        reject(err);
      }
    );
  });
}



getSAPFile(apiKey: string, id: string, filename: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(`${APIURLS.BR_BASE_URL}${apiKey}?filename=${filename}`, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers  // if you use custom headers
    }).toPromise().then(
      res => {
        resolve(res); // 'res' is already a Blob
      },
      err => {
        reject(err);
      }
    );
  });
}


    post(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        //reject(err.json());
                        reject(err._body);
                    }
                );

        });
        return promise;
    }
    delete(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.delete(APIURLS.BR_BASE_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                      resolve((res as any).status);
                    },
                    err => {

                        reject(err.status);
                    }
                );

        });
        return promise;
    }
    put(apiKey: string, id: number, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => {

                        // Success

                        // //console.log('success '+res);
                        //  resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                      resolve((res as any).status);
                        //  return res.text() ? res.json() : {}; 
                        //>>>>>>> .r26

                    },
                    err => {
                        //console.log(err.json());
                       // reject(err.json());
                       reject(err._body);
                    }
                );

        });
        return promise;
    }
    sendmail(apiKey: string, id: number, postParams): any {
        // debugger;
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id + "/" + postParams, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => {

                      resolve((res as any).status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    forgotsendmail(apiKey: string, id: string, postParams): any {
        // debugger;
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id + "/" + postParams, postParams)
                .toPromise()
                .then(
                    res => {

                      resolve((res as any).status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    patch(apiKey: string, id: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            //this.http.patch(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeaderForFileUpload())
            this.http.patch(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    
    fileUpload(apiKey: string, id: string, postParams): any {
        // debugger;
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id + "/" + postParams, postParams)
                .toPromise()
                .then(
                    res => {

                      resolve((res as any).status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    postforUploadFiles(apiKey: string, id: number, postParams): any {

        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());

                      resolve((res as any).status);
                    },
                    err => {
                        // console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    postforCustFileUpload(apiKey: string, id: number, postParams): any {
        console.log('parameters:' + postParams.name);
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                      resolve((res as any).status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    // get by param
    getByParam(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    //Post ImagesFiles..
    postImageFiles(apiKey: string, files, id: number): any {

        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey + "/" + id, files)
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                      resolve((res as any).status);
                    },
                    err => {
                        // console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
//Send mail method for room booking...
    sendPutMail(apiKey: string,type:string, postParams): any {
        // debugger;
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "?type=" + type,postParams, this.getHeader())
                .toPromise()
                .then(
                res => { 

                  resolve((res as any).status);
                },
                err => {
                    //console.log(err.json());
                    reject(err.json());
                }
                );

        });
        return promise;
    }



    //HR API Methods
    HRpost(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_HR_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    HRdelete(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.delete(APIURLS.BR_BASE_HR_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                      resolve((res as any).status);
                    },
                    err => {

                        reject(err.status);
                    }
                );

        });
        return promise;
    }
    HRput(apiKey: string, id: number, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_HR_URL + apiKey + "/" + id, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => {

                        // Success

                        // //console.log('success '+res);
                        //  resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                      resolve((res as any).status);
                        //  return res.text() ? res.json() : {}; 
                        //>>>>>>> .r26

                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    HRgetById(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_HR_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    HRget(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    HRgetByParam(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_HR_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

  HRdownloadFile(apiKey: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers
    }).toPromise().then(
      res => {
        // `res` is already a Blob
        resolve(res);
      },
      err => {
        reject(err);
      }
    );
  });
}


getFileDownloadHeader(): { headers: HttpHeaders, responseType: 'blob' } {
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + authData.token
  });

  return {
    headers,
    responseType: 'blob'  // Note: typed as string 'blob' here
  };
}

    HRpostAttachmentFile(apiKey: string, postParams): any {
        console.log('parameters:' + postParams.name);
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_HR_URL + apiKey, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                      resolve((res as any).status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    HRpostAttachmentFileWithReturn(apiKey: string, postParams): any {
        console.log('parameters:' + postParams.name);
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_HR_URL + apiKey, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    //ITAMS http urls
    amsget(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_AMS_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    amsput(apiKey: string, id: number, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_AMS_URL + apiKey + "/" + id, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => {
                      resolve((res as any).status);

                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    amsgetByParam(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_AMS_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    amspost(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_AMS_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    amspost1(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_AMS_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                      resolve((res as any).status);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    //DLS Methods
    DLSpost(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_DLS_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    DLSdelete(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.delete(APIURLS.BR_DLS_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                      resolve((res as any).status);
                    },
                    err => {

                        reject(err.status);
                    }
                );

        });
        return promise;
    }
    DLSput(apiKey: string, id: number, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_DLS_URL + apiKey + "/" + id, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => {

                        // Success

                        // //console.log('success '+res);
                        //  resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res);
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                      resolve((res as any).status);
                        //  return res.text() ? res.json() : {}; 
                        //>>>>>>> .r26

                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    DLSgetByParam(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_DLS_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    dlsgetPaged(apiKey: string, page: number, pageSize: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_DLS_URL + apiKey +"?Page=" +page + "&pageSize=" + pageSize, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    DLSget(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_DLS_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    DLSgetById(apiKey: string, id: number): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_DLS_URL + apiKey + "/" + id, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    //Travel Desk
    ExcelUploadForTD(apiKey: string,id:string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey + "/" + id+ "/" + postParams, postParams)
                .toPromise()
                .then(  
                    res => {
                        resolve(res);
                    },
                    err => {
                        reject(err.json());
                    }
                );
        });
        return promise;
    }

    ExcelUploadForSoftwareRoles(apiKey: string,id:string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey + "/" + id+ "/" + postParams, postParams)
                .toPromise()
                .then(  
                    res => {
                        resolve(res);
                    },
                    err => {
                        reject(err.json());
                    }
                );
        });
        return promise;
    }   

    ExcelUpload(apiKey: string,id:string,  postParams): any {
        // debugger;
        const promise = new Promise((resolve, reject) => {
            this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id+ "/" + postParams, postParams)
                .toPromise()
                .then(  
                    res => {

                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    //WMTS Methods
    //WMTS Methods
    GetPimData(apiKey:string,pim:string,plant:string)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + '?PIM=' + pim + '&' +'Plant='+ plant, this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    GetGatePass(apiKey:string,vehicleno:string,plant:string,printedby:string,type:string,slno:string,fromdate:string,todate:string)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + '?VehicleNo=' + vehicleno + '&' +'Plant='+ plant + '&' +'PrintedBy='+ printedby + '&' +'Type='+ type + '&' +'Slno='+ slno + '&' +'Fromdate='+ fromdate + '&' +'Todate='+ todate, this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    GetMonthEndDCData(apiKey:string,DCNo:string,Status:string, plant:string,fromdate:string,todate:string)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + '?DCNo=' + DCNo + '&' +'Plant='+ plant + '&' +'Status='+ Status + '&' +'Fromdate='+ fromdate + '&' +'Todate='+ todate, this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    ApproveMonthEndDC(apiKey:string,DCNo:string, plant:string,ApprovedBy:string)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + '?DCNo=' + DCNo + '&' +'Plant='+ plant + '&' +'ApprovedBy='+ ApprovedBy, this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }
    GetSamplingReport(apiKey:string,postParams)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_WMTS_URL + apiKey, postParams, this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    GetDCVerificationData(apiKey:string,dcno:string,plant:string)
    {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + '?DCNo=' + dcno + '&' +'Plant='+ plant , this.getHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        //   //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //  //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    postMIGO(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_WMTS_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res);
                        // resolve(res.status);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getDCData(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getDCLooseTransferData(apiKey: string, searchStr: String): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_WMTS_URL + apiKey + "?include=" + searchStr, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    postAttachmentWithReturn(apiKey: string, postParams): any {
        console.log('parameters:' + postParams.name);
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                        resolve(res);
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
  }

  //LeaveAttendanceMethods

  LAget(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_LA_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }

  LAgetById(apiKey: string, id: number): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_LA_URL + apiKey + "/" + id, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //console.log(res.json());
            resolve(res);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LApost(apiKey: string, postParams): any {
    const promise = new Promise((resolve, reject) => {
      this.http.post(APIURLS.BR_LA_URL + apiKey, postParams, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            // console.log(res.json());
            resolve(res);
            // resolve(res.status);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAdelete(apiKey: string, id: number): any {
    const promise = new Promise((resolve, reject) => {
      this.http.delete(APIURLS.BR_LA_URL + apiKey + "/" + id, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
          resolve((res as any).status);
          },
          err => {

            reject(err.status);
          }
        );

    });
    return promise;
  }
  LAput(apiKey: string, id: number, postParams): any {
    const promise = new Promise((resolve, reject) => {
      this.http.put(APIURLS.BR_LA_URL + apiKey + "/" + id, postParams, this.getHeader())
        .toPromise()
        .then(
          res => {

            // Success

            // //console.log('success '+res);
            //  resolve(res);
            //  return res.text() ? res.json() : {}; 

            // //console.log('success '+res);
            // resolve(res);
            //  return res.text() ? res.json() : {}; 

            //  //console.log('success '+res);
          resolve((res as any).status);
            //  return res.text() ? res.json() : {}; 
            //>>>>>>> .r26

          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAgetByParam(apiKey: string, searchStr: String): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_LA_URL + apiKey + "?include=" + searchStr, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //console.log(res.json());
            resolve(res);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAgetPaged(apiKey: string, page: number, pageSize: number): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_LA_URL + apiKey + "?Page=" + page + "&pageSize=" + pageSize, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
 LAdownloadFile(apiKey: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(APIURLS.BR_LA_URL + apiKey, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers
    })
    .toPromise()
    .then(
      res => {
        // `res` is already a Blob
        resolve(res);
      },
      err => {
        reject(err);
      }
    );
  });
}

  LAfileUpload(apiKey: string, id: string, postParams): any {
    // debugger;
    const promise = new Promise((resolve, reject) => {
      this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id + "/" + postParams, postParams)
        .toPromise()
        .then(
          res => {

          resolve((res as any).status);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
LAgetFile(apiKey: string, id: string, filename: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=' + id + ',' + filename, {
      responseType: 'blob',
      headers: this.getFileDownloadHeader().headers
    })
    .toPromise()
    .then(
      res => {
        // Response is already a Blob
        resolve(res);
      },
      err => {
        reject(err);
      }
    );
  });
}

  LAExcelUpload(apiKey: string, id: string, postParams): any {
    // debugger;
    const promise = new Promise((resolve, reject) => {
      this.http.put(APIURLS.BR_LA_URL + apiKey + "/" + id + "/" + postParams, postParams)
        .toPromise()
        .then(
          res => {

            resolve(res);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
}
