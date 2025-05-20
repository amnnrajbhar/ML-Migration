import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { LeaveStructure } from './LeaveStructure.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as _ from "lodash";
import { error } from 'console';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import { ExcelService } from '../../shared/excel-service';
import * as fs from 'file-saver';
import { DISABLED } from '@angular/forms/src/model';


declare var jQuery: any;
export class actionItemModel {
  description: string;
  id: number;
  uname: string;
}
@Component({
  selector: 'app-LeaveStructure',
  templateUrl: './LeaveStructure.component.html',
  styleUrls: ['./LeaveStructure.component.css']
})
export class LeaveStructurecomponent implements OnInit {
  searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm) leaveForm: NgForm;
  public filteredItems = [];
  public tableWidget: any;
  leavestructureItem: LeaveStructure = new LeaveStructure();
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';
  notFirst = true;
  currentUser = {} as AuthData;
  oldleavestructureItem: LeaveStructure = new LeaveStructure();
  auditType: string;
  aduitpurpose: string;
  leavestructureList: any;
  id: any;
  locationAllList: any;
  locationList: any;
  locListCon: any;
  baseLocation: number;
  public filteredItemsBasePlant = [];

  constructor(private httpService: HttpService, private router: Router, private appService: AppComponent, private excelService: ExcelService,
    private http: Http) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#LeaveTable');
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


  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.baseLocation = this.currentUser.baselocation;
      this.getplantMaster();
      this.getempCatList();
      this.getpayGroupList();
      this.getLeaveTypeList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  getplantMaster() {
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationAllList = data;
        this.locationList = data.filter(x => x.isActive);
        let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
      }
    }).catch(error => {
      this.isLoading = false;
      this.locationList = [];
    });
  }

  Plant: any;
  Paygroup: any;
  Empcat: any;
  getLeaveStructureList() {
    this.selectedLeaveList = [];
    this.errMsg = "";
    this.isLoading = true;
    let filterModel: any = {};
    filterModel.werks = this.Plant;
    filterModel.paygroup = this.Paygroup;
    filterModel.staffcat = this.Empcat;
    this.httpService.LApost(APIURLS.BR_LEAVESTRUCTURE_GETALL, filterModel).then((data: any) => {
      if (data.length > 0) {
        this.leavestructureList = data;
      }
      else {
        swal({
          title: "Message",
          text: " NO Data Found..!",
          icon: "error",
          dangerMode: false,
          buttons: [false, true]
        });
        this.leavestructureList = [];
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.leavestructureList = [];
    });
  }

  ClearFilter() {
    this.Plant = '';
    this.Paygroup = '';
    this.Empcat = '';
    this.leavestructureList = [];
    this.reInitDatatable();
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

  getStaffCat(id) {
    let temp = this.empCatList.find(x => x.id == id);
    return temp ? temp.catltxt : '';
  }

  leaveTypeList: any[] = [];
  getLeaveTypeList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_LEAVE_TYPES_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.leaveTypeList = data;
        this.leaveTypeList.forEach(element => {
          element.leaveTypes = element.lvShrt + ' - ' + element.lvType;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.leaveTypeList = [];
    });
  }

  selectedLeaveList: any[] = [];
  leaveTypeListSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'leaveTypes',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  onItemDeSelect(item: any) {
  }
  onDeSelectAll(items: any) {
    this.selectedLeaveList = [];
  }
  onSelectAll(items: any) {
    this.selectedLeaveList = items;
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

  payGroupList1: any[] = [];
  getPaygroupsBasedOnPlant() {
    //this.filterPaygroup = null;
    let temp = this.locationList.find(x => x.code == this.Plant);
    this.payGroupList1 = temp ? this.payGroupList.filter(x => x.plant == temp.code) : [];
  }

  getPaygroup(id) {
    let temp = this.payGroupList.find(x => x.id == id);
    return temp ? temp.long_Desc : '';
  }

  ngAfterViewInit() {
    this.initDatatable()
  }

  closeSaveModal() {
    jQuery("#myModal").modal('hide');
  }

  areTextboxesDisabled: boolean = false;
  onAddLeave(isEdit: boolean, data: LeaveStructure) {
    this.leaveForm.form.markAsPristine();
    this.leaveForm.form.markAsUntouched();
    this.leaveForm.form.updateValueAndValidity();
    this.notFirst = true;
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.leavestructureItem = new LeaveStructure();
    this.aduitpurpose = '';
    this.oldleavestructureItem = new LeaveStructure();
    if (this.isEdit) {
      this.disableTextboxes();
      this.leavestructureItem = Object.assign({}, data);
      if (this.leavestructureItem.laccum == true) {
        this.leavestructureItem.laccum = true;
      }
      else {
        this.leavestructureItem.laccum = false;
      }
      console.log(this.leavestructureItem);
      if (this.leavestructureItem.awothltyp == true) {
        // this.selectedLeaveList =  this.selectedLeaveList.concat(data.leaveTypeid);
        this.selectedLeaveList = [];
        let leaveTypeIDs: string[] = this.leavestructureItem.leavetypes.split(',');
        this.leaveTypeList.forEach(element => {
          if (leaveTypeIDs.find(x => x == element.id)) {
            this.selectedLeaveList.push(element);
            console.log(this.selectedLeaveList);
          }
        });
      }
    }
    else {
      this.enableTextboxes();
      this.leavestructureItem = new LeaveStructure();
    }
    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');
  }

  disableTextboxes() {
    this.areTextboxesDisabled = true;
  }
  enableTextboxes() {
    this.areTextboxesDisabled = false;
  }


  Edit(data: any) {
    this.leavestructureItem = Object.assign({}, data)
  }

  onSaveLeave() {
    if (this.leavestructureItem.awothltyp == true && this.selectedLeaveList.length == 0) {
      this.isLoading = false;
      swal({
        title: "Error",
        text: "Please select a Leave Type from 'Combined With ?' option..!",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true],
      });
      return;
    }
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    let connection: any;
    this.leavestructureItem.isActive = true;
    if (this.leavestructureItem.leavtxt == 'CASUAL') {
      this.leavestructureItem.leavtyp = 'CL'
    }
    else if (this.leavestructureItem.leavtxt == 'SICK') {
      this.leavestructureItem.leavtyp = 'SL'
    }
    else if (this.leavestructureItem.leavtxt == 'PRIVILEGE') {
      this.leavestructureItem.leavtyp = 'EL'
    }
    else if (this.leavestructureItem.leavtxt == 'MATERNITY') {
      this.leavestructureItem.leavtyp = 'ML'
    }
    else if (this.leavestructureItem.leavtxt == 'COMP-OFF') {
      this.leavestructureItem.leavtyp = 'CO'
    }
    else if (this.leavestructureItem.leavtxt == 'ESIC') {
      this.leavestructureItem.leavtyp = 'ES'
    }
    else if (this.leavestructureItem.leavtxt == 'ESIC - ML') {
      this.leavestructureItem.leavtyp = 'ESML'
    }
    else {
      this.leavestructureItem.leavtyp = 'NL'
    }
    if (this.leavestructureItem.awothltyp == true) {
      this.leavestructureItem.leaveTypeid = this.selectedLeaveList.length > 0 ? this.selectedLeaveList.map(x => x.id).join(',') : null;
    }
    else {
      this.leavestructureItem.leaveTypeid = null;
    }
    this.leavestructureItem.laccum = this.leavestructureItem.laccum ? true : false;
    this.leavestructureItem.lencash = this.leavestructureItem.lencash ? true : false;
    this.leavestructureItem.lhdallow = this.leavestructureItem.lhdallow ? true : false;
    this.leavestructureItem.ladv = this.leavestructureItem.ladv ? true : false;
    this.leavestructureItem.lwkend = this.leavestructureItem.lwkend ? true : false;
    this.leavestructureItem.lihol = this.leavestructureItem.lihol ? true : false;
    this.leavestructureItem.lpiadv = this.leavestructureItem.lpiadv ? true : false;
    this.leavestructureItem.awothltyp = this.leavestructureItem.awothltyp ? true : false;
    this.leavestructureItem.cldm = this.leavestructureItem.cldm ? true : false;

    if (!this.isEdit) {
      this.leavestructureItem.auditType = "Create";
      this.leavestructureItem.createdBy = this.currentUser.employeeId;
      connection = this.httpService.LApost(APIURLS.BR_LEAVESTRUCTURE_INSERT_API, this.leavestructureItem);
    }
    else {
      this.auditType = "Update";
      this.leavestructureItem.modifiedBy = this.currentUser.employeeId;
      connection = this.httpService.LAput(APIURLS.BR_LEAVESTRUCTURE_UPDATE, this.leavestructureItem.id, this.leavestructureItem);
    }

    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.length == null) {
        jQuery("#myModal").modal('hide');
        swal({
          title: "Message",
          text: "Leave Data Saved successfully!..",
          icon: "success",
          dangerMode: false,
          buttons: [false, true],
        });
        let Id = !this.isEdit ? data.id : this.leavestructureItem.id;
        this.getLeaveStructureList();
      }
      if (data.errorType == 'E') {
        swal({
          title: "Message",
          text: data.message,
          icon: "error",
          dangerMode: false,
          buttons: [false, true],
        });
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving Leave data..';
    });
  }

  deleteLeave(data: LeaveStructure): void {
    this.leavestructureItem = new LeaveStructure();
    this.aduitpurpose = '';
    this.oldleavestructureItem = new LeaveStructure();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      dangerMode: true,
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        Object.assign(this.leavestructureItem, data);
        let connection: any;
        this.auditType = "Delete";
        this.leavestructureItem.isActive = false;
        this.leavestructureItem.modifiedBy = this.currentUser.employeeId;
        this.leavestructureItem.modifiedOn = new Date().toLocaleString();
        connection = this.httpService.LAdelete(APIURLS.BR_LEAVESTRUCTURE_DELETE, this.leavestructureItem.id);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgPop1 = ' Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.getLeaveStructureList();
          }
        }).catch(() => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error deleting LeaveStructure..';
        });
      }
    });
  }

  keyPressAllowOnlyNumber(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }
  get(apiKey: string): any {
    const promise = new Promise((resolve, reject) => {
      this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
        .toPromise()
        .then(
          res => {
            resolve(res.json());
          },
          err => {
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

  setFormatedDate(date: any) {
    let dt = new Date(date);
    let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
    return formateddate;
  }

  exportList: any[];
  exportAsXLSX(): void {
    if (this.leavestructureList == undefined) {
      swal({
        title: "Message",
        text: "Provide required filters to get data...!",
        icon: "error",
        dangerMode: false,
        buttons: [false, true],
      });
      return;
    }
    this.exportList = [];
    let status: any;
    let index = 0;
    var name = 'Leave Structure Masters Report';
    this.leavestructureList.forEach(item => {
      index = index + 1;
      let exportItem = {
        "SNo": index,
        "Plant": item.werks,
        "PayGroup": this.getPaygroup(item.paygroup),
        "Staff Category": this.getStaffCat(item.staffcat),
        "Leave Type": item.leavtyp,
        "Leave Text": item.leavtxt,
        "NO. of Days Leave": +item.lnodays,
        "Leave Accumulation": item.laccum,
        "Leave Accumulation Days": +item.lacclt,
        "Leave Enchashment": item.lencash,
        "Leave Enchashment Days": +item.lenclt,
        "Minimum Leave Avail": +item.lminalw,
        "Maximum Leave Avail": +item.lmaxalw,
        "Minimum Gap b/w 2 Leaves": +item.lmindur,
        "Half Day Allowed": item.lhdallow,
        "Maximum Half Day leaves allowed in a Year": +item.lmaxtime,
        "Minimum Attendance required in a Month": +item.lattlt,
        "Allow Negative Leave balance": item.ladv,
        "Negative Days Limit": +item.lmaxadv,
        "Include Weekend In Availed Leaves": item.lwkend,
        "Include Company Declared Hoidays In Availed Leaves": item.lihol,
        "Allow Leave Application to be posted in advance": item.lpiadv,
        "Advance Leave Posting Days": +item.ladvday,
        "Can Leave be availed in Combination of Other Leave": item.awothltyp,
        "Combined With": item.leavetypes,
        "In a Half year how many Leaves can be availed": +item.lhalfyr,
        "Applicable to which Gender": item.gesch,
        "Applicable With": item.applicablewith,
        "Calculate Leave Eligibility after a period": item.cldm,
        "After how many Months": +item.month,
        "Auto Approval": item.autoApprove,
        "Auto Approval After Days": +item.autoApproveAfterDays,
        "Show Zero Leave balance": item.showzeroleavebalance
      }
      this.exportList.push(exportItem);
    });

    this.excelService.exportAsExcelFileForLA(this.exportList, name);
  }

  exportExcelLeaveStructure() {
    if (this.leavestructureList == undefined) {
      swal({
        title: "Message",
        text: "Provide required filters to get data...!",
        icon: "error",
        dangerMode: false,
        buttons: [false, true],
      });
      return;
    }
    const title = 'Leave Structure Masters Report';
    const header = ["SNo", "Plant", "PayGroup", "Emp Cat", "Leave Type", "Leave Text", "NO. of Days Leave",
      "Leave Accumulation", "Leave Accumulation Days", "Leave Enchashment", "Leave Enchashment Days", "Minimum Leave Avail",
      "Maximum Leave Avail", "Minimum Gap b/w 2 Leaves", "Half Day Allowed", "Maximum Half Day leaves allowed in a Year",
      "Minimum Attendance required in a Month", "Allow Negative Leave balance", "Negative Days Limit", "Include Weekend In Availed Leaves",
      "Include Company Declared Hoidays In Availed Leaves", "Allow Leave Application to be posted in advance", "Advance Leave Posting Days",
      "Can Leave be availed in Combination of Other Leave", "Combined With", "In a Half year how many Leaves can be availed",
      "Applicable to which Gender", "Applicable With", "Calculate Leave Eligibility after a period",
      "After how many Months", "Auto Approval", "Auto Approval After Days", "Show Zero Leave balance",
      "Created By", "Created Date"]
    var exportList = [];
    var ts: any = {};
    let index = 0;
    this.leavestructureList.forEach(item => {
      index = index + 1;
      ts = {};
      ts.slno = index;
      ts.werks = item.werks;
      ts.paygroup = this.getPaygroup(item.paygroup);
      ts.staffcat = this.getStaffCat(item.staffcat);
      ts.leavtyp = item.leavtyp;
      ts.leavtxt = item.leavtxt;
      ts.lnodays = +item.lnodays;
      if (item.laccum == true) {
        ts.laccum = "YES";
      }
      else {
        ts.laccum = "NO";
      }
      ts.lacclt = +item.lacclt;
      if (item.lencash == true) {
        ts.lencash = "YES";
      }
      else {
        ts.lencash = "NO";
      }
      ts.lenclt = +item.lenclt;
      ts.lminalw = +item.lminalw;
      ts.lmaxalw = +item.lmaxalw;
      ts.lmindur = +item.lmindur;
      if (item.lhdallow == true) {
        ts.lhdallow = "YES";
      }
      else {
        ts.lhdallow = "NO";
      }
      ts.lmaxtime = +item.lmaxtime;
      ts.lattlt = +item.lattlt;
      if (item.ladv == true) {
        ts.ladv = "YES";
      }
      else {
        ts.ladv = "NO";
      }
      ts.lmaxadv = +item.lmaxadv;
      if (item.lwkend == true) {
        ts.lwkend = "YES";
      }
      else {
        ts.lwkend = "NO";
      }
      if (item.lihol == true) {
        ts.lihol = "YES";
      }
      else {
        ts.lihol = "NO";
      }
      if (item.lpiadv == true) {
        ts.lpiadv = "YES";
      }
      else {
        ts.lpiadv = "NO";
      }
      ts.lpiadv = item.lpiadv;
      ts.ladvday = +item.ladvday;
      if (item.awothltyp == true) {
        ts.awothltyp = "YES";
      }
      else {
        ts.awothltyp = "NO";
      }
      ts.leavetypes = item.leavetypes;
      ts.lhalfyr = +item.lhalfyr;
      if (item.gesch == 1) {
        ts.gesch = 'All';
      }
      else if (item.gesch == 2) {
        ts.gesch = 'MALE';
      }
      else {
        ts.gesch = 'FEMALE';
      }
      if (item.applicablewith == 1) {
        ts.gesch = 'All';
      }
      else if (item.applicablewith == 2) {
        ts.gesch = 'ESIC';
      }
      else {
        ts.gesch = 'MEDICLAIM';
      }
      if (item.cldm == true) {
        ts.cldm = "YES";
      }
      else {
        ts.cldm = "NO";
      }
      ts.month = +item.month;
      if (item.autoApprove == true) {
        ts.autoApprove = "YES";
      }
      else {
        ts.autoApprove = "NO";
      }
      ts.autoApproveAfterDays = +item.autoApproveAfterDays;
      if (item.availFlexiHours == true) {
        ts.showzeroleavebalance = "YES";
      }
      else {
        ts.showzeroleavebalance = "NO";
      }
      ts.createdBy = +item.createdBy;
      ts.createdOn = this.setFormatedDate(item.createdOn);
      exportList.push(ts);
    });
    var OrganisationName = "MICRO LABS LIMITED";
    const data = exportList;
    let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Rules Masters');
    //Add Row and formatting
    var head = worksheet.addRow([OrganisationName]);
    head.font = { size: 16, bold: true }
    head.alignment = { horizontal: 'center' }
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:W1');
    worksheet.mergeCells('A2:W2');
    //Add Header Row
    let headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    for (let x1 of data) {
      let x2 = Object.keys(x1);
      let temp = []
      for (let y of x2) {
        temp.push(x1[y])
      }
      worksheet.addRow(temp)
    }
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRow([]);
    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'LeaveStructures_Master.xlsx');
    });
  }

}
