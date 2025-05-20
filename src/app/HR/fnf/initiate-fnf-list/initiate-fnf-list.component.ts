import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-initiate-fnf-list',
  templateUrl: './initiate-fnf-list.component.html',
  styleUrls: ['./initiate-fnf-list.component.css']
})
export class InitiateFnfListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService,
     private route: ActivatedRoute,private excelService: ExcelService) { }

  currentUser: AuthData;
  isLoading: boolean = false;
  from_date: any = null;
  to_date: any = null;
  filterData: any = {};
  filterModel: any = {};
  plantlist:any[]=[];
  payGroupList:any[]=[];
  employeeCategoryList:any[]=[];
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Terminated", color: "danger" },
    { type: "Retired", color: "danger" },
  ]

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.designationId ="";
   this.filterModel.stateId="";
   this.filterModel.locationId="";
   this.filterModel.plantId="";
   this.filterModel.payGroupId="";
   this.filterModel.employeeCategoryId="";
    this.getAllDropDownValues();
   this.getData();   
   
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  confirm(employeeId)
  {
    
  }

  getEmployeeList() {    
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    
    if (this.from_date != null)
      this.filterModel.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      this.filterModel.todate = this.getDateFormate(this.to_date);
    
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
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        
      });
  }

  getPayGroupList() {
    this.employeeCategoryList = [];
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
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
    this.httpService.HRpost(APIURLS.FNF_EMPLOYEE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find(x => x.type == item.status).color;
      }
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
    this.locationList = this.locationFullList.filter(x => x.stateId == this.filterModel.locationStateId);
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

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.FNF_EMPLOYEE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "SNo":index,
          "Employee No": item.employeeNo,
          "Status": item.status,
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Joining Date": this.setDateFormate(item.joiningDate),
          "Employment Type": item.employmentType,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'FNF_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
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
