import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
declare var toastr: any;
import { AbsentIntimation } from './AbsentIntimation.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../../auth/auth.model';
import swal from 'sweetalert';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from "lodash";
declare var $: any;
declare var jQuery: any;


export class actionItemModel {
    description: string;
    id: number;
    uname: string;
}
@Component({
    selector: 'app-AbsentIntimation',
    templateUrl: './AbsentIntimation.component.html',
    styleUrls: ['./AbsentIntimation.component.css']
})
export class AbsentIntimationcomponent implements OnInit {
    searchTerm: FormControl = new FormControl();
    @ViewChild(NgForm) leaveForm: NgForm;
    public tableWidget: any;
    AbsentIntimationItem: AbsentIntimation = new AbsentIntimation();
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    path: string = '';
    currentUser = {} as AuthData;
    oldAbsentIntimationItem: AbsentIntimation = new AbsentIntimation();
    AbsentIntimationList: any[] = [];
    StartDate: any = null;
    EndDate: any = null;

    constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
        private http: HttpClient) { }

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
        }
        else
            this.router.navigate(["/unauthorized"]);
    }




    ngAfterViewInit() {
        this.initDatatable()
    }

    closeSaveModal() {
        jQuery("#myModal").modal('hide');
    }



    Edit(data: any) {
        this.AbsentIntimationItem = Object.assign({}, data)
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
                            return { label: item.fullName + " (" + item.employeeId + ") ", value: item.employeeId + " (" + item.fullName + ") "
                                    , name: item.fullName };
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
                                    this.empName = ui.item.name;
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
    setFormatedDate(date: any) {
        let dt = new Date(date);
        let formateddate =
            dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
        return formateddate;
    }
    onSaveLeave() {
        this.errMsg = "";
        this.errMsgPop = "";
        this.isLoadingPop = true;
        let connection: any;
        if (this.AbsentIntimationItem.empId == null || this.AbsentIntimationItem.empId == '') {
            toastr.error("Please enter employee no.");
            return;
        }
        if (this.AbsentIntimationItem.intimationType == null || this.AbsentIntimationItem.intimationType == '') {
            toastr.error("Please Select Intimation Type.");
            return;
        }
        if (this.AbsentIntimationItem.intimationOver == null || this.AbsentIntimationItem.intimationOver == '') {
            toastr.error("Please Select Intimation Over");
            return;
        }
        if (this.StartDate == null || this.StartDate == undefined) {
            toastr.error("Please Select start date");
            return;
        }
        if (this.EndDate == null || this.EndDate == undefined) {
            toastr.error("Please Select End Date");
            return;
        }
        if (this.AbsentIntimationItem.duration == null || this.AbsentIntimationItem.duration == '') {
            toastr.error("Please Select duration");
            return;
        }
        if (this.AbsentIntimationItem.reason == null || this.AbsentIntimationItem.reason == '') {
            toastr.error("Please enter reason");
            return;
        }
        else {
            this.AbsentIntimationItem.fromDate = this.setFormatedDate(this.StartDate);
            this.AbsentIntimationItem.toDate = this.setFormatedDate(this.EndDate);
            this.AbsentIntimationItem.updatedBy = this.currentUser.employeeId;
            connection = this.httpService.LApost(APIURLS.ABSENT_INTIMATION_INSERT_UPDATE, this.AbsentIntimationItem);
            connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data.type != 'E') {
                    this.errMsgPop1 = ' Intimation data saved successfully!';
                    swal({
                        title: "Message",
                        text: this.errMsgPop1,
                        icon: "success",
                        dangerMode: false,
                        buttons: [false, true]
                    });
                    this.clear();
                }
                else if (data.type = 'E') {
                    this.isLoading = false;
                    swal({
                        title: "Error",
                        text: data.message,
                        icon: "error",
                        dangerMode: false,
                        buttons: [false, true]
                    });
                }
            }).catch(error => {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving intimation data..';
            });
        }
    }

    clear() {
        this.AbsentIntimationItem.fromDate = null;
        this.AbsentIntimationItem.toDate = null;
        this.AbsentIntimationItem.empId = null;
        this.AbsentIntimationItem.intimationType = null;
        this.AbsentIntimationItem.intimationOver = null;
        this.AbsentIntimationItem.duration = null;
        this.AbsentIntimationItem.reason = null;
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
                        resolve(res);
                    },
                    err => {
                        reject(err.json());
                    }
                );
        });
        return promise;
    }

getHeader(): any {
        // var headers = new Headers();
        // headers.append("Accept", 'application/json');
        // headers.append('Content-Type', 'application/json');
        // let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
        // headers.append("Authorization", "Bearer " + authData.token);
        // let options = new RequestOptions({ headers: headers });
        // return options;
         let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
    }
}
