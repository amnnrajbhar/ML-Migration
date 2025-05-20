import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Chart } from 'chart.js';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Router } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { AuthData } from '../auth/auth.model';
import { Lightbox } from 'ngx-lightbox';
declare var jQuery: any;
import * as _ from "lodash";
declare var $: any;
import { ExcelService } from '../shared/excel-service';
import swal from 'sweetalert';
import { componentFactoryName } from '@angular/compiler';
import { saveAs } from 'file-saver';
declare var require: any;
import { Http, RequestOptions, Headers } from '@angular/http';
import * as moment from 'moment';


import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { Visitor } from '../visitorappointment/visitor.model';
import { AmcvisitDetails } from '../UpdateAMCDetails/AMCDetails.model';

@Component({
  selector: 'app-locationreport',
  templateUrl: './locationreport.component.html',
  styleUrls: ['./locationreport.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LocationreportComponent implements OnInit {
  today: Date = new Date();

  currentUser: AuthData;

  imageStore = [];
  chart: any;
  usrid: number;
  tableWidget: any;
  errMsg: string;
  isLoading: boolean;
  BellCurveManagerRatingList: any;
  EmployeeList: any[] = [[]];
  EmployeeList1: any[] = [[]];
  location: any;
  label: any[] = [];
  dayOfWeek: any[] = [
    { id: 0, name: 'Sun' },
    { id: 1, name: 'Mon' },
    { id: 2, name: 'Tue' },
    { id: 3, name: 'Wed' },
    { id: 4, name: 'Thu' },
    { id: 5, name: 'Fri' },
    { id: 6, name: 'Sat' },
  ];
  visitorTypeList: any[] = [[]];
  purposeList: any[] = [[]];
  visitorsList: any[] = [[]];
  datas: any[] = [];
  exportList: any[] = [];
  errMsgPop: string = '';
  tableWidget1: any;
  visitorsFilteredList1: any[] = [];
  visitorsFilteredList: any[] = [];
  from_date: any;
  to_date: any;
  visitorsUserFilteredList1: any[] = [];
  visitorsUserFilteredList: any[] = [];
  empid: any;
  visitorsList1: any[] = [[]];
  visitorsListChart: any[] = [];
  additionalVisitors: any[] = [[]];
  additionalVisitorItem: any[] = [[]];
  avDetailsFlag: boolean = false;
  locationList: any[] = [[]];
  locationName: any;
  filterLocation: any = [];
  empMList: any = [];
  empMList1: any = [];
  filterEmployee: any = [];
  filVisitor: string = '';
  filCompany: string = '';
  filterVType: any = [];
  filterVPurpose: any = [];
  filterScheduled: any = [];
  ScheduledList: any[] = [
    { id: 0, name: 'UnPlanned' },
    { id: 1, name: 'Planned' }
  ];
  filterStatus: any = [];
  StatusList: any[] = [
    { id: 0, name: 'Checked Out' },
    { id: 1, name: 'Not Checked Out' }
  ];
  imageData: any;

  isLoadingPop: boolean;


  constructor(private appService: AppComponent, private httpService: HttpService, private http: Http, private router: Router, 
    private excelService: ExcelService,
    private https: HttpClient) { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  ngOnInit() {
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
    this.usrid = authData.uid;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(authData);
    this.isLoading = true;
    let d = new Date();
    this.label.push(this.dayOfWeek[d.getDay()].name);
    for (let i = 1; i < 7; i++) {
      d.setDate(d.getDate() - 1);
      this.label.push(this.dayOfWeek[d.getDay()].name);
    }
    this.label.reverse();
    this.getScheduledList();
    this.getStatusList();
    this.getVisitorTypeList();
    this.getPurposeList();
    this.getEmployeeList(this.currentUser.baselocation);
    this.getLocationList();
    this.totalVisits();
    // this.getAppointments();
    this.filterLocation=this.currentUser.baselocation;
   // this.getFilteredDbData();
    this.getAdditionalVisitors();
    this.getbase64image();
    this.isLoading = false;
  }


  onItemSelect(item: any) {
    // this.selCompetencyHead  = item;
    // console.log(item);
    this.getEmployeeList(this.filterLocation[0].id);
    // console.log(this.filterLocation );
  }
  onItemSelectEmp(item: any) {
    // this.selCompetencyHead  = item;
    // console.log(item);
    // console.log(this.filterEmployee );
  }
  onItemSelectVT(item: any) {
    // this.selCompetencyHead  = item;
    // console.log(item);
    // console.log(this.filterVType);
  }

  amcActionTakenColumnFlag: boolean = false;
  onItemVPSelect(item: any) {
    if (item.purpose == "AMC") {
      this.amcActionTakenColumnFlag = true;
    }
  }

  onItemVPDeselect(item: any) {
    if (item.purpose == "AMC") {
      this.amcActionTakenColumnFlag = false;
    }
  }

  dropdownSettings = {};
  locationname:string;
  locListCon=[];
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
        this.locationList = data.filter(x=>x.isActive).sort((a,b)=>{
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
          return 0;

        });        
        let temp=data.find(x=>x.id== this.currentUser.baselocation);
        this.locationname=temp.code +'-'+temp.name;
        this.filterLocation=this.locListCon.filter(x=>x.id== this.currentUser.baselocation);
        this.getFilteredDbData();
        // console.log(this.empMList);
        // this.employeeList = data;
        // console.log(this.locationList);
        // this.locationName = this.locationList.find(s=>s.id==this.location).code;
        // console.log(this.locationName);

        this.dropdownSettings = {
          singleSelection: true,
          idField: 'id',
          textField: 'name1',
          allowSearchFilter: true
        };

      }

    }).catch(error => {
      // this.isLoading = false;
      this.locationList = [];
    });
  }

  getLocationName(id) {
    let temp = this.locationList.find(s => s.id == id);
    return temp ? temp.name : '';
  }

  dropdownSettingsVP = {};
  getPurposeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_PURPOSE_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.purposeList = data;
        // console.log(this.empMList);
        // this.employeeList = data;
        // console.log(this.purposeList);
        this.dropdownSettingsVP = {
          singleSelection: true,
          idField: 'id',
          textField: 'purpose',
          allowSearchFilter: true
        };
      }
    }).catch(error => {
      // this.isLoading = false;
      this.purposeList = [];
    });
  }

  dropdownSettingsVT = {};

  getVisitorTypeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_TYPE_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {

        this.visitorTypeList = data.filter(x=>x.isActive).sort((a,b)=>{
          if(a.visitor_Type > b.visitor_Type) return 1;
          if(a.visitor_Type < b.visitor_Type) return -1;
          return 0;
        });
        // console.log(this.visitorTypeList);
        this.dropdownSettingsVT = {
          singleSelection: true,
          idField: 'id',
          textField: 'visitor_Type',
          allowSearchFilter: true
        };
      }
    }).catch(error => {
      // this.isLoading = false;
      this.visitorTypeList = [];
    });
  }
  //Code Added By SyamBora
  dropdownSettingsSchedule = {};

  getScheduledList() {

    this.dropdownSettingsSchedule = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true
    };
  }

  dropdownSettingsStatus = {};

  getStatusList() {

    this.dropdownSettingsStatus = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true
    };
  }

  dropdownSettingsE = {};

  getEmployeeList(id) {
    // debugger;
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API,id).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.EmployeeList1 = data;
        // console.log(this.EmployeeList1);



        this.location = this.EmployeeList1.find(s => s.id == this.usrid).baseLocation;
        this.locationName = this.locationList.find(s => s.id == this.location).name;
        this.EmployeeList = this.EmployeeList1.filter(s => s.baseLocation == this.location);
        //  this.EmployeeList = data;
        this.generateChart();
        this.empMList.slice(0);
        this.EmployeeList.forEach(element => {
          if (element.isActive) {
            var t = { 'id': 0, 'name': '' };
            t.id = element.employeeId;
            let lastName = this.isEmpty(element.lastName.trim()) ? '-' : '-' + element.lastName + '-';
            t.name = element.firstName + lastName + element.employeeId + '-' + element.designation;
            this.empMList.push(t);
          }
        });
        this.empMList1 = this.empMList;
        // console.log(this.empMList1);
        this.dropdownSettingsE = {
          singleSelection: true,
          idField: 'id',
          textField: 'name',
          allowSearchFilter: true
        };

        // this.reInitDatatable();
      }
    }).catch(error => {
      this.isLoading = false;
      this.EmployeeList1 = [];
    });
  }


  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  ngAfterViewInit() {
    this.initDatatable();
   
  }
  
  private initDatatable(): void {
    // let exampleId: any = jQuery('#locationTable');
    // this.tableWidget = exampleId.DataTable();


    $('#locationTable tfoot th').each(function () {
      var title = $('#locationTable thead th').eq($(this).index()).text();
      if (title != "Sl. No")
        $(this).html('<input type="text" class="form-control" placeholder="Search" style="width:100%"/>');
    });

    
    var table = $('#locationTable').DataTable();
    

    this.tableWidget = table;
    $("#locationTable tfoot input").on('keyup change', function () {
      table
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw();
    });
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.clear();
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0)
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

  

  totalVisits() {

    var todaydate = new Date();
    var temp = new Date();
    var month = temp.getMonth(); // January
    var dt = new Date(temp.getFullYear(), month + 1, 0);
    // console.log(dt);
    let lastDateOfMonth = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt.getDate()).slice(-2);
    let firstDateofMonth = temp.getFullYear() + "-" + ("00" + (temp.getMonth() + 1)).slice(-2) + "-" + "01";

    let formatedtodaydate: string = todaydate.getFullYear() + "-" + ("00" + (todaydate.getMonth() + 1)).slice(-2) + "-" +
      ("00" + todaydate.getDate()).slice(-2);
    // for(let i=1;i<7;i++){
    for (let i = 0; i <= 6; i++) {

      let dateCheck = temp.getFullYear() + "-" + ("00" + (temp.getMonth() + 1)).slice(-2) + "-" +
        ("00" + temp.getDate()).slice(-2);

      let abc: any[] = this.visitorsListChart.filter(e => (new Date(e.date).getFullYear() + "-" + ("00" + (new Date(e.date).getMonth() + 1)).slice(-2) + "-" +
        ("00" + new Date(e.date).getDate()).slice(-2)) == dateCheck);
      // console.log(abc?abc.length:0);
      this.datas.push(abc ? abc.length : 0);
      temp.setDate(temp.getDate() - 1);
    }
    this.datas.reverse();
    // console.log(' FilteredList'+this.datas);
    // this.dashboardRefresh();
  }

  generateChart() {
    var lineData = {
      labels: this.label,
      datasets: [
        {
          label: "Weeks trend",
          backgroundColor: "#99ccff",
          // borderColor: "rgba(26,179,148,0.7)",
          borderColor: "#99ccff",
          pointBackgroundColor: "rgba(26,179,148,1)",
          pointBorderColor: "#fff",
          data: this.datas
        },
        {
          label: "Expected trend",
          backgroundColor: "#dbd2c9",
          // backgroundColor: "#20639b",
          borderColor: "#dbd2c9",
          pointBackgroundColor: "rgba(220,220,220,1)",
          pointBorderColor: "#fff",
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };

    var lineOptions = {
      responsive: true
    };
    //this.chart = new Chart('linechart', {type: 'line', data: lineData, options:lineOptions});
  }

  onSelectAll() {
  }
  additionalVisitorsDetails(id) {
    // console.log(id);
    this.avDetailsFlag = false;
    this.additionalVisitorItem = [];
    this.additionalVisitorItem = this.additionalVisitors.filter(s => s.fkId == id);
    // this.avDetailsFlag = this.additionalVisitorItem.length>0?true:false;
    // console.log(this.additionalVisitorItem);
    jQuery("#additionalVisitorModal").modal('show');

  }
  getAdditionalVisitors() {
    this.httpService.get(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.additionalVisitors = data;
       
      }
    }).catch(error => {
      // this.isLoading = false;
      this.additionalVisitors = [];
    });
  }
  getAdditionalCount(id) {
    return this.additionalVisitors.filter(s => s.fkId == id).length;
  }
  exportAsXLSX(): void {
    this.exportList = [];
    //var templist=this.assessList.length;
    // debugger;
    for (var i = 0; i <= this.visitorsList.length - 1; i++) {

      var expListItem = {
        SlNo: (i + 1),
        Location: this.getLocationName(this.visitorsList[i].temp7),
        Type: this.getVisitorType(this.visitorsList[i].fkVisitorType),
        Scheduled: this.visitorsList[i].isPreShedualled ? "Planned" : "UnPlanned",//Added by Syam bora
        'Person to Meet (Employee)': this.visitorsList[i].fkEmployeeName,
        'Person to Meet (Others)': this.visitorsList[i].temp4,
        VisitorName: this.visitorsList[i].name,
        Company: this.visitorsList[i].companyName,
        Mobile: this.visitorsList[i].mobile,
        'No.of Persons': this.visitorsList[i].numberOfPerson,
        Purpose: this.getPurpose(this.visitorsList[i].fkVisitorPurpose),
        Email: this.visitorsList[i].email,
        Belongings: this.visitorsList[i].temp2,
        'Other Belongings': this.visitorsList[i].temp9,
        StartDate: this.visitorsList[i].date,
        InTime: this.visitorsList[i].fromTime,
        EndDate: this.visitorsList[i].endDateTime,
        OutTime: this.visitorsList[i].toTime
      };

      this.exportList.push(expListItem);
      // console.log('export list'+this.exportList);
    }

    //this.exportList = {  }


    this.excelService.exportAsExcelFile(this.exportList, 'LocationwiseEmpReport');
  }
  exportLocationAsXLSX(): void {
    this.exportList = [];
    //var templist=this.assessList.length;
    // debugger;
    for (var i = 0; i <= this.EmployeeList.length - 1; i++) {

      var expListItem = {
        Sl: (i + 1), EmpName: this.EmployeeList[i].firstName, EmpId: this.EmployeeList[i].employeeId,
        Email: this.EmployeeList[i].email,
        VisitorCount: this.getVisitorCount(this.EmployeeList[i].id)
      };

      this.exportList.push(expListItem);
      // console.log('export list'+this.exportList);
    }

    //this.exportList = {  }


    this.excelService.exportAsExcelFile(this.exportList, 'LocationwiseReport');
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
  userimage:string;
  getbase64image()
  {
    this.https.get('../../assets/dist/img/micrologo.png', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.userimage=event.target.result;
      };

    });
  }
  downloadPdf()
  {
    var printContents = document.getElementById('pdf').innerHTML;
    var OrganisationName ="MICROLABS LIMITED"+','+this.locationname;
    var ReportName = "VISITOR REPORT"
    var printedBy = this.currentUser.fullName;
    var now = new Date();
    var jsDate =this.setFormatedDateTime(now);
    var logo = this.userimage;
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
        title:'Visitor Report',
        },
      
      content: [
        htmnikhitml,
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
      pageSize: 'A3',
      pageMargins: [40, 80, 40, 60],
      pageOrientation: 'landscape',
      header: function (currentPage, pageCount) {
        return {
          
          columns: [
            {
              alignment: 'left',
              image: logo,
              width: 80,
              height: 60,
  
              margin: [30, 0, 0, 0]
            },
            {
              alignment: 'center',
              stack: [
                { text: OrganisationName},
                { text: ReportName},
              ],
              bold: true,
              fontSize: 16,
              width:'*',
              margin: [250, 0, 0, 0]
            
            },
            {
              alignment: 'right',
              stack: [
                { text: ['page ', { text: currentPage.toString() }, ' of ', { text: pageCount.toString() }]},
                { text: 'printedBy' + ":" + printedBy},
                { text: 'printedOn' + ":" + jsDate},
              ],
              bold: true,
              fontSize: 10,
              margin: [0, 0, 30, 0]
            }
           
          ],
          margin: 20
        }
      },
  
    };
    pdfMake.createPdf(docDefinition).open();
  }


  dashboardRefresh() {
    // debugger;
    // console.log('dashboardrefresh');
    // this.totalrevisits = 0;
    // this.totalnewvisits = 0;
    // this.totalvisits = 0;
    // this.visitorsInside = 0;
    // console.log(this.from_date+''+this.to_date);
    this.isLoading = true;
    this.visitorsList.splice(0);
    this.visitorsFilteredList1.splice(0);
    this.visitorsFilteredList.splice(0);

    // console.log('visitor array length:'+this.visitorsFilteredList.length);
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.visitorsFilteredList1 = data;
        // console.log(this.visitorsFilteredList1);
        let td = new Date();
        let formatedFROMdate: string;
        let formatedTOdate: string;

        // console.log(formatedFROMdate+'::'+formatedTOdate);
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

        for (let e of this.visitorsFilteredList1) {
          var d = new Date(e.date);

          let formateddate: string = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d.getDate()).slice(-2);
          if (formateddate >= formatedFROMdate && formateddate <= formatedTOdate) {
            // console.log(this.from_date+', '+this.to_date+':'+formateddate);
            this.visitorsList.push(e);
          }

        }
        // console.log('size:'+this.visitorsList.length);

        // this.visitorsList = this.visitorsFilteredList;
        // this.visitorsList1 = [];
        // this.visitorsList1 = this.visitorsList;
        this.reInitDatatable();
        this.isLoading = false;
        // this.reInitVisitorDatatable();
      }
    }).catch(error => {
      // this.isLoading = false;
      this.visitorsFilteredList = [];
      this.visitorsFilteredList1 = [];
    });

  }

  getFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fd.getDate()).slice(-2);
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }

  isGoLoading: boolean = false;
  getFilteredDbData() {
    this.isGoLoading = true;

    this.visitorsList.splice(0);
    this.visitorsList1.splice(0);
    this.isLoading = true;
    let td = new Date();
    let formatedFROMdate: string;
    let formatedTOdate: string;

    // console.log(formatedFROMdate+'::'+formatedTOdate);
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
    let locationId:any;
    if(this.currentUser.fkProfileId==1)
    {
      locationId = this.filterLocation.length > 0 ? this.filterLocation[0].id : '';
    }    
    else{
      locationId=this.currentUser.baselocation;
    }
    let visitorType = this.filterVType.length > 0 ? this.filterVType[0].id : '';
    let visitorPurPose = this.filterVPurpose.length > 0 ? this.filterVPurpose[0].id : '';
    let scheduledType = this.filterScheduled.length > 0 ? this.filterScheduled[0].id : ''; // Code added by syambora
    let status = this.filterStatus.length > 0 ? this.filterStatus[0].id : '';
    let employeeId = this.filterEmployee.length > 0 ? this.filterEmployee[0].id : '';
    let searchStr = locationId + ',' + visitorType + ',' + employeeId + ',' + this.filVisitor + "," +
     this.filCompany + "," + this.getFormatedDate(this.from_date) + "," + this.getFormatedDate(this.to_date) + 
     "," + scheduledType+ "," + status +","+visitorPurPose;
    // console.log(searchStr);
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data.length > 0) {
        this.visitorsList1 = data;
        // console.log(this.visitorsList1);
        this.visitorsList = this.visitorsList1.filter(s => s.numberOfPerson > 0);
        // console.log(this.visitorsList.length);

        this.visitorsList.forEach(element => {
          let im = { id: 0, imgpath: '' };
          im.id = element.id;
          im.imgpath = element.temp;
          this.imageStore.push(im);
        });

        // console.log(this.imageStore);
        if (this.filterVPurpose == "AMC") {
          // TODO: Call API endpoint
        } else {

        }
      } else {
        
      }
      //console.log(this.visitorsList.length);

      this.reInitDatatable();
      this.isLoading = false;
      this.isGoLoading = false;

    }).catch(error => {
      this.isGoLoading = false;
      this.isLoading = false;
      this.visitorsList1 = [];
      this.visitorsList = [];
      // this.visitorsFilteredList1 = [];
    });
  }

  image:any;
  downloadImage(id) {
    debugger;
    let filename = this.imageStore.find(s => s.id == id).imgpath;
    // console.log(filename);
    if (filename.length > 0) {
      this.httpService.getImageFile(APIURLS.BR_VMS_FILEDOWNLOAD_API, id, filename).then((data: any) => {
        // console.log(data);
        let temp_name = this.visitorsList1.find(s => s.id == id).name;
        // if (data.length > 0) {
        // this.imageData = data;
        // console.log(data);
        // }
        // this.isLoading=false;
        // console.log('got it');

        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(data);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image=event.target.result;
        };
        jQuery("#sModal").modal('show');

        // var FileSaver = require('file-saver');
        // const imageFile = new File([data], temp_name, { type: 'image/jpeg' });
        // // console.log(imageFile);
        // FileSaver.saveAs(imageFile);




      }).catch(error => {
        this.isLoading = false;
      });

    } else {
      swal({
        title: "Message",
        text: "No image found.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
  }
  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }

  clearFilter() {
    this.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.to_date = this.today;
    this.filCompany = '';
    this.filVisitor = '';
    this.filterLocation = [];
    this.filterVType = [];
    this.filterVPurpose=[];
    this.filterScheduled=[];
    this.filterStatus=[];
    this.filterEmployee=[];
  }
  getTimeFormat(time) {
    return moment('1970-01-01 '+time);
  }

  AMCEntry(id)
  {
  let route = 'amc-view/' + id;
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
}
