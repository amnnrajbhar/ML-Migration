import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";
import swal from 'sweetalert';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';

import { DayViewHour, MonthView, GetMonthViewArgs } from 'calendar-utils';
//import { Visitor } from './visitor.model';
import { AuthData } from '../../auth/auth.model';
import { FormControl, NgForm } from '@angular/forms';
import { colors } from '../../shared/colors';
import { MatAutocompleteTrigger } from '@angular/material';
import { UserIdRequest } from '../../UID/UserIdRequest/UserIdRequest.model';
import { Transactions } from '../../eMicro/ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { ExcelService } from '../../shared/excel-service';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';


@Component({
    selector: 'app-UserReport',
    templateUrl: './UserReport.component.html',
    styleUrls: ['./UserReport.component.css'],

})
export class UserReportComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('myInput') myInputVariable: ElementRef;


    path: any;
    public tableWidget: any;

    locListCon = [];
    locListCon1 = [];

    isLoading: boolean = false;
    errMsg: string = "";
    errMsg1: string = "";
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;



    userIdRequest = {} as UserIdRequest
    userIdRequestlist: UserIdRequest[] = [];
    userIdRequestlist1: UserIdRequest[] = [];
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filtersoftware: string = null;
    filtersoftwareType: string = null;
    filterrequest: string = null;
    filterType: string = null;
    filterEmployee: string = null;
    filterlocation: string = null;
    filterEquipName: string = null;


    //new Dev
    softType: string;
    locationCode: string;
    filteredSoftwareList: any[] = [];
    Software: string = null;
    ReportType: string = null;

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
        , private http: HttpClient, private excelService: ExcelService,private datePipe:DatePipe) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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

    ngOnInit() {
        this.path = this.router.url;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        //  this.baseLocation = this.currentUser.baselocation;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {

            // this.getAllEntries();
            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getbase64image();
            this.getsoftwareMasterList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }


    statuslist: any[] = [
        { id: 1, name: 'Created' },
        { id: 2, name: 'Submitted' },
        { id: 3, name: 'Pending' },
        { id: 4, name: 'Rejected' },
        { id: 5, name: 'Completed' },
        { id: 6, name: 'InProcess' }
    ];
    mastersList: any[] = [
        { id: 1, name: 'FRM' },
        { id: 2, name: 'FROM' },
        { id: 3, name: 'ARDM' },
        { id: 4, name: 'APIM' },
        { id: 5, name: 'NA' }
    ];

    approverstatuslist: any[] = [
        { id: 1, name: 'Reviewed' },
        { id: 2, name: 'Reviewed' },
        { id: 3, name: 'Reviewed' },
        { id: 4, name: 'Approved' },
        { id: 5, name: 'Approved' },
        { id: 6, name: 'Created' },
        { id: 7, name: 'Closed' }
    ];

    getDateFormate(date: any): string {
        let d1 = new Date(date);
        return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d1.getDate()).slice(-2);
    }
    getFormatedDateTime(date: any) {
        let dt = new Date(date);
        let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
            ("00" + dt.getDate()).slice(-2) + ' ' +
            ("00" + dt.getHours()).slice(-2) + ":" +
            ("00" + dt.getMinutes()).slice(-2) + ":" +
            ("00" + dt.getSeconds()).slice(-2);
        return formateddate;
    }


    clearFilter() {

        this.filtersoftware = null;
        this.filterstatus = null;
        this.filtersoftwareType = null;
        this.filterrequest = null;
        this.filterType = null;
        this.filterEmployee = null;
        this.filterlocation = null;
        this.filterEquipName = null;
        this.ReportType = null;

    }
    plantAssignedList: any[] = [];
    getPlantsassigned(id) {
        this.isLoading = true;
        this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
            if (data) {
                this.plantAssignedList = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.plantAssignedList.sort((a, b) => { return collator.compare(a.code, b.code) });
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.plantAssignedList = [];
        });
    }

    softwareList: any[] = [];
    AllsoftwareList: any[] = [];
    getsoftwareMasterList() {
        this.errMsg = "";
        this.isLoading = true;
        //this.softwareList=[];
        this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
            if (data.length > 0) {
                this.AllsoftwareList = data.filter(x => x.isActive).sort((a, b) => {
                    if (a.name > b.name) return 1;
                    if (a.name < b.name) return -1;
                    return 0;
                });

            }
            // this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.AllsoftwareList = [];
        });
    }
    getsoftwaresBasedOnplant() {
        this.filtersoftware=null;
        if(this.filtersoftwareType=='Plant Level')
        {
            let temp = this.plantAssignedList.find(x=>x.fkPlantId == this.filterlocation).code;
            this.softwareList = this.AllsoftwareList.filter(x=>x.location == temp);
        }
        else{
            this.softwareList = this.AllsoftwareList.filter(x=>x.location == 'ML00');
        }
       
    }

    getAllEntries() {
        this.isLoading = true;
        let td = new Date();
        let formatedFROMdate: string;
        let formatedTOdate: string;
        var filterModel: any = {};
        filterModel.location = this.filterlocation;
        filterModel.software = this.filtersoftware;
        filterModel.softwareType = this.filtersoftwareType
        filterModel.status = this.filterstatus;
        filterModel.type = this.filterType;
        filterModel.creator = this.filterEmployee;
        this.getEmpDetails(this.filterEmployee);
        filterModel.pageNo = this.pageNo;
        filterModel.pageSize = this.pageSize;
        this.httpService.post(APIURLS.GET_USER_REPORT_DATA, filterModel).then((data: any) => {
            if (data) {
                this.totalCount = data[0].totalCount;
                this.totalPages = data[0].totalPages;
                this.userIdRequestlist = data;
                // }
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.userIdRequestlist = [];
        });

    }
    exportData(val) {
        this.isLoading = true;
        let td = new Date();
        let formatedFROMdate: string;
        let formatedTOdate: string;
        var filterModel: any = {};
        filterModel.location = this.filterlocation;
        filterModel.software = this.filtersoftware;
        filterModel.softwareType = this.filtersoftwareType;
        filterModel.status = this.filterstatus;
        filterModel.type = this.filterType;
        filterModel.export = true;
        filterModel.creator = this.filterEmployee;
        this.getEmpDetails(this.filterEmployee);
        filterModel.pageNo = this.pageNo;
        filterModel.pageSize = this.pageSize;
        this.httpService.post(APIURLS.GET_USER_REPORT_DATA, filterModel).then((data: any) => {
            let list = data;
            this.userIdRequestlist1 = data;
            swal({
                title: "Message",
                text: "Are you sure to export..?",
                icon: "info",
                dangerMode: false,
                buttons: [true, true]
            }).then((willDelete) => {
                if (willDelete) {
                    if (val == 'PDF') {
                        this.downloadPdf();
                    }
                    else {
                        var exportList = [];
                        let index = 0;
                        list.forEach(item => {
                            index = index + 1;
                            let exportItem = {
                                "Sl No": index,
                                "Plant": item.locationName,
                                "Software Type": item.softwareType,
                                "Software": item.softwarename,
                                "Request Type": item.requestType,
                                "Requested By": item.requesterId,
                                "Requested Date": this.datePipe.transform(item.requestDate,'dd/MM/yyyy HH:mm'),
                                "UserID": item.allottedUserId,
                                "Status": item.isActive == false ? 'InActive' : 'Active',
                                "Created By": item.requestType =='Creation'?item.lastApprover:null,
                                "Created On": item.requestType =='Creation'?this.datePipe.transform(item.modifiedDate,'dd/MM/yyyy HH:mm'):null,
                                "Disabled By": item.requestType !='Creation'?item.lastApprover:null,
                                "Disabled On": item.requestType !='Creation'?this.datePipe.transform(item.modifiedDate,'dd/MM/yyyy HH:mm'):null,
                            };
                            exportList.push(exportItem);
                        });
                        this.excelService.exportAsExcelFile(exportList, 'UserBaserReport');


                    }
                }
            });
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            swal('Error occurred while fetching data.');
            return;
        });

    }
    pageSize: any = 10;
    pageNo: any;
    totalCount: number;
    totalPages: number
    gotoPage(no) {
        if (this.pageNo == no) return;
        this.pageNo = no;
        if (this.filterEmployee == null || this.filterEmployee == '') {
            alert("Please enter Employee Number")

        }
        else {
            this.getAllEntries();
        }
    }

    pageSizeChange() {
        this.pageNo = 1;
        if (this.filterEmployee == null || this.filterEmployee == '') {
            alert("Please enter Employee Number")

        }
        else {
            this.getAllEntries();
        }
    }
    getlist() {
        this.pageNo = 1
        if (this.filterEmployee == null || this.filterEmployee == '') {
            alert("Please enter Employee Number")

        }
        else {
            this.getAllEntries();
        }

    }


    currentUser: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }

    currentUser1: AuthData;
    getEmpDetails(empId) {
        this.errMsg = "";
        this.isLoading = true;
        //this.UserGroupsList=[];
        this.httpService.getByParam(APIURLS.BR_GET_EMP_DETAILS_API, empId).then((data: any) => {
            if (data.employeeId > 0) {
                // this.currentUser = data;
                this.userIdRequest.employeeId = data.employeeId;
                this.userIdRequest.fullName = data.fullName;
                this.userIdRequest.designation = data.designation;
                this.userIdRequest.department = data.department;
                this.userIdRequest.reportingManager = data.reportingManager;
                this.userIdRequest.joiningDate = data.joiningDate;
                this.userIdRequest.firstName = data.firstName;
                this.userIdRequest.lastName = data.lastName;
                this.userIdRequest.catogery = data.category;
                this.userIdRequest.payGroup = data.division;
            }
            // this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.currentUser = {} as AuthData;
        });
    }

    transactionsHistory: any[] = [];
    getHistory(reqNo) {
        this.httpService.getByParam(APIURLS.GET_REQUEST_HISTORY, reqNo).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                this.transactionsHistory = data;
                let temp = this.transactionsHistory.find(x => (x.doneBy == this.currentUser.employeeId || x.parallelApprover1 == this.currentUser.employeeId
                    || x.parallelApprover2 == this.currentUser.employeeId || x.parallelApprover3 == this.currentUser.employeeId ||
                    x.parallelApprover4 == this.currentUser.employeeId) && x.transactionType == null);


            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.transactionsHistory = [];
        });
    }

    image: string;
    getbase64image() {
        this.http.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
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
    downloadPdf() {
        // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
        //generalpdf
        var printContents: any;
        printContents = document.getElementById('pdf').innerHTML;
        var temp1 = this.plantAssignedList.find(x => x.fkPlantId == this.currentUser.baselocation);
        var OrganisationName = "MICRO LABS LIMITED" + ', ' + temp1.code + '-' + temp1.name;
        var ReportName = 'USER BASED REPORT';
        var printedBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
        var now = new Date();
        var jsDate = this.setFormatedDateTime(now);
        var logo = this.image;
        var reason = '';
        var htmnikhitml = htmlToPdfmake(`<html>
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
        })
        var docDefinition = {
            info: {
                title: 'User Id Report',
            },

            content: [
                htmnikhitml,
            ],
            defaultStyle: {
                fontSize: 9,
                //p: { margin: [10, 15, 10, 20] },
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
            pageMargins: [40, 100, 40, 60],
            pageOrientation: 'landscape',
            header: function (currentPage, pageCount) {
                return {

                    columns: [
                        {
                            // pageMargins: [40, 80, 40, 60],
                            style: 'tableExample',
                            color: '#444',
                            table: {
                                widths: [120, 490, 120],
                                headerRows: 2,
                                keepWithHeaderRows: 1,
                                body: [
                                    [{
                                        rowSpan: 2, image: logo,
                                        width: 50,
                                        alignment: 'center'
                                    }
                                        , { text: OrganisationName, bold: true, fontSize: 15, color: 'black', alignment: 'center', height: '*' },
                                    {
                                        rowSpan: 2, text: ['Page ', { text: currentPage.toString() }, ' of ',
                                            { text: pageCount.toString() }], bold: true, fontSize: 10, color: 'black', alignment: 'center'
                                    }],
                                    [''
                                        , { text: ReportName, bold: true, fontSize: 14, color: 'black', alignment: 'center', height: '*' }, '']

                                ]
                            }
                        }
                    ],
                    margin: [40, 40, 40, 60]
                }
            },
            footer: function () {
                return {

                    columns: [

                        {
                            alignment: 'left',
                            stack: [
                                { text: 'Printed By' + ": " + printedBy + ', ' + 'Printed On' + ": " + jsDate + '.' + ' This document printed electronically through Unnati v2.0 software' },
                                { text: 'Reason' + ": " + reason }
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
        pdfMake.createPdf(docDefinition).open();
    }




}