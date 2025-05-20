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
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
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
  filterData: any = {};
  filterModel: any = {};
  isLoading: boolean = false;
  reportingGroupsList:any[] = [];

  confirmationStatusList = [{ type: "Confirmed" }, { type: "Due For Confirmation" }];
  statusList = [
    { type: "Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Confirmation Approved", color: "success" },
    { type: "Confirmation Rejected", color: "danger" },
    { type: "Pending for Extension Approval", color: "warning" },
    { type: "Extension Approved", color: "success" },
    { type: "Extension Rejected", color: "danger" },
    { type: "Email Sent", color: "success" },
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

    this.filterModel.Status = "";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";
    this.filterModel.ConfirmationDueFrom = "";
    this.filterModel.ConfirmationDueTo = "";
    this.filterModel.ReportingGroupId = "";
    this.filterModel.ConfirmationStatus = "";

    this.masterService.getPlantListAssigned(this.currentUser.uid).then((data:any)=>{this.plantList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getSubDepartments().then((data:any)=>{this.subDepartmentFullList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getRole().then((data:any)=>{this.roleList = data;});
    //this.masterService.getReportingGroups().then((data:any)=>{this.roleList = data;});
    this.getReportingGroups();
    this.masterService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0)
    .then((data:any)=>{this.employeeCategoryList = data;});
  }
  
  ngAfterViewInit() {
    this.toggleColumns();
  }

  getReportingGroups(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_REPORTING_GROUPS).then((data: any) => {
      if (data.length > 0) {
        this.reportingGroupsList = data.sort((a, b) => { if (a.reportingGroupLt > b.reportingGroupLt) return 1; if (a.reportingGroupLt < b.reportingGroupLt) return -1; return 0; });
      }
      ;
    }).catch(error => {
      this.reportingGroupsList = [];
    });
  }
  
  getPayGroupList(){
    this.payGroupList = [];
    this.employeeCategoryList = [];
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
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

  getConfirmationList() {
    
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
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_SUMMARY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  
  toggleColumns() {
    $(".columnGroup").on("click", function () {
      var group = $(this).attr("data-group");
      if (group == "all") {
        $(".columnGroup").removeClass('active').addClass('active');
        $("#data th, #data td").show();
      }
      else {
        $(this).toggleClass('active');
        $("#data ." + group).toggle();
      }
    });
  }

  
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_SUMMARY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Plant": item.plant,
          "Pay Group": item.payGroup,
          "Employee Category": item.employeeCategory,
          "Total": item.total,
          "Confirmed": item.confirmed,
          "Probationary": item.probationary,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Confirmation_Summary'); 
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
