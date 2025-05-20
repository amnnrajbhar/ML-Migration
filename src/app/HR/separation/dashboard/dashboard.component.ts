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
  selector: 'app-separation-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [MasterDataService]
})
export class DashboardComponent implements OnInit {

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
  currentDate:Date;
  firstDay : Date;
  
  
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

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  getListData(){
    if (this.filterModel.LeavingDateFrom ==null || this.filterModel.LeavingDateFrom == undefined)
    {
      toastr.error("Select Leaving Date From");
      return;
    }
    if (this.filterModel.LeavingDateTo ==null || this.filterModel.LeavingDateTo == undefined)
    {
      toastr.error("Select Leaving Date To");
      return;
    }
    this.filterModel.pageNo = 1;
    this.getData();    
  }
 
  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_GET_DASHBOARD_RESULT_BY_FILTER, this.filterModel).then((data: any) => {
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
    this.filterModel.Gender = "";
    this.filterModel.DateOfLeavingFrom = this.firstDay;
    this.filterModel.DateOfLeavingTo = this.currentDate;
    
    this.filterData = {};
    this.getData();
  }
}
