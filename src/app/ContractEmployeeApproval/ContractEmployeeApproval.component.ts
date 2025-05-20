import { AuthData } from '../auth/auth.model'
import { ContractEmployee } from './ContractEmployeeApproval.model';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import swal from 'sweetalert';
import { ExcelService } from '../shared/excel-service';

export class actionItemModel {
  employeeId: string;
  firstName: string;
  middleName: string
  lastName: string;
  email: string;
  baseLocation: string;
  department: string;
  profile: string;
  designation: string;
  employee_type: string;
  role: string;
  manager: string;
  permanent_Address: string;
  phone_Number: string;
  current_Address: string;
  emergency_Contact_Name: string;
  emergency_Contact_Number: string;
  isActive: boolean;
}

@Component({
  selector: 'app-ContractEmployeeApproval',
  templateUrl: './ContractEmployeeApproval.component.html',
  styleUrls: ['./ContractEmployeeApproval.component.css']
})
export class ContractEmployeeApprovalComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  public tableWidget: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
  userList: ContractEmployee[] = [];
  userMasterItem = {} as ContractEmployee;
  empListCon = [];
  empListCon1 = [];
  locListCon = [];
  locListCon1 = [];
  genders: any[] = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
  titles = [{ type: "Mr." }, { type: "Mrs." }, { type: "Miss." }, { type: "Ms." }, { type: "Dr." }];
  addressList: any[];
  empOtherDetailList: any[];
  employeePayrollList: any[];
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  path: string;
  selectedBaseLocation: any[] = [];
  filterEmployeeName: string = '';
  filterEmployeeId: string = '';
  filterLocation: string = '';
  filterPayGroup: string = '';
  filterDepartment: string = '';
  filterSubDepartment: string = '';
  filterReportingGroup: string = '';
  filterStatus: string = 'Active';

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: Http, private excelService: ExcelService) { }

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
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  getLocationMaster() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.filterLocation = this.locationList.find(x => x.id == this.currentUser.baselocation).code;
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.plantList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.plantList.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  onSelectAll() {

  }

  clearFilter() {
    this.filterLocation = '';
    this.filterEmployeeId = '';
    this.filterEmployeeName = '';
    this.filterDepartment = '';
    this.filterPayGroup = '';
    this.filterSubDepartment = '';
    this.filterReportingGroup = ''
    this.filterStatus = 'Active';
    this.userList = [];
  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
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

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;

    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getMaritalstatusList();
      this.getReportingGroupList();
      this.getDepartList();
      this.getCountryList();
      this.getDesignationList();
      this.getRolelist();
      this.getstateList();
      this.getsubDeptList();
      this.getpayGroupList();
      this.getUsersList();
      this.getempCatList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }
  empCatListAll: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatListAll = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatListAll = [];
    });
  }
  getcat(id) {
    let temp = this.empCatListAll.find(x => x.id == id);
    return temp ? temp.catltxt : '';
  }

  MaritalStatusList: any[] = [];
  getMaritalstatusList() {
    this.errMsg = "";
    this.get("MaritalM/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.MaritalStatusList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.MaritalStatusList = [];
    });
  }
  getUsersList() {
    this.errMsg = "";
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.location = this.filterLocation;
    filterModel.payGroup = this.filterPayGroup;
    filterModel.dptid = this.filterDepartment;
    filterModel.sdptid = this.filterSubDepartment;
    filterModel.reportingGroup = this.filterReportingGroup;
    if (this.filterStatus == 'Active') {
      filterModel.isActive = 1;
    }
    else if (this.filterStatus == 'InActive') {
      filterModel.isActive = 0;
    }
    else if (this.filterStatus == 'ToBe Approved') {
      filterModel.isActive = 2;
    }
    else if (this.filterStatus == 'Blacklisted') {
      filterModel.isActive = 3;
    }
    //    filterModel.isActive = this.filterStatus='Active'?1:this.filterStatus='In Active'?0:this.filterStatus='ToBe Approved'?2:this.filterStatus='Blacklisted'?3:'';
    this.httpService.LApost(APIURLS.CONTRACT_EMPLOYEE_GET_FILTERED_LIST, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.userList = data;
      }
      else{
        this.userList = [];
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.userList = [];
    });
  }
  getdesig(id) {
    var temp = this.designationList.find(x => x.id == id);
    return temp ? temp.name : '';
  }
  getdept(id) {
    var temp = this.departmentList.find(x => x.id == id);
    return temp ? temp.name : '';
  }
  getsubdept(id) {
    var temp = this.subDeptList.find(x => id == id);
    return temp ? temp.sdptidStxt : '';
  }
  getpaygroup(id) {
    var temp = this.payGroupList.find(x => x.payGroup == id);
    return temp ? temp.short_desc : '';
  }

  stateList: any[] = [];
  getstateList() {
    this.errMsg = "";
    this.get("State/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.filter(x => x.isActive && x.land1 == 'IN').sort((a, b) => {
          if (a.bezei > b.bezei) return 1;
          if (a.bezei < b.bezei) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.stateList = [];
    });
  }
  payGroupList: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }

  EditUser(id) {
    let route = 'EditContractEmployee/' + id;
    this.router.navigate([route]);
  }
  ViewUser(id) {
    let route = 'ViewContractEmployee/' + id;
    this.router.navigate([route]);
  }

  deleteUser(user) {
    swal({
      title: "Message",
      text: "Are you Sure to Inactive..?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((data) => {
      if (data) {
        this.userMasterItem = {} as ContractEmployee;
        this.userMasterItem = Object.assign({}, user);
        this.userMasterItem.isActive = 0;
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        //this.userItem.fkSbuId = this.SelempSBUList.id;

        let connection: any;
        this.userMasterItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.userMasterItem.id, this.userMasterItem);

        connection.then((dataaddress: any) => {
          if (dataaddress == 200) {
            // jQuery("#myModal").modal('hide');
            alert('Employee Inactivated Successfully');
            // jQuery("#saveModal").modal('show');
            this.getUsersList();
            this.clear();
          }
          this.isLoadingPop = false;
        }).catch(error => {
          this.isLoadingPop = false;
          alert('Error inactivating user..');
        });
      }
    });


  }
  CountryList: any[] = [];
  getCountryList() {
    this.errMsg = "";
    this.get("Country/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.CountryList = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.CountryList = [];
    });
  }

  Rolelist: any[] = [];
  getRolelist() {
    this.errMsg = "";
    this.get("RoleMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.Rolelist = data.filter(x => x.isActive);
      }
    }).catch(error => {
      this.isLoading = false;
      this.Rolelist = [];
    });
  }

  getRole(id) {
    let temp = this.Rolelist.find(x => x.id == id);
    return temp ? temp.role_Stxt : '';
  }

  subDeptList: any[] = [];
  getsubDeptList() {
    this.errMsg = "";
    this.get("SubDeptMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.subDeptList = data;
      }
    }).catch(error => {
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
    }).catch(error => {
      this.isLoading = false;
      this.ReportingGroupList = [];
    });
  }

  getReporting(id) {
    let temp = this.ReportingGroupList.find(x => x.id == id);
    return temp ? temp.reportingGroupSt : '';
  }
  lastReportingkeydown = 0;
  getReportingManager($event) {
    let text = $('#reportingManager').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#reportingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
                }
                else {
                  $("#reportingManagerId").val('');
                  $("#reportingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#reportingManagerId").val(ui.item.value);
                  $("#reportingManager").val(ui.item.label);
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
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#approvingManager').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else {
                  $("#approvingManagerId").val('');
                  $("#approvingManager").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#approvingManagerId").val(ui.item.value);
                  $("#approvingManager").val(ui.item.label);
                }
                else {
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

  designationList: any[] = [];
  getDesignationList() {
    this.errMsg = "";
    this.get("DesignationMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }
  onDesignationChange() {
    this.userMasterItem.gradeId = this.designationList.find(x => x.id == this.userMasterItem.dsgid).grade;
    this.userMasterItem.bandid = this.designationList.find(x => x.id == this.userMasterItem.dsgid).band;
  }


  clear() {
    this.userMasterItem = {} as ContractEmployee;
  }

  getDepartList() {
    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.departmentList = [];
      this.isLoading = false;

    });
  }
  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.userList.length; i++) {
      this.userList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.userList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.userList.length; i++) {
      if (this.userList[i].isSelected)
        this.checkedlist.push(this.userList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }


  ApproveUser() {
    if (this.checkedRequestList.length <= 0) {
      swal({
        title: "Error",
        text: "Please select one Contract Employee to approve..!",
        icon: "error",
        dangerMode: false,
        buttons: [true, true]
      });
      // alert("Please select atleast one employee to approve.");
      return;
    }
    if (this.checkedRequestList.length > 1) {
      swal({
        title: "Error",
        text: "Please select only one Contract Employee to approve..!",
        icon: "error",
        dangerMode: false,
        buttons: [true, true]
      });
      return;
    }
    else {
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      let connection: any;
      this.checkedRequestList.forEach(element => {
        this.userMasterItem = {} as ContractEmployee;
        this.userMasterItem = Object.assign({}, element);
        this.userMasterItem.isActive = 1;
        
        //this.userItem.fkSbuId = this.SelempSBUList.id;
        this.userMasterItem.pendingApprover = '';
        this.userMasterItem.status = 'Approved';

        this.userMasterItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.userMasterItem.id, this.userMasterItem);

      });

      connection.then((dataaddress: any) => {
        if (dataaddress == 200) {

          swal({
            title: "Message",
            text: "Contract Employee Approved Successfully..!",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.getUsersList();
          this.clear();
        }
        this.isLoadingPop = false;
      }).catch(error => {
        this.isLoadingPop = false;
        alert('Error approving user..');
      });

    }
  }

  isValid: boolean = false;
  validatedForm: boolean = true;

  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => { // Success
            //   //console.log(res.json());
            resolve(res.json());
          },
          err => {
            //  //console.log(err.json());
            reject(err.json());
          }
        );

    });
    return promise;
  }

  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }

  setFormatedDateTime(date: any) {
    let dt = new Date(date);
    let formateddate = ("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      dt.getFullYear() + ' ' +
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
  exportList: any[];
  exportExcel() {
    this.exportList = [];
    let index = 0;
    this.userList.forEach(item => {
      index = index + 1;
      let midName = '';
      let lastName = ''
      midName = item.middleName == null ? '' : item.middleName;
      lastName = item.lastName == null ? '' : item.lastName;
      let exportItem = {
        "SNo": index,
        "Plant": item.location,
        "Pay Group": item.payGroup ? this.payGroupList.find(x => x.id == item.payGroup).payGroup : '',
        "Employee Id": item.employeeId,
        "Title": item.title,
        "Full Name": item.firstName + ' ' + midName + ' ' + lastName,
        "Gender": item.gender == '1' ? 'Male' : 'Female',
        "DOB": this.setDateFormate(item.dob),
        "Marital Status": this.MaritalStatusList.find(x => x.id == item.maritalStatus).name,
        "Blood Group": item.bloodGroup,
        "Mobile No": item.mobile,
        "Email Id": item.emailId,
        "Vendor Id": item.vendorContractorId,
        "Designation": item.dsgid ? this.designationList.find(x => x.id == item.dsgid).name : '',
        "Grade": item.gradeId,
        "Band": item.bandid,
        "Role": this.Rolelist.find(x => x.id == item.roleId).role_Stxt,
        "Department": item.dptid ? this.departmentList.find(x => x.id == item.dptid).name : '',
        "Sub Department": item.sdptid ? this.subDeptList.find(x => x.id == item.sdptid).sdptidStxt : '',
        "Reporting Group": item.reportingGroup ? this.ReportingGroupList.find(x => x.id == item.reportingGroup).reportingGroupSt : '',
        "DOJ": item.doj ? this.setDateFormate(item.doj) : '',
        "Contract End Date": item.dol ? this.setDateFormate(item.dol) : '',
        "Reporting Manager": item.rptmngr,
        "Approving Manager": item.apprmngr,
        "Shift": item.shiftCode,
        "Attendance Rule": item.ruleCode,
        "Swipe Count": item.swipeCount,
        "Floor": item.floor,
        "Building": item.building,
        "Room/Block": item.block,
        "Salary Frequency": item.salaryFreq,
        "Salary Amount": item.salaryAmount,
        "No of Working Days": item.workingDays,
        "Eligible for OT": item.eligibleforOt,
        "Weekly Off": item.weeklyOff,

      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFile(this.exportList, 'Contract_Employee_List');
  }

  BlacklistUser(user) {
    swal({
      title: "Message",
      text: "Are you Sure to Blacklist Employee..?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((data) => {
      if (data) {
        this.userMasterItem = {} as ContractEmployee;
        this.userMasterItem = Object.assign({}, user);
        this.userMasterItem.isActive = 3;
        this.userMasterItem.blacklisted = true;
        this.userMasterItem.status = "Blacklisted"
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        //this.userItem.fkSbuId = this.SelempSBUList.id;

        let connection: any;
        this.userMasterItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.userMasterItem.id, this.userMasterItem);

        connection.then((dataaddress: any) => {
          if (dataaddress == 200) {
            swal({
              title: "Message",
              text: "Contract Employee Blacklisted Successfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [true, true]
            });
            this.getUsersList();
            this.clear();
          }
          this.isLoadingPop = false;
        }).catch(error => {
          this.isLoadingPop = false;
          alert('Error blacklisting user..');
        });
      }
    });

  }
  UnBlacklistUser(user) {
    swal({
      title: "Message",
      text: "Are you Sure to Remove Employee from Blacklist..?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((data) => {
      if (data) {
        this.userMasterItem = {} as ContractEmployee;
        this.userMasterItem = Object.assign({}, user);
        this.userMasterItem.isActive = 0;
        this.userMasterItem.blacklisted = false;
        this.userMasterItem.status = "UnBlocked"
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        //this.userItem.fkSbuId = this.SelempSBUList.id;

        let connection: any;
        this.userMasterItem.modifiedBy = this.currentUser.employeeId;
        connection = this.httpService.LAput(APIURLS.CONTRACT_EMPLOYEE_INSERT, this.userMasterItem.id, this.userMasterItem);

        connection.then((dataaddress: any) => {
          if (dataaddress == 200) {
            swal({
              title: "Message",
              text: "Employee Removed from Blacklist Succuessfully..!",
              icon: "success",
              dangerMode: false,
              buttons: [true, true]
            });
            this.getUsersList();
            this.clear();
          }
          this.isLoadingPop = false;
        }).catch(error => {
          this.isLoadingPop = false;
          alert('Error blacklisting user..');
        });
      }
    });

  }

}
