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
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { LeaveDetails } from './LeaveCard.model';

declare var ActiveXObject: (type: string) => void;

// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe, DecimalPipe } from '@angular/common';
// import htmlToPdfmake from 'html-to-pdfmake';


@Component({
  selector: 'app-LeaveCard',
  templateUrl: './LeaveCard.component.html',
  styleUrls: ['./LeaveCard.component.css']
})
export class LeaveCardComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger!: MatAutocompleteTrigger;
@ViewChild(NgForm, { static: false }) userForm!: NgForm;


  @ViewChild('myInput', { static: false }) myInputVariable!: ElementRef;

  public tableWidget: any;
  public tableWidgetlv: any;
  //designationList: any[] = [];
  roleList: any[] = [];
  departmentList: any[] = [];
  profileList: any[] = []; managerList: any[] = []; reporting_managerList: any[] = [];
  projectList: any[] = [];
  userDivisionList: any[] = [];
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
  userMasterItem: any = {};
  year: any;

  CalenderYear: string = '';
  CalYear: any;
  lvType: number = null;
  StartDate: string = ' ';
  EndDate: string = ' ';
  Duration1: string = ' ';
  Duration2: string = ' ';
  NoOfDays: number = 0;
  LvReason: string = ' ';
  personResponsible: any;
  personName: any;
  DetailedReason: string = '';
  LeaveRequestList: any[] = [];
  ApplyFor: any = null;
  userId: string = ' ';
  LeaveAddress: any;
  LeaveContactNo: any;
  approvalStatus: any;
  approvedDate: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private http: HttpClient, private https: HttpClient, private route: ActivatedRoute) {
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
 }

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

  private initlvDatatable(): void {
    let exampleId: any = jQuery('#userTable');
    this.tableWidgetlv = exampleId.DataTable({
      "order": []
    });
  }

  private reInitlvDatatable(): void {
    if (this.tableWidgetlv) {
      this.tableWidgetlv.destroy()
      this.tableWidgetlv = null
    }
    setTimeout(() => this.initlvDatatable(), 0)
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
    this.httpService.LAget(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
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
    this.employeeId = this.currentUser.employeeId;
    let today = new Date();
    this.year = today.getFullYear();
    this.CalenderYear = new Date().getFullYear().toString();
    this.CalYear = new Date().getFullYear().toString();
    this.getLocationMaster();
    this.getLvTypesList();
    this.getApproversList(this.employeeId);
    this.getEmpleaveRequests();
    this.getbase64image();
    this.GetEmpDetails(this.currentUser.employeeId);
    this.GetReportingEmployeeList();
    this.getRoleList();
  }

  ngAfterViewInit() {
    this.initDatatable();
  }


  totOpbal: number = 0;
  totUsbal: number = 0;
  totClbal: number = 0;
  totAvbal: number = 0;
  lvbalaneList: any[] = [];
  getUsersList(id:any) {
    this.errMsg = "";
    this.lvbalaneList = [];
    this.totOpbal = 0;
    this.totUsbal = 0;
    this.totAvbal = 0;
    this.totClbal = 0;
    let srcstr = id + "," + this.CalYear;
    this.httpService.LAgetByParam(APIURLS.GET_LEAVE_DATA_BY_EMPLOYEE, srcstr).then((data: any) => {
      if (data.length > 0) {
        this.lvbalaneList = [];
        this.totOpbal = 0;
        this.totUsbal = 0;
        this.totAvbal = 0;
        this.totClbal = 0;
        this.lvbalaneList = data.sort((a:any, b:any) => {
          if (a.lvTypeid > b.lvTypeid) return 1;
          if (a.lvTypeid < b.lvTypeid) return -1;
          return 0;
        });
        this.totOpbal = 0;
        this.totUsbal = 0;
        this.totClbal = 0;
        this.totAvbal = 0;
        this.lvbalaneList.forEach((element:any)=> {

          this.totOpbal = this.totOpbal + element.lvOpbal;
          this.totUsbal = this.totUsbal + element.lvAvailed;
          this.totClbal = this.totClbal + element.lvClbal;
          this.totAvbal = this.totAvbal + element.lvAwtBal;
        });
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.lvbalaneList = [];  
    });
  }

  ApproversList: any[] = [];
  getApproversList(id:any) {
    this.errMsg = "";
    this.httpService.LAgetByParam(APIURLS.GET_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
      if (data) {
        if (data[0].typ == 'E') {
          toastr.error("Approvers Not Assigned");
        }
        else {
          this.ApproversList = data;
        }


        //this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ApproversList = [];
    });
  }

  Rolelist: any[] = [];
  getRoleList() {
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

  getRole(id)
  {
    let temp= this.Rolelist.find(x=>x.id==id);
    return temp ? temp.role_Stxt:'';
  }


  lvTypeList: any[] = [];
  getLvTypesList() {
    this.errMsg = "";
    this.httpService.LAget(APIURLS.GET_LEAVE_TYPES_DATA_GETALL).then((data: any) => {
      if (data.length > 0) {
        this.lvTypeList = data;
        this.getUsersList(this.employeeId);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.lvTypeList = [];
    });
  }
  getType(id:any) {
    let temp = this.lvTypeList.find((x:any)  => x.lvTypeid == id);
    return temp ? temp.lvType : '';
  }


  EmployeeList: any[] = [];
  GetReportingEmployeeList() {
    this.httpService.LAgetByParam(APIURLS.GET_EMP_OF_REPORTING, this.currentUser.employeeId).then((data: any) => {
      if (data.length > 0) {
        this.EmployeeList = data;
        this.EmployeeList.sort((a:any, b:any) => {
          if (a.fullName > b.fullName) return 1;
          if (a.fullName < b.fullName) return -1;
          return 0;

        })
      }
      else {
        this.EmployeeList = [];
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.EmployeeList = [];
    });
  }

  view1: boolean = false;
  ApplyLeave(isedit: boolean, data: any, value: string) {
    this.view1 = false;
    this.isEdit = isedit;
    if (this.isEdit) {
      //   let data=Object.assign({},value)

      this.lvType = this.lvTypeList.find((x:any)  => x.lvType == data.leaveType).lvTypeid;
      this.getLvReasonList(this.lvType);
      this.CalenderYear = this.CalYear;
      this.StartDate = data.startDate;
      this.EndDate = data.endDate;
      this.Duration1 = data.startDuration;
      this.Duration2 = data.endDuration;
      this.NoOfDays = data.noOfDays;
      this.LvReason = data.reasonType;
      this.DetailedReason = data.reason;
      this.personName = data.personResponsible;
      this.LeaveAddress = data.addressDuringLeave;
      this.LeaveContactNo = data.contactNo;
      this.approvalStatus = data.approvelStatus;
      this.approvedDate = data.approvedDate;
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }


  ReasonList: any[] = [];
  getLvReasonList(type) {
    this.errMsg = "";
    this.checklvbalance(type);
    this.LvReason = null;
    this.ReasonList = [];
    this.httpService.LAgetByParam(APIURLS.BR_GET_LEAVE_REASONS, type).then((data: any) => {
      if (data.length > 0) {
        this.ReasonList = data.filter((x:any)  => x.isActive);
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.ReasonList = [];
    });
  }

  checklvbalance(type) {
    let temp = this.lvbalaneList.find((x:any)  => x.lvTypeid == type);
    if (temp) {
      temp
    }
    else {
      toastr.error("Insufficient leave balance.")
    }
  }

  lastReportingkeydown = 0;
  getpersonResponsible($event) {
    let text = $('#personName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#personName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#person").val(ui.item.value);
                  $("#personName").val(ui.item.label);
                }
                else {
                  $("#person").val('');
                  $("#personName").val('');
                }
              },
              select: function (event:any, ui:any) {
                if (ui.item) {
                  $("#person").val(ui.item.value);
                  $("#personName").val(ui.item.label);
                }
                else {
                  $("#person").val('');
                  $("#personName").val('');
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


  lastReportingkeydown1 = 0;
  getEmployee($event) {
    let text = $('#empNo').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId };
            })
            $('#empNo').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event:any, ui:any) {
                if (ui.item) {
                  $("#empNo").val(ui.item.value);
                  $("#empNo").val(ui.item.value);
                }
                else {
                  $("#empNo").val('');
                  $("#empNo").val('');
                }
              },
              select: function (event:any, ui:any) {
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
      this.lastReportingkeydown1 = $event.timeStamp;
    }
  }


  isValid: boolean = false;
  validatedForm: boolean = true;
  LeaveRequestList1: any[] = [];
  upcomingLeaves: any[] = [];
  EmployeeNo: string = ' ';
  getEmpleaveRequests() {
    let srchstr: any = {};
    if (this.EmployeeNo == null || this.EmployeeNo == '') {
      this.getUsersList(this.currentUser.employeeId);
      srchstr.userId = this.currentUser.employeeId;
    }
    else {
      this.getUsersList(this.EmployeeNo);
      srchstr.userId = this.EmployeeNo;
    }
    this.errMsg = "";
    this.isLoading = true;
    srchstr.year = this.CalYear;
    this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LEAVE_REQUESTS, srchstr).then((data: any) => {
      if (data) {
        this.LeaveRequestList = data;
        //this.LeaveRequestList.reverse();
        this.LeaveRequestList1 = data.filter((x:any)  => x.approvelStatus == 'Completed');
        this.upcomingLeaves = this.LeaveRequestList.filter((x:any)  => new Date(x.startDate) > new Date());
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.LeaveRequestList = [];
    });
  }

  view: boolean = false;
  LeaveCard(isedit: boolean, data: any, value: string) {
    this.view = false;
    this.isEdit = isedit;
    if (this.isEdit) {
      //   let data=Object.assign({},value)

      this.lvType = this.lvTypeList.find((x:any)  => x.lvType == data.leaveType).lvTypeid;
      this.getLvReasonList(this.lvType);
      this.CalenderYear = this.CalYear;
      this.StartDate = data.startDate;
      this.EndDate = data.endDate;
      this.Duration1 = data.startDuration;
      this.Duration2 = data.endDuration;
      this.NoOfDays = data.noOfDays;
      this.LvReason = data.reasonType;
      this.DetailedReason = data.reason;
    }
    if (value == 'View') {
      this.view = true;
    }
    jQuery("#myModal").modal('show');
  }

  RoleId: any;
  Department: any;
  Designation: any;
  FullName: any;
  JoiningDate: any;
  EmployeeId: any;
  GetEmpDetails(val) {

    let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
    connection.then((data: any) => {
      if (data) {
        let result = data.filter((x:any)  => { return x.employeeId != null });
        this.Department = result[0].department;
        this.Designation = result[0].designation;
        this.FullName = result[0].fullName;
        this.EmployeeId = result[0].employeeId;
        this.JoiningDate = result[0].joiningDate;
        this.RoleId = result[0].roleId;
        this.getEmpleaveRequests();
      }
    }).catch((error)=> {
    });
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

  daydiff(first, second) {
    var totaldays = (second - first) / (1000 * 60 * 60 * 24);

    if (totaldays < 0) {

      return "";
    } else {

      return ((second - first) / (1000 * 60 * 60 * 24) + 1)
    }
  }


  parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1] - 1, mdy[2]);
  }

  image!: string
  getbase64image() {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
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
  setFormatedTime(date: any) {
    let dt = new Date(date);
    let formateddate =
      ("00" + dt.getHours()).slice(-2) + ":" +
      ("00" + dt.getMinutes()).slice(-2) + ":" +
      ("00" + dt.getSeconds()).slice(-2);
    return formateddate;
  }

  Print(id:any) {
    // if(this.LeaveRequestList.length = 0) {
    //   swal({
    //     title: "Message",
    //     text: "Emtry Leave Card cannot be printed..!",
    //     icon: "error",
    //     dangerMode: true,
    //     buttons: [true,true]
    //   });
    //   return;
    // }
    this.GetEmpDetails(id);
    var printContents = document.getElementById('pdf')!.innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";
    var ReportName = "EMPLOYEE LEAVE CARD";
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate = this.setFormatedDateTime(now);
    var logo = this.image;
    /*var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
    })*/
    var docDefinition = {
      info: {
        title: 'Leave card',
      },

      content: [
     //   htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 9,
        p: { margin: [10, 15, 10, 20] },
        bold: false,
        table: {
          width: '*',
        },
        th: { bold: true, fillColor: '#8B0000' }
      },
      stack: [{
        unbreakable: true,
      }],
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 90, 40, 60],
      pageOrientation: 'portrait',
      header: function (currentPage:any, pageCount:any) {
        return {

          columns: [
            {
              pageMargins: [60, 80, 60, 80],
              style: 'tableExample',
              color: '#444',
              table: {
                widths: [90, 350, 90],
                headerRows: 2,
                keepWithHeaderRows: 1,
                body: [
                  [{
                    rowSpan: 2, image: logo,
                    width: 50,
                    alignment: 'center'
                  }
                    , { text: OrganisationName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' },
                  {
                    rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                      { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                  }],
                  [''
                    ,
                    { text: ReportName, bold: true, fontSize: 12, color: 'black', alignment: 'center', height: '*' }
                    , '']
                ]
              }
            }
          ],
          margin: 20
        }
      },
      footer: function (currentPage, pageCount) {
        return {

          columns: [

            {
              alignment: 'right',
              stack: [
                { text: 'Page ' + currentPage.toString() + ' of ' + pageCount.toString() }
              ],
              bold: true,
              fontSize: 8,
              // width: 120,
              // margin: [0, 0, 20, 0]
            }

          ],
          margin: 20
        }
      },
    };
    //pdfMake.createPdf(docDefinition).open();
  }

}
