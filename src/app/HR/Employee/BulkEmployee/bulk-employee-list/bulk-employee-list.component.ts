import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { APIURLS } from '../../../../shared/api-url';
import { HttpService } from '../../../../shared/http-service';
import { AppService } from '../../../../shared/app.service';
import { AppComponent } from '../../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../../auth/auth.model';
import { ExcelService } from '../../../../shared/excel-service';
import { UpdateSelectedEmployee } from '../updatedselectedemployee.model';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-bulk-employee-list',
  templateUrl: './bulk-employee-list.component.html',
  styleUrls: ['./bulk-employee-list.component.css']
})
export class BulkEmployeeListComponent  implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private excelService: ExcelService) { }
  @Input() editAllowed: boolean = true;
  currentUser!: AuthData;
  isLoading: boolean = false;
  from_date: any = null;
  to_date: any = null;
  filterData: any = {};
  filterModel: any = {};
  updateModel:any = {};
  UpdateSelectedEmployee:any = {};
  subDepartmentList:any[] = [];
  subDepartmentFullList:any[] = [];
  plantlist:any[]=[];
  payGroupList:any[]=[];
  employeeCategoryList:any[]=[];
  reportingGroupsList:any[] = [];
  selectAll = false;
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Terminated", color: "danger" },
    { type: "Retired", color: "danger" },
  ];
  errorCount =0;
  categories = [{ category: "Reporting Manager" }, { category: "HOD" },{ category: "Department"},
                { category: "Sub Department" }, { category: "Reporting Group" }];  



  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.departmentId = "";
    this.filterModel.reportingManagerId ="";
    this.filterModel.approvingManagerId ="";
   this.filterModel.stateId="";
   this.filterModel.locationId="";
   this.filterModel.plantId="";
   this.filterModel.payGroupId="";
   this.filterModel.employeeCategoryId="";
   this.filterModel.updateCategory="";
   this.filterModel.subDepartmentId = "";
   this.filterModel.reportingGroupId = "";
    this.getAllDropDownValues();
   this.getData();   
   
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  onSelectAllChange(){
    for (var t of this.filterData.list) {      
        t.selected = this.selectAll;
    }
  }

  getEmployeeList() {  
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";

    this.filterModel.reportingManagerId = $("#fltReportingManagerId").val();
    this.filterModel.approvingManagerId = $("#approvingManagerId").val();
    if (this.from_date != null)
      this.filterModel.fromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      this.filterModel.todate = this.getDateFormate(this.to_date);
    
    this.getData();
  }

  getAllDropDownValues() {   
   this.getDepartments();
    this.getRole();
    this.getState();
     this.getLocation();
     this.getPlantList();
     this.getEmployeeCategoryList();
     this.getPayGroupList();
    this.getReportingGroups();
    this.getSubDepartments();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getReportingGroups(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_REPORTING_GROUPS).then((data: any) => {
      if (data.length > 0) {
        this.reportingGroupsList = data.sort((a:any, b:any) => { if (a.reportingGroupLt > b.reportingGroupLt) return 1; if (a.reportingGroupLt < b.reportingGroupLt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.reportingGroupsList = [];
    });
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
        this.employeeCategoryList = [];
      });
  
  }

  getPayGroupList() {
    
    if (this.filterModel.plantId > 0) {
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
      this.filterModel.payGroupId="";
      this.filterModel.employeeCategoryId="";
    }
  }


  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch((error)=> {
      this.stateList = [];      
      this.filterModel.locationId="";
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

  onDepartmentChange(){
    this.subDepartmentList = this.subDepartmentFullList.filter((x:any)=>x.departmentId == this.filterModel.departmentId);      
    this.filterModel.subDepartmentId="";
  }
  getSubDepartments(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a:any, b:any) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch((error)=> {
      this.subDepartmentFullList = [];      
    });
  }

  getData() {

    this.isLoading = true;
    this.httpService.HRpost(APIURLS.EMPLOYEE_GET_ACTIVE_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterData = data;

      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }
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
    this.filterModel.locationId = "";
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

  lastApprovingkeydown = 0;
  getApprovingManager($event) {
    let text = $('#approvingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else{
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }


  getApprovingManagerForUpdate($event) {
    let text = $('#txtApprovingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#txtApprovingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnApprovingManagerId").val(ui.item.value);
                  $("#txtApprovingManager").val(ui.item.label);
                }
                else{
                  $("#hdnApprovingManagerId").val('');
                  $("#txtApprovingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnApprovingManagerId").val(ui.item.value);
                  $("#txtApprovingManager").val(ui.item.label);
                }
                else{
                  $("#hdnApprovingManagerId").val('');
                  $("#txtApprovingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }

  getApprovingManagerForUpdateAll($event) {
    let text = $('#txtAutoApprovingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#txtAutoApprovingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnAppManagerId").val(ui.item.value);
                  $("#txtAutoApprovingManager").val(ui.item.label);
                }
                else{
                  $("#hdnAppManagerId").val('');
                  $("#txtAutoApprovingManager").val('');
                  $("#approvingManagerId").val('');
                  
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnAppManagerId").val(ui.item.value);
                  $("#approvingManagerId").val(ui.item.value);
                }
                else{
                  $("#hdnAppManagerId").val('');
                  $("#approvingManagerId").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }

  
  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#fltReportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#fltReportingManagerId").val('');
                  $("#reportingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#fltReportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else{
                  $("#fltReportingManagerId ").val('');
                  $("#reportingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  getReportingManagerForUpdate($event) {
    let text = $('#txtReportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#txtReportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnReportingManagerId").val(ui.item.value);
                  $("#txtReportingManager").val(ui.item.label);
                }
                else{
                  $("#hdnReportingManagerId").val('');
                  $("#txtReportingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnReportingManagerId").val(ui.item.value);
                  $("#txtReportingManager").val(ui.item.label);
                }
                else{
                  $("#hdnReportingManagerId").val('');
                  $("#txtReportingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  getReportingManagerForUpdateAll($event) {
    let text = $('#txtAutoReportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#txtAutoReportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnRptManagerId").val(ui.item.value);
                  $("#txtAutoReportingManager").val(ui.item.label);
                }
                else{
                  $("#hdnRptManagerId").val('');
                  $("#txtAutoReportingManager").val('');
                }                  
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#hdnRptManagerId").val(ui.item.value);
                  $("#txtAutoReportingManager").val(ui.item.label);
                }
                else{
                  $("#hdnRptManagerId").val('');
                  $("#txtAutoReportingManager").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }



  updateSelected(){
    var selectedList = this.filterData.list.filter((x:any)  => x.selected == true);
    if(selectedList.length <= 0)
    {
      toastr.error("Please select atleast one employee to update");
      return;
    }
var EmployeeIds : any[]= [];

    for(var t of selectedList)
    {  
      EmployeeIds.push(t.employeeId) ; 
    }
    this.errorCount = 0;
    toastr.info("Updating...");
     
      var request = {} as UpdateSelectedEmployee;
      request.employeeIds = EmployeeIds;

      request.CategoryType = this.updateModel.category;
   
      if(this.updateModel.category == "Department" )
      {
        request.CategoryTypeId =  this.updateModel.departmentId;
        request.CategoryTypeName = this.departmentList.find(x=>x.id ==this.updateModel.departmentId).description;
      }
      if(this.updateModel.category == "Reporting Manager" )
      {
        request.CategoryTypeId =    $("#hdnReportingManagerId").val();
        request.CategoryTypeName = $("#txtReportingManager").val();
      }
      if(this.updateModel.category == "HOD" )
      {
        request.CategoryTypeId =  $("#hdnApprovingManagerId").val();
        request.CategoryTypeName = $("#txtApprovingManager").val();
      }
      if(this.updateModel.category == "Sub Department" )
      {
        request.CategoryTypeId =  this.updateModel.subDepartmentId;
        request.CategoryTypeName = this.subDepartmentFullList.find(x=>x.id ==this.updateModel.subDepartmentId).sdptidLtxt;
      }
      if(this.updateModel.category == "Reporting Group" )
      {
        request.CategoryTypeId =  this.updateModel.reportingGroupId;
        request.CategoryTypeName = this.reportingGroupsList.find(x=>x.id ==this.updateModel.reportingGroupId).reportingGroupLt;
      }

      request.UpdateSelected = true;
      request.updatedById =  this.currentUser.uid;
      
      this.httpService.HRpost(APIURLS.UPDATE_SELECTED_EMPLOYEE, request)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully Updated.");
          $("#UpdateSelectedModal").modal("hide");
          this.getData();
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while Updating.");
      }).catch((error)=> {
        toastr.error(error);
      });
    
    }

    updateAll(){
      this.errorCount = 0;
      toastr.info("Updating...");
       
        var request = {} as UpdateSelectedEmployee;
        request.UpdateSelected = false;
        request.EmployeeFilterModel = this.filterModel;
   
        request.CategoryType = this.updateModel.category;
        
        if(this.updateModel.category == "Department" )
        {
          request.CategoryTypeId =  this.updateModel.departmentId;
          request.CategoryTypeName = this.departmentList.find(x=>x.id ==this.updateModel.departmentId).description;
        }
        if(this.updateModel.category == "Reporting Manager" )
        {
          request.CategoryTypeId =     $("#hdnRptManagerId").val();
          request.CategoryTypeName = $("#txtAutoReportingManager").val();
        }
        if(this.updateModel.category == "HOD" )
        {
          request.CategoryTypeId =  $("#hdnAppManagerId").val();
          request.CategoryTypeName = $("#txtAutoApprovingManager").val();
        }
        if(this.updateModel.category == "Sub Department" )
        {
          request.CategoryTypeId =  this.updateModel.subDepartmentId;
          request.CategoryTypeName = this.subDepartmentFullList.find(x=>x.id ==this.updateModel.subDepartmentId).sdptidLtxt;
        }
        if(this.updateModel.category == "Reporting Group" )
        {
          request.CategoryTypeId =  this.updateModel.reportingGroupId;
          request.CategoryTypeName = this.reportingGroupsList.find(x=>x.id ==this.updateModel.reportingGroupId).reportingGroupLt;
        }
        request.updatedById =  this.currentUser.uid;
        
        this.httpService.HRpost(APIURLS.UPDATE_SELECTED_EMPLOYEE, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            toastr.success("Successfully Updated.");
            $("#UpdateAllModal").modal("hide");
            this.getData();
          } else if (!data.success) {
            toastr.error(data.message);
          } else
            toastr.error("Error occurred while Updating.");
        }).catch((error)=> {
          toastr.error(error);
        });
      
      }
 }
