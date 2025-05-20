import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appraisal-history',
  templateUrl: './appraisal-history.component.html',
  styleUrls: ['./appraisal-history.component.css']
})
export class AppraisalHistoryComponent implements OnInit {
  @Input() employeeId: number;
  
  currentUser: AuthData;
  urlPath: string = '';
  isLoading = false;
  itemList: any[] = [];

  statusList = [
    { type: "Appraisal Initiated", color: "info" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Withdrawn", color: "warning" }, 
    { type: "Email Sent", color: "success" },
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService) { }

  ngOnInit() {
    console.log("history called1");
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      this.GetData();
    }
  }
  GetData() {   
console.log("history called");
    if(this.employeeId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_HISTORY_BY_EMP_ID+"/"+ this.employeeId).then((data: any) => {
        if (data) {
          console.log("history called2");
          this.itemList = data;       
          for(var item of this.itemList){
            item.statusColor = this.statusList.find(x=>x.type == item.status).color;
          } 
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  viewAppraisalDetails(eid: any, id: any) {
    let route = 'HR/actions/appraisal-view-only/' + eid + "/" + id;
    this.router.navigate([route]);
  }

  exportData() {
    //this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_HISTORY_BY_EMP_ID+"/"+ this.employeeId).then((data: any) => {
      //this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.forEach(item => {
        index = index + 1;
        let exportItem = {
          "SNo": index,
          "Employee Id": item.employeeNo,
          "Employee Name": item.employeeName,
          "Status": item.status,
          "Period": item.appraisalPeriod,
          "Appraisal Type": item.appraisalType,
          "Appraised By": item.appraisedBy,
          "Approved By": item.approvedBy,
          "Initiated By": item.initiatedByName,
          "Initiated Date": this.setDateFormate(item.initiatedDate),
          "Rating": item.rating,
          "Salary Type": item.salaryType,
          "Salary Amount": item.salaryAmount,
          "One Time Salary Type": item.oneTimeSalaryType,
          "One Time Salary Amount": item.oneTimeSalaryAmount,
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_AppraisalHistory');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
     // this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() + ' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }

}
