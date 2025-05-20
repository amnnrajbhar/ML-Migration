import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { Feedback } from './../log-complaint/feedback.model';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router } from '@angular/router';

@Component({
  selector: 'app-resolve-complaint',
  templateUrl: './resolve-complaint.component.html',
  styleUrls: ['./resolve-complaint.component.css']
})
export class ResolveComplaintComponent implements OnInit {

  public tableWidget: any;
  divisionList: any[];
  selDiv: any;
  feedbackList: Feedback[];
  feedbackItem: Feedback = new Feedback(0, 0, 0, '', '', '', '', '', false);;
  isLoading: boolean = false;
  resHeaderList: any[];
  resTableHeaderList: any[];
  divisionTabHeader: string;
  errMsg: string = "";
  todayDate: Date = new Date();
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  empItem: any;
  employeeList: any[]=[[]];
  resolveStatus: any;
  empName: string = '';
  path: string = '';
  fullStatus: any[] = [
    {id:true, name:'Close'}, 
    {id:false, name:'Open'}
  ];
  //let authData: AuthData = "";
  constructor(private appService: AppComponent, private router: Router, private httpService: HttpService) { }


  private initDatatable(): void {
    let exampleId: any = jQuery('#resComplaintTable');
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
      ////console.log(chkaccess);
      this.getEmployeeList();
      // this.getResolveHeaders();
      this.getComplaintMasterList();
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    ////console.log('testpop')
    // this.getComplaintMasterList();
    jQuery("#saveModal").modal('hide');
    
    // window.location.reload();
  }
  closemyModal() {
    ////console.log('testpop')
    this.getComplaintMasterList();
    jQuery("#myModal").modal('hide');
    
    // window.location.reload();
  }
  getComplaintMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_FEEDBACK_API_GETALL).then((data: any) => {
      this.isLoading = false;
      if (data.length>0) {
        this.feedbackList = data;
          ////console.log(this.feedbackList);
         /* for (let feed of this.feedbackList) {
            this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, feed.fkEmpId).then((dataemp: any) => {
            this.empItem = dataemp;
            // console.log(this.empName);
            // this.feedbackList.find(item => item.fkEmpId === this.empItem.id)['div_name']  =  this.empItem.firstName + ' ' + this.empItem.lastName;
            // this.empName =  this.empItem.firstName + ' ' + this.empItem.lastName;
          });}*/
        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.feedbackList = [];
    });
  }

  getNameFor(empId){
    let temp: any;
    temp = this.employeeList.find(item => item.id == empId);
    var name = (typeof temp != 'undefined')? temp.firstName+ ' ' +temp.lastName : '';
    return name;
  }

  onAddComplaint(isEdit: boolean, data: Feedback) {
    //debugger;
    // console.log(data);
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.empName='';
    this.resolveStatus = false;
    this.isLoadingPop = false;
    if (this.isEdit) {
      this.feedbackItem = data;
      // console.log(this.feedbackItem);
      // this.resolveStatus = this.fullStatus.find(s => s.id == this.feedbackItem.isActive);;
      // this.resolveStatus = this.fullStatus.find(s => s.id === this.feedbackItem.isActive);
      //console.log('Resolution status:'+this.resolveStatus.id);
      let name = this.employeeList.find(s => s.id === this.feedbackItem.fkEmpId);
      this.empName = (typeof name != 'undefined')?name.firstName + ' '+name.lastName :'';
      this.selDiv = this.employeeList.find(s => s.id == this.feedbackItem.fkEmpId);
      this.resolveStatus = this.fullStatus.find(s => s.id === this.feedbackItem.isActive);

    //console.log(this.selDiv);
    jQuery("#myModal").modal('show');

    }
    // else {
    //   this.feedbackItem = new Feedback(0, 0, 0, '', '', '', '', '', false);
    //   this.resolveStatus = null;
    //   this.selDiv = null;
    //   this.empName = '';
    // }
  }

  getEmployeeList() {
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
          if (data.length>0){
              this.employeeList = data;
              //this.reInitDatatable();
            }
          }).catch(error => {
            this.isLoading = false;
            this.employeeList = [];
          });
  }

  onSaveComplaint(status: boolean) {
    //debugger;
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    this.feedbackItem.fkEmpId = this.selDiv.id;
    this.feedbackItem.isActive = this.resolveStatus.id;
    
    if (!this.isEdit) {
     // this.feedbackItem.divid = this.selDiv.divid;
      connection = this.httpService.post(APIURLS.BR_MASTER_FEEDBACK_API, this.feedbackItem);

    }
    else {
     // this.feedbackItem.divid = this.selDiv.divid;
      connection = this.httpService.put(APIURLS.BR_MASTER_FEEDBACK_API, this.feedbackItem.id, this.feedbackItem);
    }

    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.id >0 || data == 200) {
        ////console.log('test');
        jQuery("#myModal").modal('hide');
        this.errMsgPop1 = ' Resolve Complaint data saved successfully!';
        jQuery("#saveModal").modal('show');
        this.getComplaintMasterList();
      }
      // else {
      //   this.errMsgPop = data;
      // }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error resolving complaint..';
    });
  }
  // getResolveHeaders() {
  //     this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
  //         if (data.status == 'SUCCESS') {
  //             this.resHeaderList = data.formDataList;
  //             this.resHeaderList = data.formDataList.find(s => s.subMenuId == '16'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
  //             this.resTableHeaderList = _.filter(data.formDataList, function (obj) { if (obj.subMenuId == '16') return obj; });
  //             this.divisionTabHeader = _.map(this.resTableHeaderList, 'field1');
  //         }
  //     }).catch(error => {
  //         this.resHeaderList = null;
  //     });
  // }
}
