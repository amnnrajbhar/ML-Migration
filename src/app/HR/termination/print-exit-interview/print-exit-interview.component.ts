import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Location } from '@angular/common';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-print-exit-interview',
  templateUrl: './print-exit-interview.component.html',
  styleUrls: ['./print-exit-interview.component.css'],
  providers:[Util]
})
export class PrintExitInterviewComponent implements OnInit {

  terminationId: any = 0;
  currentUser!: AuthData;
  urlPath: string = '';
  isLoading = false;
  questions: any[] = [];
  terminationDetails:any = {};
  errMsg: string = "";
  isAnswered = false;
  isDeclared = false;
  DateLastWorkingDay: string
  TerminationDate: string
  JoiningDate: string

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;     
      this.terminationId = this.route.snapshot.paramMap.get('id')!;
      this.GetData();
      this.GetTerminationDetailsById();
    }
  }

  GetData() {   

    if(this.terminationId && this.terminationId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.TERMINATION_GET_EXIT_INTERVIEW_ANSWERS+"/"+ this.terminationId).then((data: any) => {
        if (data) {
          this.questions = data;
          this.isAnswered = (data.filter((x:any)=>x.answer != "" && x.answer != null && x.answer != undefined).length > 0);          
          this.isDeclared = this.isAnswered;
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.errMsg = "Error occurred while fetching details, please check the link.";
      });
    }
  }

  
  GetTerminationDetailsById() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TERMINATION_DETAILS_GET_BYID + "/" + this.terminationId).then((data: any) => {
      if (data) {
        this.terminationDetails = data;         
        if(this.terminationDetails.expectedLastWorkingDate == null || this.terminationDetails.expectedLastWorkingDate == undefined)
          this.terminationDetails.expectedLastWorkingDate = this.terminationDetails.lastWorkingDate;

        this.DateLastWorkingDay = this.getDateFormate(this.terminationDetails.expectedLastWorkingDate);
        this.TerminationDate = this.getDateFormate(this.terminationDetails.terminationDate);
        this.JoiningDate = this.getDateFormate(this.terminationDetails.dateOfJoining);
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.errMsg = error;
      this.isLoading = false;
    });
  }
  
  Print(){
    let printContents, popupWin;
    printContents = document.getElementById('printArea').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
         
         <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
        </head>
        <body onload="window.print();window.close();">
        <table class="report-container">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
                <div class="header-info">
                 
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="report-content">
            <tr>
              <td class="report-content-cell">
                <div class="main">
                ${printContents}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </body>
      </html>`
    );
    popupWin.document.close();
  }

  
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  Back(){
    this.location.back();
  }
}
