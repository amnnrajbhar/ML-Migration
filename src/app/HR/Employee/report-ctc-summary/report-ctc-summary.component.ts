import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-report-ctc-summary',
  templateUrl: './report-ctc-summary.component.html',
  styleUrls: ['./report-ctc-summary.component.css'],
  providers: [MasterDataService]
})
export class ReportCtcSummaryComponent implements OnInit {
  constructor(private masterService: MasterDataService, private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) { }

  currentUser!: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  stateList: any[] = [];
  locationFullList: any[] = [];
  locationList: any[] = [];
  departmentList: any[] = [];
  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  designationList: any[] = [];
  roleList: any[] = [];
  reportingGroupList: any[] = [];
  filterData: any = {};
  filterModel: any = {};
  isLoading: boolean = false;
  earningHeads: any[] = [];
  deductionHeads: any[] = [];
  reimbursementHeads: any[] = [];
  benefitHeads: any[] = []; 

  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Service Withdrawn", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ];

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;

    // initialize the filter model
    this.filterModel.PlantId = "";
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
    this.filterModel.DepartmentId = "";
    this.filterModel.SubDepartmentId = "";
    this.filterModel.DesignationId = "";
    this.filterModel.RoleId = "";
    this.filterModel.StateId = "";
    this.filterModel.LocationId = "";
    this.filterModel.ReportingGroupId = "";
    this.filterModel.Status = "";
    this.filterModel.Active = true;
    this.filterModel.Data = "Summary";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";    
    this.filterModel.DateOfLeavingFrom = "";
    this.filterModel.DateOfLeavingTo = "";

    this.masterService.getPlantListAssigned(this.currentUser.uid).then((data:any)=>{this.plantList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getSubDepartments().then((data:any)=>{this.subDepartmentFullList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getRole().then((data:any)=>{this.roleList = data;});
    this.masterService.getReportingGroups().then((data:any)=>{this.reportingGroupList = data;});
    this.masterService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0)
    .then((data:any)=>{this.employeeCategoryList = data;});
  }

  
  getPayGroupList(){
    this.payGroupList = [];
    
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
    this.masterService.getPayGroupListAssigned(this.currentUser.uid, this.filterModel.PlantId)
    .then((data:any)=>{this.payGroupList = data;});
  }


  getSubDepartmentList(){
    this.filterModel.SubDepartmentId = "";
    if(this.filterModel.DepartmentId > 0)
      this.subDepartmentList = this.subDepartmentFullList.filter((x:any)=>x.departmentId == this.filterModel.DepartmentId);
    else 
      this.subDepartmentList = [];    
  }
  
  getLocationList(){
    this.filterModel.LocationId = "";
    if(this.filterModel.StateId > 0)
    {
    var selectedState = this.stateList.find((x:any)  => x.id == this.filterModel.StateId);
      this.locationList = this.locationFullList.filter((x:any)=>x.stateId == selectedState.bland);
      }
    else 
      this.locationList = [];    
  }
  
  getAmount(i, headId){
    if(this.filterData.list[i].salaryHeads.some(x=>x.salaryHeadId == headId))
      return this.filterData.list[i].salaryHeads.find(x=>x.salaryHeadId == headId).annualAmount;
    else 
      return "";
  }

  onDataChange(){
    this.filterData = {};
  }

  getListData() {    
    this.filterModel.pageNo = 1;
    this.getData();    
  }

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  getData(){
    this.isLoading = true;    
    let conn;

    if(this.filterModel.Data == 'Summary')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_CTC_SUMMARY_REPORT_BY_FILTER, this.filterModel);

    else  if(this.filterModel.Data == 'Breakup')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_CTC_BREAKUP_REPORT_BY_FILTER, this.filterModel);
    
    conn.then((data: any) => {
      this.filterData= data;
      for(var item of this.filterData.list){

        if(this.statusList.some(x=>x.type == item.status))
          item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      
        if(this.filterModel.Data == 'Breakup'){                  
          this.earningHeads = [];
          this.deductionHeads= [];
          this.reimbursementHeads = [];
          this.benefitHeads = []; 

          for(var details of item.salaryHeads){
            if(details.salaryType=="I"){
              if(!this.earningHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.earningHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }      
            else if(details.salaryType=="D"){
              if(!this.deductionHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.deductionHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }    
            else if(details.salaryType=="R"){
              if(!this.reimbursementHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.reimbursementHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }    
            else if(details.salaryType=="B"){
              if(!this.benefitHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.benefitHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }          
          }
        }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }
  
  exportData(){
    if(this.filterModel.Data == 'Summary')
      this.exportSummaryData();

    else  if(this.filterModel.Data == 'Breakup')
    this.exportBreakupData();    
  }
  
  setDateFormate(date: any): string {
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }  
  
  exportSummaryData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_CTC_SUMMARY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Status": item.status,
          "Employee No": item.employeeNo,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),  
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub-Department": item.subDepartment,  
          "Reporting Group": item.reportingGroupName,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,  
          "Gender": item.Gender, 
          "Location": item.location,    
          "State": item.state,      
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "Highest Education": item.HighestEducation,
          "Total Experience": item.totalExperience,
          "Total CTC": item.totalCTC, 
          "Earnings": item.earnings, 
          "Deductions": item.deductions, 
          "Reimbursements": item.reimbursements, 
          "Annual Benefits": item.annualBenefits, 
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'CTC_Summary_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }
  
  exportBreakupData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_CTC_BREAKUP_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      for(var item of data.list){
        this.earningHeads = [];
        this.deductionHeads= [];
        this.reimbursementHeads = [];
        this.benefitHeads = []; 

          for(var details of item.salaryHeads){
            if(details.salaryType=="I"){
              if(!this.earningHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.earningHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }      
            else if(details.salaryType=="D"){
              if(!this.deductionHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.deductionHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }    
            else if(details.salaryType=="R"){
              if(!this.reimbursementHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.reimbursementHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }    
            else if(details.salaryType=="B"){
              if(!this.benefitHeads.some(x=>x.salaryHeadId == details.salaryHeadId)){
                this.benefitHeads.push(
                  {
                  salaryHeadId: details.salaryHeadId, 
                  salaryHeadName: details.salaryHeadName, 
                  frequency: details.frequency, 
                  salaryType: details.salaryType, 
                  sequenceNo: details.sequenceNo
                });
              }
            }
          }          
        }

      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Status": item.status,
          "Employee No": item.employeeNo,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),  
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub-Department": item.subDepartment,  
          "Reporting Group": item.reportingGroupName,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,  
          "Gender": item.Gender, 
          "Location": item.location,    
          "State": item.state,      
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "Highest Education": item.HighestEducation,
          "Total Experience": item.totalExperience,
          "Total CTC": item.totalCTC
          // "Earnings": item.earnings, 
          // "Deductions": item.deductions, 
          // "Reimbursements": item.reimbursements, 
          // "Annual Benefits": item.annualBenefits, 
        };
        for(var head of this.earningHeads){
          if(item.salaryHeads.some(x=>x.salaryHeadId == head.salaryHeadId))
          exportItem[head.salaryHeadName] = item.salaryHeads.find(x=>x.salaryHeadId == head.salaryHeadId).annualAmount;
        else 
          exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Earnings"] = item.earnings;
        for(var head of this.deductionHeads){
          if(item.salaryHeads.some(x=>x.salaryHeadId == head.salaryHeadId))
          exportItem[head.salaryHeadName] = item.salaryHeads.find(x=>x.salaryHeadId == head.salaryHeadId).annualAmount;
        else 
          exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Deductions"] = item.deductions;
        for(var head of this.reimbursementHeads){
          if(item.salaryHeads.some(x=>x.salaryHeadId == head.salaryHeadId))
          exportItem[head.salaryHeadName] = item.salaryHeads.find(x=>x.salaryHeadId == head.salaryHeadId).annualAmount;
        else 
          exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Reimbursements"] = item.reimbursements;
        for(var head of this.benefitHeads){
          if(item.salaryHeads.some(x=>x.salaryHeadId == head.salaryHeadId))
          exportItem[head.salaryHeadName] = item.salaryHeads.find(x=>x.salaryHeadId == head.salaryHeadId).annualAmount;
        else 
          exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Annual Benefits"] = item.annualBenefits;
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'CTC_Breakup_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

}
