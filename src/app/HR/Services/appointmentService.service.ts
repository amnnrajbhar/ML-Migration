import { Component, Input, OnInit } from '@angular/core';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';

import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var $: any;

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppointmentService{
    
    constructor(private router: Router, private route: ActivatedRoute, private http: Http) { }
        
  getAddressTypes():any {      
    let list: any[] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_ADDRESS_TYPES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.addressType > b.addressType) return 1; if (a.addressType < b.addressType) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
  }
  
  getMaritalStatus(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_MARITAL_STATUS).then((data: any) => {
      if (data.length > 0) {
        list = data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }

  getLanguages(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_LANGUAGES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.language > b.language) return 1; if (a.language < b.language) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getStates(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_STATES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getCountries(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_COUNTRIES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.landx > b.landx) return 1; if (a.landx < b.landx) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getEducationLevels(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_EDUCATION_LEVELS).then((data: any) => {
      if (data.length > 0) {
        list = data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getCourses(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_COURSES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.educationCourse > b.educationCourse) return 1; if (a.educationCourse < b.educationCourse) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }

  getReligions(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_RELIGIONS).then((data: any) => {
      if (data.length > 0) {
        list = data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  
  getNationality(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_NATIONALITY).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.nationality > b.nationality) return 1; if (a.nationality < b.nationality) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }  
  getIndustries(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_INDUSTRIES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a, b) => { if (a.indDesc > b.indDesc) return 1; if (a.indDesc < b.indDesc) return -1; return 0; });
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getRelationTypes(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_RELATION_TYPES).then((data: any) => {
      if (data.length > 0) {
        console.log(data);
        list = data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }
  getAccountTypes(): any {      
    let list: [] = [];
    return this.getData(APIURLS.APPOINTMENT_GET_ACCOUNT_TYPES).then((data: any) => {
      if (data.length > 0) {
        list = data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }

  getInterviewList(resignationId:any,guid :any): any {      
    let list: [] = [];
    return this.getData(APIURLS.RESIGNATION_GET_EXIT_INTERVIEW_ANSWERS_LINK).then((data: any) => {
      if (data.length > 0) {
        list=data;
      }
      return list;
    }).catch(error => {
      return list;
    });
    return list;
  }

  getData(apiKey: string): any {
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

  postData(apiKey: string, postParams): any {
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

  postAttachmentFiles(apiKey: string, file): any {

    const promise = new Promise((resolve, reject) => {
        this.http.post(APIURLS.BR_BASE_HR_URL + apiKey , file)
            .toPromise()
            .then(
                res => { // Success
                    //console.log(res.json());
                    resolve(res.json());
                },
                err => {
                    // console.log(err.json());
                    reject(err.json());
                }
            );

    });
    return promise;
}
  
  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return options;
  }

 

}