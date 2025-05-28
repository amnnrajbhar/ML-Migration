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
import { HolidayMaster } from './HolidaysMaster.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ExcelService } from '../shared/excel-service';
declare var jQuery: any;
import { MatAccordion } from '@angular/material/expansion';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { error } from 'console';
//import { filter } from 'rxjs-compat/operator/filter';



@Component({
    selector: 'app-HolidaysMaster',
    templateUrl: './HolidaysMaster.component.html',
    styleUrls: ['./HolidaysMaster.component.css']
})
export class HolidaysMasterComponent implements OnInit {
    searchTerm: FormControl = new FormControl();
  @ViewChild(NgForm, { static: false }) desigForm!: NgForm;


@ViewChild(MatAccordion, { static: false }) accordion!: MatAccordion;


    public filteredItems = [];

    public tableWidget: any;
    selParentId: any;
    HolidaysMasterList: any[] = [];
    HolidaysMasterList1: any = [];
    desgList: any;
    parentList!: any[];
    selParentRole: any = [];
    selParentRoleList: any;
    requiredField: boolean = true;
    HolidaysMaster: HolidayMaster = new HolidayMaster();
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
    oldHolidaysMaster: HolidayMaster = new HolidayMaster();// For aduit log
    auditType!: string// set ActionTypes: Create,Update,Delete
    aduitpurpose!: string
    calYear!: string
    filterLocation: string = ' ';
    filterPayGroup: string = ' ';
    filterType: string = ' ';
    filterTypeCode: string = ' ';
    filterTypeName: string = ' ';
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
            let today = new Date();
            this.year = today.getFullYear();
            let currentYear = new Date().getFullYear();
            this.min = new Date(currentYear - 0, 0, 1);
            this.max = new Date(currentYear + 0, 11, 31);
         const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
            this.calYear = new Date().getFullYear().toString();
            //  this.filterLocation = this.currentUser.baselocation.toString();

            this.getPlantsassigned(this.currentUser.fkEmpId);
            this.getLocationMaster();
            // this.getHolidayMasterList();
            // this.getPayGroupList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }


    getSelectedDay(date: any, rec: number) {
        var Wday: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var d = date._d;
        if (this.dynamicArray.length > 0) {
            // let dupDate = null;
            let count: number = 0;
            // dupDate = this.dynamicArray.some((x:any)  => x.date._d == d);

            this.dynamicArray.forEach((value:any, index:any) => {
                if (index < this.dynamicArray.length - 1) {
                    let tempDate1 = new Date(value.date);
                    let tempDate2 = new Date(d);
                    if (tempDate1.getDate() == tempDate2.getDate() && tempDate1.getMonth() == tempDate2.getMonth()
                        && tempDate1.getFullYear() == tempDate2.getFullYear()) {
                        count++;
                    }
                }
            });

            if (count > 0) {
                toastr.error("Cannot select same date as above");
                this.dynamicArray.splice(rec, 1);
                return;
            }
        }

        this.dynamicArray[rec].day = Wday[d.getDay()];
        if (this.dynamicArray[rec].day == 'Sunday') {
            toastr.error("Cannot select the date as it is Sunday..!");
            this.dynamicArray.splice(rec, 1);
            return;
        }
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
        this.HolidaysMasterList = [];
    }

    dynamicArray: any = [];
    newDynamic: any = {};
    rowcount: number = 0;
    addRows() {
        let arrayLength = this.dynamicArray.length - 1;
        if (this.dynamicArray[arrayLength].occasion == '' || this.dynamicArray[arrayLength].occasion == null
            || this.dynamicArray[arrayLength].date == '' || this.dynamicArray[arrayLength].day == '') {
            toastr.error("Please fill the selected line details..");
            return;
        }

        this.rowcount = this.rowcount + 1;
        this.newDynamic = { id: this.rowcount, location: null, day: "", date: null, occasion: "", stored: "0" };
        this.dynamicArray.push(this.newDynamic);
    }

    removeRows(item:any) {
        if (this.dynamicArray.length > 1) {
            const index = this.dynamicArray.indexOf(item);
            this.dynamicArray.splice(index, 1);
            this.rowcount = this.rowcount - 1;
        }
    }

    clearRowCount() {
        this.rowcount = 0;
    }

    getTypeCode() {
        if (this.filterType == 'Regular') {
            return
        }
        else {
            var filterModel: any = {};
            filterModel.location = this.filterLocation;
            filterModel.type = 'Additional';
            filterModel.payGroup = this.filterPayGroup;

            let connection = this.httpService.LApost(APIURLS.GET_HOLIDAY_TYPE, filterModel);
            connection.then((data: any) => {
                if (data.length > 0) {
                    this.AdditionalTypesList = data;
                }
                else if (data.length == 0) {
                    swal({
                        title: 'Error',
                        text: 'No Additional Holiday is created for selected filters..Please create one..!',
                        icon: 'error',
                        dangerMode: false,
                        buttons: [false, true]
                    });
                    this.filterLocation = ''
                    this.filterType = ''
                    this.filterPayGroup = ''
                }
            }).catch((error)=> {
            });
        }
    }

    year: any;
    holidaysList: HolidayMaster[] = [];
    getholidaysList() {
        this.errMsg = "";
        let filterModel: any = {};
        filterModel.employeeId = this.currentUser.employeeId;
        filterModel.year = this.year;
        this.httpService.LApost(APIURLS.GET_HOLIDAYS_LIST_BASED_ON_EMPLOYEES, filterModel).then((data: any) => {
          if (data.length > 0) {
            this.HolidaysMasterList = data;
            this.HolidaysMasterList = this.HolidaysMasterList.sort((a:any, b:any) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return 0;
    
              });
          }
        }).catch((error)=> {
          this.isLoading = false;
          this.holidaysList = [];
        });
      }

    AdditionalTypesList: any[] = [];
    AdditionalTypesList1: any[] = [];

    getHolidayMasterList() {
        if(this.router.url != '/Holidays') {
           this.getholidaysList();
           return;
        }
        if (this.filterLocation == null || this.filterLocation == '') {
            toastr.error("Please select Plant...!");
            return;
        }
        if (this.filterPayGroup == null || this.filterPayGroup == '') {
            toastr.error("Please select PayGroup...!");
            return;
        }
        else if (this.filterType == null || this.filterType == '') {
            toastr.error("Please select Type...!");
            return;
        }
        if (this.filterType == 'Regular') {
            this.filterTypeCode = '';
            this.filterTypeName = '';
        }
        this.errMsg = "";
        this.isLoading = true;
        let searchTerm = this.filterLocation + ',' + this.filterPayGroup + ',' + this.calYear + ',' + this.filterType + ',' + this.filterTypeCode;
        this.httpService.LAgetByParam(APIURLS.GET_HOLIDAYS_LIST, searchTerm).then((data: any) => {
            if (data.length > 0) {
                this.HolidaysMasterList = data.filter((x:any)  => x.isActive == true).sort((a:any, b:any) => {
                    if (a.date > b.date) return 1;
                    if (a.date < b.date) return -1;
                    return 0;
                });
            }
            else {
                this.isLoading = false;
                swal({
                    title: "Error",
                    text: "No Holidays have been made for above filters...!",
                    icon: "error",
                    timer: 7000,
                });
                this.HolidaysMasterList = [];
            }
            this.reInitDatatable();
            this.isLoading = false;
        }).catch((error)=> {
            this.isLoading = false;
            this.HolidaysMasterList = [];
        });
    }

    getTypeName(code:any) {
        let temp = this.AdditionalTypesList.find((x:any)  => x.typeCode == code);
        return temp ? this.filterTypeName = temp.typeName : '';
    }
    TypecodeList: any[] = [];
    getTypeCodeList() {
        this.errMsg = "";
        this.isLoading = true;
        // this.HolidaysMasterList = [];
        let searchTerm = this.filterLocation + ',' + this.filterPayGroup + ',' + this.calYear + ',' + this.filterType + ',' + this.filterTypeCode + ',' + this.filterTypeName;
        this.httpService.LAget(APIURLS.GET_ALL_TYPE_CODES_LIST).then((data: any) => {
            if (data) {
                this.TypecodeList = data
            }
        }).catch((error)=> {
            this.isLoading = false;
            this.HolidaysMasterList = [];
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
                this.filterPayGroup = this.PayGroupList.find((x:any)  => x.short_desc == this.currentUser.division).id;
                //this.filterLocation = this.currentUser.baselocation.toString();
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


    onAddHolidaysMaster(isEdit: boolean, data: HolidayMaster) {
        this.desigForm.form.markAsPristine();
        this.desigForm.form.markAsUntouched();
        this.desigForm.form.updateValueAndValidity();

        this.notFirst = true;
        this.isEdit = isEdit;
        this.errMsgPop = "";
        this.isLoadingPop = true;
        this.HolidaysMaster = new HolidayMaster();
        this.aduitpurpose = '';
        this.dynamicArray = [];
        this.oldHolidaysMaster = new HolidayMaster();
        if (this.isEdit) {
            Object.assign(this.oldHolidaysMaster, data);
            this.HolidaysMaster = Object.assign({}, data);
            let holiday = this.HolidaysMasterList.filter((x:any)  => x.location == this.HolidaysMaster.location && x.year == this.HolidaysMaster.year);
            let index = 0;
            holiday.forEach((element:any)=> {

                // let newDynamic = { id: this.rowcount, location: null, paygroup: null, type: null, typecode: null, typename: null, day: "", date: null, occasion: "" };
             let newDynamic: {
  id: number;
  location: string | null;
  paygroup: string | null;
  type: string | null;
  typecode: string | null;
  typename: string | null;
  day: string;
  date: string | null;
  occasion: string;
} = {
  id: this.rowcount,
  location: null,
  paygroup: null,
  type: null,
  typecode: null,
  typename: null,
  day: "",
  date: null,
  occasion: ""
};

                newDynamic.id = element.id;
                newDynamic.location = this.filterLocation;
                newDynamic.paygroup = this.filterPayGroup;
                newDynamic.type = this.filterType;
                newDynamic.typecode = this.filterTypeCode;
                newDynamic.typename = this.filterTypeName;
                newDynamic.date = element.date;
                newDynamic.day = element.dayName;
                newDynamic.occasion = element.holidayName
                this.dynamicArray.push(newDynamic);
            });
        }
        else {
            this.HolidaysMaster = new HolidayMaster();
            this.newDynamic = { id: this.rowcount, location: null, day: "", date: null, occasion: "", stored: "0" };
            this.dynamicArray.push(this.newDynamic);
        }
        this.isLoadingPop = false;
        jQuery("#myModal").modal('show');
    }

    onSaveHoliday() {
        this.errMsg = "";
        this.errMsgPop = "";

        if (this.dynamicArray.length < 10) {
            swal({
                title: 'Message',
                text: 'Holidays should have 10 days',
                icon: 'warning',
                dangerMode: false,
                buttons: [false, true],
            });
            return;
        }
        let connection: any;
        if (!this.isEdit) {

            this.auditType = "Create";
            if (this.Location == null) {
                toastr.error("Please select Plant...!");
                return;
            }
            else if (this.PayGroup == null) {
                toastr.error("Please select PayGroup...!");
                return;
            }
            else if (this.Type == null || this.Type == '') {
                toastr.error("Please select Type...!");
                return;
            }
            if (this.Type == 'Additional' && (this.TypeCode == '' || this.TypeName == '')) {
                toastr.error("Please Enter TypeCode/TypeName...!");
                return;
            }
            if (this.dynamicArray.length > 10) {
                swal({
                    title: 'Message',
                    text: 'Holidays cannot be more than 10 days',
                    icon: 'error',
                    dangerMode: false,
                    buttons: [false, true],
                });
                return;
            }
            else {

                this.dynamicArray.forEach((element:any)=> {

                    let Holiday = {} as HolidayMaster;

                    Holiday.date = this.getDateFormate(element.date);
                    Holiday.holidayDate = this.getDateFormate(element.date);
                    Holiday.isActive = true;
                    Holiday.createdBy = this.currentUser.employeeId;
                    Holiday.createdOn = this.getDateFormate(new Date());
                    Holiday.dayName = element.day;
                    Holiday.holidayName = element.occasion;
                    Holiday.location = +this.Location;
                    Holiday.payGroup = +this.PayGroup;
                    Holiday.type = this.Type;
                    Holiday.typeCode = this.TypeCode;
                    Holiday.typeName = this.TypeName;
                    Holiday.year = this.getYear(element.date);
                    Holiday.auditType = this.auditType;
                    this.holidayList.push(Holiday);

                });
                connection = this.httpService.LApost(APIURLS.BR_HOLIDAY_LIST_CREATE, this.holidayList);
            }
        }
        else {
            if (this.dynamicArray.length > 10) {
                swal({
                    title: "Message",
                    text: "Holidays cannot be more than 10 Days..!",
                    icon: "error",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.isLoadingPop = false;
            }
            else {
                this.auditType = "Update";
                this.HolidaysMaster.modifiedBy = this.currentUser.employeeId;
                this.HolidaysMaster.modifiedOn = this.getDateFormate(new Date());
                this.dynamicArray.forEach((element:any) => {
                    let Holiday = {} as HolidayMaster;
                    let temp = this.HolidaysMasterList.find((x:any)  => x.id == element.id);
                    if (temp) {
                        Holiday.id = element.id;
                    }
                    else {
                        Holiday.id = 0;
                    }
                    Holiday.date = this.setFormatedDate(element.date);
                    Holiday.holidayDate = this.setFormatedDate(element.date);
                    Holiday.isActive = true;
                    Holiday.modifiedBy = this.currentUser.employeeId;
                    Holiday.modifiedOn = this.setFormatedDate(new Date());
                    Holiday.dayName = element.day;
                    Holiday.location = +this.filterLocation;
                    Holiday.payGroup = +this.filterPayGroup;
                    Holiday.type = this.filterType;
                    Holiday.typeCode = this.filterTypeCode;
                    Holiday.typeName = this.filterTypeName;
                    Holiday.holidayName = element.occasion;
                    Holiday.year = this.getYear(element.date);
                    connection = this.httpService.LAput(APIURLS.BR_HOLIDAY_LIST_UPDATE, Holiday.id, Holiday);
                });
            }
        }
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data.length == null) {
                jQuery("#myModal").modal('hide');
                swal({
                    title: "Message",
                    text: "Holidays Saved Successfully..!",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.filterTypeCode = '';
                this.filterTypeName = '';
                this.filterType = 'Regular';
                this.Location = '';
                this.PayGroup = '';
                this.Type = '';
                this.TypeCode = '';
                this.TypeName = '';
                this.clearFilter;
            }
            if (data.errorType == 'E') {
                swal({
                    title: "Message",
                    text: data.message,
                    icon: "error",
                    dangerMode: false,
                    buttons: [false, true]
                });
                this.filterTypeCode = '';
                this.filterTypeName = '';
                this.filterType = 'Regular';
                this.clearFilter;
            }

        }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving holiday data..';
        });
    }


    getDateFormate(date: any): string {
        let d1 = new Date(date);
        return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d1.getDate()).slice(-2) + ' ' +
            ("00" + d1.getHours()).slice(-2) + ":" +
            ("00" + d1.getMinutes()).slice(-2) + ":" +
            ("00" + d1.getSeconds()).slice(-2);
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

    deleteHoliday(data: HolidayMaster): void {
        let d1 = new Date(data.date);
        let holidayDate = this.setFormatedDate(d1);
        let currentDate = this.setFormatedDate(new Date());
        if (holidayDate < currentDate) {
            this.isLoading = false;
            swal({
                title: "Message",
                text: "Past Holiday cannot be deleted..!",
                icon: "error",
                timer: 7000,
            });
            this.getHolidayMasterList();
            return;
        }
        else {
            this.HolidaysMaster = new HolidayMaster();
            this.aduitpurpose = '';
            this.oldHolidaysMaster = new HolidayMaster();
            swal({
                title: "Are you sure to delete?",
                icon: "warning",
                dangerMode: true,
                buttons: [true, true],
            }).then((willdelete) => {
                if (willdelete) {
                    Object.assign(this.HolidaysMaster, data);
                    let connection: any;
                    this.auditType = "Delete";
                    this.HolidaysMaster.isActive = false;
                    this.HolidaysMaster.modifiedBy = this.currentUser.employeeId;
                    this.HolidaysMaster.modifiedOn = this.getDateFormate(new Date());
                    connection = this.httpService.LAput(APIURLS.BR_HOLIDAY_LIST_DELETE, this.HolidaysMaster.id, this.HolidaysMaster);
                    connection.then((data: any) => {
                        this.isLoadingPop = false;
                        if (data == 200 || data.id > 0) {
                            swal({
                                title: "Message",
                                text: "Holiday Deleted successfully",
                                icon: "success",
                                timer: 4000,
                                dangerMode: false,
                            });
                            this.getHolidayMasterList();
                        }
                    }).catch((error) => {
                        this.isLoadingPop = false;
                        this.errMsgPop = 'Error deleting holiday..';
                    });
                }
            });
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
  //const authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
const authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');


  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}

    getDayName(per:any) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date(per.date);
        var dayName = days[d.getDay()];
        per.day = dayName;
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
        if (this.HolidaysMasterList.length < 0) {
            toastr.error("Pease filter some data...");
            return;
        }
        this.exportList = [];
        let index = 0;
        this.HolidaysMasterList.forEach((item :any) => {
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
                    "Day Name": item.dayName,
                    "Occasion": item.holidayName,
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
                    "Day Name": item.dayName,
                    "Occasion": item.holidayName,
                    "Type": item.type,
                    "Type Code": item.typeCode,
                    "Type Name": item.typeName,
                }
                this.exportList.push(exportItemAH);
            }
        });

        this.excelService.exportAsExcelFile(this.exportList, 'Holiday_List');
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
