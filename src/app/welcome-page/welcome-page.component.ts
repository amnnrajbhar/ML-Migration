import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
// import { ChartDataLabels } from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import swal from 'sweetalert';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { ExcelService } from '../shared/excel-service';
import { HttpService } from '../shared/http-service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as moment from 'moment';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {
  newVisitorsMonth: any;
  todayDate = new Date();
  today: Date = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
  chart1: any;
  errMsg: string;
  EmployeeList1: any = [];
  location: any = 0;
  locationName: any;
  usrid: number;
  path: string;
  employeeId: any;
  pendingCheckouts = 0;
  pendingbook = 0;
  canceledBookings = 0;
  directcheckedInCount=0;
  additionalVisitorItem: any[] = [[]];
  additionalVisitors: any[] = [[]]
  visitorTypeList: any[] = [[]];
  purposeList: any[] = [[]];
  errMsgPop = '';
  locationList: any[] = [[]];
  [x: string]: any;
  public tableWidget;
  public tableWidget1;
  chart: any;
  visitorsList: any = [];
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
  private _albums = [];
  j = 1;
  empData: AuthData;
  visitorsFilteredList1: any[] = [[]];
  visitorsFilteredList: any[] = [[]];
  todayVisitorsFilteredList1: any[] = [[]];
  todayVisitorsFilteredList: any[] = [[]];
  datas: any[] = [];
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
  totaltodayvisits: any = 0;
  currentUser:AuthData;


  public chartPlugins = [ChartDataLabels];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private excelService: ExcelService) {

  }

  ngAfterViewInit() {
    this.initDatatable();
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
    if (chkaccess == true) {

      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUser=JSON.parse(localStorage.getItem('currentUser'));
      // console.log(authData);
      this.roleId = authData.roleId;
      this.usrid = authData.uid;
      this.employeeId = authData.userName;
      this.empData = authData;
      // // console.log(this.today);
      this.isLoading = true;
      let d = new Date();
      this.label.push(this.dayOfWeek[d.getDay()].name);
      for (let i = 1; i < 7; i++) {
        d.setDate(d.getDate() - 1);
        this.label.push(this.dayOfWeek[d.getDay()].name);
      }
      this.label.reverse();
      this.getLocationList();

      // this.getVisitorTypeList();
      // this.getPurposeList();
      // this.getEmployee();

      // this.getAdditionalVisitors();
      // this.filterReport();

    }
    else
      this.router.navigate(["/unauthorized"]);
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



  getEmployee() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API, this.usrid).then((data: any) => {
      // console.log(data);
      if (data == 200 || data.id > 0) {
        this.EmployeeList1 = data;
        // // console.log(this.EmployeeList1);
        // // debugger;
        this.location = this.EmployeeList1.baseLocation;
        // console.log(this.location);
        this.locationName = this.locationList.find(s => s.id == this.location).code;
        // console.log(this.locationName);
        // this.reInitDatatable();
        // this.generateChart();
        // this.getLocwiseList();
        this.getAppointments();

      }
    }).catch(error => {
      this.isLoading = false;
      this.EmployeeList1 = [];
    });

  }

  bookAppointment(ch) {
   // localStorage.setItem('categoryVMS', ch);
    // // console.log('navigating from welcome'+ localStorage.getItem('categoryVMS'));
    //this.router.navigateByUrl("/visitorentry");
    this.router.navigate(['/welcome-page',ch]);
  }


  getFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fd.getDate()).slice(-2);
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }
  getTimeFormat(time) {
    return moment('1970-01-01 '+time);
  }

  filterReport() {
    // this.totalrevisits = 0;
    // this.totalnewvisits = 0;
    // this.totalvisits = 0;
    // this.visitorsInside = 0;
    // // console.log(this.from_date+''+this.to_date);
    // this.todayVisitorsFilteredList1.splice(0);
    // this.todayVisitorsFilteredList.splice(0);
    // this.isLoading = true;
    this.visitorsFilteredList.splice(0);
    this.visitorsFilteredList1.splice(0);

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


    // // console.log('visitor array length:'+this.visitorsFilteredList.length);
    let searchStr:any;
    if(this.currentUser.fkProfileId==1)
    {
      searchStr = ',,,,,' + this.getFormatedDate(this.from_date) + "," + this.getFormatedDate(this.to_date) + ','+',';
    }
    else{
      searchStr = this.location + ',,,,,' + this.getFormatedDate(this.from_date) + "," + this.getFormatedDate(this.to_date) + ','+',';
    }
    
    // console.log(searchStr);
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      // // debugger;
      // this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API ).then((data: any) => {
      if (data.length > 0) {
        this.visitorsFilteredList1 = data;
        this.visitorsFilteredList = this.visitorsFilteredList1.filter(s => s.numberOfPerson > 0);
        //console.log(this.visitorsFilteredList);
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
      // // console.log(this.visitorsFilteredList.length);
      this.reInitDatatable();

    }).catch(error => {
      this.isLoading = false;
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
    // // debugger;
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
    // // console.log(StartMnDate);

    formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
      ("00" + td.getDate()).slice(-2);
    EndMnDate = formatedTOdate;

    let searchStr = this.location + ',,,,,' + StartMnDate + "," + EndMnDate + ','+',';
    // console.log(searchStr);
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data) {
        this.visitorsList1 = data;
        this.visitorsList = this.visitorsList1;//.filter(s => s.numberOfPerson > 0);
        // console.log(this.visitorsList);
        this.totalVisits();

      }
    }).catch(error => {
      this.isLoading = false;
      this.visitorsList = [];
    });
  }

  totalVisits() {
    this.totalrevisits = 0;
    this.checkedInCount = 0;
    this.pendingCheckouts = 0;
    this.pendingbook = 0;
    this.totalnewvisits = 0;
    this.totalvisits = 0;
    this.visitorsInside = 0;
    this.singlevisits = 0;
    this.newVisitors = [];
    this.newVisitorsMonth = 0;
    this.canceledBookings=0;
    this.directcheckedInCount=0;
    var todaydate = new Date();
    var temp = new Date();
    var month = temp.getMonth(); // January
    var dt = new Date(temp.getFullYear(), month + 1, 0);
    let formatedtodaydate: string = this.getFormatedDate(todaydate);
    if (this.visitorsList.length > 0) {
      for (let i = 0; i <= 6; i++) {
        let dateCheck = this.getFormatedDate(temp);

        let abc: any[] = this.visitorsList.filter(e => (new Date(e.date).getFullYear() + "-" + ("00" + (new Date(e.date).getMonth() + 1)).slice(-2) + "-" +
          ("00" + new Date(e.date).getDate()).slice(-2)) == dateCheck);
        // // console.log(abc?abc.length:0);
        this.datas.push(abc ? abc.length : 0);
        temp.setDate(temp.getDate() - 1);
      }
      this.datas.reverse();
    } else {
      this.datas = [0, 0, 0, 0, 0, 0, 0];
    }
    // unattended count

    temp = new Date();
    if (this.visitorsList1.length > 0) {
      for (let i = 0; i <= 6; i++) {
        let dateCheck = this.getFormatedDate(temp);
        let abc: any[] = this.visitorsList1.filter(e => this.getFormatedDate(e.date) == dateCheck);
        // // console.log(abc.filter(s => s.numberOfPerson <= 0));
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
     //checked in count
    this.totaltodayvisits = this.todaysvisitorsList.filter(e => e.fromTime != null).length;
    this.pendingbook = this.todaysvisitorsList.filter(e => e.isPreShedualled==true && e.isCancelled==false).length;
    this.canceledBookings =  this.todaysvisitorsList.filter(e => e.toTime != null).length;
    this.pendingCheckouts = this.visitorsList.filter(e => e.fromTime != null && e.toTime == null).length;
    this.checkedInCount = this.visitorsList.filter(e => e.fromTime != null && e.isPreShedualled==true ).length;
    this.directcheckedInCount = this.visitorsList.filter(e => e.fromTime != null &&  e.isPreShedualled==false ).length;

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
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function (value) { if (Number.isInteger(value)) { return value; } }
             // stepSize: 5
            }
          }]
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
            // formatter: function(value) {
            //   return value;
            // }
          }
        }
      }
    });

    /*Today's Visitors by type */
    let typeLables=[];
    let typePieData=[];
    var coloR = [];
    var dynamicColors = function () {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      return "rgb(" + r + "," + g + "," + b + ")";
    };
    this.visitorTypeList.forEach(e => {
      typeLables.push(e.visitor_Type);
      let typecount=this.todaysvisitorsList.filter(i => i.fromTime != null &&  i.fkVisitorType==e.id ).length;
      typePieData.push(typecount);
      coloR.push(dynamicColors());
    });

    new Chart(document.getElementById("piechart"), {
      plugin:this.chartPlugins,
      type: 'doughnut',
      data: {
        labels: typeLables,
        datasets: [
          {
            backgroundColor: coloR,
            data: typePieData
          }
        ]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: 'right',
          // labels: {
          //   padding: 20,
          //   boxWidth: 10
          // }
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
            // formatter: function(value) {
            //   return value;
            // }
          }
        },

        title: {
          display: true,
          text: "Today's Visitors by type"
        }
      }
    });

// *Missed Appointmnets* on 19/02/2020
    // this.chart = new Chart(document.getElementById("mixed-chart"), {
    //   type: 'bar',
    //   data: {
    //     labels: this.label,
    //     datasets: [{
    //       label: "All Visitors",
    //       type: "bar",
    //       borderColor: "#8e5ea2",
    //       data: this.datas,
    //       fill: false
    //     }, {
    //       label: "Missed App",
    //       type: "line",
    //       borderColor: "#3e95cd",
    //       data: this.misseddatas,
    //       fill: false
    //     },// {
    //       //   label: "Europe",
    //       //   type: "bar",
    //       //   backgroundColor: "rgba(0,0,0,0.2)",
    //       //   data: [408,547,675,734],
    //       // }, {
    //       //   label: "Africa",
    //       //   type: "bar",
    //       //   backgroundColor: "rgba(0,0,0,0.2)",
    //       //   backgroundColorHover: "#3e95cd",
    //       //   data: [133,221,783,2478]
    //       // }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: true,
    //     responsive: true,
    //     title: {
    //       display: true,
    //       text: 'Missed appointments'
    //     },
    //     scales: {
    //       yAxes: [{
    //         ticks: {
    //           beginAtZero: true,
    //           callback: function (value) { if (Number.isInteger(value)) { return value; } },
    //           //stepSize: 1
    //         }
    //       }]
    //     },
    //     legend: { display: false },
    //     plugins: {
    //       datalabels: {
    //         color: 'black',
    //         font: {
    //           size: 12,
    //           weight: 600
    //         },
    //         offset: 4,
    //         padding: 0,
    //         // formatter: function(value) {
    //         //   return value;
    //         // }
    //       }
    //     }
    //   }
    // });
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
     new Chart(document.getElementById("myPieChart"), {
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
            // formatter: function(value) {
            //   return value;
            // }
          }
        },
        //   tooltips: {
        //     callbacks: {
        //         label: function(tooltipItems, data) {
        //           // // console.log(tooltipItems);
        //           // // console.log(data);
        //           // if(data.labels[0]=="No Checked In Visitors")
        //            return data.labels[tooltipItems.index];
        //           // else
        //           // return data['datasets'][0]['data'][tooltipItems['index']];
        //         }
        //     }
        // },
        title: {
          display: true,
          text: 'Monthly Visitors Status'
        }
      }
    });

    this.chart = new Chart(document.getElementById("myPieChart1"), {
      type: 'doughnut',
      data: {
        labels: ["Employee", "Others"],
        datasets: [
          {
            label: "Checked in (persons)",
            backgroundColor: ["#3e95cd", "#d9534f"],
            data: [this.totalvisits - this.otherVisitorsTotal, this.otherVisitorsTotal]
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Employee vs Other Visitors this month'
        },
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
            // formatter: function(value) {
            //   return value;
            // }
          }
        }
      }
    });
    this.filterReport();
    this.reInitVisiorDatatable();
  }

  exportAsXLSX(): void {
    this.exportList = [];
    // // debugger;
    // // console.log(this.visitorsFilteredList);
    for (var i = 0; i <= this.visitorsFilteredList.length - 1; i++) {

      var expListItem = {
        SlNo: (i + 1),
        Location: this.getLocationName(this.visitorsFilteredList[i].temp7),
        Type: this.getVisitorType(this.visitorsFilteredList[i].fkVisitorType),
        Scheduled: this.visitorsFilteredList[i].isPreShedualled ? "Planned" : "UnPlanned",
        'Person to Meet (Employee)': this.visitorsFilteredList[i].fkEmployeeName,
        'Person to Meet (Others)': this.visitorsFilteredList[i].temp4,
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
        OutTime: this.visitorsFilteredList[i].toTime
      };


      this.exportList.push(expListItem);
      // // console.log('export list'+this.exportList);
    }

    //this.exportList = {  }


    this.excelService.exportAsExcelFile(this.exportList, 'VisitorList');
  }

  additionalVisitorsDetails(id) {
    // // console.log(id);
    // this.avDetailsFlag = false;
    // this.additionalVisitorItem = [];
    // this.additionalVisitorItem = this.additionalVisitors.filter(s=>s.fkId==id);
    this.httpService.getById(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ANY_API, id).then((data: any) => {
      // this.isLoading = false;
      // // console.log(data);
      if (data.length > 0) {
        this.additionalVisitorItem = data;
        // // console.log(this.empMList);
        // this.employeeList = data;
        // // console.log(this.additionalVisitors);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.errMsgPop = 'error retrieving additional persons details.';
      this.additionalVisitors = [];
    });
    jQuery("#additionalVisitorModal").modal('show');

  }
  getAdditionalVisitors() {
    this.errMsgPop = '';
    this.httpService.get(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ALL_API).then((data: any) => {
      // this.isLoading = false;
      // // console.log(data);
      if (data.length > 0) {
        this.additionalVisitors = data;
        // // console.log(this.empMList);
        // this.employeeList = data;
        // // console.log(this.additionalVisitors);
      }
    }).catch(error => {
      // this.isLoading = false;
      this.errMsgPop = 'error retrieving additional persons details.';
      this.additionalVisitors = [];
    });
  }
  getLocationName(id) {
    let temp = this.locationList.find(s => s.id == id);
    return temp ? temp.name : '';
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
        // // console.log(this.empMList);
        // this.employeeList = data;
        // // console.log(this.purposeList);
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
        // // console.log(this.visitorTypeList);
      }
      this.getPurposeList();

    }).catch(error => {
      // this.isLoading = false;
      this.visitorTypeList = [];
    });
  }
   getHeader(): any {
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
}
}
