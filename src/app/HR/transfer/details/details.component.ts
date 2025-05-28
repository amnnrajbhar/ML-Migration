import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm,FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
import { JobChangeDetails } from '../../confirmation/confirmation-detail/jobChangeDetails.model';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-transfer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  providers: [Util]
})
export class DetailsComponent implements OnInit {

  currentUser!: AuthData;
  employeeId: any;
  transferId: any;
  urlPath: string = '';
  errMsg: string = "";
  editAllowed: boolean = true;
  isLoading: boolean = false;
  isRejected: boolean = false;
  transferStatus :any;
  transferDetails: any = {};
  employeeDetails :any={};
  DateToday :Date ;
  objectType: string = "Transfer";
  files: any[] = [];

  selectedRoleText: string = "";
  selectedDesignationText: string = "";
  selectedPlantText: string = "";
  selectedPaygroupText: string = "";
  selectedStateText: string = "";
  selectedLocationText: string = "";
  selectedDepartmentText: string = "";
  selectedSubDepartmentText: string = "";
  selectedStaffCategoryText: string = "";

  isDesignationChange: any = false;
  isRoleChange: any = false;
  isStaffCategoryChange: any = false;
  isTransfer: any = false;

  jobChangeDetailsList: any[] = [];
  approvalType :any;
  filterModel: any = {};
  noticePeriod :any;
  approvalTypes =
    [
      { type: "HR" },
      { type: "HOD" },
      { type: "Reporting Manager and HOD" },
      { type: "Predefined Approvers" }
    ];

    transferReasons =
    [
      { type: "Personal" },
      { type: "Job Sattisfaction" },
      { type: "Vacancy" }
    ];


  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private fb: FormBuilder, private util: Util, private location: Location) {
    }

  ngOnInit() {
    this.DateToday=new Date();
    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.filterModel.departmentId = "";
      this.filterModel.subDepartmentId = "";
      this.filterModel.designationId = "";
      this.filterModel.roleId = "";
      this.filterModel.stateId = "";
      this.filterModel.locationId = "";
      this.filterModel.plantId = "";
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
      this.filterModel.noticePeriod=null;
      this.isTransfer = true;

   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.employeeId = this.route.snapshot.paramMap.get('id')!;  
      this.transferId = this.route.snapshot.paramMap.get('id2')!;  
      this.approvalType = this.route.snapshot.paramMap.get('id3')!;  
      if (!this.employeeId || this.employeeId <= 0)
      {
        toastr.error("Invalid ID passed.");
        this.router.navigate(['/HR/transfer/select-employee']);
      }      
      this.GetEmployeeDetails(this.employeeId);
      this.getAllDropDownValues();
    }
  }
  
  getAllDropDownValues() {
    this.getDepartments();
    this.getSubDepartments();
    this.getRole();
    this.getDesignation();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
  }
  
  selectedPlant: any;
  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  onPlantChange(){
    this.filterModel.payGroupId = "";
    if(this.filterModel.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.filterModel.plantId);
      this.payGroupList = this.payGroupFullList.filter((x:any)=>x.plant ==  plant.code);
    }
    else{
      this.payGroupList = [];
    }
  }

  selectedPaygroup: any;
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
  getPayGroupList() {    
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.payGroupFullList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
      }
    }).catch((error)=> {
      this.payGroupFullList = [];
    });
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList() {    
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API)
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.employeeCategoryList = [];
      });   
  }

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
        if(this.filterModel.stateId > 0){
          var selectedState = this.stateList.find((x:any)  => x.id == this.filterModel.stateId);
          if (selectedState)
            this.locationList = this.locationFullList.filter((x:any)  => x.stateId == selectedState.bland);
        }
    }
    }).catch((error)=> {
      this.locationFullList = [];
    });
  }

  selectedState: any;
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

  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  getSubDepartments() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a:any, b:any) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
        if(this.filterModel.departmentId > 0)
          this.subDepartmentList = this.subDepartmentFullList.filter((x:any)  => x.departmentId == this.filterModel.departmentId);
      }
    }).catch((error)=> {
      this.subDepartmentFullList = [];
    });
  }
    
  lastRequestorEmployeekeydown = 0;
  getRequestorEmployees($event) {
    let text = $('#requestedByName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastRequestorEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#requestedByName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#requestedById").val(ui.item.value);
                  $("#requestedByName").val(ui.item.label);                  
                  //this.filterModel.appraisedBYEmployeeId = ui.item.value;
                }
                else {
                  $("#requestedById").val('');
                  $("#requestedByName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#requestedById").val(ui.item.value);
                  $("#requestedByName").val(ui.item.label);
                 
                }
                else {
                  $("#requestedById").val('');
                  $("#requestedByName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastRequestorEmployeekeydown = $event.timeStamp;
    }
  }

  lastApproverEmployeekeydown = 0;
  getApproverEmployees($event) {
    let text = $('#approvedByName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#approvedByName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvedById").val(ui.item.value);
                  $("#approvedByName").val(ui.item.label);
                  //this.filterModel.approvedBYEmployeeId = ui.item.value;
                }
                else {
                  $("#approvedById").val('');
                  $("#approvedByName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvedById").val(ui.item.value);
                  $("#approvedByName").val(ui.item.label);
                }
                else {
                  $("#approvedById").val('');
                  $("#approvedByName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }

  lastrmEmployeekeydown = 0;
  getRMEmployees($event) {
    let text = $('#rmName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastrmEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#rmName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#rmId").val(ui.item.value);
                  $("#rmName").val(ui.item.label);
                  //this.filterModel.rmId = ui.item.value;
                }
                else {
                  $("#rmId").val('');
                  $("#rmName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#rmId").val(ui.item.value);
                  $("#rmName").val(ui.item.label);
                }
                else {
                  $("#rmId").val('');
                  $("#rmName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastrmEmployeekeydown = $event.timeStamp;
    }
  }

  lastHodEmployeekeydown = 0;
  getHodEmployees($event) {
    let text = $('#hodName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastHodEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#hodName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hodId").val(ui.item.value);
                  $("#hodName").val(ui.item.label);
                  //this.filterModel.hodId = ui.item.value;
                }
                else {
                  $("#hodId").val('');
                  $("#hodName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hodId").val(ui.item.value);
                  $("#hodName").val(ui.item.label);
                }
                else {
                  $("#hodId").val('');
                  $("#hodName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastHodEmployeekeydown = $event.timeStamp;
    }
  }
  
  lastSpocEmployeekeydown = 0;
  getSpocEmployees($event) {
    let text = $('#destinationSpocName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#destinationSpocName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#destinationSpocId").val(ui.item.value);
                  $("#destinationSpocName").val(ui.item.label);
                }
                else {
                  $("#destinationSpocId").val('');
                  $("#destinationSpocName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#destinationSpocId").val(ui.item.value);
                  $("#destinationSpocName").val(ui.item.label);
                }
                else {
                  $("#destinationSpocId").val('');
                  $("#destinationSpocName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }

  lastVacantEmployeeEmployeekeydown = 0;
  getVacantEmployees($event) {
    let text = $('#destinationVacantPositionEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastVacantEmployeeEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#destinationVacantPositionEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#destinationVacantPositionEmployeeId").val(ui.item.value);
                  $("#destinationVacantPositionEmployeeName").val(ui.item.label);
                }
                else {
                  $("#destinationVacantPositionEmployeeId").val('');
                  $("#destinationVacantPositionEmployeeName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#destinationVacantPositionEmployeeId").val(ui.item.value);
                  $("#destinationVacantPositionEmployeeName").val(ui.item.label);
                }
                else {
                  $("#destinationVacantPositionEmployeeId").val('');
                  $("#destinationVacantPositionEmployeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastVacantEmployeeEmployeekeydown = $event.timeStamp;
    }
  }

  GetEmployeeDetails(id:any) {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.employeeDetails = data;
        // this.filterModel.plantId = data.plantId;
        // this.filterModel.payGroupId = data.payGroupId;
        // this.filterModel.employeeCategoryId = data.employeeCategoryId;
        // this.filterModel.departmentId = data.departmentId;
        // this.filterModel.subDepartmentId = data.subDepartmentId;
        // this.filterModel.designationId = data.designationId;
        // this.filterModel.roleId = data.roleId;
        // this.filterModel.stateId = data.stateId;
        // this.filterModel.locationId = data.locationId;
        // this.filterModel.rmId = data.reportingManagerId;
        // this.filterModel.rmName = data.reportingManagerName;
        // this.filterModel.hodId = data.approvingManagerId;
        // this.filterModel.hodName = data.approvingManagerName;
        // this.onDepartmentChange(null);
        // this.onStateChange(null);        
        // this.getPayGroupList(null);
        // this.getEmployeeCategoryList();
        if(this.transferId > 0){
          this.GetTransferDetailsById(this.transferId);    
        }
        else{
          this.GetTransferDetailsByEmpId(this.employeeId);    
      }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;

    });
  }

  
  GetTransferDetailsByEmpId(id:any) {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_TRANSFER_STATUS_GET_BYEMPID+"/"+id).then((data: any) => {
      if (data) {
         this.transferDetails = data;
         this.transferId = this.transferDetails.employeeTransferId;
         this.transferStatus = this.transferDetails.status;
         
         if (this.transferStatus=="Withdrawn" || this.transferStatus=="Approved" || this.transferStatus=="Joining Confirmed")
         {
           this.transferDetails = {};
          this.transferDetails.effectiveDate = new Date();   
          this.transferId = 0;
          this.transferStatus= "";
         }
         else if (this.transferStatus=="Pending For Approval")
         {
          toastr.error("Transfer is "+this.transferStatus);
          this.router.navigate(['/HR/transfer/transfer-list']);
         }         
         else if (this.transferStatus=="Rejected" )
         {
          this.isRejected = true;
          this.loadOldDetails(data);
         }
         else if (this.transferStatus=="Submitted" )
         {
          this.loadOldDetails(data);
         }  
         else{
          toastr.error("transfer is "+this.transferStatus);
          this.router.navigate(['/HR/transfer/select-employee']);
         }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });
  }

  
  GetTransferDetailsById(id:any) {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_TRANSFER_STATUS_GET_BY_ID+"/"+id).then((data: any) => {
      if (data) {
         this.transferDetails = data;
         this.transferId = this.transferDetails.employeeTransferId;
         this.transferStatus = this.transferDetails.status;
         
         if (this.transferStatus=="Withdrawn" || this.transferStatus=="Accepted" || this.transferStatus=="Joining Confirmed")
         {
          this.transferDetails = {};
          this.transferDetails.effectiveDate = new Date();   
          this.transferId = 0;
          this.transferStatus= "";
         }
         else if (this.transferStatus=="Pending For Approval")
         {
          toastr.error("Transfer is "+this.transferStatus);
          this.router.navigate(['/HR/transfer/transfer-list']);
         }   
         else if (this.transferStatus=="Rejected" )
         {
          this.isRejected = true;
          this.loadOldDetails(data);
         }   
         else if (this.transferStatus=="Submitted" )
         {
          this.loadOldDetails(data);
         }      
         else{
          toastr.error("transfer is "+this.transferStatus);
          this.router.navigate(['/HR/transfer/select-employee']);
         }
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error(error);
    });
  }

  loadOldDetails(data: any){
    this.isRoleChange = data.isRoleChange;
    this.isDesignationChange = data.isDesignationChange;
    this.isTransfer = data.isTransfer;
    this.isStaffCategoryChange = data.isStaffCategoryChange;

    $("#requestedById").val(data.requestedById);
    $("#approvedById").val(data.approvedById);
    this.approvalType = data.approvalType;
    this.filterModel.requestedById = data.requestedById;
    this.filterModel.approvedById = data.approvedById;
    this.filterModel.requestedByName = data.requestedByName;
    this.filterModel.approvedByName = data.approvedByName;
    this.jobChangeDetailsList = data.jobChangeDetailsList;
    if (this.jobChangeDetailsList.find((x:any)  => x.type == "Role") != null)
      this.filterModel.roleId = this.jobChangeDetailsList.find((x:any)  => x.type == "Role").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "Designation") != null)
      this.filterModel.designationId = this.jobChangeDetailsList.find((x:any)  => x.type == "Designation").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "Department") != null)
      this.filterModel.departmentId = this.jobChangeDetailsList.find((x:any)  => x.type == "Department").newValueId;
    this.getSubDepartments();

    this.subDepartmentList = this.subDepartmentFullList.filter((x:any)  => x.departmentId == this.filterModel.departmentId);
    if (this.jobChangeDetailsList.find((x:any)  => x.type == "SubDepartment") != null)
      this.filterModel.subDepartmentId = this.jobChangeDetailsList.find((x:any)  => x.type == "SubDepartment").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "Plant") != null)
      this.filterModel.plantId = this.jobChangeDetailsList.find((x:any)  => x.type == "Plant").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "PayGroup") != null)
      this.filterModel.payGroupId = this.jobChangeDetailsList.find((x:any)  => x.type == "PayGroup").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "State") != null)
      this.filterModel.stateId = this.jobChangeDetailsList.find((x:any)  => x.type == "State").newValueId;
    this.getLocation();

    var selectedState = this.stateList.find((x:any)  => x.id == this.filterModel.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter((x:any)  => x.stateId == selectedState.bland);

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "Location") != null)
      this.filterModel.locationId = this.jobChangeDetailsList.find((x:any)  => x.type == "Location").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "StaffCategory") != null)
      this.filterModel.employeeCategoryId = this.jobChangeDetailsList.find((x:any)  => x.type == "StaffCategory").newValueId;

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "HOD") != null) {
      this.filterModel.hodId = this.jobChangeDetailsList.find((x:any)  => x.type == "HOD").newValueId;
      this.filterModel.hodName = this.jobChangeDetailsList.find((x:any)  => x.type == "HOD").oldValueText;
    }

    if (this.jobChangeDetailsList.find((x:any)  => x.type == "RM") != null) {
      this.filterModel.rmId = this.jobChangeDetailsList.find((x:any)  => x.type == "RM").newValueId;
      this.filterModel.rmName = this.jobChangeDetailsList.find((x:any)  => x.type == "RM").oldValueText;
    }
  }

  
  save() {
    let connection: any;    
    this.transferDetails.EmployeeId = this.employeeId;   
    if (this.transferDetails.effectiveDate == null || this.transferDetails.effectiveDate == "") {
      toastr.error("Please enter Transfer Date, it is required.");
      return;
    }
    if (this.transferDetails.effectiveDate < new Date(this.employeeDetails.dateOfJoining)) {
      toastr.error("Transfer Date cannot be before Joining Date.");
      return;
    }
    if (this.transferDetails.effectiveDate > new Date(this.transferDetails.reportingDate)) {
      toastr.error("Reporting Date cannot be before Transfer Date.");
      return;
    }
    for (const file of this.files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }      
    }
    
    this.transferDetails.CreatedById = this.currentUser.uid;
    this.transferDetails.ModifiedById = this.currentUser.uid;
    //this.transferDetails.requestedById = $("#requestedById").val();
    this.transferDetails.requestedById = this.currentUser.uid;
    this.filterModel.requestedByName = $("#requestedByName").val();
    this.transferDetails.approvedById = $("#approvedById").val();
    this.transferDetails.destinationSpocId = $("#destinationSpocId").val();
    this.transferDetails.destinationVacantPositionEmployeeId = $("#destinationVacantPositionEmployeeId").val();
    this.filterModel.approvedByName = $("#approvedByName").val();
    this.transferDetails.effectiveDate = this.util.getFormatedDateTime(this.transferDetails.effectiveDate);
    this.transferDetails.modifiedDate = this.util.getFormatedDateTime(new Date());
    this.transferDetails.isRoleChange = this.isRoleChange;
    this.transferDetails.isDesignationChange = this.isDesignationChange;
    this.transferDetails.isTransfer = this.isTransfer;
    this.transferDetails.isStaffCategoryChange = this.isStaffCategoryChange;
    this.jobChangeDetailsList = null;
    this.jobChangeDetailsList = [];
    this.transferDetails.approvalType = this.approvalType;
    this.transferDetails.noticePeriod = this.noticePeriod;
    if (this.isTransfer) {
      
      if (this.filterModel.plantId <= 0 || this.filterModel.plantId == null || this.filterModel.plantId == "") {
        toastr.error("Please select a new Plant"); return;
      }
      if (this.filterModel.plantId > 0) {
        if (this.plantList.find((x:any)  => x.id == this.filterModel.plantId) != null) {
          this.selectedPlantText = this.plantList.find((x:any)  => x.id == 
            this.filterModel.plantId).name;
        }
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Plant";
        jobChangeDetail.oldValueText = this.employeeDetails.plantName;
        jobChangeDetail.newValueText = this.selectedPlantText;
        jobChangeDetail.newValueId = this.filterModel.plantId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.payGroupId <= 0 || this.filterModel.payGroupId == null || this.filterModel.payGroupId == "") {
        toastr.error("Please select a new Pay Group"); return;
      }
      if (this.filterModel.payGroupId > 0) {
        if (this.payGroupList.find((x:any)  => x.id == this.filterModel.payGroupId) != null) {
          this.selectedPaygroupText = this.payGroupList.find((x:any)  => x.id == 
            this.filterModel.payGroupId).printName;
        }
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "PayGroup";
        jobChangeDetail.oldValueText = this.employeeDetails.payGroupPrintName;
        jobChangeDetail.newValueText = this.selectedPaygroupText;
        jobChangeDetail.newValueId = this.filterModel.payGroupId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.stateId <= 0 || this.filterModel.stateId == null || this.filterModel.stateId == "") {
        toastr.error("Please select a new State"); return;
      }
      if (this.filterModel.stateId > 0) {
        if (this.stateList.find((x:any)  => x.id == this.filterModel.stateId) != null) {
          this.selectedStateText = this.stateList.find((x:any)  => x.id == 
            this.filterModel.stateId).bezei;
        }
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "State";
        jobChangeDetail.oldValueText = this.employeeDetails.state;
        jobChangeDetail.newValueText = this.selectedStateText;
        jobChangeDetail.newValueId = this.filterModel.stateId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.locationId <= 0 || this.filterModel.locationId == null || this.filterModel.locationId == "") {
        toastr.error("Please select a new Location"); return;
      }
      if (this.filterModel.locationId > 0) {
        if (this.locationList.find((x:any)  => x.id == this.filterModel.locationId) != null) {
          this.selectedLocationText = this.locationFullList.find((x:any)  => x.id == 
            this.filterModel.locationId).name;
        }
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Location";
        jobChangeDetail.oldValueText = this.employeeDetails.location;
        jobChangeDetail.newValueText = this.selectedLocationText;
        jobChangeDetail.newValueId = this.filterModel.locationId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.departmentId <= 0 || this.filterModel.departmentId == null || this.filterModel.departmentId == "") {
        toastr.error("Please select a new Department"); return;
      }
      if (this.filterModel.departmentId > 0) {
        if (this.departmentList.find((x:any)  => x.id == this.filterModel.departmentId) != null) {
          this.selectedDepartmentText = this.departmentList.find((x:any)  => x.id == 
            this.filterModel.departmentId).description;
        }
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Department";
        jobChangeDetail.oldValueText = this.employeeDetails.department;
        jobChangeDetail.newValueText = this.selectedDepartmentText;
        jobChangeDetail.newValueId = this.filterModel.departmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.subDepartmentId > 0) {
        this.selectedSubDepartmentText = this.subDepartmentList.find((x:any)  => x.id == this.filterModel.subDepartmentId).sdptidLtxt;
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "SubDepartment";
        jobChangeDetail.oldValueText = this.employeeDetails.subDepartmentName;
        jobChangeDetail.newValueText = this.selectedSubDepartmentText;
        jobChangeDetail.newValueId = this.filterModel.subDepartmentId;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if ($('#rmId').val() <= 0 || $('#rmId').val() == null || $('#rmId').val() == "") {
        toastr.error("Please select a new Reporting Manager"); return;
      }
      if ($('#rmId').val() > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "RM";
        jobChangeDetail.oldValueText = this.employeeDetails.reportingManagerName;
        jobChangeDetail.newValueText = $('#rmName').val();
        jobChangeDetail.newValueId = $('#rmId').val();
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if ($('#hodId').val() <= 0 || $('#hodId').val() == null || $('#hodId').val() == "") {
        toastr.error("Please select a new HOD"); return;
      }
      if ($('#hodId').val() > 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "HOD";
        jobChangeDetail.oldValueText = this.employeeDetails.approvingManagerName;
        jobChangeDetail.newValueText = $('#hodName').val();
        jobChangeDetail.newValueId = $('#hodId').val();
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
      if (this.filterModel.noticePeriod == null || this.filterModel.noticePeriod == "")
      {
        toastr.error("Please select a new Notice Period"); 
        return;
      }
      if (this.filterModel.noticePeriod >= 0) {
        jobChangeDetail = {} as JobChangeDetails;
        jobChangeDetail.type = "Notice Period";
        jobChangeDetail.oldValueText = this.employeeDetails.noticePeriod;
        jobChangeDetail.newValueText = this.filterModel.noticePeriod;
        jobChangeDetail.newValueId = this.filterModel.noticePeriod;
        this.jobChangeDetailsList.push(jobChangeDetail);
      }
    }
    if (this.isStaffCategoryChange) {
      if (this.filterModel.employeeCategoryId <= 0 || this.filterModel.employeeCategoryId == null || this.filterModel.employeeCategoryId == "") {
        toastr.error("Please select a new Employee Category"); return;
      }
      if (this.employeeCategoryList.find((x:any)  => x.id == this.filterModel.employeeCategoryId) != null) {
        this.selectedStaffCategoryText = this.employeeCategoryList.find((x:any)  => x.id == 
          this.filterModel.employeeCategoryId).catltxt;
      }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "StaffCategory";
      jobChangeDetail.oldValueText = this.employeeDetails.employeeCategoryName;
      jobChangeDetail.newValueText = this.selectedStaffCategoryText;
      jobChangeDetail.newValueId = this.filterModel.employeeCategoryId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isDesignationChange) {
      if (this.filterModel.designationId <= 0 || this.filterModel.designationId == null || this.filterModel.designationId == "") {
        toastr.error("Please select a new Designation"); return;
      }
      if (this.designationList.find((x:any)  => x.id == this.filterModel.designationId) != null) {
        this.selectedDesignationText = this.designationList.find((x:any)  => x.id == 
          this.filterModel.designationId).name;
        }
      jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Designation";
      jobChangeDetail.oldValueText = this.employeeDetails.designation;
      jobChangeDetail.newValueText = this.selectedDesignationText;
      jobChangeDetail.newValueId = this.filterModel.designationId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    if (this.isRoleChange) {
      if (this.filterModel.roleId <= 0 || this.filterModel.roleId == null || this.filterModel.roleId == "") {
        toastr.error("Please select a new Role"); return;
      }
      if (this.roleList.find((x:any)  => x.id == this.filterModel.roleId) != null) {
        this.selectedRoleText = this.roleList.find((x:any)  => x.id == 
          this.filterModel.roleId).role_ltxt;
        }
      var jobChangeDetail = {} as JobChangeDetails;
      jobChangeDetail.type = "Role";
      jobChangeDetail.oldValueText = this.employeeDetails.role;
      jobChangeDetail.newValueText = this.selectedRoleText;
      jobChangeDetail.newValueId = this.filterModel.roleId;
      this.jobChangeDetailsList.push(jobChangeDetail);
    }
    this.transferDetails.jobChangeDetailsList = this.jobChangeDetailsList;

    toastr.info("Submitting the details...");
    this.isLoading = true;
    connection = this.httpService.HRpost(APIURLS.HR_TRANSFER_SAVE, this.transferDetails);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success("Details saved successfully.");
          this.transferDetails.employeeTransferId = data.id;
          this.addAttachments();
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving Details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while saving Details. Error:' + error);
      });
  }

  
  submitForApproval(id:any) {
    this.isLoading = true;
    var request: any = {};
    request.transferId = id;
    request.submittedById = this.currentUser.uid;

    toastr.info("Submitting for approval...");
    this.httpService.HRpost(APIURLS.HR_TRANSFER_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully submitted for approval.");
          this.router.navigate(['HR/transfer/list']);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while submitting.");

        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error(error);
      });
  }

  addAttachments(){

    if(this.files.length > 0){
      
      const formData = new FormData();  
      var index =0;
      for (const file of this.files) {      
        formData.append("attachments["+index+"]", file);        
        index++;
      }
      this.isLoading = true;      
      toastr.info("Uploading attachment files ...");  
      this.httpService.HRpostAttachmentFile(APIURLS.HR_TRANSFER_ADD_ATTACHMENTS+"/"+this.transferDetails.employeeTransferId, formData)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          { 
            toastr.success('Files uploaded successfully!');
            this.submitForApproval(this.transferDetails.employeeTransferId);
          }
          else
          toastr.error(data.message);
        })
        .catch((error)=> {
          this.isLoading = false;
          toastr.error('Error occured while uploading attachments. Error:' + error);
        });
    }
    else
    {
      this.submitForApproval(this.transferDetails.employeeTransferId);
    }
  }
  
  goBack() {
    this.location.back();
  }

  selectFiles(event) {
    this.files = event.target.files;
  }

  onStateChange(event: any) {
    var selectedState = this.stateList.find((x:any)  => x.id == this.filterModel.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter((x:any)  => x.stateId == selectedState.bland);
  }

  onDepartmentChange(event: any) {
    this.subDepartmentList = this.subDepartmentFullList.filter((x:any)  => x.departmentId == this.filterModel.departmentId);
  }

  onPayGroupChange(event: any) {
    this.getEmployeeCategoryList();
  }

}
