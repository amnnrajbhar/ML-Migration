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
  selector: 'app-employee-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService) { }

  currentUser!: AuthData;
  transferId: any;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantlist:any[]=[];
  payGroupList:any[]=[];
  employeeCategoryList:any[]=[];
  listFilter: any;
  comments: string
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
  transferStatusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Rejected", color:"danger" },    
    { type: "Withdrawn", color:"danger" },    
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
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.active = true;
    this.filterModel.filterByHodRm = false;

    this.listFilter = this.route.snapshot.paramMap.get('id')!;
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("EmployeeList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }    
    this.filterModel.employeeId = this.currentUser.uid;
    
    if(this.listFilter == "filtered")
    this.filterModel.filterByHodRm = true;
    else
    this.filterModel.filterByHodRm = false;
    this.getAllDropDownValues();
    this.getData();      
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  transfer(employeeId, reportingTypeForTransfer:any)
  {
    console.log(reportingTypeForTransfer);
    if(employeeId > 0){      
      let route = 'HR/transfer/details/' + employeeId+"/0/"+reportingTypeForTransfer;
      this.router.navigate([route]);
    }
    else
    {
      toastr.error("Select an employee from the list.");
    }
  }

  getEmployeeList() {    
    // this.filterModel.fromdate = "";
    // this.filterModel.todate = "";
    
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

  getPayGroupList() {
    
    if (this.filterModel.plantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
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
            this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch((error)=> {
          this.employeeCategoryList = [];
        });
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
    this.httpService.HRpost(APIURLS.EMPLOYEE_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      console.log(data);
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
        if (item.transferStatus != undefined && item.transferStatus !=''){
          var status = this.transferStatusList.find((x:any)  => x.type == item.transferStatus);
          if(status != null)
            item.transferStatusColor = status.color;
        }
    }
      // store the filter model
      this.dataStore.SetData("EmployeeList", this.filterModel);
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
    this.filterModel.locationId="";
    this.locationList = this.locationFullList.filter((x:any)  => x.stateId == this.filterModel.stateId);
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
    this.httpService.HRpost(APIURLS.EMPLOYEE_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,          
          "Employee No": item.employeeNo,
          "Employee Status": item.status,
          "Employee Type": item.employmentType,
          "Active": item.active == true? "Yes": "No",
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Plant Name": item.plantName,
          "Plant Code":item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod,
          "Confirmation Due Date": this.setDateFormate(item.confirmationDueDate),
          "Confirmation Date": this.setDateFormate(item.dateOfConfirmation),
          "Employment Type": item.employmentType,
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName,
          "Date of Resignation": this.setDateFormate(item.dateOfResignation),
          "Notice Period": item.noticePeriod,
          "Last Working Date": this.setDateFormate(item.lastWorkingDatePerSystem),
          "Actual Relieving Date": this.setDateFormate(item.dateOfLeaving),
          "Notice Shortfall Days": item.noticeShortfallDays,
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
    if(date == null || date == "" || date == undefined) return "";

    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
  
  submitForApproval(id:any) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.transferId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.HR_TRANSFER_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.getData();
            toastr.success("Successfully submitted for approval.");
          } else if (!data.success) {
            toastr.error(data.message);
          } else
          toastr.error("Error occurred.");
        }).catch((error)=> {
          toastr.error(error);
        });
    }
  }

  withdraw(id:any) {
    this.transferId = id;
    this.comments = "";
  }

  edit(eId: any, transferId: any) {
    let route = 'HR/transfer/details/' + eId+"/"+transferId+"/0";
    this.router.navigate([route]);
  }

  view(transferId: any) {
    let route = 'HR/transfer/view/' + transferId;
    this.router.navigate([route]);
  }

  print(transferId: any) {
    let route = 'HR/transfer/print/' + transferId;
    this.router.navigate([route]);
  }

  performTask() {
    if (this.comments==undefined || this.comments=='')
    {
      toastr.error("Enter Reason For Withdrwal");
      return;
    }
    var confirmMsg =  "Are you sure you want to withdraw this?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request: any = {};
      request.id = this.transferId;
      request.comments = this.comments;
      request.status = "Withdrawn";
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.httpService.HRpost(APIURLS.HR_TRANSFER_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.getData();
          toastr.success("Successfully " + "Withdrawn");
        } else if (!data.success) {
          toastr.error(data.message);
        } else
        toastr.error("Error occurred.");
      }).catch((error)=> {
        toastr.error(error);
      });
    }
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
