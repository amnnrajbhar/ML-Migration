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
  selector: 'app-offer-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css'],
  providers: [MasterDataService]
})
export class ReportListComponent implements OnInit {

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
  firstDay :Date;

  statusList = [
    { type: "Initial", color:"info" },
    { type: "Updated", color:"info" },
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
    // this.getData();
  }
  
  ngAfterViewInit() {
    this.toggleColumns();
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

  getOfferList() {
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
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
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
    this.filterModel.createdbyname = '';

    this.filterData = {};

  }
  
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Offer ID": item.offerId,
          "Status": item.status,
          "Joining Date":item.joiningDate,
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub-Department": "",
          "State": item.state,
          "Location": item.location,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "Qualification": item.qualification,
          "Experience": item.totalExperience,
          "Previous Salary": item.presentCTC,
          "Offered Salary": item.offeredSalary,
          "Created By": item.createdByName,
          "Created On": this.setDateFormate(item.createdDate),
          "Last Employer": item.presentEmployer,
          "Recruitment Type": item.recruitmentType,
          "Replacing Emp. No": item.replacingEmployeeNumber,
          "Replacing Emp. Name": item.replacingEmployeeName,         
          "Initiated Date": this.setDateFormate(item.createdDate),
          "Approved Date": this.setDateFormate(item.approvedDate),
          "Days for Approval": item.daysForApproval,
          "Released Date": this.setDateFormate(item.releasedDate),
          "Days for Release": item.daysForRelease,
          "Accepted Date": this.setDateFormate(item.acceptedDate),
          "Days for Acceptance": item.daysForAcceptance,
          "Tentative DOJ": this.setDateFormate(item.joiningDate),
          "Accepted DOJ": this.setDateFormate(item.acceptedDOJ)
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Offers_List'); 
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
