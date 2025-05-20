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
  selector: 'app-activity-report',
  templateUrl: './activity-report.component.html',
  styleUrls: ['./activity-report.component.css'],
  providers: [MasterDataService]
})
export class ActivityReportComponent implements OnInit {

  constructor(private masterService: MasterDataService, private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) { }

  currentUser: AuthData;
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

  statusList = [
    { type: "Entry In Progress", color: "info" },
    { type: "Details Submitted", color: "warning" },
    { type: "Joining Confirmed", color: "warning" },
    { type: "Pending Verification", color: "warning" },    
    { type: "Verified", color: "primary" },    
    { type: "Emp Code Generated", color: "primary" },
    { type: "Pending for Approval", color: "warning" },    
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Letter Sent", color: "success" },  
    { type: "Accepted", color: "success" },
    { type: "Not Accepted", color: "danger" },
    { type: "Withdrawn", color: "danger" },
    { type: "Updated", color: "info" },
  ]

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";

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
    this.masterService.getPayGroupListAssigned(this.currentUser.uid, this.filterModel.PlantId)
    .then((data:any)=>{this.payGroupList = data;});
  }

  getSubDepartmentList(){
    this.filterModel.SubDepartmentId = "";
    if(this.filterModel.DepartmentId > 0)
      this.subDepartmentList = this.subDepartmentFullList.filter(x=>x.departmentId == this.filterModel.DepartmentId);
    else 
      this.subDepartmentList = [];    
  }
  
  getLocationList(){
    this.filterModel.LocationId = "";
    if(this.filterModel.StateId > 0)
    {
    var selectedState = this.stateList.find(x => x.id == this.filterModel.StateId);
      this.locationList = this.locationFullList.filter(x=>x.stateId == selectedState.bland);
      }
    else 
      this.locationList = [];    
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
    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_ACTIVITY_REPORTS_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_ACTIVITY_REPORTS_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Offer ID": item.offerId,
          "Status": item.status,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub-Department": item.subDepartment,
          "Employee No": item.employeeNo,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),         
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName,          
          "Date of Joining": this.setDateFormate(item.joiningDate),
          "Offer Initiated Date": this.setDateFormate(item.offerCreatedDate),
          "Offer Approved Date": this.setDateFormate(item.offerApprovedDate),
          "Offer Released Date": this.setDateFormate(item.offerReleasedDate),
          "Appointment Creation Date": this.setDateFormate(item.appointmentCreatedDate),         
          "Submitted for Approval Date": this.setDateFormate(item.appointmentSubmittedDate),
          "Approved Date": this.setDateFormate(item.appointmentApprovedDate),
          "Released Date": this.setDateFormate(item.appointmentReleasedDate),
          "Accepted Date": this.setDateFormate(item.appointmentAcceptedDate),
          "Days for Appointment Release": item.daysForRelease,
          "Days for Offer to Appointment": item.daysForAppointment
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Activity_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }
  
  setDateFormate(date: any): string {
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }  
}
