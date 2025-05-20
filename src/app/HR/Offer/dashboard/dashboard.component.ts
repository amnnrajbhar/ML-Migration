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
  selector: 'app-dashboard',
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
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.masterService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0)
    .then((data:any)=>{this.employeeCategoryList = data;});

    this.getOfferList();
  }

  
  getPayGroupList(){
    this.payGroupList = [];
    
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
    this.masterService.getPayGroupListAssigned(this.currentUser.uid, this.filterModel.PlantId)
    .then((data:any)=>{this.payGroupList = data;});
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
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_DASHBOARD_RESULT_BY_FILTER, this.filterModel).then((data: any) => {
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
    this.filterModel.StateId = "";
    this.filterModel.LocationId = "";
    this.filterModel.CreatedDateFrom = "";
    this.filterModel.CreateDateTo = "";
    this.filterModel.CreatedDateFrom = this.firstDay;
    this.filterModel.CreatedDateTo = this.currentDate;
    this.filterData = {};
    this.getData();
  }
}
