import { Component, OnInit, ViewEncapsulation } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
import * as _ from "lodash";
import { Router, ActivatedRoute } from '@angular/router';
import { Employee } from '../masters/employee/employee.model';
import { EmployeeAddress } from '../masters/employee/employee-address.model';
import { EmployeeOtherDetails } from '../masters/employee/employee-otherDetails.model';
import { UserMaster } from '../masters/employee/user-master.model';
import { Payroll } from '../masters/employee/employee-payroll.model';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import {WebcamImage} from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
// import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Visitor } from '../visitorappointment/visitor.model';
import { AppService } from '../shared/app.service';
import * as FileSaver from 'file-saver';
import { AuthData } from '../auth/auth.model';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $:any;

@Component({
  selector: 'app-gevisitorpass',
  templateUrl: './gevisitorpass.component.html',
  styleUrls: ['./gevisitorpass.component.css']
})
export class GevisitorpassComponent implements OnInit {


  public webcamImage: WebcamImage = null;
  public tableWidget: any;
  addressId: number = 0;
  competencyList: any[];
  entityList: any[];
  designationList: any[];
  selParentRole: any;
  selDepartment: any;
  selApprovalTemp: any;
  selProfile: any; selManager: any;selReportingManager: any;
  roleList: any[];
  departmentList: any[];
  AapprovalTempList: any[];
  profileList: any[]; managerList: any; reporting_managerList: any;
  projectList: any[];
  userDivisionList: any[];
  FilteredDivList: any[];
  divSelectedItem: any[];
  entitySelectedItem: any[];
  userEntityList: any[];
  entitySelected=[];
  userList: Visitor[];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  uid: number = 0;
  // userItem: Employee =  new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
  // calendarItem: Visitor = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','',0,0,'', '', '');
  calendarItem: Visitor = {
    id: 0,
    isCancelled: true,
    isApproved: true,
    isPreShedualled: true,
    numberOfPerson: 0,
    modifiedBy: 0,
    isActive: true,
    fkVisitorType: 0,
    fkVisitorPurpose: 0
  } as Visitor;
  addressItem: EmployeeAddress = new EmployeeAddress(0,0,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'', true,0);
  empOtherDetailsItem: EmployeeOtherDetails = new EmployeeOtherDetails(0, 0,	'',	0,	'',	true,	'',	'',	'',	'',	'',	'',	'',	0,	0,	'', '',	'',	'');
  userMasterItem: UserMaster =  new UserMaster(0, 0,	 '',	'',	'',	'',	0,'',	'',	'',	'',0,0,0,0,0,'');
  employeePayrollItem: Payroll = new Payroll(0, '',0,0,0,'',0,'','',0,'',0,'',true);
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  SelempDesignation: any;
  SelCompetency: any;
  SelempSBUList: any;
  SelProject: any;
  addressNtest: any;
  otherDetailNtest: any;
  payrollNtest: any;
  employeeId:string ="";
  formData: FormData = new FormData();
  file: File;successMsg: string = "";
  path:string = '';
  todayDate: Date = new Date();
  visitorName: string = '';
  private trigger: Subject<void> = new Subject<void>();
  seconds: number;
  finYear = (new Date()).getFullYear();
  value="hello";
  selectedFiles: any = [];
  fileName: any;
  imageFile: string;
  empMList: any=[[]];
  visitorsList: any=[[]];
  typeOfVisitor: string='newvisit';
  visitorsList1: any;
  isSaved: boolean = false;
  currentUser: AuthData;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  private initDatatable(): void {
      let exampleId: any = jQuery('#userTable');
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
    console.log(this.path);
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if(chkaccess == true){
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUser = authData;
      console.log(chkaccess);
      this.typeOfVisitor = localStorage.getItem("categoryVMS");

      this.calendarItem.createdBy = this.currentUser.fkEmpId;
      
      console.log('visitorentry:'+this.typeOfVisitor);
      // this.getEvents();
      this.getEmpList();
      this.getVisitorsList();

    }
    else {
      console.log('unauthorized');
      this.router.navigate(["/unauthorized"]);
    }
  }

  ngOnDestroy(){
    localStorage.removeItem("categoryVMS");
  }
  getVisitorsList(){
    debugger;

    this.visitorsList1 = [];
    debugger;
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API ).then((data: any) => {
      debugger;
      // this.isLoading = false;
      if (data.length > 0) {
        this.visitorsList1 = data;
        this.visitorsList = [];
        console.log('visitor type:'+this.typeOfVisitor);
        if(this.typeOfVisitor == 'newvisit'||this.typeOfVisitor==null || this.typeOfVisitor==undefined){
        var todaydate = new Date();
    let formatedtodaydate:string = todaydate.getFullYear() + "-" +("00" + (todaydate.getMonth() + 1)).slice(-2) + "-" +
    ("00" + todaydate.getDate()).slice(-2) ;

    for(let e of this.visitorsList1){
    var d = new Date(e.date);

    let formateddate:string = d.getFullYear() + "-" +("00" + (d.getMonth() + 1)).slice(-2) + "-" +
    ("00" + d.getDate()).slice(-2) ;
      console.log(formateddate+', '+formatedtodaydate);
    if(formateddate == formatedtodaydate){
     this.visitorsList.push(e);
    }
        }

      }
      else{
        this.visitorsList = this.visitorsList1;
      }
      this.visitorsList.reverse();

      console.log('list length'+this.visitorsList.length);
      this.reInitDatatable();
    }
    }).catch(error => {
      // this.isLoading = false;
      this.visitorsList = [];
      this.visitorsList1 = [];
    });
  }


  keyPressNumber(evt){
    evt = (evt) ? evt : window.event;
   var charCode = (evt.which) ? evt.which : evt.keyCode;
   if (charCode > 32 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getEmpList(){
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.empMList = data;
        console.log(this.empMList);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.empMList = [];
    });
  }

  public triggerSnapshot(): void {
    this.seconds = 3;
    this.trigger.next();
    this.seconds = null;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  handleImage(webcamImage: WebcamImage) {
    // debugger;
    this.webcamImage = webcamImage;
    // var FileSaver = require('file-saver');
    var base64=webcamImage.imageAsBase64;
// Naming the image
const date = new Date().valueOf();
let text = '';
const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < 5; i++) {
   text += possibleText.charAt(Math.floor(Math.random() *    possibleText.length));
}
// Replace extension according to your media type
const imageName = date + '_' + text + '.jpeg';
// call method that creates a blob from dataUri
const imageBlob = this.dataURItoBlob(base64);
const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
console.log(imageFile);
this.imageFile = imageFile.name;
FileSaver.saveAs(imageFile);
}

dataURItoBlob(dataURI) {
  const byteString = window.atob(dataURI);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([int8Array], { type: 'image/jpeg' });
  return blob;
}

  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    // console.log(printContents);
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Visitor Pass</title>
          <link rel="stylesheet" type="text/css" href="src/styles.css" />
          <link rel="stylesheet" type="text/css" href="src/assets/bootstrap/css/bootstrap.min.css" />
          <style>
          html{
              zoom: 0.9;
              transform-origin: 90%;
          }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
}

  ngAfterViewInit() {
      this.initDatatable();

        // $('#dParentId').select2({
        //   placeholder: "Select an Employee",

        // });
        // $('body').on('shown.bs.modal', '.modal', function() {
        //   $(this).find('select').each(function() {
        //     var dropdownParent = $(document.body);
        //     if ($(this).parents('.modal.in:first').length !== 0)
        //       dropdownParent = $(this).parents('.modal.in:first');
        //     $(this).select2({
        //       dropdownParent: dropdownParent

        //     });
        //   });
        // });
      //   $('#dParentId').on('select2:opening select2:closing', function( event ) {
      //     var $searchfield = $(this).parent().find('.select2-search__field');
      //     $searchfield.prop('enabled', true);
      // });
  }


  getEvents() {
      this.errMsg = "";
      this.isLoading = true;
      this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API).then((data: any) => {
          this.isLoading = false;
          if (data.length > 0) {
              this.userList = data;
              // this.managerList = data;
              // this.reporting_managerList = data;
            this.reInitDatatable();

          }
      }).catch(error => {
          this.isLoading = false;
          this.userList = [];
      });
  }


isValid: boolean = false;
validatedForm: boolean = true;


closeSaveModal() {
////console.log('testpop')
jQuery("#myModal").modal('hide');
// this.getEvents();
this.getVisitorsList();
// window.location.reload();
}

  onImgFileChange(event: any) {
    this.errMsg = '';
    // debugger;
    this.formData = new FormData();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        //let file: File = fileList[0];
        this.file = fileList[0];
        this.formData.append("File", this.file);
        // if (this.file.type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === -1) {
        //     this.errMsg = " Select xlsx File Type to Upload";
        // }
        // else {
        //     //let formData: FormData = new FormData();
        //     this.formData.append("File", this.file);
        // }
    }
    //window.location.reload();
}
uploadCustInv() {
  // debugger;
 // this.sfields = { divid: this.divid, subdivid: this.sub_divid, formData: this.formData };
  let connection: any;
  //this.isLoading = true;
  // ////console.log('this.employeeId');
  // ////console.log(this.employeeId);
  connection = this.httpService.postforCustFileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, +this.employeeId, this.formData);
  connection.then((data: any) => {
   this.isLoading = false;
      if (data==200) {

      }
  }).catch(error => {

       this.errMsg = 'Error uploading file ..';
  });

}

onUpdateUser(isEdit: boolean, data: Employee){

}

openEntry(isEdit, data: Visitor){
  this.calendarItem = data;
  console.log(this.calendarItem);
  this.isEdit = isEdit;
  this.isSaved = false;
  this.selParentRole = this.empMList.find(s=>s.firstName == this.calendarItem.fkEmployeeName);
  jQuery("#myModal").modal('show');
}

rescheduleEntry(isEdit, data: Visitor){
  this.calendarItem = data;
  this.isEdit = isEdit;
  this.isSaved = false;
  this.selParentRole = this.empMList.find(s=>s.firstName == this.calendarItem.fkEmployeeName);
  console.log('reschedule:'+this.isEdit);
  jQuery("#myModal").modal('show');
}



completeVisit(user){

  this.calendarItem = user;
  this.calendarItem.isActive = false;
  var d = new Date();
  let toTime = ("00" + d.getHours()).slice(-2) + ":" +
  ("00" + d.getMinutes()).slice(-2) + ":" +
  ("00" + d.getSeconds()).slice(-2);
  this.calendarItem.toTime = toTime;
  let connection: any;
  connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
  connection.then((data: any) => {
    // this.isLoadingPop = false;
    if (data == 200 || data.id > 0) {
        // jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Appointment closed!';
        jQuery("#saveModal").modal('show');
        this.getVisitorsList();
    }
}).catch(error => {
    this.isLoadingPop = false;
    this.errMsgPop = 'Error saving Appointment data..';
});
}

onSaveEntry(){
  console.log(event);
  debugger;
  let connection: any;
  // if(!this.calendarList.some(s => s.fiscalYear === this.calendarItem.fiscalYear && s.id != this.calendarItem.id)){
  // if (!this.isEdit)
  // this.id = this.events[this.events.length - 1].id;
  // console.log("last id assigned:"+this.id);

  // this.calendarItem.fkEmployeeId = 827;

  // this.calendarItem.temp8 = (+this.id).toString();
  var d = new Date();

  let formateddate:string = d.getFullYear() + "-" +("00" + (d.getMonth() + 1)).slice(-2) + "-" +
  ("00" + d.getDate()).slice(-2) + " " +
  ("00" + d.getHours()).slice(-2) + ":" +
  ("00" + d.getMinutes()).slice(-2) + ":" +
  ("00" + d.getSeconds()).slice(-2);

  let fromTime = ("00" + d.getHours()).slice(-2) + ":" +
  ("00" + d.getMinutes()).slice(-2) + ":" +
  ("00" + d.getSeconds()).slice(-2);

  let formatedenddate:string = d.getFullYear() + "-" +("00" + (d.getMonth() + 1)).slice(-2) + "-" +
  ("00" + (d.getDate() )).slice(-2) + " " +
  ("00" + (d.getHours() + 1)).slice(-2) + ":" +
  ("00" + (d.getMinutes() )).slice(-2) + ":" +
  ("00" + d.getSeconds()).slice(-2);

  console.log(formateddate);
  console.log(this.selParentRole);

  // this.calendarItem.companyName =
  this.calendarItem.fkEmployeeId = this.selParentRole.id;
  this.calendarItem.fkEmployeeName = this.selParentRole.name;
 this.calendarItem.date = formateddate;
 this.calendarItem.endDateTime = formatedenddate;
 this.calendarItem.isPreShedualled = false;
 this.calendarItem.fromTime = fromTime;
 this.calendarItem.toTime = '';
 this.calendarItem.temp = this.imageFile;
 this.calendarItem.employeeEmail = this.selParentRole.email;
 this.calendarItem.fkEmployeeId = this.selParentRole.id;
 this.calendarItem.fkEmployeeName = this.selParentRole.firstName;
 this.calendarItem.isActive = true;
  // this.calendarItem.fkEmployeeName = this.visiting;
  // this.calendarItem.purpose = this.purpose;
  // this.calendarItem.name = this.visitorName;
  // this.calendarItem.mobile = this.mobile;
  // this.calendarItem.email = this.email;
  console.log(this.calendarItem);
  debugger;
  if(this.isEdit){
    // this.calendarItem.isActive = true;

  connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
  this.errMsgPop1 = 'Appointment updated!';
  }
  else{
    this.calendarItem.id = 0;
  connection = this.httpService.post(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem);
  this.errMsgPop1 = 'Appointment confirmed!';
  }
  connection.then((data: any) => {
      // this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          // this.errMsgPop1 = 'Appointment confirmed!';
          this.isSaved = true;
          jQuery("#saveModal").modal('show');
          this.getVisitorsList();
          // this.router.navigateByUrl('/welcome-page');
      }
  }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Appointment data..';
  });
}

}
