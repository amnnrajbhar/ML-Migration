  import { AuthData } from './../../auth/auth.model';
  import { AppComponent } from './../../app.component';
  import { User } from './../../masters/user/user.model';
  import { APIURLS } from './../../shared/api-url';
  import { HttpService } from './../../shared/http-service';
  import { Component, OnInit } from '@angular/core';
  import { Assessment } from './assessment.model';
  import { HttpClientModule } from '@angular/common/http';
  import { Http, RequestOptions, Headers } from '@angular/http';
  import * as _ from "lodash";
  import { error } from '@angular/compiler/src/util';
  import { Employee } from '../employee/employee.model';
  import { Calendar } from '../calendar/calendar.model';
import { Router } from '@angular/router';
  declare var jQuery: any;

  @Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
  })
  export class AssesmentComponent implements OnInit {

  public tableWidget: any;
  assessList: any[];
  parentList: any[];
  employeeList: any[] = [[]];
  selParentRole: any;
  selCalYr: any;
  empItem: Employee = this.empItem = new Employee(0,	'',	'',	0,	0,		0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true,0,0,0);
  assessItem: Assessment = this.assessItem = new Assessment(0, '', '', 0,0,'',true, true, true, true, true, true,true, true, true,'',true, '' );
  calendarList: any[] = [[]];
  calendarItem: Calendar = this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
  isLoading: boolean = false;
  errMsg: string = "";
  calenderId: string="";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  constructor(private appService: AppComponent, private httpService: HttpService, private http:Http,  private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#assessment');
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
      this.getAssessList();
      this.getEmployeeList();
      this.getCalendarList();
      this.getFilteredList();
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  ngAfterViewInit() {
      this.initDatatable()
  }

  getEmployeeList(){
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      if (data.length >0) {
        this.employeeList = data;
        
        this.reInitDatatable();
      }
    });
  }
  getCalendarList(){
    this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
      if (data.length >0) {
        this.calendarList = data;
      }
    });
  }
  onAddAssess(isEdit: boolean, data: Assessment) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;

    if (this.isEdit) {
      this.assessItem = data;
      this.parentList = this.assessList.filter(s => s.isActive != false);
      this.calenderId = this.assessItem.fkCalendarId+'';
      this.selParentRole1 = this.employeeList.find(s => s.id === this.assessItem.fkEmpId);
      this.filteredName = this.selParentRole1.firstName+' ('+this.selParentRole1.employeeId+')';
      this.selCalYr = this.calendarList.find(s => s.id == this.calenderId);

    }
    else {
      this.parentList = this.assessList.filter(s => s.isActive != false);
      this.assessItem = new Assessment(0, '', '', 0,0,'',true, true, true, true, true, true,true, true, true,'',true,'' );
      this.empItem = new Employee(0,	'',	'',	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	0,	'',	0,	'',true, 0, 0,0);
      this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
      this.filteredName = "";
      this.selParentRole1 = [];
      this.selCalYr = null;
    }
    jQuery("#myModal").modal('show');
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

  getEmpName(id: number){
    var temp: any;
    temp = this.employeeList.find(s => s.id == id);
    var name = (typeof temp != 'undefined')? temp.firstName+ ' '+temp.lastName : '';
    return name;
  }
  getEmpId(id: number){
    var temp: any;
    temp = this.employeeList.find(s => s.id == id);
    var name = (typeof temp != 'undefined')? temp.employeeId: '';
    return name;
  }
  getEmpEmail(id: number){
    var temp: any;
    temp = this.employeeList.find(s => s.id == id);
    var name = (typeof temp != 'undefined')? temp.email: '';
    return name;
  }


  getCalName(id: number){
    var temp: any;
    temp = this.calendarList.find(s => s.id == id);
    var name = (typeof temp != 'undefined')? temp.fiscalYear : '';
    return name;
  }

  getAssessList() {
        this.httpService.get(APIURLS.BR_MASTER_ASSESMENT_DATA_API).then((data: any) => {
      this.isLoading = false;
      if (data.length >0) {
        this.assessList = data;
        // for(let des of this.assessList) {
        //   this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API,des.fkEmpId).then((datam:any) => {
        //   this.empItem = datam;
        //   this.assessList.find(s => s.fkEmpId === this.empItem.id)['fkEmpId'] = this.empItem.firstName;
        //  });  
        // }

        // for(let des of this.assessList) {
        //   this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API,des.fkCalendarId).then((datam:any) => {
        //   this.calendarItem = datam;
        //   this.assessList.find(s => s.fkCalendarId === this.calendarItem.id)['fkCalendarId'] = this.calendarItem.fiscalYear;
        //  });  
        // }

        this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.assessList = [];
    });
  }
  onSaveAssess() {
    // debugger;
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    
    this.assessItem.fkEmpId = (this.selParentRole1 != null)?this.selParentRole1.id : null;
    ////console.log(this.assessItem.fkEmpId);
    this.assessItem.fkCalendarId = this.selCalYr.id;
    
    let connection: any;
    if(this.assessItem.fkEmpId != null){
    // if(!this.assessList.some(s => s.name == this.assessItem.name && s.id != this.assessItem.id && s.fkEmpId == this.assessItem.fkEmpId)){ 
    if(!this.assessList.some(s => s.id != this.assessItem.id && s.fkEmpId == this.assessItem.fkEmpId && s.fkCalendarId == this.assessItem.fkCalendarId) ){ 
      this.assessItem.name="Assessment "+this.assessItem.fkEmpId;
      if (!this.isEdit){
        this.assessItem.employeePcpStatus = 'System Initiated';
        this.assessItem.isInitiatedBySystem = true;
        this.assessItem.isInitiatedByEmployee = false;
        this.assessItem.formStatus = false;
        this.assessItem.isApprovedByFirstLevel = false;
        this.assessItem.isApprovedBySecondLevel = false;
        this.assessItem.isApprovedByThirdLevel = false;
        this.assessItem.isApprovedByFourthLevel = false;
        this.assessItem.isApprovedByFifthLevel = false;
        connection = this.httpService.post(APIURLS.BR_MASTER_ASSESMENT_API, this.assessItem);
      }
      else
        connection = this.httpService.put(APIURLS.BR_MASTER_ASSESMENT_API, this.assessItem.id, this.assessItem);
        
        connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id>0) {
          let type="AppraisalInitiation";this.httpService.sendmail(APIURLS.BR_MASTER_SENDEMAIL_API,this.assessItem.fkEmpId,type).then((dataemail:any) =>{ if (dataemail==200) { }});
         // let type1="UserCreation";this.httpService.sendmail(APIURLS.BR_MASTER_SENDEMAIL_API,this.assessItem.fkEmpId,type1).then((dataemail:any) =>{ if (dataemail==200) { }});
         jQuery("#myModal").modal('hide');
          //this.getAssessList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Assessment data..';
      });
      
      
    }

  else{
    this.isLoadingPop = false;
    this.errMsgPop = 'Assessment already exists..';
  }}
  else{
    this.isLoadingPop = false;
    this.selectedName=false;
    this.errMsgPop = 'Select an Appraisee';
  }
  }
 filteredEmployee: any[]=[];
 selectedName = false;
 filteredName: string ;
 selParentRole1: any;

  complete(str){
    
    var output=[];

    this.employeeList.forEach( element =>{
    if(element.firstName.toLowerCase().indexOf(str.toLowerCase())>=0 || element.employeeId.toLowerCase().indexOf(str.toLowerCase())>=0){
        output.push(element);
      }
    });
    this.filteredEmployee=output;
  
    
  }
  fillTextbox(str){
    if(str.length<=0)
      this.getFilteredList();
    else{
      this.filteredName=str.firstName+' ('+str.employeeId+')';
      this.filteredEmployee=null;
      this.selectedName=false;
    }
  }
  getFilteredList(){
    // debugger;
    if(this.filteredEmployee)
     this.filteredEmployee.pop();
    this.employeeList.forEach(element => {
      this.filteredEmployee.push(element);
    });
  }
  }
