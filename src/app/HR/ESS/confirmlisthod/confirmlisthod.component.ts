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

@Component({
  selector: 'app-confirmlisthod',
  templateUrl: './confirmlisthod.component.html',
  styleUrls: ['./confirmlisthod.component.css']
})
export class ConfirmlisthodComponent  implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private excelService: ExcelService, private dataStore: DataStorageService) { }

  currentUser!: AuthData;
  isLoading: boolean = false;
  employeeId!: number;
  from_date: any = null;
  to_date: any = null;
  filterData: any = {};
  filterModel: any = {};
  plantlist:any[]=[];
  payGroupList:any[]=[];
  employeeCategoryList:any[]=[];
  action: string
  comment: string
  confirmEmployeeModel: any[] = [];
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
  ]

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
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
    this.getAllDropDownValues();
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ConfirmationReviewList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }
    
    this.filterModel.hodId = this.currentUser.uid;
   this.getData();   
   
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  view(id){
    let route = 'HR/confirmation/view/' + id;
    this.router.navigate([route]);
  }

  confirm(employeeId)
  {
    
  }

  getEmployeeList() {    
    // this.filterModel.fromdate = null;
    // this.filterModel.todate = null

    // if (this.from_date != null)
    //   this.filterModel.fromdate = this.getDateFormate(this.from_date);
    // if (this.to_date != null)
    //   this.filterModel.todate = this.getDateFormate(this.to_date);
    
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
    this.getDesignation();
    this.getEmployeeCategoryList();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantlist = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        
      });
  }

  getPayGroupList() {
    this.filterModel.payGroupId = null;
    this.filterModel.employeeCategoryId = null;
    
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.designationList = [];
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

  departmentList:any[]=[];
  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  getData() {
    
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("ConfirmationReviewList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
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
    var selectedState = this.stateList.find(x=>x.id == this.filterModel.stateId);
    if(selectedState)
      this.locationList = this.locationFullList.filter((x:any)  => x.stateId == selectedState.bland);
  }

  roleList: any[] = [];
  getRole() {
    this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roleList = data.sort((a:any, b:any) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.roleList = [];
    });
  }

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "SNo":index,
          "Status": item.status,
          "ID": item.employeeConfirmationId,
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod + " month(s)",
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Submitted By": item.submitedByName,
          "Submitted On": this.setDateFormate(item.createdDate),
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Employee_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
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

  enterConfirmationHodRecommendations(employeeId: any, id: any, flowTaskId:any) {
    let route = 'HR/confirmation/detail/' + employeeId+"/"+id+"/"+flowTaskId;
    this.router.navigate([route]);
  }

}
