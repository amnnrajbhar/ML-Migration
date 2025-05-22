import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { MatAccordion } from '@angular/material';
import { LeaveDetails } from '../ApplyLeave/ApplyLeave.model';


@Component({
  selector: 'app-RotationalShift',
  templateUrl: './RotationalShift.component.html',
  styleUrls: ['./RotationalShift.component.css']
})
export class RotationalShiftComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  locationList: any[] = [[]];
  path: string;
  employeeId: any = null;
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  lvType: number = null;
  Date: any = null;
  Date1: string = null;

  Duration1: string = null;
  Duration2: string = null;
  NoOfDays: number = 0;
  LvReason: string = null;
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  LeaveRequestList: any[] = [];
  ApplyFor: any = null;
  userId: string = null;
  ReasonType: string = null;
  SwipeType: string = null;
  filterStatus: any = null;

  filterEmployeeName: string = null;
  filterEmployeeId: string = null;
  filterLocation: string = null;;
  filterPayGroup: string = null;
  filterDepartment: string = null;
  filterSubDepartment: string = null;
  filterReportingGroup: string = null;
  filterCategory: string = null;
  toDate: any;
  EmployeeNo: any = null;

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


  locationAllList: any[] = [[]];
  getLocation(id) {
    let temp = this.locationAllList.find(e => e.id == id);
    return temp ? temp.name : '';
  }
  g
  onSelectAll() {

  }
  getLocationName(id) {
    let t = this.locationList.find(s => s.id == id);
    return t.code + ' - ' + t.name;
  }

  dropdownList = [];
  selectedItems = [];

  Frequency: number = null;
  selectedShifts: any[] = [];

  currentUser: AuthData;
  ngOnInit() {
    this.path = this.router.url;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.baseLocation = this.currentUser.baselocation;
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getEmpShiftMasterList();
      this.getUsersList();
      this.getPlantsassigned(this.currentUser.fkEmpId);
      this.getDepartList();
      this.getsubDeptList();
      this.getempCatList();

    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  shift1: any; shift2: any; shift3: any; shift4: any;
  onItemSelectM(item: any) {
    if (this.Frequency == 1) {
      this.shift1 = this.selectedShifts[0].id;
    }
    if (this.Frequency == 2) {
      this.shift1 = this.selectedShifts[0].id;
      this.shift2 = this.selectedShifts[1].id;

    }
    if (this.Frequency == 3) {
      this.shift1 = this.selectedShifts[0].id;
      this.shift2 = this.selectedShifts[1].id;
      this.shift3 = this.selectedShifts[2].id;
    }
    if (this.Frequency == 4) {
      this.shift1 = this.selectedShifts[0].id;
      this.shift2 = this.selectedShifts[1].id;
      this.shift3 = this.selectedShifts[2].id;
      this.shift4 = this.selectedShifts[3].id;
    }
  }

  onItemSelectB(item: any) {
  }

  onItemSelectRM(item: any) {
  }


  EmpShiftMasterList: any[] = [];
  getEmpShiftMasterList() {
    this.isLoading = true;
    this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
      if (data.length > 0) {
        this.EmpShiftMasterList = data.filter(x => x.isActive == 1).sort((a, b) => {
          if (a.shiftCode > b.shiftCode) return 1;
          if (a.shiftCode < b.shiftCode) return -1;
          return 0;
        });
        this.EmpShiftMasterList.map((i) => { i.code = i.shiftCode + '-' + i.shiftName, i.id = i.shiftCode; return i; });
        // console.log(this.EmpShiftMasterList);

      }
      this.isLoading = false;
      this.reInitDatatable();
    }).catch(() => {
      this.isLoading = false;
      this.EmpShiftMasterList = [];
    });
  }

  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'code',
    allowSearchFilter: true,
    limitSelection: 4
  };
  ClearData() {
    this.selectedEmployees = null;
    this.selectedShifts = null;
    this.Date = null;
    this.toDate = null;
    this.Frequency = null;
  }


  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  dynamicArray: any[] = [];
  newDynamic: any = {};
  rowcount: number = 0;
  addRows(index) {
    this.rowcount = this.rowcount + 1;
    this.newDynamic = { id: this.rowcount, employeeId: null, shift1: "", shift2: null, shift3: "", shift4: "0" };
    this.dynamicArray.push(this.newDynamic);
  }
  removeRows(item) {
    if (this.dynamicArray.length > 1) {
      const index = this.dynamicArray.indexOf(item);
      this.dynamicArray.splice(index, 1);
    }
  }
  dropdownSettingsE = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    limitSelection: 4
  };


  UserList: any[] = [];
  empListCon: any[] = [];
  selectedEmployees: any[] = [];
  getUsersList() {
    let filterModel: any = {};
    filterModel.employeeId = this.currentUser.fkEmpId;
    this.httpService.LApost(APIURLS.GET_AUTHORIZED_EMPLOYEE_LIST, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.UserList = data;
        this.empListCon = data.map((i) => {
          i.name = i.firstName + ' ' + i.middleName + ' ' + i.lastName + '-' + i.employeeId + '-' + i.designation
          i.id = i.employeeId; return i;
        });
      }
    }).catch(error => {
      this.UserList = [];
      this.isLoading = false;

    });
  }

  UpdateShifts() {
    if (this.Frequency == null) {
      toastr.error("Please select rotation frequency.")
      return;
    }
    if (this.Date == null) {
      toastr.error("Please select effective date.")
      return;
    }
    if (this.toDate == null) {
      toastr.error("Please select effective to date.")
      return;
    }
    if (this.checkedRequestList.length <= 0) {
      toastr.error("Please select group of employees and shifts to update.")
      return;
    }
    else if (this.selectedShifts.length <= 0) {
      toastr.error("Please select group of employees and shifts to update.")
      return;
    }
    else if (this.Frequency == 2) {
      if (this.shift1 == '' || this.shift1 == null || this.shift1 == undefined) {
        toastr.error("Please select a shift for Week 1 to update..")
        return;
      }
      else if (this.shift2 == '' || this.shift2 == null || this.shift2 == undefined) {
        toastr.error("Please select a shift for Week 2 to update..")
        return;
      }
    }
    else if (this.Frequency == 3) {
      if (this.shift1 == '' || this.shift1 == null || this.shift1 == undefined) {
        toastr.error("Please select a shift for Week 1 to update..")
        return;
      }
      else if (this.shift2 == '' || this.shift2 == null || this.shift2 == undefined) {
        toastr.error("Please select a shift for Week 2 to update..")
        return;
      }
      else if (this.shift3 == '' || this.shift3 == null || this.shift3 == undefined) {
        toastr.error("Please select a shift for Week 3 to update..")
        return;
      }
    }
    else if (this.Frequency == 4) {
      if (this.shift1 == '' || this.shift1 == null || this.shift1 == undefined) {
        toastr.error("Please select a shift for Week 1 to update..")
        return;
      }
      else if (this.shift2 == '' || this.shift2 == null || this.shift2 == undefined) {
        toastr.error("Please select a shift for Week 2 to update..")
        return;
      }
      else if (this.shift3 == '' || this.shift3 == null || this.shift3 == undefined) {
        toastr.error("Please select a shift for Week 3 to update..")
        return;
      }
      else if (this.shift4 == '' || this.shift4 == null || this.shift4 == undefined) {
        toastr.error("Please select a shift for Week 4 to update..")
        return;
      }
    }

    this.isLoading = true;
    let connection: any;
    let filtermodal: any = {};
    filtermodal.employeeId = this.checkedRequestList.map(x => x.employeeId).join();
    filtermodal.shift1 = this.selectedShifts.find(x => x.id == this.shift1).id;
    filtermodal.shift2 = this.shift2 != null ? this.selectedShifts.find(x => x.id == this.shift2).id : null;
    filtermodal.shift3 = this.shift3 != null ? this.selectedShifts.find(x => x.id == this.shift3).id : null;
    filtermodal.shift4 = this.shift4 != null ? this.selectedShifts.find(x => x.id == this.shift4).id : null;
    filtermodal.frequency = this.Frequency;
    filtermodal.date = this.getDateFormate(this.Date);
    filtermodal.todate = this.getDateFormate(this.toDate);
    filtermodal.updatedBy = this.currentUser.employeeId;
    connection = this.httpService.LApost(APIURLS.UPDATE_ROTATIONAL_SHIFT_DATA, filtermodal);
    connection.then((shiftdata) => {
      if (shiftdata.type == "S") {
        swal({
          title: "Message",
          text: "Rotational Shifts Updated Successfully..",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        this.clearFilter();
        this.checkUncheckAll();
        this.reInitDatatable();
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    });
  }

  EmployeeList: any[] = [];
  getFilteredList() {
    this.Rotation = false;
    if (this.filterLocation == null) {
      toastr.error("Please select plant.");
      return;
    }
    else if (this.filterPayGroup == null) {
      toastr.error("Please select paygroup.");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.baseLocation = this.filterLocation;
      filterModel.fkPayroll = this.filterPayGroup;
      filterModel.fkCompetency = this.filterCategory;
      filterModel.fkDepartment = this.filterDepartment
      filterModel.subDept = this.filterSubDepartment;
      if (this.filterEmployeeId == '' || this.filterEmployeeId == null) {
        filterModel.employeeId = null;
      }
      else {
        filterModel.employeeId = this.filterEmployeeId;
      }
      let connection = this.httpService.LApost(APIURLS.HR_EMPLOYEEMASTER_GET_LIST, filterModel);
      connection.then((data: any) => {
        if (data) {
          this.EmployeeList = data;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.errMsgPop = 'Error uploading file ..';
      });
    }

  }
  lastReportingkeydown = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#empNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
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
  clearFilter() {
    this.filterDepartment = null;
    this.filterPayGroup = null;
    this.filterSubDepartment = null;
    this.filterReportingGroup = null;
    this.filterCategory = null;
    this.filterLocation = null;
    this.selectedEmployees = null;
    this.selectedShifts = null;
    this.shift1 = null;
    this.shift2 = null;
    this.shift3 = null;
    this.shift4 = null;
    this.Date = null;
    this.toDate = null;
    this.Frequency = null;
    this.EmployeeNo = null;
    this.Rotation = false;
    this.EmployeeList = [];
  }

  payGroupList: any[] = [];
  payGroupList1: any[] = [];
  getpayGroupList() {
    this.errMsg = "";
    this.get("PayGroupMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => {
          if (a.short_desc > b.short_desc) return 1;
          if (a.short_desc < b.short_desc) return -1;
          return 0;
        });
        let temp = this.locationList.find(x => x.fkPlantId == this.currentUser.baselocation);
        this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
      }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.payGroupList = [];
    });
  }
  onlocationSelect(id) {
    let temp = this.locationList.find(x => x.fkPlantId == id);
    this.payGroupList1 = this.payGroupList.filter(x => x.plant == temp.code);
  }
  empCatList: any[] = [];
  getempCatList() {
    this.errMsg = "";
    this.get("EmployeeCategoryMaster/GetAll").then((data: any) => {
      if (data.length > 0) {
        this.empCatList = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.empCatList = [];
    });
  }
  departmentList: any[] = [];
  getDepartList() {
    this.httpService.LAget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
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

  plantList: any[] = [];
  getPlantsassigned(id) {
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
      if (data) {
        this.locationList = data.filter(x => { return x.isActive; }).map((i) => { i.location = i.code + '-' + i.name; return i; });;
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.getpayGroupList();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.plantList = [];
    });
  }

  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.EmployeeList.length; i++) {
      this.EmployeeList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.EmployeeList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.EmployeeList.length; i++) {
      if (this.EmployeeList[i].isSelected)
        this.checkedlist.push(this.EmployeeList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }

  RotationalList: any[] = [];
  Rotation: boolean = false;
  GetEmployeesOnRotation() {
    this.Rotation = true;
    if (this.filterLocation == null) {
      toastr.error("Please select plant.");
      return;
    }
    else if (this.filterPayGroup == null) {
      toastr.error("Please select paygroup.");
      return;
    }
    else {
      let filterModel: any = {};
      filterModel.baseLocation = this.filterLocation;
      filterModel.fkPayroll = this.filterPayGroup;
      filterModel.fkCompetency = this.filterCategory;
      filterModel.fkDepartment = this.filterDepartment
      filterModel.subDept = this.filterSubDepartment;
      filterModel.employeeId = this.filterEmployeeId;
      let connection = this.httpService.LApost(APIURLS.GET_EMPLOYEES_ON_ROTATION, filterModel);
      connection.then((data: any) => {
        if (data) {
          this.EmployeeList = data;
        }
        this.reInitDatatable();
      }).catch(error => {
        this.errMsgPop = 'Error uploading file ..';
      });
    }
  }

  RemoveEmployees() {
    if (this.checkedRequestList.length <= 0) {
      toastr.error("Please select group of employees and shifts to update.");
      return;
    }
    else if (this.selectedShifts == null || this.selectedShifts.length <= 0) {
      toastr.error("Please select shifts to update.");
      return;
    }
    else if (this.Date == null) {
      toastr.error("Please select effective date.");
      return;
    }
    else if (this.toDate == null) {
      toastr.error("Please select effective date.");
      return;
    }
    else {
      this.isLoading = true;
      let connection: any;
      let filtermodal: any = {};
      filtermodal.employeeId = this.checkedRequestList.map(x => x.employeeId).join();
      filtermodal.shift1 = this.selectedShifts[0].id;
      filtermodal.frequency = '1';
      filtermodal.date = this.getDateFormate(this.Date);
      filtermodal.updatedBy = this.currentUser.employeeId;
      connection = this.httpService.LApost(APIURLS.DELETE_ROTATIONAL_SHIFT_DATA, filtermodal);
      connection.then((shiftdata) => {
        if (shiftdata.type == "S") {
          swal({
            title: "Message",
            text: "Employees Removed From Rotational Shift Successfully..",
            icon: "success",
            dangerMode: false,
            buttons: [false, true]
          });
          this.clearFilter();
          this.checkUncheckAll();
          this.reInitDatatable();
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      })

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
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}




}
