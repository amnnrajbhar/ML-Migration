import { AuthData } from '../../auth/auth.model';
import { AppComponent } from '../../app.component';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { HttpService } from '../../shared/http-service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
import { DatePipe } from '@angular/common';
declare var jQuery: any;
declare var $: any;
import moment from 'moment'
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
import { EmpShiftMaster } from '../EmpShiftMaster/EmpShiftMaster.model';
import { ChangeShift } from '../ChangeShift/ChangeShift.model';
import { TourPlan } from './TourPlan.model';
// import * as pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import htmlToPdfmake from 'html-to-pdfmake';


export class actionItemModel {
    CalenderYear: string = '';
    CalYear: any;
}
@Component({
    selector: 'app-TourPlan',
    templateUrl: './TourPlan.component.html',
    styleUrls: ['./TourPlan.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class TourPlanComponent implements OnInit {
    public tableWidget: any;
    @ViewChild(NgForm  , { static: false }) TourPlanForm!: NgForm;
    isLoading: boolean = false;
    errMsg: string = "";
    path: string = '';
    currentUser!: AuthData;
    CalenderYear: string = '';
    CalYear: any;
    year: any;
    isEdit: boolean = false;
    FromDateforTP: string = ' ';
    ToDateforTP: string = ' ';
    DetailsforTP: string = ' ';
    errMsgPop: string = "";
    isLoadingPop: boolean = false;
    selectedEmployee: any[] = [];
    MonthorYear: any = null;
    EmployeeNo: any = null;
    EmployeeList: any[] = [];
    empListCon = [];
    filterMonth: any = null;
    typrWrk: string = ' ';
    Duration1: string = ' ';
    Duration2: string = ' ';

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private http: HttpClient,
        private datePipe: DatePipe, private https: HttpClient,) {
    //    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }


    private initDatatable(): void {
        let exampleId: any = jQuery('#userTable');
        this.tableWidget = exampleId.DataTable({
            "order": []
        });
        $('#userTable').on('click', '.toggleTest', function () {
            console.log('click');
        });
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0);
    }

    ngOnInit() {
        this.path = this.router.url;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {
         const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
            let today = new Date();
            this.year = today.getFullYear();
            this.CalenderYear = new Date().getFullYear().toString();
            this.CalYear = new Date().getFullYear().toString();
            this.getApproversList(this.currentUser.employeeId);
            this.GetReportingEmployeeList();
            this.getbase64image();

        }
        else
            this.router.navigate(["/unauthorized"]);
    }

    ngAfterViewInit() {
        this.initDatatable();
    }

    locListCon = [];
    locationList: any[] = [[]];
    ShiftList: EmpShiftMaster[] = [];
    ShiftList1: EmpShiftMaster[] = [];
    loccode: string

    GetShift() {
        let temp = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation)
        this.ShiftList1 = this.ShiftList.filter((x:any)  => x.loc.includes(temp.code));
    }
    getShiftMasterList() {
        this.httpService.LAget(APIURLS.BR_GET_ALL_SHIFTS).then((data: any) => {
            if (data.length > 0) {
                this.ShiftList = data.filter((x:any)  => x.loc != null);
                this.loccode = this.locationList.find((x:any)  => x.id == this.currentUser.baselocation).code.toString();
                this.ShiftList1 = this.ShiftList.filter((x:any)  => x.loc.includes(this.loccode));

            }
        }).catch((error)=> {
            this.isLoading = false;
            this.ShiftList = [];
        });
    }

    lastReportingkeydown = 0;
    getEmployee($event) {
        let text = $('#empNo').val();

        if (text.length > 3) {
            if ($event.timeStamp - this.lastReportingkeydown > 400) {
                this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
                    if (data.length > 0) {
                        var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
                        var list = $.map(sortedList, function (item) {
                            return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.fullName };
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
                                    this.empName = ui.item.name;
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
                                    this.empName = ui.item.name;
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

    lastReportingkeydown1 = 0;
    getEmployee1($event) {
        let text = $('#userId').val();

        if (text.length > 3) {
            if ($event.timeStamp - this.lastReportingkeydown1 > 400) {
                this.get("EmployeeMaster/GetEmployeesList/" + text).then((data: any) => {
                    if (data.length > 0) {
                        var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
                        var list = $.map(sortedList, function (item) {
                            return { label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.fullName };
                        })
                        $('#userId').autocomplete({
                            source: list,
                            classes: {
                                "ui-autocomplete": "highlight",
                                "ui-menu-item": "list-group-item"
                            },
                            change: function (event:any, ui:any) {
                                if (ui.item) {
                                    $("#userId").val(ui.item.value);
                                    $("#userId").val(ui.item.value);
                                    this.empName = ui.item.name;
                                }
                                else {
                                    $("#userId").val('');
                                    $("#userId").val('');
                                }
                            },
                            select: function (event:any, ui:any) {
                                if (ui.item) {
                                    $("#userId").val(ui.item.value);
                                    $("#userId").val(ui.item.value);
                                    this.empName = ui.item.name;
                                }
                                else {
                                    $("#userId").val('');
                                    $("#userId").val('');
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

    notFirst = true;
    rmnotFirst = true;
    checkStatus() {
        // console.log(this.EmployeeNo.length+'<->'+this.notFirst);
        if (this.selectedEmployee.length <= 0) this.notFirst = false;
    }
    checkStatusRep() {
        // console.log(this.EmployeeNo.length+'<->'+this.rmnotFirst);
        if (this.selectedEmployee.length <= 0) this.rmnotFirst = false;
    }

    isEmpty(str) {
        if (str.length == 0) return true;
        else return false;
    }

    onSelectAll() {
    }

    get(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
            this.http.get(APIURLS.BR_HR_URL + apiKey, this.getHeader())
                .toPromise()
                .then(
                    res => {
                        resolve(res);
                    },
                    err => {
                        reject(err.json());
                    }
                );

        });
        return promise;
    }


    setFormatedDate(date: any) {
        let dt = new Date(date);
        let formateddate =
            dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
        return formateddate;
    }

   getHeader(): { headers: HttpHeaders } {
  //const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');


  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true
    };

    onItemSelectM(item: any) {
    }

    onItemSelectB(item: any) {
    }

    onItemSelectRM(item: any) {
    }

    binddatetime(time) {
        let datetime = new Date();
        let times = time.split(':');
        datetime.setHours(parseInt(times[0]));
        datetime.setMinutes(parseInt(times[1]));
        datetime.setSeconds(parseInt(times[2]));
        return datetime;
    }

    closeSaveModal() {
        jQuery("#myModal").modal('hide');
    }

    getFormattedTime(date: any) {
        let dtStartTime = new Date(date);
        return ("00" + dtStartTime.getHours()).slice(-2) + ":" +
            ("00" + dtStartTime.getMinutes()).slice(-2) + ":" +
            ("00" + dtStartTime.getSeconds()).slice(-2);
    }


    empName: string
    getEmpTPRequests() {
        this.errMsg = "";
        this.isLoading = true;
        let srchstr: any = {};
        if (this.router.url == '/TourPlanEss') {
            if (this.selectedEmployee.length <= 0) {
                srchstr.reqBy = this.currentUser.employeeId;
                this.empName = this.currentUser.fullName;
            }
            else {
                srchstr.reqBy = this.selectedEmployee[0].id;
                this.empName = this.EmployeeList.find((x:any)  => x.employeeId == this.selectedEmployee[0].id).fullName;
            }
        }
        else {
            if (this.EmployeeNo == null || this.EmployeeNo == '') {
                srchstr.reqBy = this.currentUser.employeeId;
                this.empName = this.currentUser.fullName;
            }
            else {
                srchstr.reqBy = this.EmployeeNo;
            }
        }
        // this.GetEmpDetails(srchstr.reqBy);
        srchstr.Year = this.CalenderYear;
        this.httpService.LApost(APIURLS.GET_EMP_TP_DATA, srchstr).then((data: any) => {
            if (data) {
                this.EmpTPList = data;
                //this.upcomingShift = this.ChangeShiftList.filter((x:any)  => new Date(x.startDate) > new Date());
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.EmpTPList = [];
        });

    }

    Department: any;
    Designation: any;
    FullName: any;
    GetEmpDetails(val) {
        let emp: any;

        let connection = this.httpService.LApost(APIURLS.GET_EMP_DETAILS_FOR_OT, val);
        connection.then((data: any) => {
            if (data) {
                let result = data.filter((x:any)  => { return x.employeeId != null });
                this.EmployeeNo = result[0].employeeId;
                this.Department = result[0].department;
                this.Designation = result[0].designation;
                this.FullName = result[0].fullName;
                this.empName = this.FullName;
            }
        }).catch((error)=> {
        });
    }

    GetReportingEmployeeList() {
        this.httpService.LAgetByParam(APIURLS.GET_EMP_OF_REPORTING, this.currentUser.employeeId).then((data: any) => {
            if (data.length > 0) {
                this.EmployeeList = data;
                this.empListCon = data.map((i:any) => { i.name = i.fullName + '-' + i.employeeId, i.id = i.employeeId, i.empName = i.fullName; return i; });
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

    isValid: boolean = false;
    validatedForm: boolean = true;
    EmpTPList: any[] = [];
    upcomingShift: any[] = [];

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
            }
        }).catch((error)=> {
            this.isLoading = false;
            this.ApproversList = [];
        });
    }

    ClearData() {
        this.FromDateforTP = null;
        this.ToDateforTP = null;
        this.typrWrk = null;
        this.Duration1 = null;
        this.Duration2 = null;
        this.DetailsforTP = null;
        this.TourPlanList = [];
        this.rowcount = 1;
        this.isDelete = true;
        this.ApplyFor = null;
    }

    view: boolean = false;
    TourPlanRequest(isedit: boolean, data: any, value: string) {
        this.view = false;
        this.isEdit = isedit;
        this.newDynamic = { id: this.rowcount, FromDateforTP: null, ToDateforTP: null, typrWrk: null, Duration1: null, Duration2: null, DetailsforTP: null };
        this.TourPlanList.push(this.newDynamic);
        this.ClearData();
        if (this.isEdit) {
        }
        else {
            this.newDynamic = { id: this.rowcount, FromDateforTP: null, ToDateforTP: null, typrWrk: null, Duration1: null, Duration2: null, DetailsforTP: null };
            this.TourPlanList.push(this.newDynamic);
        }
        if (value == 'View') {
            this.view = true;
        }
        jQuery("#myModal").modal('show');
    }

    rowcount: number = 0;
    isDelete: boolean = true;

    addRows(index) {
        this.rowcount = this.rowcount + 1;
        this.newDynamic = { id: this.rowcount, FromDateforTP: null, ToDateforTP: null, typrWrk: null, Duration1: null, Duration2: null, DetailsforTP: null };
        this.TourPlanList.push(this.newDynamic);
    }
    removeRows(item:any) {
        if (this.TourPlanList.length > 1) {
            const index = this.TourPlanList.indexOf(item);
            this.TourPlanList.splice(index, 1);
        }
    }

    TourPlanList: any = [];
    newDynamic: any = {};
    TourPlanTp = {} as TourPlan;
    userId: string = ' ';
    ApplyFor: any = null;


    OnSubmit() {
        this.errMsg = "";
        let connection: any;
        this.TourPlanList.forEach((element:any)=> {

            this.TourPlanTp = {} as TourPlan;
            if (this.ApplyFor == "Others") {
                this.TourPlanTp.reqBy = this.userId;
                this.getApproversList(this.userId);
            }
            else {
                this.TourPlanTp.reqBy = this.currentUser.employeeId;
                this.getApproversList(this.currentUser.employeeId);
            }
            this.TourPlanTp.date = this.setFormatedDate(element.FromDateforTP);
            this.TourPlanTp.typeOfWork = element.typrWrk;
            this.TourPlanTp.duration = element.Duration1;
            this.TourPlanTp.details = element.DetailsforTP;
            this.TourPlanTp.approverStatus = 'Pending';
            this.TourPlanTp.pendingApprover = this.ApproversList[0].employeeId;
            this.TourPlanTp.lastApprover = '';
            this.TourPlanTp.approvedOn = null;
            connection = this.httpService.LApost(APIURLS.BR_GET_TOUR_PLAN_REQUESTS, this.TourPlanTp);
        });


        connection.then((output: any) => {
            this.isLoadingPop = false;
            if (output.typ == 'S') {
                swal({
                    title: "Message",
                    text: "Request generated sucessfully...!",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.ClearData();
                this.closeSaveModal();
                this.getEmpTPRequests();
            }
            else {
                swal({
                    title: "Message",
                    text: output.message,
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.FromDateforTP = null;
                this.Duration1 = null;
            }
        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving Request..';
        });
    }

    CancelLeave(val) {
        this.errMsg = "";
        let connection: any;

        this.TourPlanTp = {} as TourPlan;
        this.TourPlanTp = Object.assign({}, val);
        this.TourPlanTp.approverStatus = 'Cancelled';
        this.TourPlanTp.pendingApprover = "";
        this.TourPlanTp.lastApprover = '';
        this.TourPlanTp.approvedOn = null;
        connection = this.httpService.LAput(APIURLS.UPDATE_TOUR_PLAN, this.TourPlanTp.id, this.TourPlanTp);


        connection.then((output: any) => {
            this.isLoadingPop = false;
            if (output == 200) {
                swal({
                    title: "Message",
                    text: "Request cancelled sucessfully...!",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.ClearData();
                this.getEmpTPRequests();
            }

        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving Request..';
        });
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

    reqNo: any;
    reqBy: any;
    reqOn: any;
    date: any;
    duration: any;
    typeOfWork: any;
    details: any;
    appid: any;
    appName: any;
    appDesg: any;
    appDept: any;
    appStatus: any;
    appDate: any;
    appRole: any;
    approverStatus: any;

    printLeave(values) {
        // this.appDetails(values.reqId);
        this.reqNo = values.id;
        this.reqBy = values.reqBy;
        this.reqOn = values.reqOn;
        this.date = values.date;
        this.duration = values.duration;
        this.typeOfWork = values.typeOfWork;
        this.details = values.details;
        if (values.approverStatus == 'Approved') {
            this.appid = values.approverNo;
            this.appName = values.lastApprover;
            this.appDesg = values.appDesignation;
            this.appDept = values.appDepartment;
            this.approverStatus = values.approverStatus;
            this.appRole = values.appRole;
            this.appDate = values.approvedDate;
        }
        else {
            this.appid = values.approverNoP;
            this.appName = values.pendingApprover;
            this.appDesg = values.appDesignationP;
            this.appDept = values.appDepartmentP;
            this.approverStatus = values.approverStatus;
            this.appRole = values.appRoleL;
            this.appDate = values.approvedDate;
        }
        swal({
            title: "Message",
            text: "Are you sure to print?",
            icon: "warning",
            dangerMode: false,
            buttons: [true, true]
        }).then((willsave) => {
            if (willsave) {
                this.Print();
            }
        });
    }

    Print() {
        var printContents = document.getElementById('pdf')!.innerHTML;
        var OrganisationName = "MICRO LABS LIMITED";
        var ReportName = "EMPLOYEE TOUR PLAN";
        var printedBy = this.currentUser.fullName;
        var now = new Date();
        //   var jsDate = this.setFormatedDateTime(now);
        var logo = this.image;
    //     var htmnikhitml = htmlToPdfmake(`<html>
    //   <head>
    //   </head>
    //   <body>
    //   ${printContents}
    //   <div>     
    //   </div>
    //   </body>  
    //   </html>`, {
    //         tableAutoSize: true,
    //         headerRows: 1,
    //         dontBreakRows: true,
    //         keepWithHeaderRows: true,
    //     })
        var docDefinition = {
            info: {
                title: 'Tour Plan',
            },

            content: [
                //htmnikhitml,
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