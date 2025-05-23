import { Component, OnInit } from '@angular/core';
// import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
import { Chart } from 'chart.js';
import { ChartDataLabels } from 'chartjs-plugin-datalabels';
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
import * as moment from 'moment';
//import { debug } from 'util';
import { Visitor } from '../visitorappointment/visitor.model';
import { AmcvisitDetails } from '../UpdateAMCDetails/AMCDetails.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: AuthData;
  newVisitorsMonth: any;
  todayDate = new Date();
  today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
  chart1: any;
  errMsg: string;
  EmployeeList1: any;
  location: any;
  usrid: number;
  path: string;
  employeeId: any;
  additionalVisitorItem: any[] = [[]];
  additionalVisitors: any[] = [[]]
  visitorTypeList: any[] = [[]];
  purposeList: any[] = [[]];
  locationList: any[] = [[]];
  errMsgPop = '';
  [x: string]: any;
  // calendarItem: Visitor = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, '', '', '');
  calendarItem: Visitor = {
    id: 0,
    isCancelled: true,
    isApproved: true,
    isPreShedualled: true,
    numberOfPerson: 0,
    modifiedBy: 0,
    isActive: true,
    fkVisitorType: 0,
    fkVisitorPurpose: 0
  } as Visitor;
  // [x: string]: any;
  public tableWidget;
  public tableWidget1;
  chart: any;
  visitorsList: any[] = [[]];
  totalnewvisits: number = 0;
  totalrevisits: number = 0;
  totalvisits: number = 0;
  singlevisits: number = 0;
  visitorsInside: any;
  myDate = new Date();
  todaysvisitorsList: any = [];
  roleId: number;
  from_date: any;
  to_date: any;
  //today report filter
  fromDate = '';
  toDate = '';
  visitorsList1: any = [];
  visitorsListAllCount = 0;
  private _albums = [];
  j = 1;
  empData: AuthData;
  pendingCheckouts = 0;
  visitorsFilteredList1: any[] = [];
  visitorsFilteredList: any[] = [];
  todayVisitorsFilteredList1: any[] = [];
  todayVisitorsFilteredList: any[] = [];
  datas: any = [];
  misseddatas: any[] = [];
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
  otherVisitorsTotal = 0;
  isLoading: boolean;
  checkedInCount: any = 0;
  todaysVisitorCount: any = 0;
  exportList: any[];
  newVisitors: any[] = [];
  pendingbook = 0;
  canceledBookings = 0;
  directcheckedInCount = 0;
  totaltodayvisits: any = 0;
  public chartPlugins = [ChartDataLabels];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private excelService: ExcelService) {
    // for (let i = 1; i <= 8; i++) {
    //   this.j = (this.j%3==0)?this.j++:this.j%3;
    //   const src = 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(10' + i + ').jpg';
    //   const caption = 'Image ' + i + ' caption here';
    //   const thumb = 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(10' + i + ').jpg';
    //   const album = {
    //      src: src,
    //      caption: caption,
    //      thumb: thumb
    //   };

    //   this._albums.push(album);
    //   this.j++;
    // }
  }

  //  open(index: number): void {
  // open lightbox
  // console.log(index);
  //   this._lightbox.open(this._albums, index);
  // }

  // close(): void {
  // close lightbox programmatically
  //   this._lightbox.close();
  // }

  ngAfterViewInit() {
    // this.initVisitorDatatable();
    this.initDatatable();

    //   $('#slide_button').click(function() {
    //     $('#slide').animate({
    //     height: 'toggle'
    //     }, 1500, function() {
    //     });
    // });


  }

  toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    // console.log('Access:'+chkaccess);
    if (chkaccess == true) {
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUser = authData;
      // console.log(authData);
      this.roleId = authData.roleId;
      this.usrid = authData.uid;
      this.employeeId = authData.userName;
      this.empData = authData;

      this.calendarItem.createdBy = this.currentUser.fkEmpId;

      // console.log(this.today);
      let d = new Date();
      this.label.push(this.dayOfWeek[d.getDay()].name);
      for (let i = 1; i < 7; i++) {
        d.setDate(d.getDate() - 1);
        this.label.push(this.dayOfWeek[d.getDay()].name);
      }
      this.label.reverse();
      this.getLocationList();

      // let thisMonth = this.todayDate.getMonth();
      // let numberOfDays = (thisMonth == 0 || thisMonth == 2 || thisMonth == 4 || thisMonth == 6 || thisMonth == 7 || thisMonth == 9 || thisMonth == 11) ? 31 : 30;
      
      // this.from_date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), 1, 0, 0, 0);
      // this.to_date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), numberOfDays, 23, 59, 59);

      // this.getVisitorTypeList();
     // this.getPurposeList();
      //this.getEmployee();

      // this.getAdditionalVisitors();
      // this.filterReport();

    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  getEmployee() {
    this.errMsg = "";
    this.isLoading = true;
    // debugger;
    // console.log(this.employeeId);
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.usrid).then((data: any) => {
      // this.isLoading = false;
      // debugger;
      if (data == 200 || data.id > 0) {
        this.EmployeeList1 = data;
        // console.log(this.EmployeeList1);

        this.location = this.EmployeeList1.baseLocation;
        this.locationName = this.locationList.find(s => s.id == this.location).code;

        // this.location = this.EmployeeList1.baseLocation;
        // console.log(this.location);
        this.getAppointments();

        // this.reInitDatatable();
        // this.generateChart();
        // this.getLocwiseList();
      }
    }).catch(error => {
      this.isLoading = false;
      this.EmployeeList1 = [];
    });

  }

  bookAppointment(ch) {
    localStorage.setItem('categoryVMS', ch);
    // console.log('navigating from welcome'+ localStorage.getItem('categoryVMS'));
    this.router.navigateByUrl("/visitorentry");
  }

  //   dashboardRefresh(){
  // this.totalrevisits = 0;
  // this.totalnewvisits = 0;
  // this.totalvisits = 0;
  // this.visitorsInside = 0;
  // console.log(this.from_date+''+this.to_date);
  //   this.visitorsFilteredList1.splice(0);
  //   this.visitorsFilteredList.splice(0);
  // console.log('visitor array length:'+this.visitorsFilteredList.length);
  //     this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API ).then((data: any) => {
  //       if (data.length > 0) {
  //         this.visitorsFilteredList1 = data;

  //     let td = new Date();
  //     let formatedFROMdate:string;
  //     let formatedTOdate:string;

  // console.log(formatedFROMdate+'::'+formatedTOdate);
  //       if(this.from_date=='' || this.from_date==null){
  //         formatedFROMdate = td.getFullYear() + "-" +("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
  //         this.from_date = new Date(td.getFullYear(),td.getMonth(),1);
  //       }
  //       else{
  //         let fd = new Date(this.from_date);
  //         formatedFROMdate =  fd.getFullYear() + "-" +("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
  //         ("00" + fd.getDate()).slice(-2) ;
  //         this.from_date = new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());

  //       }

  //       if(this.to_date=='' || this.to_date==null){
  //         formatedTOdate = td.getFullYear() + "-" +("00" + (td.getMonth() + 1)).slice(-2) + "-" +
  //         ("00" + td.getDate()).slice(-2) ;
  //         this.to_date = new Date(td.getFullYear(),td.getMonth(),+("00" + td.getDate()).slice(-2));
  //       }
  //       else{
  //         let ed = new Date(this.to_date);
  //         formatedTOdate =  ed.getFullYear() + "-" +("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
  //         ("00" + ed.getDate()).slice(-2) ;
  //         this.to_date = new Date(ed.getFullYear(),ed.getMonth(),+("00" + ed.getDate()).slice(-2));

  //       }

  //     for(let e of this.visitorsFilteredList1){
  //     var d = new Date(e.date);

  //     let formateddate:string = d.getFullYear() + "-" +("00" + (d.getMonth() + 1)).slice(-2) + "-" +
  //     ("00" + d.getDate()).slice(-2) ;
  //     if(formateddate >= formatedFROMdate && formateddate <= formatedTOdate){
  // if(formateddate >= this.from_date && formateddate <= this.to_date){
  // console.log(this.from_date+', '+this.to_date+':'+formateddate);
  //      this.visitorsFilteredList.push(e);
  //     }

  //     }
  //     this.reInitDatatable();
  //   }
  // }).catch(error => {
  // this.isLoading = false;
  //   this.visitorsFilteredList = [];
  //   this.visitorsFilteredList1 = [];
  // });

  // }

  getFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fd.getDate()).slice(-2);
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }

  isFilterReportLoading: boolean = false;
  filterReport() {
    this.isFilterReportLoading = true;

    // this.totalrevisits = 0;
    // this.totalnewvisits = 0;
    // this.totalvisits = 0;
    // this.visitorsInside = 0;
    // console.log(this.from_date+''+this.to_date);
    // this.todayVisitorsFilteredList1.splice(0);
    // this.todayVisitorsFilteredList.splice(0);
    // this.isLoading = true;
    this.visitorsFilteredList.splice(0);
    this.visitorsFilteredList1.splice(0);
    // debugger;
    let td = new Date();
    let formatedFROMdate: string;
    let formatedTOdate: string;
    if (this.from_date == '' || this.from_date == null) {
      formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
      this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
    }
    else {
      let fd = new Date(this.from_date);
      formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
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


    // console.log('visitor array length:'+this.visitorsFilteredList.length);
    let searchStr = ',,' + this.employeeId + ',,,' + this.getFormatedDate(this.from_date) + "," +
    this.getFormatedDate(this.to_date) + ","+","+",";

    // console.log(searchStr);
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      // debugger;
      // this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API ).then((data: any) => {
      if (data.length > 0) {
        this.visitorsFilteredList1 = data;
        this.visitorsFilteredList = this.visitorsFilteredList1.filter(s => s.numberOfPerson > 0);
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
      this.isFilterReportLoading = false;
      // console.log(this.visitorsFilteredList.length);
      this.reInitDatatable();

    }).catch(error => {
      this.isLoading = false;
      this.isFilterReportLoading = false;
      // this.todayVisitorsFilteredList = [];
      // this.todayVisitorsFilteredList1 = [];
      this.visitorsFilteredList = [];
    });

  }

  private initDatatable(): void {
    // let exampleId: any = jQuery('#userTable');
    // this.tableWidget = exampleId.DataTable();
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
  //   private initVisitorDatatable(): void {
  //     let exampleId: any = jQuery('#visitorTable');
  //     this.tableWidget1 = exampleId.DataTable();
  // }

  // private reInitVisiorDatatable(): void {
  //     if (this.tableWidget1) {
  //         this.tableWidget1.destroy();
  //         this.tableWidget1 = null;
  //     }
  //     setTimeout(() => this.initVisitorDatatable(), 0)
  // }
  addDays(date, daysToAdd) {
    var _24HoursInMilliseconds = 86400000;
    return new Date(date.getTime() + daysToAdd * _24HoursInMilliseconds);
  };

  getLocationName(id) {
    let temp = this.locationList.find(s => s.id == id);
    return temp ? temp.name : '';
  }

  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.locationList = data;


      }
      this.getVisitorTypeList();

    }).catch(error => {
      // this.isLoading = false;
      this.locationList = [];
    });
  }


  getAppointments() {
    //last 1 months
    var now = new Date();
    this.visitorsList1 = [];
    this.visitorsList = [];
    var threemonthAgo = this.addDays(now, - 30 * 1);
    // console.log(threemonthAgo);

    let td = new Date();
    let StartMnDate, EndMnDate;
    let formatedFROMdate: string;
    let formatedTOdate: string;
    // formatedFROMdate = td.getFullYear() + "-" +("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
    StartMnDate = this.getFormatedDate(threemonthAgo);
    // console.log(StartMnDate);

    formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
      ("00" + td.getDate()).slice(-2);
    EndMnDate = formatedTOdate;

    let searchStr = ',,' + this.employeeId + ',,,' + StartMnDate + "," + EndMnDate + ","+","+",";
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data.length > 0) {
        this.visitorsList1 = data;
        this.visitorsList = this.visitorsList1.filter(s => s.numberOfPerson > 0);
        //console.log(this.visitorsList);
      }
      // debugger;
      this.totalVisits();

    }).catch(error => {
      this.isLoading = false;
      this.visitorsList = [];
    });
    // searchStr = ',,,,,' + StartMnDate + "," + EndMnDate;
    // this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
    //   if (data.length > 0) {
    //     let visitorsList1 = data;
    //     this.visitorsListAllCount = visitorsList1.filter(s => s.numberOfPerson > 0).length;

    //   }
    // }).catch(error => {
    //   this.isLoading = false;
    // visitorsList = [];
    // });
  }

  totalVisits() {
    this.totalrevisits = 0;
    this.checkedInCount = 0;
    this.totalnewvisits = 0;
    this.totalvisits = 0;
    this.visitorsInside = 0;
    this.singlevisits = 0;
    this.pendingCheckouts = 0;
    this.newVisitors = [];
    this.pendingbook = 0;
    this.newVisitorsMonth = 0;
    this.canceledBookings = 0;
    this.directcheckedInCount = 0;
    var todaydate = new Date();
    var temp = new Date();
    this.datas = [];
    this.todaysvisitorsList = [];
    var month = temp.getMonth(); // January
    var dt = new Date(temp.getFullYear(), month + 1, 0);
    let formatedtodaydate: string = this.getFormatedDate(todaydate);
    // debugger;
    if (this.visitorsList.length > 0) {
      for (let i = 0; i <= 6; i++) {
        let dateCheck = this.getFormatedDate(temp);

        let abc: any[] = this.visitorsList.filter(e => (new Date(e.date).getFullYear() + "-" + ("00" + (new Date(e.date).getMonth() + 1)).slice(-2) + "-" +
          ("00" + new Date(e.date).getDate()).slice(-2)) == dateCheck);
        // console.log(abc?abc.length:0);
        this.datas.push(abc ? abc.length : 0);
        temp.setDate(temp.getDate() - 1);
      }
      this.datas.reverse();
    }
    else {
      // for (let i = 0; i <= 6; i++) {

      this.datas = [0, 0, 0, 0, 0, 0, 0];
      // }
    }
    // unattended count
    // console.log(this.datas);
    // debugger;
    temp = new Date();
    if (this.visitorsList1.length > 0) {
      for (let i = 0; i <= 6; i++) {
        let dateCheck = this.getFormatedDate(temp);
        let abc: any[] = this.visitorsList1.filter(e => this.getFormatedDate(e.date) == dateCheck);
        // console.log(abc.filter(s => s.numberOfPerson <= 0));
        this.misseddatas.push(abc ? abc.filter(s => s.numberOfPerson <= 0).length : 0);
        temp.setDate(temp.getDate() - 1);
      }
      this.misseddatas.reverse();
    } else {
      this.misseddatas = [0, 0, 0, 0, 0, 0, 0];
    }
    this.totalvisits = this.visitorsList.length;
    this.otherVisitorsTotal = this.visitorsList.filter(s => s.numberOfPerson > 0 && s.fkEmployeeName == '').length;

    if (this.visitorsList1.length > 0) {
      for (let e of this.visitorsList1) {
        var d = new Date(e.date);
        let formateddate: string = this.getFormatedDate(d);
        //d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +("00" + d.getDate()).slice(-2);
        if (formateddate == formatedtodaydate) {
          this.todaysvisitorsList.push(e);
        }
      }
    }

    this.totaltodayvisits = this.todaysvisitorsList.filter(e => e.fromTime != null).length;
    this.pendingbook = this.todaysvisitorsList.filter(e => e.isPreShedualled == true && e.isCancelled == false).length;
    this.canceledBookings = this.todaysvisitorsList.filter(e => e.toTime != null).length;
    this.pendingCheckouts = this.visitorsList.filter(e => e.fromTime != null && e.toTime == null).length;
    this.checkedInCount = this.visitorsList.filter(e => e.fromTime != null && e.isPreShedualled == true).length;
    this.directcheckedInCount = this.visitorsList.filter(e => e.fromTime != null && e.isPreShedualled == false).length;


    // console.log('checkedincount' + this.checkedInCount);
    // console.log('totalcount' + this.totaltodayvisits);


    this.chart = new Chart('linechart', {

      type: 'bar',
      data: {
        // labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        labels: this.label,
        datasets: [{
          label: '# of Visitors last 7 days',
          // data: [12, 119, 103, 105, 92, 23],
          data: this.datas,
          backgroundColor: [
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df'
          ],
          borderColor: [
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df',
            '#4e73df'
          ],

          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: '# of Visitors last 7 days'
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } }
              //stepSize: 1,
            }
          }]
        },
        plugins: {
          datalabels: {
            color: 'white',
            font: {
              size: 12,
              weight: 600
            },
            offset: 4,
            padding: 0,
            // formatter: function(value) {
            //   return value;
            // }
          }
        }
      }
    });

    // this.chart = new Chart(document.getElementById("myPieChart1"), {
    //   type: 'doughnut',
    //   data: {
    //     labels: ["My Visitors", "Total Visitors"],
    //     datasets: [
    //       {
    //         label: "Checked in (persons)",
    //         backgroundColor: ["#33cccc", "#00cc99"],
    //         data: [this.totalvisits - this.visitorsListAllCount]
    //       }
    //     ]
    //   },
    //   options: {
    //     title: {
    //       display: true,
    //       text: 'Employee vs Other Visitors this month'
    //     }
    //   }
    // });

    this.chart = new Chart(document.getElementById("mixed-chart"), {
      type: 'bar',
      data: {
        labels: this.label,
        datasets: [{
          label: "All Visitors",
          type: "bar",
          borderColor: "#8e5ea2",
          data: this.datas,
          fill: false
        }, {
          label: "Missed App",
          type: "line",
          borderColor: "#3e95cd",
          data: this.misseddatas,
          fill: false
        },
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Missed appointments'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } }
              //stepSize: 1
            }
          }]
        },
        legend: { display: false },
        plugins: {
          datalabels: {
            color: 'black',
            font: {
              size: 12,
              weight: 600
            },
            offset: 4,
            padding: 0,
            // formatter: function(value) {
            //   return value;
            // }
          }
        }
      }
    });

    let pieData = [];
    let labels1 = [];
    let bckColor = [];
    let lab = "";
    if (this.checkedInCount != 0 || this.directcheckedInCount != 0) {
      pieData = [this.checkedInCount, this.directcheckedInCount];
      labels1 = ["With Appointment", "Without Appointment"];
      bckColor = ["#3e95cd", "#d9534f"];
      lab = "Checked in (persons)"
    }
    else {
      pieData = [100];
      labels1 = ["No Checked In Visitors"]
      bckColor = ["#cccccc"]
    }
    let displayFlag = (this.checkedInCount != 0 || this.directcheckedInCount != 0) ? true : false;
    // let displayFlag = true;
    this.chart = new Chart(document.getElementById("myPieChart"), {
      plugin:this.chartPlugins,
      type: 'doughnut',
      data: {
        labels: labels1,
        datasets: [
          {
            label: lab,
            backgroundColor: bckColor,
            data: pieData
          }
        ]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            boxWidth: 10
          },
          onClick: (e) => e.stopPropagation()
        },
        plugins: {
          datalabels: {
            color: 'white',
            font: {
              size: 15,
              weight: 600
            },
            offset: 4,
            padding: 0,
          }
        },
        title: {
          display: true,
          text: 'Monthly Visitors Status'
        }
      }
    });
    this.filterReport();
    this.reInitVisiorDatatable();
  }

  exportAsXLSX(): void {
    this.exportList = [];
    //var templist=this.assessList.length;
    // debugger;
    for (var i = 0; i <= this.visitorsFilteredList.length - 1; i++) {

      var expListItem = {
        SlNo: (i + 1),
        Location: this.getLocationName(this.visitorsFilteredList[i].temp7),
        Type: this.getVisitorType(this.visitorsFilteredList[i].fkVisitorType),
        Scheduled: this.visitorsFilteredList[i].isPreShedualled ? "Planned" : "UnPlanned",//Added by Syam bora
        'Person met': this.visitorsFilteredList[i].fkEmployeeName,
        VisitorName: this.visitorsFilteredList[i].name,
        Company: this.visitorsFilteredList[i].companyName,
        Mobile: this.visitorsFilteredList[i].mobile,
        'No.of Persons': this.visitorsFilteredList[i].numberOfPerson,
        Purpose: this.getPurpose(this.visitorsFilteredList[i].fkVisitorPurpose),
        Email: this.visitorsFilteredList[i].email,
        Belongings: this.visitorsFilteredList[i].temp2,
        'Other Belongings': this.visitorsFilteredList[i].temp9,
        StartDate: this.visitorsFilteredList[i].date,
        InTime: this.visitorsFilteredList[i].fromTime,
        EndDate: this.visitorsFilteredList[i].endDateTime,
        OutTime: this.visitorsFilteredList[i].toTime,
        AMCActionTaken: this.visitorsFilteredList[i].amcActionTaken ? this.visitorsFilteredList[i].amcActionTaken : "NA"
      };

      this.exportList.push(expListItem);
      // console.log('export list'+this.exportList);
    }

    //this.exportList = {  }


    this.excelService.exportAsExcelFile(this.exportList, 'VisitorList');
  }


  additionalVisitorsDetails(id) {
    // console.log(id);
    this.avDetailsFlag = false;
    this.additionalVisitorItem = [];
    this.additionalVisitorItem = this.additionalVisitors.filter(s => s.fkId == id);
    this.httpService.getById(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ANY_API, id).then((data: any) => {
      // this.isLoading = false;
      // console.log(data);
      if (data.length > 0) {
        this.additionalVisitorItem = data;
        // console.log(this.empMList);
        // this.employeeList = data;
        // console.log(this.additionalVisitors);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.errMsgPop = 'error retrieving additional persons details.';
      this.additionalVisitors = [];
    });
    // this.avDetailsFlag = this.additionalVisitorItem.length>0?true:false;
    // console.log(this.additionalVisitorItem);
    jQuery("#additionalVisitorModal").modal('show');

  }
  getAdditionalVisitors() {
    this.errMsgPop = '';
    this.httpService.get(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ALL_API).then((data: any) => {
      // this.isLoading = false;
      // console.log(data);
      if (data.length > 0) {
        this.additionalVisitors = data;
        // console.log(this.empMList);
        // this.employeeList = data;
        // console.log(this.additionalVisitors);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.errMsgPop = 'error retrieving additional persons details.';
      this.additionalVisitors = [];
    });
  }
  getAdditionalCount(id) {
    // debugger;
    let temp = this.additionalVisitors.filter(s => s.fkId == id);
    // if(temp)// console.log(id+'-'+temp.length);
    return temp ? temp.length : 0;
  }

  getVisitorCount(id) {
    return this.visitorsList1.find(s => s.fkEmployeeId == id) ? this.visitorsList1.filter(s => s.fkEmployeeId == id).length : 0;
  }

  getVisitorType(id) {
    let t = this.visitorTypeList.find(s => s.id == id);
    return t ? t.visitor_Type : '';
  }

  getPurpose(id) {
    let t = this.purposeList.find(s => s.id == id);
    return t ? t.purpose : '';
  }

  getPurposeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_PURPOSE_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.purposeList = data;
        // console.log(this.empMList);
        // this.employeeList = data;
        // console.log(this.purposeList);
      }
      this.getEmployee();

    }).catch(error => {
      // this.isLoading = false;
      this.purposeList = [];
    });
  }


  getVisitorTypeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_TYPE_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {

        this.visitorTypeList = data;
        // console.log(this.visitorTypeList);
      }
      this.getPurposeList();
    }).catch(error => {
      // this.isLoading = false;
      this.visitorTypeList = [];
    });
  }
getHeader(): { headers: HttpHeaders } {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authData.token
  });

  return { headers };
}
  getTimeFormat(time) {
    return moment('1970-01-01 '+time);
   }

   
   AMCEntry(id)
   {
    let route = 'amc-entry/' + id;
    this.router.navigate([route]);
   }

   printAMCItems: AmcvisitDetails[] = [];
   getAMCDetailsById(id: number) {
     this.isLoading = true;
 
     this.httpService.getById(APIURLS.GET_AMC_VISIT_DETAILS_BY_ID, id).then((data) => {
       if (data.length > 0) {
         this.printAMCItems = data;
       }
 
       $("#AMCPrintModal").modal('show');
       this.isLoading = false;
     }).catch((error) => {
       swal("Error!", "Error fetching AMC details: " + error, "error");
       console.log("Error fetching AMC details: " + error);
 
       this.isLoading = false;
     });
   }
 
   printItem: Visitor;
   showPrintModal(data) {
     this.printItem = Object.assign({}, data);
     this.getAMCDetailsById(this.printItem.id);
   }
 
   showCommentsModal(data)
   {
     this.calendarItem = Object.assign({},data);
     $("#ReasonModal").modal('show');
   }
 
   print(): void {
     let printContents, popupWin;
     printContents = document.getElementById('amc-print-section').innerHTML;
     popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
     popupWin.document.open();
     popupWin.document.write(`
       <html>
         <head>
           <title>Outward - STO</title>
           <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
           <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
         </head>
         <body onload="window.print();window.close()">
         <table class="report-container">
           <thead class="report-header">
             <tr>
               <th class="report-header-cell">
                 <div class="header-info">
                   Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
                 </div>
               </th>
             </tr>
           </thead>
           <tbody class="report-content">
             <tr>
               <td class="report-content-cell">
                 <div class="main">
                 ${printContents}
                 </div>
               </td>
             </tr>
           </tbody>
         </table>
         </body>
       </html>`
     );
     popupWin.document.close();
   }
 
   reason:any;
   OnUpdate() {
     //this.calendarItem.isActive=false;
     this.calendarItem.temp18 = this.reason;
     let connection: any;
     connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
     connection.then((data: any) => {
       // this.isLoadingPop = false;
       if (data == 200 || data.id > 0) {
         // jQuery("#myModal").modal('hide');
         this.errMsgPop1 = 'Visit Completed Successfully.';
         this.isLoadingPop = false;
         this.isLoading = false;
         //this.getAppointments();
         this.getAppointments();
         alert(this.errMsgPop1 );
         $("#ReasonModal").modal('hide');
         this.barCode = '';
         this.reason = null;
         // this.router.navigateByUrl('welcome-page');
       }
     }).catch(error => {
       this.isLoadingPop = false;
       this.isLoading = false;
       this.errMsgPop = 'Error completing entry..';
     }).then((value) => {
       this.errMsgPop1 = 'Entry Closed Successfully.';
     });
   }
 }
 