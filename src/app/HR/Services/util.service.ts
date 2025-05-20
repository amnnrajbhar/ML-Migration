import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Location } from '@angular/common';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
declare var toastr: any;

@Injectable()
export class Util{
    constructor(private httpService: HttpService, private router: Router, private location: Location) { }
   
    public profileId:any;
            
    hasPermission(permissionId: number): boolean{
      let result = false;
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if(currentUser.permissions != null && currentUser.permissions.length > 0)
          return currentUser.permissions.includes(permissionId);

      return result;
  } 

    getFormatedDateTime(date: any) {
      if(date == undefined || date == null || date == "") return "";
        let dt = new Date(date);
        let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
          ("00" + dt.getDate()).slice(-2) + ' ' +
          ("00" + dt.getHours()).slice(-2) + ":" +
          ("00" + dt.getMinutes()).slice(-2) + ":" +
          ("00" + dt.getSeconds()).slice(-2);
        return formateddate;
      }

      
  isValidPAN(pan) {
    if(pan == null || pan == undefined || pan == "") return false;
    var regex = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan.toUpperCase());
  }

  saveLetter(request: any){      
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_SAVE_DOCUMENT, request)
    .then((data: any) => {
      if (data == 200 || data.success) {
      } else if (!data.success) {
        console.log("Error while saving the leter "+data.message);
      } else
      console.log("Error while saving the letter "+data);
    }
    ).catch(error => {
      console.log("Error while saving the letter "+error);
    });  
  }

  saveLetterActivity(request: any){      
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_SAVE_LETTER_ACTIVITY, request)
    .then((data: any) => {
      if (data == 200 || data.success) {
      } else if (!data.success) {
        console.log("Error while saving the leter activity "+data.message);
      } else
      console.log("Error while saving the letter activity "+data);
    }
    ).catch(error => {
      console.log("Error while saving the letter activity "+error);
    });  
  }
  
  
  canApproveTask(taskId, employeeId){      
    this.httpService.HRget(APIURLS.WORKFLOW_CHECK_CAN_APPROVE_TASK+"/"+taskId+"/"+employeeId)
    .then((data: any) => {
      if (data == 200 || data.success) {
      } 
      else{
      this.location.back();
      toastr.error("You are not authorized to approve this.");
      }
    }
    ).catch(error => {
      toastr.error("You are not authorized to approve this.");
    });  
  }

}