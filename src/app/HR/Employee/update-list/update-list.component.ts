import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-update-list',
  templateUrl: './update-list.component.html',
  styleUrls: ['./update-list.component.css']
})
export class UpdateListComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService) { }

  currentUser: AuthData;
  transferId: any;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantlist:any[]=[];
  payGroupList:any[]=[];
  employeeCategoryList:any[]=[];
  
  comments: string;
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Service Withdrawn", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ]
  profileStatusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Rejected", color:"danger" },    
    { type: "Withdrawn", color:"danger" },    
  ];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.designationId ="";
    this.filterModel.stateId="";
    this.filterModel.locationId="";
    this.filterModel.plantId="";
    this.filterModel.payGroupId="";
    this.filterModel.employeeCategoryId="";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.active = true;

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("EmployeeUpdateList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }    
    this.filterModel.employeeId = this.currentUser.uid;    
    
    this.getAllDropDownValues();
    this.getData();    
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }
  
  getEmployeeList() { 
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getAllDropDownValues() {
    
   this.getDepartments();
    this.getRole();
    this.getDesignation();
    this.getState();
     this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
  }


  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.plantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
    }
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.designationList = [];
    });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  departmentList:any[]=[];
  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.TEMPORARY_EMPLOYEE_GET_EMPLOYEE_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      console.log(data);
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find(x => x.type == item.status).color;
        if (item.profileStatus != undefined && item.profileStatus !=''){
          var status = this.profileStatusList.find(x => x.type == item.profileStatus);
          if(status != null)
            item.profileStatusColor = status.color;
        }
    }
      // store the filter model
      this.dataStore.SetData("EmployeeUpdateList", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
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

  onStateChange() {    
    this.filterModel.locationId="";
    this.locationList = this.locationFullList.filter(x => x.stateId == this.filterModel.stateId);
  }

  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a, b) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
    }).catch(error => {
      this.roleList = [];
    });
  }

  
  edit(eId: any, transferId: any) {
    let route = 'HR/transfer/details/' + eId+"/"+transferId+"/0";
    this.router.navigate([route]);
  }

  view(transferId: any) {
    let route = 'HR/transfer/view/' + transferId;
    this.router.navigate([route]);
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
}
