import { AuthData } from './../auth/auth.model';
import { APIURLS } from './api-url';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
@Injectable()
export class HttpService {

    constructor(private http: Http) {

    }
    getHeaderForLogin(): any {
        var headers = new Headers();
        headers.append("Accept", 'application/json; charset=utf-8');

        // headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        return options;
    }
    getHeaderForForgotPwd(): any {
        var headers = new Headers();
        headers.append("Accept", 'application/json; charset=utf-8');
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    getHeader(): any {
        var headers = new Headers();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
        headers.append("Authorization", "Bearer " + authData.token);
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    getHeaderForFileUpload(): any {
        var headers = new Headers();
        headers.append("Accept", 'application/json; charset=utf-8');
        //headers.append('Content-Type', 'multipart/form-data; charset=utf-8');
        //headers.append('Access-Control-Allow-Origin', '*');
        let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
        headers.append("Authorization", "Bearer " + authData.token);
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    postLogin(postParams): any {
        var data = {
            employeeId: postParams.username,
            password: postParams.password,
            tenantId: 1,
            ip:postParams.ip
        }
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + APIURLS.BR_AUTH_API, data, this.getHeaderForLogin())
                .toPromise()
                .then(
                    res => { // Success
                        //console.log(res.json());
                        // debugger;
                        if (res.status != 401) {
                            resolve(res.json());
                        }
                        else {
                            resolve(res.status);

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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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

    getImageFile(apiKey: string, id: number, filename: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=' + id + ',' + filename + '.jpeg', { responseType: ResponseContentType.Blob })
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        console.log(res);
                        // resolve(res.blob());
                        resolve(new Blob([res.blob()], { type: 'image/jpeg' }));
                        //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

                        //   return blob;            
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    getFile(apiKey: string, id: string, filename: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=' + id + ',' + filename, { responseType: ResponseContentType.Blob })
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        console.log(res);
                        // resolve(res.blob());
                        resolve(new Blob([res.blob()], {type: 'application/blob'},));
                        //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

                        //   return blob;            
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    getSAPFile(apiKey: string, id: string, filename: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename='+ filename, { responseType: ResponseContentType.Blob })
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        console.log(res);
                        // resolve(res.blob());
                        resolve(new Blob([res.blob()], {type: 'application/blob'},));
                        //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

                        //   return blob;            
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    post(apiKey: string, postParams): any {
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_URL + apiKey, postParams, this.getHeader())
                .toPromise()
                .then(
                    res => { // Success
                        // console.log(res.json());
                        resolve(res.json());
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
                        resolve(res.status);
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
                        //  resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                        resolve(res.status);
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

                        resolve(res.status);
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

                        resolve(res.status);
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
                        resolve(res.json());
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

                        resolve(res.status);
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

                        resolve(res.status);
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
                        resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.status);
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

                    resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.status);
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
                        //  resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                        resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    HRdownloadFile(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, this.getFileDownloadHeader())
                // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

                .toPromise()
                .then(
                    res => { // Success
                        console.log(res);
                        // resolve(res.blob());
                        resolve(new Blob([res.blob()], {type: 'application/blob'},));
                        //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

                        //   return blob;            
                    },
                    err => {
                        //console.log(err.json());
                        reject(err.json());
                    }
                );

        });
        return promise;
    }

    getFileDownloadHeader(): any {
        var headers = new Headers();
        //headers.append("responseType", "application/blob");
        //headers.append("Accept", 'application/json');
        //headers.append('Content-Type', 'application/json');
        let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
        headers.append("Authorization", "Bearer " + authData.token);
        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        return options;
    }

    HRpostAttachmentFile(apiKey: string, postParams): any {
        console.log('parameters:' + postParams.name);
        const promise = new Promise((resolve, reject) => {
            this.http.post(APIURLS.BR_BASE_HR_URL + apiKey, postParams, this.getHeaderForFileUpload())
                .toPromise()
                .then(
                    res => { // Success
                        resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.status);

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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.status);
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
                        //  resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        // //console.log('success '+res);
                        // resolve(res.json());
                        //  return res.text() ? res.json() : {}; 

                        //  //console.log('success '+res);
                        resolve(res.status);
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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

                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
                        resolve(res.json());
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
            resolve(res.json());
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
            resolve(res.json());
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
            resolve(res.json());
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
            resolve(res.status);
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
            //  resolve(res.json());
            //  return res.text() ? res.json() : {}; 

            // //console.log('success '+res);
            // resolve(res.json());
            //  return res.text() ? res.json() : {}; 

            //  //console.log('success '+res);
            resolve(res.status);
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
            resolve(res.json());
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
            resolve(res.json());
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAdownloadFile(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_LA_URL + apiKey, this.getFileDownloadHeader())
        // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

        .toPromise()
        .then(
          res => { // Success
            console.log(res);
            // resolve(res.blob());
            resolve(new Blob([res.blob()], { type: 'application/blob' },));
            //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

            //   return blob;            
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAfileUpload(apiKey: string, id: string, postParams): any {
    // debugger;
    const promise = new Promise((resolve, reject) => {
      this.http.put(APIURLS.BR_BASE_URL + apiKey + "/" + id + "/" + postParams, postParams)
        .toPromise()
        .then(
          res => {

            resolve(res.status);
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAgetFile(apiKey: string, id: string, filename: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=' + id + ',' + filename, { responseType: ResponseContentType.Blob })
        // this.http.get(APIURLS.BR_BASE_URL + apiKey + '?filename=1,test.jpg, {responseType: ResponseContentType.Blob}' )

        .toPromise()
        .then(
          res => { // Success
            console.log(res);
            // resolve(res.blob());
            resolve(new Blob([res.blob()], { type: 'application/blob' },));
            //             var blob = new Blob([res.blob()], {type: 'application/blob'} )

            //   return blob;            
          },
          err => {
            //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }
  LAExcelUpload(apiKey: string, id: string, postParams): any {
    // debugger;
    const promise = new Promise((resolve, reject) => {
      this.http.put(APIURLS.BR_LA_URL + apiKey + "/" + id + "/" + postParams, postParams)
        .toPromise()
        .then(
          res => {

            resolve(res.json());
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
