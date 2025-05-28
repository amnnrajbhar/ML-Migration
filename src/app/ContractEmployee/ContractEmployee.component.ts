import { AuthData } from '../auth/auth.model'
import { ContractEmployee } from './ContractEmployee.model';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';

import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';


declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
//import { filter } from 'rxjs-compat/operator/filter';
import { error } from 'console';
declare var require: any;
declare var toastr: any;

export class actionItemModel {
  employeeId: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  baseLocation: string
  department: string
  profile: string
  designation: string
  employee_type: string
  role: string
  manager: string
  permanent_Address: string
  phone_Number: string
  current_Address: string
  emergency_Contact_Name: string
  emergency_Contact_Number: string
  isActive!: boolean;
}

@Component({
  selector: 'app-ContractEmployee',
  templateUrl: './ContractEmployee.component.html',
  styleUrls: ['./ContractEmployee.component.css']
})
export class ContractEmployeeComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm!: NgForm;

@ViewChild('native', { static: false }) native!: ElementRef;

  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;
  public tableWidget: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
  userList: ContractEmployee[];
  userMasterItem = {} as ContractEmployee;
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  addressList!: any[];
  empOtherDetailList!: any[];
  employeePayrollList!: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string// set ActionTypes: Create,Update,Delete
  aduitpurpose: string
  path!: string
  selectedBaseLocation: any[] = [];
  employeeId: any = null;
  types = [{ type: "Passport size Photo" }, { type: "Aadhar Card" }, { type: "PAN Card" }, { type: "PF-UAN Ac Details" },
  { type: "ESI Number" }, { type: "UAN Details" }, { type: "Bank Passbook / Cheque" },
  { type: "Medical Certificate" }, { type: "Previous Employer Relieving Letter" }, { type: "Previous Employer 3 months payslip" },
  { type: "Previous Employer Form 16" }, { type: "Previous Employer Offer Letter" }];

  item: any = {};
  count: number = 0;
  fileList: any[] = [];
  today = new Date();


  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private route: ActivatedRoute) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }


  dropdownSettings1 = {
    singleSelection: true,
    idField: 'id',
    textField: 'name1',
    allowSearchFilter: true
  };
  locationAllList: any[] = [[]];
  getLocation(id:any) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter((x:any)  => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x:any) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.locationList = [];
    });
  }


  plantList: any[] = [];
  getPlantsassigned(id:any) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.plantList = [];
    });
  }


  onSelectAll() {

  }
  getLocationName(id:any) {
    let t = this.locationList.find((s:any) => s.id == id);
    return t.code + ' - ' + t.name;
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true
  };

  BloodGroupList: any[] = [];

  currentUser!: AuthData;
  ngOnInit() {
    this.path = this.router.url;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    if (this.employeeId != null) {
      this.getUsersList(this.employeeId);
    }
    // var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // if (chkaccess == true) {
    this.getPlantsassigned(this.currentUser.fkEmpId);
    this.getLocationMaster();
    this.getMaritalstatusList();
    this.getReportingGroupList();
    this.getDepartList();
    this.getCountryList();
    this.getDesignationList();
    this.getRolelist();
    this.getstateList();
    this.getsubDeptList();
    this.getpayGroupList();
    this.getempCatList();
    this.getEmpShiftMasterList();
    //this.getApproversList(this.currentUser.baselocation);
    this.userMasterItem.swipeCount = '2';
    this.userMasterItem.calendarType = 'Regular';
    this.userMasterItem.workingDays = 24;
    this.userMasterItem.isActive = 2;
    // }
    // else   EditContractEmployee
    //   this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  getUsersList(id:any) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.CONTRACT_EMPLOYEE_GET_BY_ANY, this.employeeId).then((data: any) => {
      if (data.length > 0) {
        this.isEdit = true;
        this.userList = data;
        this.userMasterItem = Object.assign({}, data);
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.userList = [];
    });
  }
  EmpShiftMasterList: any[] = [];
  getEmpShiftMasterList() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.EmpShiftMasterList = data.filter((x:any)  => x.isActive == 1).sort((a:any, b:any) => {
          if (a.shiftCode > b.shiftCode) return 1;
          if (a.shiftCode < b.shiftCode) return -1;
          return 0;
        });
        // console.log(this.EmpShiftMasterList);
      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch((error) => {
      this.isLoading = false;
      this.EmpShiftMasterList = [];
    });
  }
  ApproversList: any[] = [];
  getApproversList(id:any) {
    this.getPaygroupsBasedOnPlant();
    let loc = this.locationList.find((x:any)  => x.code == id).id;
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.BR_GET_CONTRACT_EMPLOYEE_APPROVER, loc).then((data: any) => {
      if (data.length > 0) {
        this.ApproversList = data;
      }
      else {
        swal({
          title: "Message",
          text: "Approvers not assigned for the selected plant.",
          dangerMode: false,
          icon: "error",
          buttons: [false, true]
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }
  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    this.payGroupList1 = this.payGroupList.filter((x:any)  => x.plant == this.userMasterItem.location);
  }

  MaritalStatusList: any[] = [];
  getMaritalstatusList() {
    this.errMsg = "";
    this.get("MaritalM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.MaritalStatusList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.MaritalStatusList = [];
    });
  }
  evaluatedays(days: number) {
    if (days > 30) {
      this.userMasterItem.workingDays = 24;
      swal({
        title: "Message",
        text: "No of working cannot be greater than 30 days..!",
        icon: "success",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    }
  }
  stateList: any[] = [];
  getstateList() {
    this.errMsg = "";
    this.get("State/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.filter((x:any)  => x.isActive && x.land1 == 'IN').sort((a:any, b:any) => {
          if (a.bezei > b.bezei) return 1;
          if (a.bezei < b.bezei) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.stateList = [];
    });
  }
  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a:any, b:any) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }
  empCatList: any[] = [];
  empCatListAll: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatListAll = data;
        this.empCatList = data.filter((x:any)  => x.catltxt == 'Contractor');
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.empCatList = [];
    });
  }

  CountryList: any[] = [];
  getCountryList() {
    this.errMsg = "";
    this.get("Country/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.CountryList = data.filter((x:any)  => x.isActive);
        this.userMasterItem.country = data.find((x:any)  => x.land1 == 'IN').land1;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.CountryList = [];
    });
  }

  Rolelist: any[] = [];
  getRolelist() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter((x:any)  => x.isActive);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  subDeptList: any[] = [];
  getsubDeptList() {
    this.errMsg = "";
    this.get("SubDeptMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.subDeptList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.subDeptList = [];
    });
  }

  ReportingGroupList: any[] = [];
  getReportingGroupList() {
    this.errMsg = "";
    this.get("ReportingGroupM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.ReportingGroupList = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ReportingGroupList = [];
    });
  }

  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#reportingManager").val(ui.item.value);
                }
                else {
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#reportingManager").val(ui.item.value);
                }
                else {
                  $("#reportingManagerId").val('');
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

  lastApprovingkeydown = 0;
  getApprovingManager($event) {
    let text = $('#approvingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManager").val(ui.item.value);
                }
                else {
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#approvingManager").val(ui.item.value);
                }
                else {
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
  lastcontractkeydown = 0;
  getContractor($event) {
    let self = this;
    let text = $('#contractor').val();

    if (text.length > 1) {
      if ($event.timeStamp - this.lastcontractkeydown > 400) {
        this.httpService.LAgetByParam(APIURLS.BR_API_GET_CONTRACTORS, text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.name + " (" + item.sapCodeNo + ")", value: item.sapCodeNo };
            })
            $('#contractor').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  self.userMasterItem.vendorContractorId = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#contractorId").val(ui.item.value);
                  $("#contractor").val(ui.item.label);
                  self.userMasterItem.vendorContractorId = ui.item.value;
                }
                else {
                  $("#contractorId").val('');
                  $("#contractor").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastcontractkeydown = $event.timeStamp;
    }
  }

  ManpowerList: any[] = [];
  getManPowerPlanning() {
    let srcstr = this.userMasterItem.location + ',' + this.userMasterItem.payGroup + ',' +
      this.userMasterItem.staffCat + ',' + this.userMasterItem.dptid + ',' + this.userMasterItem.sdptid
      + ',' + this.userMasterItem.vendorContractorId;
    this.httpService.LAgetByParam(APIURLS.BR_GET_MAN_POWER_PLANNING, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.ManpowerList = data;
      }
    }).catch((error)=> {
      this.ManpowerList = null;
      this.isLoading = false;

    });
  }
  designationList: any[] = [];
  getDesignationList() {
    this.errMsg = "";
    this.get("DesignationMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.designationList = [];
    });
  }
  onDesignationChange() {
    this.userMasterItem.gradeId = this.designationList.find((x:any)  => x.id == this.userMasterItem.dsgid).grade;
    this.userMasterItem.bandid = this.designationList.find((x:any)  => x.id == this.userMasterItem.dsgid).band;
  }


  clear() {
    this.userMasterItem = {} as ContractEmployee;
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter((x:any)  => x.isActive).sort((a:any, b:any) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch((error)=> {
      this.departmentList = [];
      this.isLoading = false;

    });
  }

  // CheckManpowerPlanning() {
  //   this.errMsg = "";
  //   let connection: any;
  //   let filterModel: any = {};
  //   filterModel.plant = this.userMasterItem.location;
  //   filterModel.payGroup = this.userMasterItem.payGroup;
  //   filterModel.staffCat = '8';
  //   filterModel.vendorContractorId = this.userMasterItem.vendorContractorId;
  //   connection = this.httpService.LApost(APIURLS.BR_CHECK_CONTRACT_MANPOWER_PLANNING, filterModel);
  //   connection.then((data: any) => {
  //     if (data) {

  //     }
  //     else {

  //     }
  //   });
  // }

  isValid: boolean = false;
  validatedForm: boolean = true;

  saveEmployee() {
    // debugger;
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    //this.userItem.fkSbuId = this.SelempSBUList.id;
    //this.CheckManpowerPlanning();

    if (this.userMasterItem.salarypermonth == null || this.userMasterItem.salarypermonth == undefined) {
      swal({
        title: "Message",
        text: "Please calculate Salary..",
        dangerMode: false,
        icon: "error",
        buttons: [false, true]
      });
      return;
    }
    if (this.userMasterItem.salaryAmount == 0) {
      swal({
        title: "Message",
        text: "Please calculate Salary..",
        dangerMode: false,
        icon: "error",
        buttons: [false, true]
      });
      return;
    }
    else if (this.userMasterItem.vendorContractorName == null || this.userMasterItem.vendorContractorName == '') {
      swal({
        title: "Message",
        text: "Please select Contractor/Vendor details..",
        dangerMode: false,
        icon: "error",
        buttons: [false, true]
      });
      return;
    }
    else if (this.userMasterItem.vendorContractorId == null || this.userMasterItem.vendorContractorId == undefined) {
      swal({
        title: "Message",
        text: "Please select contractor details..",
        dangerMode: false,
        icon: "error",
        buttons: [false, true]
      });
      return;
    }
    else {
      let connection: any;
      this.userMasterItem.createdBy = this.currentUser.employeeId;
      //this.userMasterItem.isActive = 1;
      this.userMasterItem.pendingApprover = this.ApproversList.find((x:any)  => x.priority == 1).approverId;
      this.userMasterItem.status = 'Pending for Approval'
      this.userMasterItem.fileList = this.fileList;
      this.userMasterItem.doj = this.setFormatedDate(this.userMasterItem.doj);
      this.userMasterItem.dol = this.userMasterItem.dol ? this.setFormatedDate(this.userMasterItem.dol) : this.userMasterItem.dol;
      connection = this.httpService.LApost(APIURLS.CONTRACT_EMPLOYEE_INSERT_NEW, this.userMasterItem);

      connection.then((dataaddress: any) => {
        if (dataaddress == 200 || dataaddress.success) {
          // jQuery("#myModal").modal('hide');
          let data = dataaddress.contractempDetails;
          this.uploadfile(data.id);
          swal({
            title: "Message",
            text: "Employee Created Successfully With Employee Id: " + data.employeeId,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clear();
          this.router.navigate(['/ContractEmployeeList'])
        }
        else {
          swal({
            title: "Message",
            text: dataaddress.message,
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
        }
        this.isLoadingPop = false;
      }).catch((error)=> {
        this.isLoadingPop = false;
        alert('Error saving user data..');
      });
    }
  }

  filesList: File[] = [];
  ItemList: any[] = [];
  uploadfiles(files: File) {
    if (this.item.attachmentType == null) {
      toastr.error("Please select attachment type..!");
      return;
    }

    if (!this.checkSpecialCharactersInFileName(files[0].name)) {
      swal({
        title: "Error",
        text: "Filenames cannot have the following special characters: @, !, #, $, &, /, %, ^, *, +, =, {, }, ?, |. Please remove them from " + files[0].name + " before uploading it.",
        icon: "error",
        dangerMode: false,
        buttons: [false, true]
      });
      return;
    } else {
      this.item.fileName = files[0].name;
      this.filesList.push(files[0]);
      this.fileList.push(this.item);
      this.reset();
      this.item = {};
    }
  }

  checkSpecialCharactersInFileName(fileName: string): boolean {
    let pattern = new RegExp("[@!#\$\&%\^*+=\{\}\?\|]");

    if (pattern.test(fileName)) {
      return false;
    }

    return true;
  }

  reset() {
    if (this.myInputVariable.nativeElement.value != null || this.myInputVariable.nativeElement.value != undefined) {
      this.myInputVariable.nativeElement.value = "";
    }
  }
  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res);
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }

getHeader(): { headers: HttpHeaders } {
  //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

  CalculateSalary() {
    if (this.userMasterItem.location == null) {
      toastr.error("Please select location");
      return;
    }
    if (this.userMasterItem.payGroup == null) {
      toastr.error("Please select pay group");
      return;
    }
    if (this.userMasterItem.staffCat == null) {
      toastr.error("Please select employee category");
      return;
    }
    if (this.userMasterItem.dptid == null) {
      toastr.error("Please select department");
      return;
    }
    if (this.userMasterItem.sdptid == null) {
      toastr.error("Please select sub department");
      return;
    }
    if (this.userMasterItem.salaryAmount == null || this.userMasterItem.salaryAmount == 0) {
      toastr.error("Please enter salary");
      return;
    }
    if (this.userMasterItem.salaryFreq == null) {
      toastr.error("Please select salary Frequency");
      return;
    }
    if (this.userMasterItem.workingDays <= 0) {
      toastr.error("Working days should be greater than 0");
      return;
    }

    if (this.userMasterItem.salaryFreq == 'A') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 12)).toString();
    }
    else if (this.userMasterItem.salaryFreq == 'Q') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 4)).toString();
    }
    else if (this.userMasterItem.salaryFreq == 'M') {
      this.userMasterItem.sendSalaryAmount = this.userMasterItem.salaryAmount.toString();
    }
    else if (this.userMasterItem.salaryFreq == 'H') {
      this.userMasterItem.sendSalaryAmount = Math.round((this.userMasterItem.salaryAmount / 6)).toString();
    }
    else {
      this.userMasterItem.sendSalaryAmount = (this.userMasterItem.salaryAmount * this.userMasterItem.workingDays).toString();
    }

    let connection = this.httpService.LApost(APIURLS.VALIDATE_MAN_POWER, this.userMasterItem);

    connection.then((dataaddress: any) => {
      if (dataaddress == 200 || dataaddress.success) {
        // jQuery("#myModal").modal('hide');
        let data = dataaddress.manpowerplannig;
        if (data.type == 'E') {
          swal({
            title: "Error",
            text: data.message,
            icon: "error",
            dangerMode: false,
            buttons: [false, true]
          });
          this.userMasterItem.salaryAmount = 0;
          this.userMasterItem.salarypermonth = "0";
          this.userMasterItem.salaryFreq = null;
        }
        else {
          if (this.userMasterItem.salaryFreq == 'A') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 12)).toString();
          }
          else if (this.userMasterItem.salaryFreq == 'Q') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 4)).toString();
          }
          else if (this.userMasterItem.salaryFreq == 'M') {
            this.userMasterItem.salarypermonth = this.userMasterItem.salaryAmount.toString();
          }
          else if (this.userMasterItem.salaryFreq == 'H') {
            this.userMasterItem.salarypermonth = Math.round((this.userMasterItem.salaryAmount / 6)).toString();
          }
          else {
            this.userMasterItem.salarypermonth = (this.userMasterItem.salaryAmount * this.userMasterItem.workingDays).toString();
          }
        }
      }
      else {
        swal({
          title: "Error",
          text: dataaddress.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.userMasterItem.salaryAmount = 0;
      }
      this.isLoadingPop = false;
    }).catch((error)=> {
      this.isLoadingPop = false;
      alert('Error saving user data..');
    });

  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }



  getFile(id, fileName) {
    if (id <= 0) return;
    this.httpService.LAdownloadFile(APIURLS.BR_GET_EMP_ATTACHMENTS + "/" + id).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find((s:any) => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }

      if (data != undefined) {
       // var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
    //      FileSaver.saveAs(imageFile);
      }
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  onAddLineClick() {
    this.fileList.push(this.item);
    this.count++;
    this.clearInput();
  }

  removeLine(no) {
    var data = this.fileList[no];
    this.fileList.splice(no, 1);
    for (let i = 0; i < this.filesList.length; i++) {
      if (this.filesList[i].name == data.fileName) {
        var index = this.filesList.indexOf(this.filesList[i])
        this.filesList.splice(index, 1);
      }
    }
  }


  clearInput() {
    this.item = {};
  }

  id: string
  formData: FormData = new FormData();
  uploadfile(id:any) {
    // debugger;
    // this.id='VM001';
    this.formData = new FormData();
    for (var i = 0; i < this.filesList.length; i++) {
      this.formData.append('files', this.filesList[i]);
    }
    let connection: any;
    connection = this.httpService.LAfileUpload(APIURLS.BR_SAVE_EMP_ATTACHMENTS, id, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        //this.imageFlag = true;
      }
    }).catch((error)=> {
      this.errMsgPop = 'Error uploading file ..';
    });

  }

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate =
      dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

}
