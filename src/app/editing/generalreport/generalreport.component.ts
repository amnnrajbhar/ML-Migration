import { AuthData } from './../../auth/auth.model';
import { AppComponent } from './../../app.component';
import { User } from './../../masters/user/user.model';
import { APIURLS } from './../../shared/api-url';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';

import { Router } from '@angular/router';
import { Assessment } from '../../masters/assesment/assessment.model';
import { Employee } from '../../masters/employee/employee.model';
import { Calendar } from '../../masters/calendar/calendar.model';
import { ExcelService } from '../../shared/excel-service';

declare var jQuery: any;


@Component({
  selector: 'app-generalreport',
  templateUrl: './generalreport.component.html',
  styleUrls: ['./generalreport.component.css']
})
export class GeneralreportComponent implements OnInit {

  public tableWidget: any;
  filteredEmployee: any[]=[[]];
  assessList: any[] = [[]];
  exportList: any[] = [[]];
  managerList: any[] = [[]];
  repmanagerList: any[] = [[]];
  competencyList: any[] = [[]];
  sbuList: any[] = [[]];
  parentList: any[] = [[]];
  employeeList: any[] = [[]];
  selParentRole: any;
  selCalYr: any;
  empItem: Employee = new Employee(0,  '', '', 0,  0,    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  '', '', '', '', '', '', '', 0,  '', '', 0,  '', 0,  '',true,0,0,0);
  assessItem: Assessment =  new Assessment(0, '', '', 0,0,'',true, true, true, true, true, true,true, true, true,'',true, '' );
  calendarList: any[] = [[]];
  calendarItem: Calendar =  new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
  isLoading: boolean = false;
  errMsg: string = "";
  calenderId: string="";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  employeeOtherList: any[]=[[]];
  employeePayroll: any[]=[[]];
  overallRatingList: any[]=[[]];
  recommDetailsList: any[] = [[]];
  projectList: any[] = [[]];
  designationList: any[] = [[]];
  constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient,  private router: Router, private excelService:ExcelService) { }

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
    this.isLoading = true;
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if(chkaccess == true){
      //console.log(chkaccess);
      this.getAssessList();
    this.getEmployeeList();
    this.getEmployeeOtherList();
    this.getEmployeePayroll();
    this.getCalendarList();
    this.getFilteredList();
    this.getCompetencyList();
    this.getDesignationList();
    this.getRecommDetailsList();
    this.getSBUList();
    this.getProjectList();
    this.getOverallRating();
    this.isLoading = false;
    // }
    // else 
    //   this.router.navigate(["/unauthorized"]);
  }
  getEmployeeList(){
    this.httpService.get(APIURLS.BR_EMPLOYEEMASTER_API_GET).then((data: any) => {
      if (data.length >0) {
        this.employeeList = data;
        this.managerList = data;
        this.repmanagerList = data;
        console.log(data);
        this.reInitDatatable();
      }
    });
  }
  getEmployeeOtherList(){
    this.httpService.get(APIURLS.BR_MASTER_EMPLOYEEOTHERDETAILS_GET_API).then((data: any) => {
      if (data.length >0) {
        this.employeeOtherList = data;
        this.reInitDatatable();
      }
    });
  }
  getDesignationList(){
    this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
      if (data.length >0) {
        this.designationList = data;
        console.log(data);
        this.reInitDatatable();
      }
    });
  }
  getProjectList(){
    this.httpService.get(APIURLS.BR_MASTER_PROJECTMASTER_API).then((data: any) => {
      if (data.length >0) {
        this.projectList = data;
        console.log(data);
        this.reInitDatatable();
      }
    });
  }
  getEmployeePayroll(){
    this.httpService.get(APIURLS.BR_MASTER_EMPLOYEEPAYROLL_API_ALL).then((data: any) => {
      if (data.length >0) {
        this.employeePayroll = data;
        console.log(data);
        this.reInitDatatable();
      }
    });
  }
  getOverallRating(){
    this.httpService.get(APIURLS.BR_DETAILS_OVERALLRATING_API).then((data: any) => {
      if (data.length >0) {
        this.overallRatingList = data;
        this.reInitDatatable();
      }
    });
  }
  getRecommDetailsList(){
    this.httpService.get(APIURLS.BR_DETAIL_APPRAISAL_API).then((data: any) => {
      if (data.length >0) {
        this.recommDetailsList = data;
        console.log(this.recommDetailsList);
        this.reInitDatatable();
      }
    });
  }
  getFilteredList(){
    // debugger;
    if(this.filteredEmployee)
     this.filteredEmployee.pop();
    this.employeeList.forEach((element:any)=> {

      this.filteredEmployee.push(element);
      this.reInitDatatable();
    });
  }
  getEmpCompetency(id: number){
    var temp: any;
    var temp1: any;
    var temp2: any;
    temp = this.employeeList.find(s=>s.id==id);
    temp1 = (typeof temp != 'undefined')?this.competencyList.find((s:any) => s.id == temp.fkCompetency):'';
    temp2 = (typeof temp1 != 'undefined')?this.employeeList.find((s:any) => s.id == temp1.fkHeadEmpId):'';
    var name = (typeof temp2 != 'undefined')? temp2.email : '';
    return name;
  }
  getEmpSBU(id: number){
    var temp: any;
    var temp1: any;
    var temp2: any;
    temp = this.employeeList.find(s=>s.id==id);
    temp1 = (typeof temp != 'undefined')?this.sbuList.find((s:any) => s.id == temp.fkSbuId):'';
    temp2 = (typeof temp1 != 'undefined')?this.employeeList.find((s:any) => s.id == temp1.headEmpId):'';
    var name = (typeof temp2 != 'undefined')? temp2.email : '';
    return name;
  }
   getLocation(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.baseLocation: '';
    return name;
  }
  getCompetencyHead(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp2 = (typeof temp != 'undefined')? this.competencyList.find((s:any) => s.id == temp.fkCompetency): '';
    var temp1 = (typeof temp2!= 'undefined')? this.employeeList.find(s=>s.id == temp2.fkHeadEmpId):'';
    var name = (typeof temp1!= 'undefined')? temp1.firstName+ ' '+temp1.lastName : '';
    return name;
  }
  getCompetency(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp2 = (typeof temp != 'undefined')? this.competencyList.find((s:any) => s.id == temp.fkCompetency): '';
    // var temp1 = (typeof temp2!= 'undefined')? this.employeeList.find(s=>s.id == temp2.fkHeadEmpId):'';
    var name = (typeof temp2!= 'undefined')? temp2.name : '';
    return name;
  }
  getSBU(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp2 = (typeof temp != 'undefined')? this.sbuList.find((s:any) => s.id == temp.fkSbuId): '';
    // var temp1 = (typeof temp2!= 'undefined')? this.employeeList.find(s=>s.id == temp2.fkHeadEmpId):'';
    var name = (typeof temp2!= 'undefined')? temp2.name : '';
    return name;
  }
  getPrevAppDue(id: number){
    var temp: any;
    var temp1 = this.employeeList.find((s:any) => s.id == id);
    temp = (typeof temp1 != 'undefined')? this.employeePayroll.find((s:any) => s.employeeId == temp1.employeeId):'';
    var name = (typeof temp != 'undefined')? temp.previousAppraisalDate: '';
    return name;
  }
    
  getCurrentProject(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp1 = (typeof temp != 'undefined')? this.projectList.find(s=>s.id == temp.fkProjectId): '';
    var name = (typeof temp1 != 'undefined')? temp1.name: '';
    return name;
  }
  getRemarks(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.comments: '';
    return name;
  }
  getSecRemarks(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.managerComments: '';
    return name;
  }
  getSubSbuRemarks(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.compentcyComments: '';
    return name;
  }
  getSbuRemarks(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.sbuComments: '';
    return name;
  }
  getSBUHead(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp2 = (typeof temp != 'undefined')? this.sbuList.find((s:any) => s.id == temp.fkSbuId): '';
    var temp1 = (typeof temp2!= 'undefined')? this.employeeList.find(s=>s.id == temp2.headEmpId):'';
    var name = (typeof temp1!= 'undefined')? temp1.firstName+ ' '+temp1.lastName : '';
    return name;
  }

  getTotalRelExp(id: number){
    var temp: any;
    temp = this.employeeOtherList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.relativeExp: '';
    return name;
  }
  getQual(id: number){
    var temp: any;
    temp = this.employeeOtherList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.qualification: '';
    return name;
  }
  getYOP(id: number){
    var temp: any;
    temp = this.employeeOtherList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.yearOfPassing: '';
    return name;
  }
  getSkills(id: number){
    var temp: any;
    temp = this.employeeOtherList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.softSkill: '';
    return name;
  }
  getPerfBonus(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.variableHike: '';
    return name;
  }
  getvarInc(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.variableIncentive: '';
    return name;
  }

  getTotalHike(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.recommendationHike : '';
    return name;
  }
  getFixedHike(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.fixedHike: '';
    return name;
  }
  getPromotion(id: number){
    var temp: any;
    temp = this.recommDetailsList.find((s:any) => s.fkEmpId == id);
    var temp1 = (typeof temp != 'undefined')?  this.designationList.find((s:any) => s.id == temp.fkRecommendationDesignation):'';
    var name = (typeof temp1 != 'undefined')? temp1.name: '';
    return name;
  }
  getCurrentStatus(id: number){
    var temp: any;
    var temp1 = this.employeeList.find((s:any) => s.id == id);
    temp = (typeof temp1 != 'undefined')? this.employeePayroll.find((s:any) => s.employeeId == temp1.employeeId):'';
    var name = (typeof temp != 'undefined')? temp.currentWorkStatus: '';
    return name;
  }
  getBillingRate(id: number){
    var temp: any;
    var temp1 = this.employeeList.find((s:any) => s.id == id);
    temp = (typeof temp1 != 'undefined')? this.employeePayroll.find((s:any) => s.employeeId == temp1.employeeId):'';
    var name = (typeof temp != 'undefined')? temp.billingRate: '';
    return name;
  }
  getAppDue(id: number){
    var temp: any;
    var temp1 = this.employeeList.find((s:any) => s.id == id);
    temp = (typeof temp1 != 'undefined')? this.employeePayroll.find((s:any) => s.employeeId == temp1.employeeId):'';
    var name = (typeof temp != 'undefined')? temp.appraisalDueDate: '';
    return name;
  }
  getCurrentCTC(id: number){
    var temp: any;
    var temp2: any;
    temp2 = this.employeeList.find(s=> s.id == id);
    temp = (typeof temp2 != 'undefined')?this.employeePayroll.find((s:any) => s.employeeId == temp2.employeeId):'';
    // let totalCTC=+temp.currentAnnualCtc+ +temp.fixedCtc+ +temp.veriablePay;
    var name = (typeof temp != 'undefined')? temp.fixedCtc: '';
    return name;
  }
  getPerformanceBon(id: number){
    var temp: any;
    var temp2: any;
    temp2 = this.employeeList.find(s=> s.id == id);
    temp = (typeof temp2 != 'undefined')?this.employeePayroll.find((s:any) => s.employeeId == temp2.employeeId):'';
    // let totalCTC=+temp.currentAnnualCtc+ +temp.fixedCtc+ +temp.veriablePay;
    var name = (typeof temp != 'undefined')? temp.veriablePay: '';
    return name;
  }
  getTotalCTC(id: number){
    var temp: any;
    var temp2: any;
    temp2 = this.employeeList.find(s=> s.id == id);
    temp = (typeof temp2 != 'undefined')?this.employeePayroll.find((s:any) => s.employeeId == temp2.employeeId):'';
    // let totalCTC=+temp.currentAnnualCtc+ +temp.fixedCtc+ +temp.veriablePay;
    var name = (typeof temp != 'undefined')?  +temp.fixedCtc+ +temp.veriablePay : '';
    return name;
  }
  getAvgScore(id: number){
    var temp: any;
    temp = this.overallRatingList.find((s:any) => s.fkAssesmentId == id);
    var name = (typeof temp != 'undefined')? +temp.rating : '';
    return name;
  }
  getSelfScore(id: number){
    var temp: any;
    temp = this.overallRatingList.find((s:any) => s.fkAssesmentId == id);
    var name = (typeof temp != 'undefined')? +temp.ratingEmp : '';
    return name;
  }
  getSMART(id: number){
    var temp: any;
    temp = this.overallRatingList.find((s:any) => s.fkAssesmentId == id);
    var te = (typeof temp != 'undefined')? +temp.rating : '';
    var name='';
    if(te>4 && te<=5)
    name = 'Star';
    else if((te>3 && te<=4))
    name = 'Meritorious';
    else if((te>2 && te<=3))
    name= 'Achiever';
    else if((te>1 && te<=2))
    name = 'Reasonable';
    else if((te>0 && te<=1))
    name = 'Trailer';
    return name;
  }
  getCurrentDesignation(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var temp1 = (typeof temp != 'undefined')? this.designationList.find((s:any) => s.id == temp.fkDesignation): '';
    var name = (typeof temp1 != 'undefined')? temp1.name: '';
    return name;
  }
  getTotalExp(id: number){
    var temp: any;
    temp = this.employeeOtherList.find((s:any) => s.fkEmpId == id);
    var name = (typeof temp != 'undefined')? temp.yearExp: '';
    return name;
  }
  getCompetencyList(){
    this.httpService.get(APIURLS.BR_COMPETENCY).then((data: any) => {
      if (data.length >0) {
        this.competencyList = data;
      }
    });
  }
  getSBUList(){
    this.httpService.get(APIURLS.BR_MASTER_SBU_All).then((data: any) => {
      if (data.length >0) {
        this.sbuList = data;
        console.log(data);
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
  
  getEmpName(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.firstName+ ' '+temp.lastName : '';
    return name;
  }
  getEmpId(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.employeeId: '';
    return name;
  }
  getEmpDoj(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.joiningDate: '';
    return name;
  }
  getEmpEmail(id: number){
    var temp: any;
    temp = this.employeeList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.email: '';
    return name;
  }

  
exportAsXLSX():void {
  this.exportList=[];
  //var templist=this.assessList.length;
  debugger;
  for(var i=0; i<=this.assessList.length-1;i++)
  {
    
    var expListItem={SNo:i+1, EmpName: this.getEmpName(this.assessList[i].fkEmpId), EmpId: this.getEmpId(this.assessList[i].fkEmpId), 
      RManager:this. getEmpReportingMgr(this.assessList[i].fkEmpId), Manager:this.getEmpManager(this.assessList[i].fkEmpId), Competency: this.getCompetency(this.assessList[i].fkEmpId), Qual: this.getQual(this.assessList[i].fkEmpId), YOP: this.getYOP(this.assessList[i].fkEmpId), 
      CompetencyHead:this.getCompetencyHead(this.assessList[i].fkEmpId),  SBU:this.getSBU(this.assessList[i].fkEmpId),
      SBUHead: this.getSBUHead(this.assessList[i].fkEmpId),
      CurrentDesignation:this.getCurrentDesignation(this.assessList[i].fkEmpId),  RecommDesignation:this.getPromotion(this.assessList[i].fkEmpId),
       Fixedhike:this.getFixedHike(this.assessList[i].fkEmpId),
      PerfBonus:this.getPerfBonus(this.assessList[i].fkEmpId), VariableInc:this.getvarInc(this.assessList[i].fkEmpId), RecommHike: this.getTotalHike(this.assessList[i].fkEmpId)
     };
    
    this.exportList.push(expListItem);
    console.log('export list'+this.exportList);
  }

  //this.exportList = {  }
  
  
  this.excelService.exportAsExcelFile(this.exportList, 'GeneralReport');
}

getEmpManager(id: number){
  var temp: any;
  var temp1: any;
  temp = this.employeeList.find(s=>s.id==id);
  temp1 = (typeof temp != 'undefined')?this.managerList.find((s:any) => s.id == temp.fkManager):'';
  var name = (typeof temp1 != 'undefined')? temp1.email : '';
  return name;
}
getEmpReportingMgr(id: number){
  var temp: any;
  var temp1: any;
  temp = this.employeeList.find(s=>s.id==id);
  temp1 = (typeof temp != 'undefined')?this.repmanagerList.find((s:any) => s.id == temp.fkReportingManager):'';
  var name = (typeof temp1 != 'undefined')? temp1.email : '';
  return name;
}
// getEmpCompetency(id: number){
//   var temp: any;
//   var temp1: any;
//   temp = this.employeeList.find(s=>s.id==id);
//   temp1 = this.competencyList.find((s:any) => s.id == temp.fkCompetency);
//   var name = (typeof temp1 != 'undefined')? temp1.email : '';
//   return name;
// }
// getEmpSBU(id: number){
//   var temp: any;
//   var temp1: any;
//   temp = this.employeeList.find(s=>s.id==id);
//   temp1 = this.sbuList.find((s:any) => s.id == temp.fkSbuId);
//   var name = (typeof temp1 != 'undefined')? temp1.email : '';
//   return name;
// }

  getCalName(id: number){
    var temp: any;
    temp = this.calendarList.find((s:any) => s.id == id);
    var name = (typeof temp != 'undefined')? temp.fiscalYear : '';
    return name;
  }
  getAssessList() {
    this.httpService.get(APIURLS.BR_MASTER_ASSESMENT_DATA_API).then((data: any) => {
  this.isLoading = false;
  if (data.length >0) {
    this.assessList = data;
    console.log(this.assessList);
    // for(let des of this.assessList) {
    //   this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API,des.fkEmpId).then((datam:any) => {
    //   this.empItem = datam;
    //   this.assessList.find((s:any) => s.fkEmpId === this.empItem.id)['fkEmpId'] = this.empItem.firstName;
    //  });  
    // }

    // for(let des of this.assessList) {
    //   this.httpService.getById(APIURLS.BR_MASTER_CALENDAR_INSERT_API,des.fkCalendarId).then((datam:any) => {
    //   this.calendarItem = datam;
    //   this.assessList.find((s:any) => s.fkCalendarId === this.calendarItem.id)['fkCalendarId'] = this.calendarItem.fiscalYear;
    //  });  
    // }

    this.reInitDatatable();
  }
}).catch((error)=> {
  this.isLoading = false;
  this.assessList = [];
});
}

}
