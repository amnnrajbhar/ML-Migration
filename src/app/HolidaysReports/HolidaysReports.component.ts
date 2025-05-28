import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../shared/http-service';
import { APIURLS } from '../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { FormControl, NgForm } from '@angular/forms';
import { AuthData } from '../auth/auth.model';
import swal from 'sweetalert';
declare var toastr: any;
import { AuditLogChange } from '../masters/auditlogchange.model';
import { AuditLog } from '../masters/auditlog.model';
import * as _ from "lodash";
import { HolidaysReports } from './HolidaysReports.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ExcelService } from '../shared/excel-service';
declare var jQuery: any;
import { MatAccordion } from '@angular/material/expansion';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { error } from 'console';
//import { filter } from 'rxjs-compat/operator/filter';



@Component({
    selector: 'app-HolidaysReports',
    templateUrl: './HolidaysReports.component.html',
    styleUrls: ['./HolidaysReports.component.css']
})
export class HolidaysReportsComponent implements OnInit {
    searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm, { static: false }) desigForm!: NgForm;


@ViewChild(MatAccordion, { static: false }) accordion!: MatAccordion;


    public filteredItems = [];

    public tableWidget: any;
    selParentId: any;
    HolidaysReportsList: any[] = [];
    HolidaysReportsList1: any = [];
    desgList: any;
    parentList!: any[];
    selParentRole: any = [];
    selParentRoleList: any;
    requiredField: boolean = true;
    HolidaysReports: HolidaysReports = new HolidaysReports();
    isLoading: boolean = false;
    errMsg: string = "";
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    isLoadPopPlus: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    path: string = '';
    notFirst = true;
    currentUser = {} as AuthData;
    oldHolidaysReports: HolidaysReports = new HolidaysReports();// For aduit log
    auditType: string// set ActionTypes: Create,Update,Delete
    aduitpurpose: string
    calYear: string
    filterLocation: string = '';
    filterPayGroup: string = '';
    filterType: string = '';
    filterTypeCode: string = '';
    filterTypeName: string = '';
    Type: string = ' ';
    TypeCode: string = ' ';
    TypeName: string = ' ';
    PayGroup: string = ' ';
    Location: string = ' ';
    min = new Date();
    max = new Date();
    holidayList: any[] = [];

    constructor(private httpService: HttpService, private router: Router, private appService: AppComponent,
        private http: HttpClient, private excelService: ExcelService) {
    }

    ngAfterViewInit() {
        this.initDatatable();
    }
    private initDatatable(): void {
        let table: any = jQuery('#userTable');
        this.tableWidget = table.DataTable({
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
            let currentYear = new Date().getFullYear();
            this.min = new Date(currentYear - 0, 0, 1);
            this.max = new Date(currentYear + 0, 11, 31);
         const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
            this.calYear = new Date().getFullYear().toString();
            //  this.filterLocation = this.currentUser.baselocation.toString();

            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getLocationMaster();
            // this.getHolidaysReportsList();
            // this.getPayGroupList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }

    locationList11: any[] = [[]];
    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationList11 = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList11.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
            }
        }).catch((error)=> {
            this.isLoading = false;
            this.locationList11 = [];
        });
    }

    closeSaveModal() {
        jQuery("#myModal").modal('hide');
    }

    clearFilter() {
        this.filterLocation = '';
        this.filterPayGroup = '';
        this.calYear = new Date().getFullYear().toString();
        //this.filterType = null;
this.filterType = '';
     //   this.filterTypeCode = null;
   this.filterTypeCode = '';
       //   this.filterTypeName = null;
 this.filterTypeName = '';
        this.HolidaysReportsList = [];
    }


    AdditionalTypesList: any[] = [];
    AdditionalTypesList1: any[] = [];

    getHolidaysReportsList() {
        this.HolidaysReportsList = [];
        this.errMsg = "";
        this.isLoading = true;
        let filterModel: any = {};
        filterModel.location = this.filterLocation;
        filterModel.payGroup = this.filterPayGroup;
        filterModel.year = this.calYear;
        filterModel.type = this.filterType;
        this.httpService.LApost(APIURLS.GET_HOLIDAY_REPORT_LIST, filterModel).then((data: any) => {
            if (data) {
                this.HolidaysReportsList = [];
                this.HolidaysReportsList = data.filter((x:any)  => x.isActive == true).sort((a:any, b:any) => {
                    if (a.location > b.location) return 1;
                    if (a.location < b.location) return -1;

                    if (a.payGroup > b.payGroup) return 1;
                    if (a.payGroup < b.payGroup) return -1;

                    if (a.type < b.type) return 1;
                    if (a.type > b.type) return -1;

                    if (a.date > b.date) return 1;
                    if (a.date < b.date) return -1;
                    return 0;
                });
            }
            console.log(this.HolidaysReportsList);
            // this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.HolidaysReportsList = [];
        });
    }

    locationList: any[] = [];
    plantList: any[] = [];
    getPlantsassigned(id:any) {
        this.isLoading = true;
        this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
            if (data) {
                this.locationList = data.filter((x:any)  => { return x.isActive; }).map((i:any) => { i.location = i.code + '-' + i.name; return i; });;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
                this.getPayGroupList();
            }
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.plantList = [];
        });
    }

    PayGroupList: any[] = [];
    getPayGroupList() {
        this.get("PayGroupMaster/GetAll").then((data: any) => {
            if (data.length > 0) {
                this.PayGroupList = data.sort((a:any, b:any) => {
                    if (a.short_desc > b.short_desc) return 1;
                    if (a.short_desc < b.short_desc) return -1;
                    return 0;
                });
                let temp = this.locationList.find((x:any)  => x.fkPlantId == this.filterLocation);
                this.payGroupList1 = temp ? this.PayGroupList.filter((x:any)  => x.plant == temp.code) : [];
            }
        }).catch((error)=> {
            this.isLoading = false;
            this.PayGroupList = [];
        });
    }

    getPay(id:any) {
        let tempPg = this.PayGroupList.find((x:any)  => x.id == id);
        return tempPg ? tempPg.short_desc : '';
    }

    payGroupList1: any[] = [];
    getPaygroupsBasedOnPlant() {
       // this.filterPayGroup = null;
  this.filterPayGroup = '';

        let temp = this.locationList.find((x:any)  => x.fkPlantId == this.filterLocation);
        this.payGroupList1 = temp ? this.PayGroupList.filter((x:any)  => x.plant == temp.code) : [];
    }
    getLoc(id:any) {
        let temp = this.locationList.find((x:any)  => x.fkPlantId == id);
        return temp ? temp.code + ' - ' + temp.name : '';
    }

    payGroupList11: any[] = [];
    getPaygroupsBasedOnPlant1() {
       // this.filterPayGroup = null;
  this.filterPayGroup = '';

        let temp = this.locationList.find((x:any)  => x.fkPlantId == this.Location);
        this.payGroupList11 = temp ? this.PayGroupList.filter((x:any)  => x.plant == temp.code) : [];
    }
    getLoc1(id:any) {
        let temp = this.locationList.find((x:any)  => x.fkPlantId == id);
        return temp ? temp.code : '';
    }

    getDateFormate(date: any): string {
        let d1 = new Date(date);
        return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d1.getDate()).slice(-2);
    }

    setFormatedDate(date: any) {
        let dt = new Date(date);
        let formateddate =
            dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + '-' + ("00" + dt.getDate()).slice(-2);
        return formateddate;
    }

    getYear(date: any): number {
        let d1 = new Date(date);
        return d1.getFullYear();
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
  //const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');


  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
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

    exportList!: any[];
    exportExcel() {
        if (this.HolidaysReportsList.length == 0) {
            toastr.error("Pease filter Holiday data...");
            return;
        }
        this.exportList = [];
        let index = 0;
        this.HolidaysReportsList.forEach((item :any) => {
            index = index + 1;
            let midName = '';
            let lastName = '';
            midName = item.middleName == null ? '' : item.middleName;
            lastName = item.lastName == null ? '' : item.lastName;
            if (item.type == 'Regular') {
                let exportItemRH = {
                    "SNo": index,
                    "Plant": item.location ? this.locationList11.find((x:any)  => x.id == item.location).code : '',
                    "Pay Group": item.payGroup ? this.PayGroupList.find((x:any)  => x.id == item.payGroup).short_desc : '',
                    "Holiday Date": this.setDateFormate(item.date),
                    "Day Name": item.day_Name,
                    "Occasion": item.holiday_Name,
                    "Type": item.type,
                }
                this.exportList.push(exportItemRH);
            }
            else {
                let exportItemAH = {
                    "SNo": index,
                    "Plant": item.location ? this.locationList11.find((x:any)  => x.id == item.location).code : '',
                    "Pay Group": item.payGroup ? this.PayGroupList.find((x:any)  => x.id == item.payGroup).short_desc : '',
                    "Holiday Date": this.setDateFormate(item.date),
                    "Day Name": item.day_Name,
                    "Occasion": item.holiday_Name,
                    "Type": item.type,
                    "Type Code": item.typeCode,
                    "Type Name": item.typeName,
                }
                this.exportList.push(exportItemAH);
            }
        });
        this.excelService.exportAsExcelFileForLA(this.exportList, 'HolidayList');
    }


    toggleAccordian(event:any, index:any) {

        var element = event.target;
        element.classList.toggle("active");
        if (this.AdditionalTypesList[index].isActive) {
            this.AdditionalTypesList[index].isActive = false;
        } else {
            this.AdditionalTypesList[index].isActive = true;
        }
        var panel = element.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }
}
