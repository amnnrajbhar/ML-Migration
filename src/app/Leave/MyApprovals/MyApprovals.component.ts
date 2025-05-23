import { AuthData } from '../../auth/auth.model'
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError as _observableThrow, of as _observableOf, identity } from 'rxjs';
 
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';


declare var jQuery: any;
declare var $: any;
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
//import { debug } from 'util';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import swal from 'sweetalert';
// import Swal from 'sweetalert2';
import { HolidayMaster } from '../../HolidaysMaster/HolidaysMaster.model';
import { MatExpansionModule } from '@angular/material/expansion';
import * as moment from 'moment';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
import { UserIdRequest } from '../../UID/UserIdRequest/UserIdRequest.model';
import { ReachHRDetails } from '../ReachHR/ReachHR.model';
// import { initNgModule } from '@angular/core/src/view/ng_module';
import { CompOffRequest } from '../CompOffRequest/CompOffRequest.model';
import { HOURS_IN_DAY } from 'angular-calendar-scheduler/modules/scheduler/utils/calendar-scheduler-utils';

declare var ActiveXObject: (type: string) => void;



@Component({
    selector: 'app-MyApprovals',
    templateUrl: './MyApprovals.component.html',
    styleUrls: ['./MyApprovals.component.css']
})
export class MyApprovalsComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm, { static: false }) userForm: NgForm;


@ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


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
    employeeId: any = null;
    userMasterItem: any = {};
    year: any;

    CalenderYear: string = '';
    CalYear: any;
    OnDutyType: string = null;
    OnDutyAddress: string = null;
    OnDutyContactNo: string = null;
    StartDate: string = null;
    EndDate: string = null;
    Duration1: string = null;
    Duration2: string = null;
    typeOfWork: string = null;
    details: string = null;
    NoOfDays: number = 0;
    LvReason: string = null;
    personResponsible: any;
    personName: any;
    DetailedReason: string = '';
    MyApprovalsList: any[] = [];
    Starttime: any;
    EndTime: any;
    fromDate: any;
    Date: any;
    toDate: any;
    fromTime: any;
    toTime: any;
    Plant: any = null;
    filterStatus: any = null;
    filterRequest: any = null;
    FromDateforCS: any;
    ToDateforCS: any;
    previousShift: any;
    ReasonType: any;
    updatedShift: any;
    reason: any;
    filterHR: any;
    filtercategory: any;
    filtersubject: any;
    filterdescription: any;
    Time: any;
    EmpPunchList: any[] = [];

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
    getLocation(id) {
        let temp = this.locationAllList.find(e => e.id == id);
        return temp ? temp.name : '';
    }
    getLocationMaster() {
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

    getLocationName(id) {
        let t = this.locationList.find(s => s.id == id);
        return t.code + ' - ' + t.name;
    }


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
        this.getRoleList();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {
            this.getLocationMaster();
            this.getholidaysList(this.year);
            this.getShiftMasterList();
            this.getCatList();
            this.getLvTypesList();
            this.reInitDatatable();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }

    ngAfterViewInit() {
        this.initDatatable();
    }

    Holiday: any;
    HolidayDate: any;
    holidayname: any = null;
    holidaysList: HolidayMaster[] = [];
    getholidaysList(id) {
        this.errMsg = "";
        let srchstr = this.currentUser.baselocation + ',,' + this.year + ',' + ',,'
        this.httpService.LAgetByParam(APIURLS.GET_HOLIDAYS_LIST, srchstr).then((data: any) => {
            if (data.length > 0) {
                this.holidaysList = data;
                this.holidaysList = this.holidaysList.filter(x => x.isActive == true).sort((a, b) => {
                    if (a.date > b.date) return 1;
                    if (a.date < b.date) return -1;
                    return 0;

                });
                let temp = this.holidaysList.find(x => new Date(x.date) > new Date());
                this.Holiday = temp ? temp.holidayName : 'No Holidays.'
                this.HolidayDate = temp ? temp.date : null;
                //this.reInitDatatable();
            }
        }).catch(error => {
            this.isLoading = false;
            this.holidaysList = [];
        });
    }

    ApproversList: any[] = [];
    getApproversList(id) {
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
        }).catch(error => {
            this.isLoading = false;
            this.ApproversList = [];
        });
    }

    ApproversListForPM: any[] = [];
    getApproversListForPM(id) {
      this.errMsg = "";
      this.httpService.LAgetByParam(APIURLS.GET_PERMISSION_APPROVERS_FOR_EMPLOYEE, id).then((data: any) => {
        if (data) {
          if (data[0].typ == 'E') {
            //toastr.error("Approvers Not Assigned");
            swal({
              title: "Message",
              text: "Approvers Not Assigned",
              icon: "error",
              dangerMode: false,
              buttons: [false, true]
            })
          }
          else {
            this.ApproversListForPM = data;
          }
  
  
          //this.reInitDatatable();
        }
      }).catch(error => {
        this.isLoading = false;
        this.ApproversList = [];
      });
    }

    PlantHeadList: any[] = [];
    getPlantHeadList(id) {
        this.errMsg = "";
        this.httpService.LAgetByParam(APIURLS.GET_PLANT_HEADS_FOR_EMPLOYEE, this.currentUser.baselocation.toString()).then((data: any) => {
            if (data) {
                if (data[0].typ == 'E') {
                    toastr.error("Plant Head Details Not Found");
                }
                else {
                    this.ApproversList = data;
                }


                //this.reInitDatatable();
            }
        }).catch(error => {
            this.isLoading = false;
            this.ApproversList = [];
        });
    }

    Rolelist: any[] = [];
    getRoleList() {
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

    COApproversList: any[] = [];
    getCOApproversList(id) {
        this.errMsg = "";
        this.httpService.LAgetByParam(APIURLS.GET_PLANT_HEADS_FOR_EMPLOYEE, id).then((data: any) => {
            if (data) {
                if (data[0].typ == 'E') {
                    swal({
                        title: "Message",
                        text: "Approvers Details not Found",
                        icon: "error",
                        dangerMode: false,
                        buttons: [false, true]
                    })
                }
                else {
                    this.COApproversList = data;
                }
                //this.reInitDatatable();
            }
        }).catch(error => {
            this.isLoading = false;
            this.COApproversList = [];
        });
    }

    ClearData() {
        this.OnDutyType = null;
        this.StartDate = null;
        this.Duration1 = null;
        this.EndDate = null;
        this.Duration2 = null;
        this.NoOfDays = null;
        this.LvReason = null;
        this.DetailedReason = null;
        this.Starttime = null;
        this.EndTime = null;
        this.personName = null;
        this.personResponsible = null;
        this.Comments = null;
    }


    ReasonList: any[] = [];
    getLvReasonList(id) {
        this.errMsg = "";
        this.LvReason = null;
        this.ReasonList = [];
        this.httpService.LAget(APIURLS.BR_GET_ALL_REASONS_LIST).then((data: any) => {
            if (data.length > 0) {
                this.ReasonList = data.filter(x => x.isActive);
            }
        }).catch(error => {
            this.isLoading = false;
            this.ReasonList = [];
        });
    }

    ReasonListOD: any[] = [];
    getODReasonList() {
        this.errMsg = "";
        this.ReasonListOD = [];
        this.httpService.LAget(APIURLS.BR_GET_ALL_ONDUTY_REASONS_LIST).then((data: any) => {
            if (data.length > 0) {
                this.ReasonListOD = data.filter(x => x.isActive && x.leavType == 100);
            }
        }).catch(error => {
            this.isLoading = false;
            this.ReasonListOD = [];
        });
    }


    isValid: boolean = false;
    validatedForm: boolean = true;

    view: boolean = false;
    binddatetime(time) {
        let datetime = new Date();
        let times = time.split(':');
        let tm = times[1].toString().substring(2, 4);
        if (tm == 'PM') {
            times[0] = +times[0] + +12;
        }
        datetime.setHours(parseInt(times[0]));
        datetime.setMinutes(parseInt(times[1].toString().substring(0, 2)));
        datetime.setSeconds(parseInt('00'));
        return datetime;
    }


    transform(value: any, args?: any): any {
        return moment(value, 'HH:mm').format("HH:mm A");
    }

    binddatetime1(time) {
        let datetime = new Date();
        let times = time.split(':');
        datetime.setHours(parseInt(times[0]));
        datetime.setMinutes(parseInt(times[1]));
        datetime.setSeconds(parseInt(times[2]));
        return datetime;
    }

    GetRequests() {
        this.isLoading = true;
        let filterModel: any = {};
        filterModel.type = this.filterRequest;
        filterModel.empCode = this.currentUser.employeeId;
        filterModel.status = this.filterStatus;
        filterModel.year = this.CalYear;
        this.httpService.LApost(APIURLS.BR_GET_PENDING_REQUEST, filterModel).then((data: any) => {
            if (data) {
                this.MyApprovalsList = data;
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.MyApprovalsList = [];
        });
    }

    Comments: any;
    reqNo: any;
    userid: any;
    ApplyOnDuty(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            //   let data=Object.assign({},value)
            this.getODReasonList();
            this.reqNo = data.requestNo;
            this.Plant = data.location;
            this.CalenderYear = this.CalYear;
            this.fromDate = data.startDate;
            this.OnDutyType = data.onDutyType;
            this.toDate = data.endDate;
            this.fromTime = this.binddatetime1(data.startTime);
            this.toTime = this.binddatetime1(data.endTime);
            this.DetailedReason = data.reason;
            this.personName = data.personResponsible;
            this.OnDutyAddress = data.addressDuringLeave;
            this.OnDutyContactNo = data.contactNo;
            this.Comments = data.comments;
            if (data.documents != null) {
                this.fileslist1 = data.documents.split(',');
              }
        }
        else {
            this.fromTime = this.binddatetime1('09:00:00');
            this.toTime = this.binddatetime1('18:00:00');
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#myModal").modal('show');
    }
    lvType: number = null;
    lvTypeList: any[] = [];
    getLvTypesList() {
        this.errMsg = "";
        this.httpService.LAget(APIURLS.GET_LEAVE_TYPES_GETALL).then((data: any) => {
            if (data.length > 0) {
                this.lvTypeList = data;
                // this.getUsersList(this.employeeId);
            }
        }).catch(error => {
            this.isLoading = false;
            this.lvTypeList = [];
        });
    }

    lvTypeList1: any[] = [
        { id: 8, name: "ESIC Leave" }
    ];

    
  fileslist1: any[] = [];

    ApplyLeave(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            //   let data=Object.assign({},value)
            // this.getEmpleaveRequests(data.userId);
            this.lvType = this.lvTypeList.find(x => x.lvType == data.leaveType).lvTypeid;
            this.getLvReasonList(this.lvType);
            this.userid = data.userId;
            this.reqNo = data.reqId;
            this.CalenderYear = this.CalYear;
            this.StartDate = data.startDate;
            this.EndDate = data.endDate;
            this.Duration1 = data.startDuration;
            this.Duration2 = data.endDuration;
            this.NoOfDays = data.noOfDays;
            this.LvReason = data.reasonType;
            this.DetailedReason = data.reason;
            this.LeaveAddress = data.addressDuringLeave;
            this.LeaveContactNo = data.contactNo;
            this.personResponsible = data.personResponsible;
            this.Comments = data.comments;
            if (data.documents != null) {
                      this.fileslist1 = data.documents.split(',');
                  }
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#lvModal").modal('show');
    }

    getEMpPunchList(categ) {
        this.errMsg = "";
        let srchstr: any = {};
        srchstr.userId = categ.userid;
        srchstr.fromDate = categ.startDate;
        srchstr.toDate = categ.endDate;
    }

    reqId: any;
    fileslist: any[] = [];
    LeaveAddress: any;
    LeaveContactNo: any;

    ApplyESIC(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.fileslist = [];
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            this.lvType = 8;
            this.CalenderYear = this.CalYear;
            this.reqNo = data.reqId;
            this.StartDate = data.startDate;
            this.EndDate = data.endDate;
            this.Duration1 = data.startDuration;
            this.Duration2 = data.endDuration;
            this.NoOfDays = data.noOfDays;
            this.LvReason = data.reasonType;
            this.DetailedReason = data.reason;
            this.personResponsible = data.personResponsible;
            this.LeaveAddress = data.addressDuringLeave;
            this.LeaveContactNo = data.contactNo;
            let docs = data.documents ? data.documents.split(",") : [];
            docs.forEach(element => {
                this.fileslist.push(element);
            });
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#esicModal").modal('show');
    }

    ApproveRequest(isedit: boolean, data: any, value: string) {
        if (this.filterRequest != 'OverTime' && this.filterRequest != 'CompOff' && this.filterRequest != 'Change Shift Request'
            && this.filterRequest != 'HR Queries' && this.filterRequest != 'Tour Plan'
            && this.filterRequest != 'Permission' && this.filterRequest != 'Regularization'  && this.filterRequest != 'Payroll Regularization') {
            this.getApproversList(data.userId);
        }
        else if (this.filterRequest == 'Permission') {
            this.getApproversListForPM(data.userId);
        }
        else if (this.filterRequest == 'Regularization') {
            this.getApproversListForPM(data.userId);
        }
        else if (this.filterRequest == 'Payroll Regularization') {
            this.getApproversListForPM(data.userId);
        }
        else if (this.filterRequest == 'Change Shift Request') {
            this.getApproversListForPM(data.userId);
        }
        else if (this.filterRequest == 'HR Queries') {
            this.getApproverDetails(data);
        }
        else if (this.filterRequest == 'Tour Plan') {
            this.getApproversList(data.reqBy);
        }
        else if (this.filterRequest != 'OverTime' && this.filterRequest != 'CompOff') {
            this.getPlantHeadList(this.currentUser.baselocation);
        }

        if (this.filterRequest == 'OnDuty' || this.filterRequest == 'Cancel OnDuty') {
            this.ApplyOnDuty(isedit, data, value);
        }
        else if (this.filterRequest == 'Leave' || this.filterRequest == 'Cancel Leave') {
            this.ApplyLeave(isedit, data, value);
        }
        else if (this.filterRequest == 'CompOff') {
            // this.getApproversList(data.pernr);
            this.ApplyCompoff(isedit, data, value);
        }
        else if (this.filterRequest == 'OverTime') {
            //  this.getApproversList(data.pernr);
            this.ApplyOverTime(isedit, data, value);
        }
        else if (this.filterRequest == 'Change Shift Request') {
            this.ApplyChangeShift(isedit, data, value);
        }
        else if (this.filterRequest == 'HR Queries') {
            this.ApplyHRQuery(isedit, data, value);
        }
        else if (this.filterRequest == 'ESIC Leave') {
            this.ApplyESIC(isedit, data, value);
        }
        else if (this.filterRequest == 'Tour Plan') {
            this.ApplyTour(isedit, data, value);
        }
        else if (this.filterRequest == 'Regularization') {
            this.ApplyRegularization(isedit, data, value);
        }
        else if (this.filterRequest == 'Payroll Regularization') {
            this.ApplyPayrollRegularization(isedit, data, value);
        }
        else {
            this.ApplyPermission(isedit, data, value)
        }
    }


    getApproverDetails(data) {
        let filterModel = {} as ReachHRDetails;
        filterModel.role = data.role;
        filterModel.category = data.category;
        filterModel.location = data.location;
        let connection = this.httpService.LApost(APIURLS.BR_GET_HR_QUERY_APPROVER, filterModel);
        connection.then((data: any) => {
            if (data[0].typ == 'E') {
                toastr.error("Approvers Not Assigned");
            }
            else {
                this.ApproversList = data;
            }

        }).catch(error => {
            this.isLoading = false;
            this.ApproversList = [];
        });
    }
    SwipeType: any = null;
    ApplyPermission(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            //   let data=Object.assign({},value)
            this.reqNo = data.requestNo;
            this.Plant = data.location;
            this.CalenderYear = this.CalYear;
            this.fromDate = data.date;
            this.SwipeType = data.swipeType;
            this.fromTime = this.binddatetime1(data.startTime);
            this.toTime = this.binddatetime1(data.endTime);
            this.DetailedReason = data.reason;
            this.Comments = data.comments
        }
        else {
            this.fromTime = this.binddatetime1('17:00:00');
            this.toTime = this.binddatetime1('18:00:00');
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#perModal").modal('show');
    }

    ApplyRegularization(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            this.reqNo = data.requestNo;
            this.Date = data.date;
            this.Time = data.time;
            this.ReasonType = data.reasonType;
            this.SwipeType = data.swipeType;
            this.Comments = data.comments;
            this.DetailedReason = data.reason;
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#regModal").modal('show');
    }

    ApplyPayrollRegularization(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            this.reqNo = data.requestNo;
            this.Date = data.date;
            this.Time = data.time;
            this.SwipeType = data.swipeType;
            this.Comments = data.comments;
            this.DetailedReason = data.reason;
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#payregModal").modal('show');
    }

    rowcount: number = 0;
    dynamicArray: any = [];
    newDynamic: any = {};
    addRows(index) {
        this.rowcount = this.rowcount + 1;
        this.newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, applicable: null, stored: "0" };
        this.dynamicArray.push(this.newDynamic);
    }
    removeRows(item) {
        if (this.dynamicArray.length > 1) {
            const index = this.dynamicArray.indexOf(item);
            this.dynamicArray.splice(index, 1);
        }
    }


    AssignedShift: any;
    inTime: any;
    outTime: any;
    totHours: any;
    updatedApplicable: any;
    updatedNoofHours: any;
    compofftype: any;
    status: any;
    ApplyCompoff(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.getCOApproversList(data.pernr);
        this.ClearData();
        this.dynamicArray = [];
        if (this.isEdit) {
            //   let data=Object.assign({},value)
            this.reqNo = data.reqNo;
            this.Plant = data.location;
            this.CalenderYear = this.CalYear;
            this.fromDate = data.fromDate;
            this.SwipeType = data.swipeType;
            this.compofftype = data.compType;
            this.DetailedReason = data.reason;
            this.AssignedShift = data.shift;
            this.inTime = data.intime;
            this.outTime = data.outtime;
            this.status = data.status;
            this.Comments = data.comments;

            //#region TO GET TOTAL HOURS FOR SAME DATE

            let hours1 = data.intime.split(":")[0];
            let minutes1 = data.intime.split(":")[1];
            let seconds1 = data.intime.split(":")[2];

            let hours2 = data.outtime.split(":")[0];
            let minutes2 = data.outtime.split(":")[1];
            let seconds2 = data.outtime.split(":")[2];

            let today: Date = new Date();

            var date1 = Date.parse(new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours1, minutes1, seconds1).toString());
            var date2 = Date.parse(new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours2, minutes2, seconds2).toString());

            var diffInMs = date2 - date1;
            var diffInHours = diffInMs / 1000 / 60 / 60;
            var diffInMinutes = (diffInMs / 1000 / 60) - (Math.floor(diffInHours) * 60);

            this.totHours = Math.floor(diffInHours) + ':' + diffInMinutes;

            let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, applicable: null, stored: "0" };
            newDynamic.NoHrs = data.noHrs;
            newDynamic.applicable = data.applicabale;
            newDynamic.empNo = data.pernr;
            newDynamic.Name = data.empName;
            newDynamic.Dept = data.dept;
            newDynamic.Desig = data.desig;
            newDynamic.DOJ = data.joiningDate;
            this.dynamicArray.push(newDynamic);
        }
        else {
            let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
            this.dynamicArray.push(newDynamic);
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#CoModal").modal('show');
    }

    updateNew() {
        if (this.updatedNoofHours == '' || this.updatedNoofHours == null) {
            toastr.error("Please select updated hours if any, else select same..!")
            return;
        }
        if (this.updatedApplicable == '' || this.updatedApplicable == null) {
            toastr.error("Please select updated Applicable if any, else select same..!")
            return;
        }
        this.errMsg = "";
        this.isLoading = true;
        let compOTDetailsModel = {} as CompOffRequest;
        compOTDetailsModel.id = this.reqNo;
        compOTDetailsModel.applicabale = this.updatedApplicable;
        compOTDetailsModel.noHrs = this.updatedNoofHours;
        this.httpService.LAput(APIURLS.BR_GET_UPDATE_COMPOFF_REQUESTS, compOTDetailsModel.id, compOTDetailsModel).then((data: any) => {
            if (data) {
                swal({
                    title: "Message",
                    text: "Data Updated...! Please approve the request..",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                if (this.filterRequest == 'CompOff') {
                    jQuery("#CoModal").modal('hide');
                }
                this.GetRequests();
                this.updatedApplicable = '';
                this.updatedNoofHours = '';
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
        });
    }

    ApplyOverTime(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.getCOApproversList(data.pernr);
        this.dynamicArray = [];
        this.ClearData();
        if (this.isEdit) {
            //   let data=Object.assign({},value)
            this.reqNo = data.reqNo;
            this.Plant = data.location;
            this.CalenderYear = this.CalYear;
            this.fromDate = data.requestedDate;
            this.SwipeType = data.swipeType;
            this.compofftype = data.compType;
            this.DetailedReason = data.reason;
            this.Comments = data.comments;
            let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, applicable: null, stored: "0" };
            newDynamic.NoHrs = data.noHRS;
            newDynamic.applicable = data.applicabale;
            newDynamic.empNo = data.pernr;
            newDynamic.Name = data.empName;
            newDynamic.Dept = data.dept;
            newDynamic.Desig = data.desig;
            newDynamic.DOJ = data.joiningDate;
            this.dynamicArray.push(newDynamic);
        }
        else {
            let newDynamic = { id: this.rowcount, empNo: null, Name: null, Dept: null, Desig: null, DOJ: null, NoHrs: null, stored: "0" };
            this.dynamicArray.push(newDynamic);
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#OTModal").modal('show');
    }

    ApplyChangeShift(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        if (this.isEdit) {
            this.reqNo = data.reqNo;
            this.fromDate = data.fromDate;
            this.toDate = data.toDate;
            this.previousShift = data.previousShift;
            this.updatedShift = data.updatedShift;
            this.reason = data.reason;
            this.Comments = data.comments;
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#CSRModal").modal('show');
    }

    ApplyHRQuery(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();
        // this.getApproversList(data.requestedBy);
        if (this.isEdit) {
            this.getEmpDetails(data.reqBy)
            this.reqNo = data.id;
            this.filterHR = data.role;
            this.filtercategory = data.category;
            this.filtersubject = data.subject;
            this.filterdescription = data.description;
            this.Comments = data.comments;
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#HRQModal").modal('show');
    }

    setFormatedDate(date: any) {
        let dt = new Date(date);
        let formateddate =
          dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
        return formateddate;
      }

    ApplyTour(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.ClearData();

        if (this.isEdit) {
            this.reqNo = data.id;
            this.StartDate = this.setFormatedDate(data.date);
            this.Duration1 = data.duration;
            this.EndDate = this.setFormatedDate(data.date);
            this.Duration2 = data.duration;
            this.typeOfWork = data.typeOfWork;
            this.details = data.details;
            this.Comments = data.comments;
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#TPModal").modal('show');

    }

    userIdRequest = {} as UserIdRequest;
    getEmpDetails(empId) {
        this.errMsg = "";
        this.isLoading = true;
        //this.UserGroupsList=[];
        this.httpService.LAgetByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
            if (data.employeeId > 0) {
                // this.currentUser = data;
                // this.userIdRequest.requestDate=this.requestdate;
                let temp = this.locationList.find(x => x.id == this.currentUser.baselocation)
                this.userIdRequest.plant = temp.code + "-" + temp.name;
                this.userIdRequest.employeeId = data.employeeId;
                this.userIdRequest.firstName = data.firstName;
                this.userIdRequest.lastName = data.lastName;
                this.userIdRequest.fullName = data.fullName;
                this.userIdRequest.designation = data.designation;
                this.userIdRequest.department = data.department;
                // this.userIdRequest.sid=this.selectedSoftwares[0].id;
            }
            else {
                // this.Error="Error";
                swal({
                    title: "Message",
                    text: "Entered employee code (" + empId + ") does not exist.Please check again or contact administator",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                })
            }
            // this.reInitDatatable();()
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.currentUser = {} as AuthData;
        });
    }


    ShiftList: EmpShiftMaster[] = [];
    ShiftList1: EmpShiftMaster[] = [];
    loccode: string;

    GetShift() {
        let temp = this.locationList.find(x => x.id == this.currentUser.baselocation)
        this.ShiftList1 = this.ShiftList.filter(x => x.loc.includes(temp.code));
    }
    getShiftMasterList() {
        this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
            if (data.length > 0) {
                this.ShiftList = data.filter(x => x.isActive == true);

            }
        }).catch(error => {
            this.isLoading = false;
            this.ShiftList = [];
        });
    }

    LeaveRequestList: any[] = [];
    upcomingLeaves: any[] = [];
    getEmpleaveRequests(userid) {
        this.errMsg = "";
        this.isLoading = true;
        let srchstr: any = {};
        srchstr.userId = userid;
        srchstr.year = this.CalYear;
        this.httpService.LApost(APIURLS.BR_GET_EMPLOYEE_LEAVE_REQUESTS, srchstr).then((data: any) => {
            if (data) {
                this.LeaveRequestList = data;
                this.upcomingLeaves = this.LeaveRequestList.filter(x => x.approvelStatus == 'Approved');
            }
            jQuery('#PreviousLeavesModal').modal("show")
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.LeaveRequestList = [];
        });
    }

    lvbalaneList: any[] = [];
    getUsersList(id) {
        this.errMsg = "";
        this.lvbalaneList = [];
        let srcstr = id + "," + this.CalYear;
        this.httpService.LAgetByParam(APIURLS.GET_LEAVE_DATA_BY_EMPLOYEE, srcstr).then((data: any) => {
            if (data.length > 0) {
                this.lvbalaneList = data.sort((a, b) => {
                    if (a.lvTypeid > b.lvTypeid) return 1;
                    if (a.lvTypeid < b.lvTypeid) return -1;
                    return 0;
                });
            }
            this.reInitDatatable();
        }).catch(error => {
            this.isLoading = false;
            this.lvbalaneList = [];
        });
    }

    RequestAction(status: string) {
        this.isLoadingPop = true;
        swal({
            text: "Please wait...Requests are getting approved/reject...!",
            timer: 2000,
            icon: "info",
            dangerMode: false,
            buttons: [false, false]
        });
        if (status == 'Rejected' && (this.Comments == '' || this.Comments == null)){
            toastr.error("Please enter Comments..!");
            return;
        } 
        if (status == 'Approved' && (this.Comments == '' || this.Comments == null)){
            this.Comments = 'Approved';
        } 
        let ApproveModel: any = {};
        ApproveModel.reqId = this.reqNo;
        ApproveModel.empCode = this.currentUser.employeeId;
        ApproveModel.status = status;
        ApproveModel.type = this.filterRequest;
        ApproveModel.comments = this.Comments;
        let connection = this.httpService.LApost(APIURLS.BR_APPROVE_PENDING_REQUEST, ApproveModel);
        connection.then((data) => {
            if (data) {
                // toastr.success(data);
                swal({
                    title: "Message",
                    text: data,
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.isLoadingPop = false;
                if (this.filterRequest == 'OnDuty') {
                    jQuery("#myModal").modal('hide');
                }
                else if (this.filterRequest == 'Leave') {
                    jQuery("#lvModal").modal('hide');
                }
                else if (this.filterRequest == 'Permission') {
                    jQuery("#perModal").modal('hide');
                }
                else if (this.filterRequest == 'CompOff') {
                    jQuery("#CoModal").modal('hide');
                }
                else if (this.filterRequest == 'OverTime') {
                    jQuery("#OTModal").modal('hide');
                }
                else if (this.filterRequest == 'ESIC Leave') {
                    jQuery("#esicModal").modal('hide');
                }
                else if (this.filterRequest == 'Regularization') {
                    jQuery("#regModal").modal('hide');
                }
                else if (this.filterRequest == 'Payroll Regularization') {
                    jQuery("#payregModal").modal('hide');
                }
                else if (this.filterRequest == 'Change Shift Request') {
                    jQuery("#CSRModal").modal('hide');
                }
                else if (this.filterRequest == 'Tour Plan') {
                    jQuery("#TPModal").modal('hide');
                }
            }
            this.GetRequests();
        }).catch(error => {
            this.errMsgPop = 'Error Approving Request.'
        })
    }

    RequestAction1(status: string) {
        this.isLoadingPop = true;
        swal({
            text: "Please wait...Requests are getting approve/reject...!",
            timer: 2000,
            icon: "info",
            dangerMode: false,
            buttons: [false, false]
        });
        if (status == 'Closed' && (this.Comments == '' || this.Comments == null)){
            toastr.error("Please enter Comments..!");
            return;
        }
        let HRApproveModel: any = {};
        HRApproveModel.reqId = this.reqNo;
        HRApproveModel.empCode = this.currentUser.employeeId;
        HRApproveModel.status = status;
        HRApproveModel.Type = this.filterRequest;
        HRApproveModel.comments = this.Comments;
        let connection = this.httpService.LApost(APIURLS.BR_APPROVE_PENDING_REQUEST, HRApproveModel);
        connection.then((data) => {
            if (data) {
                swal({
                    title: "Message",
                    text: data,
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.isLoadingPop = false;
                jQuery("#HRQModal").modal('hide');
            }
            this.GetRequests();
        }).catch(error => {
            this.errMsgPop = 'Error Approving Request.'
        })

    }

    closesavemodel() {
        jQuery("#PreviousLeavesModal").modal('hide');
    }

    isMasterSel: boolean = false;
    isLoadingReq: boolean = false;
    checkUncheckAll() {
        for (var i = 0; i < this.MyApprovalsList.length; i++) {
            this.MyApprovalsList[i].isSelected = this.isMasterSel;
        }
        this.getCheckedItemList();
    }
    isAllSelected() {
        this.isMasterSel = this.MyApprovalsList.every(function (item: any) {
            return item.isSelected == true;
        })
        this.getCheckedItemList();
    }
    checkedRequestList: any[] = [];
    checkedlist: any[] = [];
    getCheckedItemList() {
        this.checkedRequestList = [];
        this.checkedlist = [];
        for (var i = 0; i < this.MyApprovalsList.length; i++) {
            if (this.MyApprovalsList[i].isSelected)
                this.checkedlist.push(this.MyApprovalsList[i]);
        }
        this.checkedRequestList = this.checkedlist;
    }

    MassApprove(status: string) {
        this.isLoadingPop = true;
        swal({
            text: "Please wait... Requests are getting approve/reject...!",
            timer: 2000,
            icon: "info",
            dangerMode: false,
            buttons: [false, false]
        });
        let ApproveModel: any = {};
        if (this.filterRequest == 'Leave' || this.filterRequest == 'Cancel Leave') {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.reqId).join();
        }
        else if (this.filterRequest == 'OnDuty' || this.filterRequest == 'Cancel OnDuty' || this.filterRequest == 'Permission') {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.requestNo).join();
        }
        else if (this.filterRequest == 'Tour Plan') {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.id).join();
        }
        else if (this.filterRequest == 'Regularization') {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.requestNo).join();
        }
        else if (this.filterRequest == 'Payroll Regularization') {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.requestNo).join();
        }
        else {
            ApproveModel.reqId = this.checkedRequestList.map(x => x.reqNo).join();
        }
        ApproveModel.empCode = this.currentUser.employeeId;
        ApproveModel.status = status;
        ApproveModel.type = this.filterRequest;
        ApproveModel.comments = 'Mass ' + status;
        let connection = this.httpService.LApost(APIURLS.BR_APPROVE_PENDING_REQUEST, ApproveModel);
        connection.then((data) => {
            if (data) {
                // toastr.success(data);
                swal({
                    title: "Message",
                    text: data,
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
            }
            this.isLoadingPop = false;
            this.checkUncheckAll();
            this.GetRequests();
        }).catch(error => {
            this.errMsgPop = 'Error Approving Request.'
        })
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
  const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

    HrList: any[] = [
        { id: 1, name: 'Corporate HR' },
        { id: 2, name: 'Site HR' },
        { id: 3, name: 'VP HR' },
        { id: 4, name: 'Field HR' }
    ];

    catList: any[] = [];
    CategoryList: any[];
    getCatList() {
        this.httpService.LAget(APIURLS.BR_GET_QUERY_CATEGORY).then((data: any) => {
            // this.isLoading = false;
            if (data.length > 0) {
                this.catList = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.catList.sort((a, b) => { return collator.compare(a.name, b.name) });
            }
        }).catch(error => {
            this.catList = [];
        });
    }


    downloadFileLeave(reqNo, value) {

        // console.log(filename);
        if (value.length > 0) {
            this.httpService.LAgetFile(APIURLS.BR_LEAVE_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
                // console.log(data);
                // let temp_name = this.visitorsList1.find(s => s.id == id).name;
                if (data != undefined) {
                    var FileSaver = require('file-saver');
                    const imageFile = new File([data], value, { type: 'application/doc' });
                    // console.log(imageFile);
                    FileSaver.saveAs(imageFile);


                }
            }).catch(error => {
                this.isLoading = false;
            });

        } else {
            swal({
                title: "Message",
                text: "No File on server",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            }).then((willDelete) => {
                if (willDelete) {
                    this.isLoading = false;
                }
            });
        }
    }

    downloadFileOnDuty(reqNo, value) {

        // console.log(filename);
        if (value.length > 0) {
            this.httpService.LAgetFile(APIURLS.BR_ONDUTY_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
                // console.log(data);
                // let temp_name = this.visitorsList1.find(s => s.id == id).name;
                if (data != undefined) {
                    var FileSaver = require('file-saver');
                    const imageFile = new File([data], value, { type: 'application/doc' });
                    // console.log(imageFile);
                    FileSaver.saveAs(imageFile);


                }
            }).catch(error => {
                this.isLoading = false;
            });

        } else {
            swal({
                title: "Message",
                text: "No File on server",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            }).then((willDelete) => {
                if (willDelete) {
                    this.isLoading = false;
                }
            });
        }
    }

    ViewPreviousLeaves(value: string) {
        jQuery('#PreviousLeavesModal').modal("Show")
    }


}
