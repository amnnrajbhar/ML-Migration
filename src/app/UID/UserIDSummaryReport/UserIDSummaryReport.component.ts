import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
declare var jQuery: any;
import * as _ from "lodash";
import swal from 'sweetalert';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';

// import { MonthView, GetMonthViewArgs } from 'calendar-utils';
import { MonthView, GetMonthViewArgs } from 'calendar-utils';
//import { Visitor } from './visitor.model';
import { AuthData } from '../../auth/auth.model';
import { FormControl, NgForm } from '@angular/forms';
import { colors } from '../../shared/colors';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { UserIdRequest } from '../../UID/UserIdRequest/UserIdRequest.model';
import { Transactions } from '../../eMicro/ItemCodeCreation/transactions.model';
import { WorkFlowApprovers } from '../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { ExcelService } from '../../shared/excel-service';
//import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';

interface task {
    value: string;
    viewValue: string;
}

interface taskGroup {
    disabled?: boolean;
    name: string;
    task: task[];
}

interface UGrpsList { id: number, UserGroup: string, sid: number, UserSubGroups: any[] }


@Component({
    selector: 'app-UserIDSummaryReport',
    templateUrl: './UserIDSummaryReport.component.html',
    styleUrls: ['./UserIDSummaryReport.component.css'],

})
export class UserIDSummaryReportComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('myInput') myInputVariable: ElementRef;


    searchTermBaseLoc = new FormControl();
    public filteredItemsBaseLoc = [];
    searchTermMgr = new FormControl();
    public filteredItemsMgr = [];
    searchTermRMgr = new FormControl();
    public filteredItemsRMgr = [];
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

    formData: FormData = new FormData();
    file: File; successMsg: string = "";
    path: string = '';
    locationList: any[] = [[]];
    selectedBaseLocation: any = [];
    baseLocationnotfirst = true;


    userIdRequest = {} as UserIdRequest
    userIdRequestlist: UserIdRequest[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    comments: string;
    filterMaterialCode: string = null;
    filterstatus: string = null;
    filtersoftware: string = null;
    filterrequest: string = null;
    filterType: string = null;
    filterEmployee: string = null;
    filterlocation: string = null;
    filterEquipName: string = null;
    today = new Date();
    from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    to_date: any = this.today;
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    UserIdRequestList: UserIdRequest[] = [];
    userIdRequestsearchlist: UserIdRequest[] = [];

    filterData: any = {};
    filterModel: any = {};

    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router
        , private http: HttpClient, private excelService: ExcelService) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

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
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {
            this.filterModel.pageSize = 10;
            this.filterModel.pageNo = 1;
            this.filterModel.groupBy = 'Plant/Software';
            // this.getAllEntries();
            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getsoftwareMasterList();
            this.getbase64image();
            this.getLocationMaster();
            this.getsoftwareRolesMasterList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }
    locationAllList: any[] = [[]];


    statuslist: any[] = [
        { id: 1, name: 'Created' },
        { id: 2, name: 'Submitted' },
        { id: 3, name: 'Pending' },
        { id: 4, name: 'Rejected' },
        { id: 5, name: 'Completed' },
        { id: 6, name: 'InProcess' }
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

    softwareRolesList: any[] = [];
  softwareRolesList1: any[] = [];
  getsoftwareRolesMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    //this.softwareRolesList=[];
    this.httpService.get(APIURLS.BR_SOFTWARE_ROLES_API).then((data: any) => {
      if (data.length > 0) {
        this.softwareRolesList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
      // this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.softwareRolesList = [];
    });
  }

  getRole(id)
    {
        let temp = this.softwareRolesList.find(x=>x.id==id);
        return temp ? temp.role:'';
    }
    clearFilter() {
        this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
        this.to_date = this.today;
        this.filtersoftware = null;
        this.filterstatus = null;
        this.filterrequest = null;
        this.filterType = null;
        this.filterEmployee = null;
        this.filterlocation = null;
        this.filterEquipName = null;

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
            }
        }).catch(error => {
            this.isLoading = false;
            this.locationList = [];
        });
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
    getsoftwareMasterList() {
        this.errMsg = "";
        this.isLoading = true;
        //this.softwareList=[];
        this.httpService.get(APIURLS.BR_SOFTWARE_API).then((data: any) => {
            if (data.length > 0) {
                this.softwareList = data.filter(x => x.isActive).sort((a, b) => {
                    if (a.name > b.name) return 1;
                    if (a.name < b.name) return -1;
                    return 0;
                });
            }
            // this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.softwareList = [];
        });
    }
    softwareList1: any[] = [];
    GetSoftwareList() {
        if(this.filterModel.locationId =='')
        {
            this.softwareList1=this.softwareList;
        }       
        else  if (this.filterModel.locationId != '5') {
            let temp = this.locationList.find(x => x.id == this.filterModel.locationId);
            this.softwareList1 = this.softwareList.filter(x => x.location == temp.code || x.location == 'ML00');
        }

    }


    getOfferList() {
        this.filterModel.pageNo = 1;
        this.getData();
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

    getData() {
        this.isLoading = true;
        this.filterModel.employeeId = this.currentUser.fkEmpId;
        this.filterModel.fromDate = this.filterModel.fromDate ? this.SetDateFormat(this.filterModel.fromDate) : null;
        this.filterModel.toDate = this.filterModel.toDate ? this.SetDateFormat(this.filterModel.toDate) : null;
        this.httpService.post(APIURLS.USERID_REQUEST_SUMMARY_REPORT, this.filterModel).then((data: any) => {
            if (data) {
                this.filterData = data.result;
            }

            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
        });
    }

    exportData(type: string) {
        this.filterModel.export = true;
        this.isLoading = true;
        var groupBy = this.filterModel.groupBy;
        this.filterModel.employeeId = this.currentUser.fkEmpId;
        this.httpService.post(APIURLS.USERID_REQUEST_SUMMARY_REPORT, this.filterModel).then((data: any) => {
            this.filterModel.export = false;
            var exportList = [];

            if (type == "PDF") {
                this.filterData=data.result;
                swal({
                    title: "Message",
                    text: "Are you sure to export..?",
                    icon: "info",
                    dangerMode: false,
                    buttons: [true, true]
                }).then((willDelete) => {
                    if (willDelete) {
                        this.downloadPdf();
                    }
                });
            }
            else {
                var list = data.result;
                let index = 0;
                let exportItem: any;
                list.list.forEach(item => {
                    index = index + 1;
                    if (this.filterModel.groupBy == "Plant/Software/Equipment") {
                        exportItem = {
                            "Sl No": index,
                            "plant": item.plant,
                            "Software": item.software,
                            "Equipment": item.equipment,
                            "Total Active User Ids": item.submitted,
                            "Total InActive User Ids": item.rejeceted,
                        };

                    }
                    else if (this.filterModel.groupBy == "Plant/Software/Role") {
                        exportItem = {
                            "Sl No": index,
                            "plant": item.plant,
                            "Software": item.software,
                            "Software Type": item.softwareType,
                            "Role": this.getRole(item.equipment),
                            "Total Active User Ids": item.submitted,
                            "Total InActive User Ids": item.rejeceted,
                        };

                    }
                    else {
                        exportItem = {
                            "Sl No": index,
                            "plant": item.plant,
                            "Software": item.software,
                            "Software Type": item.softwareType,
                            "Total Active User Ids": item.submitted,
                            "Total InActive User Ids": item.rejeceted,
                        };

                    }

                    exportList.push(exportItem);
                });
                this.excelService.exportAsExcelFile(exportList, 'UserId_Summary');
            }

            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.filterModel.export = false;
            swal('Error occurred while fetching data.');
            return;
        });
    }

    ClearResult() {
        this.filterData.totalCount = 0;
        this.filterData.list = [];
    }

    currentUser: AuthData;
    ngAfterViewInit() {
        this.initDatatable();
    }


    isValid: boolean = false;
    validatedForm: boolean = true;

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
    setFormatedTime(date: any) {
        let dt = new Date(date);
        let formateddate =
            ("00" + dt.getHours()).slice(-2) + ":" +
            ("00" + dt.getMinutes()).slice(-2) + ":" +
            ("00" + dt.getSeconds()).slice(-2);
        return formateddate;
    }
    SetDateFormat(date: any) {
        let dt = new Date(date);
        let formateddate =
            dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" + ("00" + dt.getDate()).slice(-2);

        return formateddate;
    }

    GetDetailedReport(id: number, id2: number) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/Creation';
        this.router.navigate([route]);
    }
    GetDetailedAcReport(id: number, id2: number) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/Activation';
        this.router.navigate([route]);
    }
    GetDetailedReportE(id: number, id2: number, id3: string) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/' + id3 + '/Creation';
        this.router.navigate([route]);
    }
    GetDetailedAcReportE(id: number, id2: number, id3: string) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/' + id3 + '/Activation';
        this.router.navigate([route]);
    }
    GetDetailedReportR(id: number, id2: number, id3: number) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/' + id3 + '/Creation';
        this.router.navigate([route]);
    }
    GetDetailedAcReportR(id: number, id2: number, id3: number) {
        let route = 'DetailedReport/' + id + '/' + id2 + '/' + id3 + '/Activation';
        this.router.navigate([route]);
    }


    locationname: string;
    downloadPdf() {
        // var temp=this.materialList.find(x=>x.id==this.filtermaterialtype);
        //generalpdf

        var printContents: any;
        printContents = document.getElementById('pdf').innerHTML;
        var temp1 = this.locationList.find(x => x.id == this.currentUser.baselocation);
        var OrganisationName = "MICRO LABS LIMITED";
        var ReportName = 'USER ID SUMMARY REPORT';
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
                title: 'User Id Form',
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
            pageOrientation: 'portrait',
            header: function (currentPage, pageCount) {
                return {

                    columns: [
                        {
                            // pageMargins: [40, 80, 40, 60],
                            style: 'tableExample',
                            color: '#444',
                            table: {
                                widths: [50, 370, 70],
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