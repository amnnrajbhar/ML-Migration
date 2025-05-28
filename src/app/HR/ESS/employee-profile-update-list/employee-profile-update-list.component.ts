import { Component, OnInit } from '@angular/core';
import { CompleteEmployeeProfileTaskRequest } from '../CompleteEmployeeProfileTaskRequest.model.';
import { AuthData } from '../../../auth/auth.model';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { EmployeeProfileListFilter } from '../EmployeeProfileListFilter.model';
declare var $: any;
import swal from 'sweetalert';
import { ProfileListFilter } from './profilelistfilter.model';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-employee-profile-update-list',
  templateUrl: './employee-profile-update-list.component.html',
  styleUrls: ['./employee-profile-update-list.component.css']
})
export class EmployeeProfileUpdateListComponent implements OnInit {
  currentUser!: AuthData;
  urlPath: string = '';
  myTasks: any[] = [];
  isLoading: boolean = false;
  selectedType: any = "";
  selectedPlant: any = "";
  selectedPayGroup: any = "";
  selectedEmpCategory: any = "";
  selectedDepartment: any = "";
  selectedState: any = "";
  selectedLocation: any = "";
  taskId: number = 0;
  comments: string
  types = [{ type: "Employee Profile Approval" }];
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount = 0;
  filterModel: EmployeeProfileListFilter = {} as EmployeeProfileListFilter;
  filterProfile: any = {};
  statusList = [
    { type: "Submitted", color: "info" },
    { type: "Pending For Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
  ]
  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute, private dataStore: DataStorageService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.LoadDropDowns();
      this.filterModel.employeeId = this.currentUser.uid;
      this.getData();
    }
  }

  LoadDropDowns() {
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
    this.getState();
    this.getLocation();
    this.getDepartments();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }
  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }
  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }
  getPayGroupList() {
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });
      }
    }).catch((error)=> {
      this.payGroupList = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.empCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.empCategoryList = [];
    });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch((error)=> {
      this.stateList = [];
      this.filterModel.locationId = "";
    });
  }

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.locationList = [];
    });
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  onStateChange() {
    this.filterModel.locationId = "";
    //console.log(this.locationFullList);
    if (this.selectedState)
      this.locationList = this.locationFullList.filter((x:any)  => x.stateId == this.selectedState);
    console.log(this.locationList);
  }

  getDetails() {
    this.filterModel.selectedPlantId = this.selectedPlant;
    this.filterModel.selectedPayGroupId = this.selectedPayGroup;
    this.filterModel.selectedEmployeeCategoryId = this.selectedEmpCategory;
    this.filterModel.selectedDepartmentId = this.selectedDepartment;
    this.filterModel.selectedStateId = this.selectedState;
    this.filterModel.selectedLocationId = this.selectedLocation;
    this.filterModel.pageNo = 1;
    this.getData();
  }
  filterData: any = {};
  getData() {
    this.isLoading = true;
    // this.filterModel.pageNo = 1;  
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("ProfileList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  viewProfile(profileId: any) {
    let route = 'HR/Employee/update-view/' + profileId ;
    this.router.navigate([route]);
  }
  
  
  submitForApproval(id){        
    var request: any = {};
    request.profileId = id;      
    request.submittedById = this.currentUser.uid;
    toastr.info("Submitting for approval...");  
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_SUBMIT_FOR_APPROVAL, request)
    .then((data: any) => {
      if(data == 200 || data.success)
      { 
        this.getData();
        toastr.success("Successfully submitted for approval.");  
      }else if(!data.success){
        toastr.error(data.message); 
      }else
      toastr.error("Error occurred while submitting.");
    }).catch((error)=> {
      toastr.error(error);
    });    
}
}


