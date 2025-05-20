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
  selector: 'app-offer-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css'],
  providers: [MasterDataService]
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
  currentDate:Date;
  firstDay : Date;
  statusList = [
    { type: "Initial", color:"info" },
    { type: "Pre-joining Email Sent", color:"primary" },
    { type: "Pre-joining Completed", color:"success" },
    { type: "Pending For Approval", color:"info"},    
    { type: "Approved", color:"warning" },            
    { type: "Rejected", color:"danger" },        
    { type: "Pending For Exception Approval", color:"info"},    
    { type: "Exception Rejected", color:"danger" },        
    { type: "Exception Approved", color:"warning" },        
    { type: "Email Sent", color:"warning" },
    { type: "Accepted", color:"primary" },
    { type: "Not Accepted", color:"danger" },   
    { type: "Withdrawn", color:"danger" },
    { type: "Archived", color:"danger" }, 
  ]

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.groupBy = "Paygroup";

    this.currentDate = new Date();
    this.firstDay =new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    // initialize the filter model
    this.clear();

    this.masterService.getPlantListAssigned(this.currentUser.uid).then((data:any)=>{this.plantList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getSubDepartments().then((data:any)=>{this.subDepartmentFullList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getRole().then((data:any)=>{this.roleList = data;});    
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

  groupByList = [
    {type:"Paygroup", name: "Paygroup"},
    {type:"Paygroup/Department", name: "Department"},
    {type:"Paygroup/EmployeeCategory", name: "Employee Category"},
    {type:"Paygroup/State", name: "State"}
  ];

  getGroupByName(){
    return this.groupByList.find(x=>x.type ==this.filterModel.groupBy).name;
  }

  getOfferList() {    
    this.filterModel.pageNo = 1;
    if (this.filterModel.CreatedDateFrom ==null || this.filterModel.CreatedDateFrom == undefined)
    {
      toastr.error("Select Created From Date");
      return;
    }
    if (this.filterModel.CreatedDateTo ==null || this.filterModel.CreatedDateTo == undefined)
    {
      toastr.error("Select Created To Date");
      return;
    }
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
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_SUMMARY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;       
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  } 
  
  clear()
  {
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
    this.filterModel.CreatedDateFrom = "";
    this.filterModel.CreateDateTo = "";
    this.filterModel.ApprovedDateFrom = "";
    this.filterModel.ApprovedDateTo = "";
    this.filterModel.ReleaseDateFrom = "";
    this.filterModel.ReleaseDateTo = "";
    this.filterModel.AcceptedDateFrom = "";
    this.filterModel.AcceptedDateTo = "";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";
    this.filterModel.AcceptedDOJFrom = "";
    this.filterModel.AcceptedDOJTo = "";
    this.filterModel.CreatedDateFrom = this.firstDay;
    this.filterModel.CreatedDateTo = this.currentDate;
    this.filterData = {};

  }

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    var groupBy = this.filterModel.groupBy;
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_SUMMARY_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Pay Group": item.payGroup,
          "Group By": item.groupByText,
          " Offers Created": item.totalOffersCreated,
          " Offers Draft": item.totalOffersInDraft,
          " Offers Pending for Approval": item.totalOffersPendingForApproval,
          " Offers Approved": item.totalOffersApproved,
          " Offers Rejected": item.totalOffersRejected,
          " Offers Withdrawm": item.totalOffersWithdrawn,
          " Offers Released": item.totalOffersReleased,
          " Offers Accepted": item.totalOffersAccepted,
          " Offers Not-Accepted": item.totalOffersNotAccepted,
          " Offers Pending for Acceptance": item.totalOffersPendingAcceptance,
          " Joined": item.totalJoined,
          " Entry In Progress": item.totalEntryInProgress,
        };        
          exportList.push(exportItem);
      });
      let exportItem2={
        "Sl No":"",
        "Pay Group": "Total",
        "Group By": "",
        " Offers Created": data.grandTotalOffersCreated,
        " Offers Draft": data.grandTotalOffersInDraft,
        " Offers Pending for Approval": data.grandTotalOffersPendingForApproval,
        " Offers Approved": data.grandTotalOffersApproved,
        " Offers Rejected": data.grandTotalOffersRejected,
        " Offers Withdrawm": data.grandTotalOffersWithdrawn,
        " Offers Released": data.grandTotalOffersReleased,
        " Offers Accepted": data.grandTotalOffersAccepted,
        " Offers Not-Accepted": data.grandTotalOffersNotAccepted,
        " Offers Pending for Acceptance": data.grandTotalOffersPendingAcceptance,
        " Joined": data.grandTotalJoined,
        " Entry In Progress": data.grandTotalEntryInProgress,
      };        
        exportList.push(exportItem2);
      this.excelService.exportAsExcelFile(exportList, 'Offers_Summary'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }
  
}
