import { Component, OnInit } from '@angular/core';
// import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
//import { Chart } from 'chart.js';
//import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import * as _ from "lodash";
import { AuthData } from '../auth/auth.model';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Router } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { MOMENT } from 'angular-calendar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExcelService } from '../shared/excel-service';
declare var $: any;
import swal from 'sweetalert';
import moment from 'moment'
//import { debug } from 'util';
import { GenericGateEntryM } from '../gateentry/genericgateentrym.model';


@Component({
    selector: 'app-GEDashboard',
    templateUrl: './GEDashboard.component.html',
    styleUrls: ['./GEDashboard.component.css']
})
export class GEDashboardComponent implements OnInit {
    newVisitorsMonth: any;
    todayDate = new Date();
    today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
    chart1: any;
    errMsg: string
    location: any;
    usrid!: number;
    path: string
    employeeId: any;
    locationList: any[] = [[]];
    errMsgPop = '';
    public tableWidget:any;
   public tableWidget1:any;
    chart: any;
    myDate = new Date();
    todaysvisitorsList: any = [];
    from_date: any;
    to_date: any;
    //today report filter
    fromDate = '';
    toDate = '';
    empData!: AuthData;
    DashboardData: any;;
    datas: any = [];
    misseddatas: any[] = [];
    STOdatas: any[] = [];
    SCdatas: any[] = [];
    Retdatas: any[] = [];

    label: any[] = [];
    dayOfWeek: any[] = [
        { id: 0, name: 'Sun' },
        { id: 1, name: 'Mon' },
        { id: 2, name: 'Tue' },
        { id: 3, name: 'Wed' },
        { id: 4, name: 'Thu' },
        { id: 5, name: 'Fri' },
        { id: 6, name: 'Sat' },
    ]
    isLoading!: boolean;

    GEWithPOCount: any = 0;
    GEWithoutPOCount: any = 0;
    GateInwardSTOCount: any = 0;
    GISubContractCount: any = 0;
    GTReturnableCount: any = 0
    inwardcount: any = 0;
    outwardcount: any = 0;
    totRetCount: any = 0;
    totNonRetCount: any = 0;
    STOdatasout: any = [];
    SCdatasOUT: any[] = [];
    RetOutdata: any[] = [];
    NonRetData: any[] = [];
    Sales: any[] = [];

   // public chartPlugins = [ChartDataLabels];
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, 
        private http: HttpClient,private excelService: ExcelService) {

    }

    ngAfterViewInit() {
        this.initDatatable();
    }



    ngOnInit() {
        this.path = this.router.url;
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        if (chkaccess == true) {
            //let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            this.usrid = authData.uid;
            this.employeeId = authData.userName;
            this.empData = authData;
            let d = new Date();
            this.label.push(this.dayOfWeek[d.getDay()].name);
            for (let i = 1; i < 7; i++) {
                d.setDate(d.getDate() - 1);
                this.label.push(this.dayOfWeek[d.getDay()].name);
            }
            this.label.reverse();
            this.getLocationList();
            this.filterReport();
            this.getPlantsassigned(authData.fkEmpId);
            this.getGateList(authData.baselocation);
            this.getpayGroupList();
        }
        else
            this.router.navigate(["/unauthorized"]);
    }



    bookAppointment(ch:any) {
        localStorage.setItem('categoryVMS', ch);
        this.router.navigateByUrl("/visitorentry");
    }
    locationGateList = [];
    selGateLocation: any;
    getGateList(id:any) {
      this.isLoading = true;
      this.httpService.getById(APIURLS.BR_MASTER_LOCATIONGATE_MASTER_ANY_API, id).then((data: any) => {
        if (data.length > 0) {
          this.locationGateList = data;
          this.selGateLocation = this.locationGateList.find((x:any)  => x.gateNo == '1');
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.locationGateList = [];
      });
    }

    payGroupList: any[] = [];
    getpayGroupList() {
      this.errMsg = "";
      this.get("PayGroupMaster/GetAll").then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => {
            if (a.short_desc > b.short_desc) return 1;
            if (a.short_desc < b.short_desc) return -1;
            return 0;
          });
        }
      }).catch((error)=> {
        this.isLoading = false;
        this.payGroupList = [];
      });
    }
    get(apiKey: string): any {
        const promise = new Promise((resolve, reject) => {
          this.http.get(APIURLS.BR_BASE_HR_URL + apiKey, this.getHeader())
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
    getFormatedDate(d:any) {
        let fd = new Date(d);
        let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
            ("00" + fd.getDate()).slice(-2);
        return formateddate;
    }

    plantAssignedList: any[] = [];
    getPlantsassigned(id:any) {
      this.isLoading = true;
      this.httpService.getById(APIURLS.BR_MASTER_USER_PLANT_MAINT_API_ANY, id).then((data: any) => {
        if (data) {
          this.plantAssignedList = data;
          let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          this.plantAssignedList.sort((a:any, b:any) => { return collator.compare(a.code, b.code) });
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.plantAssignedList = [];
      });
    }
    plant:string;
    filterReport() {
        // debugger;
        let td = new Date();
        let formatedFROMdate: string
        let formatedTOdate: string
        if (this.from_date == '' || this.from_date == null) {
            formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
            this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
        }
        else {
            let fd = new Date(this.from_date);
            formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1 - 4)).slice(-2) + "-" +
                ("00" + fd.getDate()).slice(-2);
            this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

        }

        if (this.to_date == '' || this.to_date == null) {
            formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
                ("00" + td.getDate()).slice(-2);
            this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2));
        }
        else {
            let ed = new Date(this.to_date);
            formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
                ("00" + ed.getDate()).slice(-2);
            this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2));

        }

        let filtermodel: any = {};
        filtermodel.fromdate = this.getFormatedDate(this.from_date);
        filtermodel.todate = this.getFormatedDate(this.to_date);
        filtermodel.planT_ID = this.plant;

        this.httpService.post(APIURLS.GET_GATE_ENTRY_DASHBOARD_DATA, filtermodel).then((data: any) => {
            if (data) {
                this.DashboardData = data;
                this.totalVisits();
            }
            else {
                swal({
                    title: "Message",
                    text: "No data found.",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                }).then((willDelete) => {
                    if (willDelete) {
                        this.isLoading = false;
                    }
                });
            }
            this.isLoading = false;
            this.reInitDatatable();

        }).catch((error)=> {
            this.isLoading = false;
        });

    }

    private initDatatable(): void {
        $('#userTable tfoot th').each(function () {
            var title = $('#userTable thead th').eq($(this).index()).text();
            if (title != "Sl. No")
                $(this).html('<input type="text" class="form-control" placeholder="Search" style="width:100%"/>');
        });
        var table = $('#userTable').DataTable();
        this.tableWidget = table;
        $("#userTable tfoot input").on('keyup change', function () {
            table
                .column($(this).parent().index() + ':visible')
                .search(this.value)
                .draw();
        });
    }

    private reInitDatatable(): void {
        // debugger;
        if (this.tableWidget) {
            this.tableWidget.clear();
            this.tableWidget.destroy();
            this.tableWidget = null;
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    getLocationName(id:any) {
        let temp = this.locationList.find((s:any) => s.id == id);
        return temp ? temp.name : '';
    }

    getLocationList() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            // this.isLoading = false;
            if (data.length > 0) {
                this.locationList = data;
            }

        }).catch((error)=> {
            // this.isLoading = false;
            this.locationList = [];
        });
    }

    totalVisits() {
        this.GEWithPOCount = 0;
        this.GEWithoutPOCount = 0;
        this.GateInwardSTOCount = 0;
        this.GISubContractCount = 0;
        this.GTReturnableCount = 0;
        this.inwardcount = 0;
        this.outwardcount = 0;
        this.totRetCount = 0;
        this.totNonRetCount = 0;
        var todaydate = new Date();
        var temp = new Date();
        this.datas = [];
        this.todaysvisitorsList = [];
        var month = temp.getMonth(); // January
        var dt = new Date(temp.getFullYear(), month + 1, 0);
        let formatedtodaydate: string = this.getFormatedDate(todaydate);

        this.inwardcount = this.DashboardData.inwardCount;
        this.outwardcount = this.DashboardData.outwardCount;
        this.totRetCount = this.DashboardData.retOutwardCount;
        this.totNonRetCount = this.DashboardData.nonReturnableCount;
        this.GEWithPOCount = this.DashboardData.withPOCount;
        this.GEWithoutPOCount = this.DashboardData.withoutPOCount;
        this.GateInwardSTOCount = this.DashboardData.stoInwardCount;
        this.GISubContractCount = this.DashboardData.subContractingInwardCount;
        this.GTReturnableCount = this.DashboardData.retInwardCount;
        let Models = this.DashboardData.models
        let withPOList = Models.filter((x:any)  => x.type == 'WithPO');
        if (withPOList.length > 0) {
            for (let i = 0; i <= withPOList.length; i++) {

                this.datas.push(withPOList[i] ? withPOList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.datas.reverse();
        }
        else {
            this.datas = [0, 0, 0, 0, 0, 0, 0];
        }
        let withoutPOList = Models.filter((x:any)  => x.type == 'WithoutPO');
        if (withoutPOList.length > 0) {
            for (let i = 0; i <= withoutPOList.length; i++) {

                this.misseddatas.push(withoutPOList[i] ? withoutPOList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.misseddatas.reverse();
        }
        else {
            this.misseddatas = [0, 0, 0, 0, 0, 0, 0];
        }

        let retlist = Models.filter((x:any)  => x.type == 'ReturnableInward');
        if (retlist.length > 0) {
            for (let i = 0; i <= retlist.length; i++) {

                this.Retdatas.push(retlist[i] ? retlist[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.Retdatas.reverse();
        }
        else {
            this.Retdatas = [0, 0, 0, 0, 0, 0, 0];
        }
        let SCList = Models.filter((x:any)  => x.type == 'SubContractingInward');
        if (SCList.length > 0) {
            for (let i = 0; i <= SCList.length; i++) {

                this.SCdatas.push(SCList[i] ? SCList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.SCdatas.reverse();
        }
        else {
            this.SCdatas = [0, 0, 0, 0, 0, 0, 0];
        }
        let STOoutList = Models.filter((x:any)  => x.type == 'STO');
        if (STOoutList.length > 0) {
            for (let i = 0; i <= STOoutList.length; i++) {

                this.STOdatasout.push(STOoutList[i] ? STOoutList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.STOdatasout.reverse();
        }
        else {
            this.STOdatasout = [0, 0, 0, 0, 0, 0, 0];
        }

        let SCOutList = Models.filter((x:any)  => x.type == 'SubContractingOutward');
        if (SCOutList.length > 0) {
            for (let i = 0; i <= SCOutList.length; i++) {

                this.SCdatasOUT.push(SCOutList[i] ? SCOutList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.SCdatasOUT.reverse();
        }
        else {
            this.SCdatasOUT = [0, 0, 0, 0, 0, 0, 0];
        }

        let RetOutList = Models.filter((x:any)  => x.type == 'Returnable');
        if (RetOutList.length > 0) {
            for (let i = 0; i <= RetOutList.length; i++) {

                this.RetOutdata.push(RetOutList[i] ? RetOutList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.RetOutdata.reverse();
        }
        else {
            this.RetOutdata = [0, 0, 0, 0, 0, 0, 0];
        }
        let NonRetList = Models.filter((x:any)  => x.type == 'NonReturnable');
        if (NonRetList.length > 0) {
            for (let i = 0; i <= NonRetList.length; i++) {

                this.NonRetData.push(NonRetList[i] ? NonRetList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.NonRetData.reverse();
        }
        else {
            this.NonRetData = [0, 0, 0, 0, 0, 0, 0];
        }
        let SaleList = Models.filter((x:any)  => x.type == 'Sales');
        if (SaleList.length > 0) {
            for (let i = 0; i <= SaleList.length; i++) {

                this.Sales.push(SaleList[i] ? SaleList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.Sales.reverse();
        }
        else {
            this.Sales = [0, 0, 0, 0, 0, 0, 0];
        }
        let STOList = Models.filter((x:any)  => x.type == 'STOInward');
        if (STOList.length > 0) {
            for (let i = 0; i <= STOList.length; i++) {

                this.STOdatas.push(STOList[i] ? STOList[i].count : 0);
                temp.setDate(temp.getDate() - 1);
            }
            this.STOdatas.reverse();
        }
        else {
            this.STOdatas = [0, 0, 0, 0, 0, 0, 0];
        }

        // this.chart = new Chart('mixed-out-chart', {
        //     plugin: this.chartPlugins,
        //     type: 'line',
        //     data: {
        //         labels: this.label,
        //         datasets: [{
        //             label: "STO",
        //             type: "line",
        //             borderColor: "#8e5ea2",
        //             data: this.STOdatasout,
        //             fill: false
        //         }, {
        //             label: "Sub Contracting",
        //             type: "line",
        //             borderColor: "#3e95cd",
        //             data: this.SCdatasOUT,
        //             fill: false
        //         },
        //         {
        //             label: "Sales",
        //             type: "line",
        //             borderColor: "#E4D482",
        //             data: this.Sales,
        //             fill: false
        //         },
        //         {
        //             label: "Returnable",
        //             type: "line",
        //             borderColor: "#FF33B2",
        //             data: this.RetOutdata,
        //             fill: false
        //         },
        //         {
        //             label: "Non Returnable",
        //             type: "line",
        //             borderColor: "#FF5733",
        //             data: this.NonRetData,
        //             fill: false
        //         },
        //         ]
        //     },
        //     options: {
        //         title: {
        //             display: true,
        //             text: 'Gate Entry Outward Summary(Last 7 days)'
        //         },
        //         scales: {
        //             yAxes: [{
        //                 ticks: {
        //                     beginAtZero: true,
        //                     callback: function (value:any) { if (Number.isInteger(value)) { return value; } }
        //                     //stepSize: 1
        //                 },
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: 'Count'
        //                 }
        //             }]
        //         },
        //         legend: {
        //             position: 'bottom',
        //             // labels: {
        //             //   padding: 20,
        //             //   boxWidth: 10
        //             // }
        //             onClick: (e) => e.stopPropagation()
        //         },
        //         plugins: {
        //             datalabels: {
        //                 color: 'black',
        //                 font: {
        //                     size: 12,
        //                     weight: 600
        //                 },
        //                 offset: 4,
        //                 padding: 0,
        //                 // formatter: function(value) {
        //                 //   return value;
        //                 // }
        //             }
        //         }
        //     }
        // });

        // this.chart = new Chart(document.getElementById("mixed-chart"), {
        //     plugin: this.chartPlugins,
        //     type: 'line',
        //     data: {
        //         labels: this.label,
        //         datasets: [{
        //             label: "With PO",
        //             type: "line",
        //             borderColor: "#8e5ea2",
        //             data: this.datas,
        //             fill: false
        //         }, {
        //             label: "Without PO",
        //             type: "line",
        //             borderColor: "#3e95cd",
        //             data: this.misseddatas,
        //             fill: false
        //         },
        //         {
        //             label: "STO",
        //             type: "line",
        //             borderColor: "#E4D482",
        //             data: this.STOdatas,
        //             fill: false
        //         },
        //         {
        //             label: "Sub Contracting",
        //             type: "line",
        //             borderColor: "#FF33B2",
        //             data: this.SCdatas,
        //             fill: false
        //         },
        //         {
        //             label: "Returnable",
        //             type: "line",
        //             borderColor: "#FF5733",
        //             data: this.Retdatas,
        //             fill: false
        //         },
        //         ]
        //     },
        //     options: {
        //         title: {
        //             display: true,
        //             text: 'Gate Entry Inward Summary(Last 7 days)'
        //         },
        //         scales: {
        //             yAxes: [{
        //                 ticks: {
        //                     beginAtZero: true,
        //                     callback: function (value:any) { if (Number.isInteger(value)) { return value; } }
        //                     //stepSize: 1
        //                 },
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: 'Count'
        //                 }
        //             }]
        //         },
        //         legend: {
        //             position: 'bottom',
        //             // labels: {
        //             //   padding: 20,
        //             //   boxWidth: 10
        //             // }
        //             onClick: (e) => e.stopPropagation()
        //         },
        //         plugins: {
        //             datalabels: {
        //                 color: 'black',
        //                 font: {
        //                     size: 12,
        //                     weight: 600
        //                 },
        //                 offset: 4,
        //                 padding: 0,
        //                 // formatter: function(value) {
        //                 //   return value;
        //                 // }
        //             }
        //         }
        //     }
        // });


        //PIE Chart
        let pieData = [];
        let labels1 = [];
        let bckColor = [];
        let lab = "";
        if (this.GEWithPOCount != 0 || this.GEWithoutPOCount != 0) {
            pieData = [this.GEWithPOCount, this.GEWithoutPOCount, this.GateInwardSTOCount, this.GISubContractCount, this.GTReturnableCount];
            labels1 = ["Gate Entry WithPO", "Gate Entry WithoutPO", "STO Inward", "Sub-Contracting Inward", "Returnable Material"];
            bckColor = ["#3e95cd", "#d9534f", "#FF5733", "#33FF55", "#FF33B2", "#E4D482 "];
            lab = "Inward Entries."
        }
        else {
            pieData = [100];
            labels1 = ["No Entries"]
            bckColor = ["#cccccc"]
        }
        let displayFlag = (this.GEWithPOCount != 0 || this.GEWithoutPOCount != 0) ? true : false;
        // let displayFlag = true;
        // this.chart = new Chart(document.getElementById("inwardPieChart"), {
        //     plugin: this.chartPlugins,
        //     type: 'pie',
        //     data: {
        //         labels: labels1,
        //         datasets: [
        //             {
        //                 label: lab,
        //                 backgroundColor: bckColor,
        //                 data: pieData
        //             }
        //         ]
        //     },
        //     options: {
        //         maintainAspectRatio: true,
        //         responsive: true,
        //         legend: {
        //             position: 'right',
        //             labels: {
        //                 padding: 20,
        //                 boxWidth: 10
        //             },
        //             onClick: (e) => e.stopPropagation()
        //         },
        //         plugins: {
        //             datalabels: {
        //                 color: 'white',
        //                 font: {
        //                     size: 15,
        //                     weight: 600
        //                 },
        //                 offset: 4,
        //                 padding: 0,
        //             }
        //         },
        //         title: {
        //             display: true,
        //             text: 'Gate Entry Inward Status'
        //         }
        //     }
        // });

        let pieData1 = [];
        let labels12 = [];
        let bckColor1 = [];
        let lab1 = "";
        if (this.GEWithPOCount != 0 || this.GEWithoutPOCount != 0) {
            pieData1 = [this.DashboardData.stoCount, this.DashboardData.subContractingOutwardCount, this.DashboardData.salesCount,
            this.DashboardData.retOutwardCount, this.DashboardData.nonReturnableCount, this.DashboardData.returnableDueCount ? this.DashboardData.returnableDueCount : 0];
            labels12 = ["STO Outward", "Sub Contracting Outward", "Sales Outward", "Returnable Outward", "Non Returnable Outward", "Returnable Overdue"];
            bckColor1 = ["#3e95cd", "#d9534f", "#FF5733", "#33FF55", "#FF33B2", "#E4D482", "#084D2F"];
            lab1 = "Outward Entries."
        }
        else {
            pieData1 = [100];
            labels12 = ["No Entries"]
            bckColor1 = ["#cccccc"]
        }
        let displayFlag1 = (this.GEWithPOCount != 0 || this.GEWithoutPOCount != 0) ? true : false;
        // let displayFlag = true;
        // this.chart = new Chart(document.getElementById("outwardPieChart"), {
        //     plugin: this.chartPlugins,
        //     type: 'pie',
        //     data: {
        //         labels: labels12,
        //         datasets: [
        //             {
        //                 label: lab1,
        //                 backgroundColor: bckColor1,
        //                 data: pieData1
        //             }
        //         ]
        //     },
        //     options: {
        //         maintainAspectRatio: true,
        //         responsive: true,
        //         legend: {
        //             position: 'right',
        //             labels: {
        //                 padding: 20,
        //                 boxWidth: 10
        //             },
        //             onClick: (e) => e.stopPropagation()
        //         },
        //         plugins: {
        //             datalabels: {
        //                 color: 'white',
        //                 font: {
        //                     size: 15,
        //                     weight: 600
        //                 },
        //                 offset: 4,
        //                 padding: 0,
        //             }
        //         },
        //         title: {
        //             display: true,
        //             text: 'Gate Entry Outward Status'
        //         }
        //     }
        // });



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
    getTimeFormat(time:any) {
        return moment('1970-01-01 ' + time);
    }


    AMCEntry(id:any) {
        let route = 'amc-entry/' + id;
        this.router.navigate([route]);
    }

}
