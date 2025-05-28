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
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css'],
  providers: [MasterDataService]
})
export class ReportListComponent implements OnInit {

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
  filterDataDetails: any = {};
  filterModel: any = {};
  isLoading: boolean = false;

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
    this.filterModel.Data = "Details";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";    
    this.filterModel.DateOfLeavingFrom = "";
    this.filterModel.DateOfLeavingTo = "";
    this.filterModel.name = "";


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

  onDataChange(){
    this.filterDataDetails = {};
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

    if(this.filterModel.Data == 'Details')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_REPORT_BY_FILTER, this.filterModel);

    else  if(this.filterModel.Data == 'Experience')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_EXPERIENCE_REPORT_BY_FILTER, this.filterModel);
    
    else  if(this.filterModel.Data == 'Family')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_FAMILY_REPORT_BY_FILTER, this.filterModel);

    else  if(this.filterModel.Data == 'Education')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_EDUCATION_REPORT_BY_FILTER, this.filterModel);

    else  if(this.filterModel.Data == 'Statutory')
      conn = this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_STATUTORY_REPORT_BY_FILTER, this.filterModel);

    conn.then((data: any) => {
      this.filterDataDetails = data;
      for(var item of this.filterDataDetails.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }
  
  exportData(){
    if(this.filterModel.Data == 'Details')
      this.exportDetails();

    else  if(this.filterModel.Data == 'Experience')
      this.exportExperienceDetails();
    
    else  if(this.filterModel.Data == 'Family')
      this.exportFamilyDetails();

    else  if(this.filterModel.Data == 'Education')
      this.exportEducationDetails();

    else  if(this.filterModel.Data == 'Statutory')
      this.exportStatutoryDetails();
  }
  
  setDateFormate(date: any): string {
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }  

  exportDetails(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Employee Type": item.employmentType,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "Designation": item.designation,
          "Role": item.role,
          "Grade": item.grade,
          "Band": item.band,
          "Department": item.department,
          "Sub-Department": item.subDepartment,   
          "Reporting Group": item.reportingGroupName, 
          "Plant Code": item.plantCode,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "Gender": item.gender,
          "Date of Birth": this.setDateFormate(item.dateOfBirth),
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "State": item.state,
          "Location": item.location, 
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName, 
          "Mobile No": item.mobileNo,
          "Personal Email ID": item.personalEmailId,
          "Highest Education": item.HighestEducation,
          "Total Experience": item.totalExperience,
          "Present Company Experience": item.tenure,
          "Age": item.age,
          "PAN No": item.panNo,
          "Aadhar No": item.aadharNo,
          "Official Email ID": item.officialEmailId,
          "Marital Status": item.maritalStatus,
          "No of Children": item.noOfChildren,
          "Date of Leaving":this.setDateFormate(item.dateOfLeaving)
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Details_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }

  exportExperienceDetails(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_EXPERIENCE_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "Current Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "Industry": item.industryName,
          "Employer": item.workExperienceEmployer, 
          "City": item.workExperienceCity,
          "Contry": item.workExperienceCountryName,
          "Designation": item.workExperienceDesignation,
          "Job Role": item.workExperienceJobRole,
          "From Date": this.setDateFormate(item.workExperienceFromDate),
          "To Date": this.setDateFormate(item.workExperienceToDate),
          "Last Company": item.currentCompany ? "Yes" : "No",
          "Is Micro Lab": item.isMicroLab,
          "Old Employee No": item.oldEmployeeNumber
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Experience_Details_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }

  exportFamilyDetails(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_FAMILY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "Relationship": item.relationshipType,
          "Relation Name": item.familyFirstName, 
          "Gender": item.familyGender,
          "Occupation": item.familyOccupation,
          "Date of Birth": this.setDateFormate(item.familyBirthDate),
          "Mobile No": item.familyMobileNumber,
          "Email ID": item.familyEmailAddress,
          "Blood Group": item.familyBloodGroup,
          "Is Dependant": item.familyIsDependent,
          "Is Micro Lab Employee": item.familyIsEmployee,
          "Emp. No": item.familyEmployeeNumber
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Family_Details_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }

  exportEducationDetails(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_EDUCATION_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "Education Level": item.educationLevel,
          "Course": item.course, 
          "Specialisation": item.specialisation,
          "University": item.university,
          "City": item.city,
          "State": item.educationStateName,
          "Country": item.educationCountryName,
          "Duration": item.durationofCourse,
          "Year of Passing": item.yearOfPassing,
          "Full/Part Time": item.fullorPartTime,
          "Percentage": item.percentage
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Education_Details_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }

  exportStatutoryDetails(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_LIST_STATUTORY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Date of Joining": this.setDateFormate(item.dateOfJoining),
          "UAN No": item.uanNo,
          "PF No": item.pfNo, 
          "ESI No": item.esiNo,
          "Bank": item.bankName +" "+ (item.branchName == null ? "":item.branchName),
          "Account No": item.accountNo,
          "IFSC Code": item.ifscCode,
          "Date Of Birth":item.dateOfBirth,
          "Marital Status":item.maritalStatus,  
          "Gender":item.gender,                       
          "Pan No":item.panNo,
          "Adhar No":item.adharNo

        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Statutory_Details_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }

  exportDependencyData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_DEPENDENCY_GET_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),    
          "DOB": this.setDateFormate(item.dateOfBirth),
          "DOJ": this.setDateFormate(item.dateOfJoining),
          "Gender": item.gender,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "State": item.state,
          "Location": item.location, 
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Mobile No": item.mobileNo,
          "Personal Email ID": item.personalEmailId,         
          "Marital Status": item.maritalStatus,
          "No of Children": item.noOfChildren,
          "Dependent Relationship Type":item.dependentRelationshipType,
          "Dependent Name": item.dependentFirstName +" "+(item.dependentMiddleName == null ? "":item.dependentmiddleName) + ' '+ (item.dependentLastName == null ? "" : item.dependentLastName),    
          "Dependant Gender":item.dependentGender,
          "Dependant DOB":this.setDateFormate(item.dependentBirthDate)
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_Dependency_Report'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });   
  }
}
