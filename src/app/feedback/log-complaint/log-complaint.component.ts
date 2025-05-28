import { AuthData } from './../../auth/auth.model';
import { Feedback } from './feedback.model';
import { AppComponent } from './../../app.component';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Employee } from '../../masters/employee/employee.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-complaint',
  templateUrl: './log-complaint.component.html',
  styleUrls: ['./log-complaint.component.css']
})
export class LogComplaintComponent implements OnInit {
    
    public tableWidget: any;
    employeeList: any[]=[[]];
    selDiv: any;
    feedbackList: Feedback[];
    feedbackItem: Feedback = new Feedback(0, 0, 0, '', '', '', '', '', false);;
    empItem: any;//Employee = this.empItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true, 0,0);
    isLoading: boolean = false;
    comHeaderList!: any[];
    comTableHeaderList!: any[];
    divisionTabHeader: string
    errMsg: string = "";
    todayDate: Date = new Date();
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    divItem: any;
    path: string = '';
    userid:number=0;
    //let authData: AuthData = "";
    constructor(private appService: AppComponent,  private router: Router, private httpService: HttpService) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#complaintTable');
        this.tableWidget = exampleId.DataTable();
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy()
            this.tableWidget = null
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    ngOnInit() {
      this.path = this.router.url;
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      if(chkaccess == true){
        //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.userid = authData.uid;
        this.getCompHeaders();
        this.getComplaintMasterList();
        this.getEmployeeList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable()
    }

    closeSaveModal() {
      ////console.log('testpop')
      jQuery("#myModal").modal('hide');
      
      // window.location.reload();
    }
    
    getComplaintMasterList() {
      this.errMsg = "";
      this.isLoading = true;
      //console.log(this.userid);
      //console.log('this.userid');

      this.httpService.getById(APIURLS.BR_MASTER_FEEDBACK_API_GETBYANY,this.userid).then((data: any) => {
        this.isLoading = false;
        if (data.length>0) {
          this.feedbackList = data;
        }
      }).catch((error)=> {
        this.isLoading = false;
        this.feedbackList = [];
      });
    }

    getUserName(id: number){
      let temp: any;
      temp = this.employeeList.find(item => item.id === id);
      var name = (typeof temp != 'undefined')? temp.firstName+ ' '+temp.lastName  : '';
        return name;
    }

    onAddComplaint(isEdit: boolean, data: Feedback) {
       // debugger;
      this.isEdit = isEdit;
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.feedbackItem = data;
        ////console.log(this.empItem);
        this.selDiv = this.employeeList.find((s:any) => s.id === this.feedbackItem.fkEmpId);;
        ////console.log(this.selDiv);
      }
      else {
        this.feedbackItem = new Feedback(0, 0, 0, '', '', '', '', '', false);
        this.selDiv = null;
      }
      jQuery("#myModal").modal('show');
    }

    getEmployeeList() {
      this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
            if (data.length>0){
                this.employeeList = data;
                //this.reInitDatatable();
              }
            }).catch((error)=> {
              this.isLoading = false;
              this.employeeList = [];
            });
    }

    onSaveComplaint() {
      //debugger;
      this.errMsg = "";
      this.errMsgPop = "";
      //this.errMsgPAN = "";
      //this.errMsgGSTIN = "";
      this.isLoadingPop = true;
      this.feedbackItem.fkEmpId = this.userid;
      let connection: any;
      if (!this.isEdit) 
        connection = this.httpService.post(APIURLS.BR_MASTER_FEEDBACK_API, this.feedbackItem);
      else
        connection = this.httpService.put(APIURLS.BR_MASTER_FEEDBACK_API, this.feedbackItem.id, this.feedbackItem);

      connection.then((data: any) => {
        this.isLoadingPop = false;
        ////console.log(data);
        if (data.id>0 || data==200) {
          jQuery("#myModal").modal('hide');
          
 this.errMsgPop1 = 'Log Complaint data saved successfully!';
 jQuery("#saveModal").modal('show');
          this.getComplaintMasterList();
        }
      }).catch((error)=> {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error logging complaint..';
      });
    }
    getCompHeaders() {
        this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
            if (data.length>0) {
                this.comHeaderList = data;
                this.comHeaderList = data.find((s:any) => s.subMenuId == '15'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
                this.comTableHeaderList = _.filter(data.formDataList, function (obj) { if (obj.subMenuId == '15') return obj; });
                this.divisionTabHeader = _.map(this.comTableHeaderList, 'field1');
            }
        }).catch((error)=> {
            this.comHeaderList = null;
        });
    }
}
