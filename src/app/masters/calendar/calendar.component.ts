import { Calendar } from './calendar.model';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Company } from './../../company/company.model';
declare var jQuery: any;
import * as _ from "lodash";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
   @ViewChild(NgForm, { static: false }) calendarForm: NgForm;

    public tableWidget: any;
    selMonth: any;
    companyId:  number;
    calendarList: any[]=[[]];
    companyItem: any;
    calendarItem: Calendar = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
    isLoading: boolean = false;
    entityTabHeader: string;
    errMsg: string = "";
    startDate: string;
    endDate: string;
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    calSelMonth: any;
    calSelFiscalYear: any;
    path: string ='';

    fillFiscalYear: any[] = [
        { name: '2019-2020' },
        { name: '2020-2021' },
        { name: '2021-2022' },
        { name: '2022-2023' },
        { name: '2023-2024' },
        { name: '2024-2025' },
        { name: '2025-2026' },
        { name: '2026-2027' }
    ];
    fullMonths: any[] = [
        {id:1, name:'January'}, 
        {id:2, name:'February'},
        {id:3, name:'March'},
        {id:4, name:'April'},
        {id:5, name:'May'},
        {id:6, name:'June'},
        {id:7, name:'July'},
        {id:8, name:'August'},
        {id:9, name:'September'},
        {id:10, name:'October'},
        {id:11, name:'November'},
        {id:12, name:'December'}
    ];
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#calendarTable');
        this.tableWidget = exampleId.DataTable({
            "order": []
        });
        this.isLoading=false;

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
        if(chkaccess == true){
          ////// console.log(chkaccess);
          this.getCalendarMasterList();
        }
        else 
          this.router.navigate(["/unauthorized"]);

      }

    ngAfterViewInit() {
        this.initDatatable();
    }

    onAddCalendar(isEdit: boolean, data: Calendar) {
        this.calendarForm.form.markAsPristine();
        this.calendarForm.form.markAsUntouched();
        this.calendarForm.form.updateValueAndValidity();

        this.isEdit = isEdit;
        this.errMsgPop = "";
        this.isLoadingPop = false;
        
        if (this.isEdit) {
            this.calendarItem = data;
            this.calSelMonth = this.fullMonths.find(s => s.id == this.calendarItem.month);
            this.calSelFiscalYear = this.fillFiscalYear.find(s => s.name === this.calendarItem.fiscalYear);
            this.startDate = this.calendarItem.startDate; 
            this.endDate = this.calendarItem.endDate;
        }
        else {
            this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
            this.calendarItem.fkCompanyId = 'Micro Labs';
            // this.calendarItem.period == 0 ? '' : this.calendarItem.period;
            // this.calendarItem.period == null ? '' : this.calendarItem.period;
            // if(this.calendarItem.period <= 0 || this.calendarItem.period == null)
            this.calendarItem.period = 2;
            this.calSelFiscalYear = null;
            this.calSelMonth = null;
            this.selMonth = null;
            this.startDate = null;
            this.endDate = null;
        }
       
        jQuery("#myModal").modal('show');
    }

    getCalendarMasterList() {
       this.httpService.get(APIURLS.BR_MASTER_CALENDAR_API).then((data: any) => {
            this.isLoading = true;
            if (data.length >0) {
              this.calendarList = data;
              for(let cal of this.calendarList) {
                    this.httpService.getById(APIURLS.BR_MASTER_COMPANY_API_ID, +cal.fkCompanyId).then((datacomp: any) => {
                    this.companyItem = datacomp;
                    
                    // for(let calend of this.fullMonths){
                    //     if(calend.id == cal.month){
                    //         this.calendarList.find(item => +item.month === calend.id)['month'] = calend.name;
                    //     }
                    // }
                    this.calendarList.find(item => item.fkCompanyId === this.companyItem.id)['fkCompanyId'] = this.companyItem.name;
                });}
              this.reInitDatatable();
            }
          }).catch(error => {
            this.isLoading = false;
            this.calendarList = [];
          });
    }

    getMonthName(id: number){
        let temp: any;
        temp = this.fullMonths.find(item => item.id == id);
        var name = (typeof temp != 'undefined')? temp.name : '';
        return name;
    }

    onSaveCalendar(status: boolean) {
        this.errMsg = "";
        //this.errMsgPop = "";
        
        let year1 = this.calSelFiscalYear.name.substr(0,4);
        let year2 = this.calSelFiscalYear.name.substr(5,4);
        ////// console.log(year1 + ' - '+year2);
        let startDateYear = new Date("1/1/" + year1);
        let endDateYear = new Date("12/31/" + year2);
        
        if ((this.startDate == undefined || this.startDate == null || this.startDate.toString() == "")) {
            this.errMsgPop = "Select Proper start Date";
        }
        else if ((this.endDate == undefined || this.endDate == null || this.endDate.toString() == "")) {
            this.errMsgPop = "Select Proper End Date";
        }
        else if (this.errMsgPop == "Enter valid Start Date" || this.errMsgPop == "Enter valid End Date") {
            this.errMsgPop = "Enter valid Date";
        }
        else if ((new Date(this.startDate)) >= (new Date(this.endDate))){
            this.errMsgPop = "Start Date greater than End Date. Please select proper Date";
        }
        else if(new Date(this.startDate) < startDateYear || new Date(this.endDate) > endDateYear ){
            this.errMsgPop = "Start Date and End Date fall outside year range selected. Please select proper Date";
        }
        else {
			this.errMsgPop = "";
            this.isLoadingPop = true;
            this.calendarItem.startDate = this.startDate;
            this.calendarItem.endDate = this.endDate;
            this.calendarItem.year = +this.calSelFiscalYear.name.substr(0, 4);
            this.calendarItem.fkCompanyId = '1';
            this.calendarItem.month = this.calSelMonth.id;
            this.calendarItem.fiscalYear = this.calSelFiscalYear.name;
            let connection: any;
            if(!this.calendarList.some(s => s.fiscalYear === this.calendarItem.fiscalYear && s.id != this.calendarItem.id)){
            if (!this.isEdit) 
                    connection = this.httpService.post(APIURLS.BR_MASTER_CALENDAR_INSERT_API, this.calendarItem);
            else 
                connection = this.httpService.put(APIURLS.BR_MASTER_CALENDAR_INSERT_API, this.calendarItem.id, this.calendarItem);
            
            connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200 || data.id > 0) {
                    jQuery("#myModal").modal('hide');
                    this.errMsgPop1 = 'Calendar data saved successfully!';
                    jQuery("#saveModal").modal('show');
                    this.getCalendarMasterList();
                }
            }).catch(error => {
                this.isLoadingPop = false;
                this.errMsgPop = 'Error saving calendar data..';
            });
            }
            else{
                    this.isLoadingPop = false;
                    this.errMsgPop = 'Entries selected already exists..';
            }
        }
    }

    closeSaveModal() {
        ////// console.log('testpop')
        jQuery("#saveModal").modal('hide');
        
        // window.location.reload();
      }
    getFiscalYears() {
        this.calendarItem.fiscalYear = "FY" + (new Date(this.startDate).getFullYear() - 1).toString().substr(-2) + "-" + (new Date(this.startDate).getFullYear()).toString().substr(-2);
    }

    setStartDate(startD: any) {
        this.errMsgPop = '';
        var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
        if ((date_regex.test(startD))) {
            this.startDate = startD;
            this.calendarItem.year = new Date(this.startDate).getFullYear();
        }
        else if (startD == "") {
            this.errMsgPop = 'Enter valid Start Date';
        }
    }

    setEndDate(endD: any) {
        this.errMsgPop = '';
        var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
        if ((date_regex.test(endD))) {
            this.endDate = endD;
        }
        else if (endD == "") {
            this.errMsgPop = 'Enter valid End Date';
        }
    }
}
