import { AuthData } from './../auth/auth.model';
import { AppComponent } from './../app.component';
import { User } from './../masters/user/user.model';
import { APIURLS } from './../shared/api-url';
import { HttpService } from './/../shared/http-service';
import { Component, OnInit } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as _ from "lodash";
import { error } from '@angular/compiler/src/util';

import { Router } from '@angular/router';
import { Assessment } from '../masters/assesment/assessment.model';
import { Employee } from '../masters/employee/employee.model';
import { Calendar } from '../masters/calendar/calendar.model';
import { ExcelService } from '../shared/excel-service';
import { NewSalary } from '../visitorappointment/newsalary.model';
import swal from 'sweetalert';
declare var $:any;

declare var jQuery: any;


@Component({
  selector: 'app-gatevisitorreport',
  templateUrl: './gatevisitorreport.component.html',
  styleUrls: ['./gatevisitorreport.component.css']
})
export class GatevisitorreportComponent implements OnInit {


  public tableWidget: any;
  filteredEmployee: any[]=[[]];
  assessList: any[] = [[]];
  exportList: any[] = [[]];
  managerList: any[] = [[]];
  repmanagerList: any[] = [[]];
  competencyList: any[] = [[]];
  sbuList: any[] = [[]];
  parentList: any[] = [[]];
  employeeList: any[] = [[]];
  selParentRole: any;
  selCalYr: any;
  userList: NewSalary[];
  // calendarItem: NewSalary = new NewSalary(0, 0, '','','','','','','',new Date,'','', '','','','','','','','','','', true,'','','','','','','','','', '','','','','','','','','','', '','','','','','','');
  // empItem: Employee = this.empItem = new Employee(0,  '', '', 0,  0,    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  '', '', '', '', '', '', '', 0,  '', '', 0,  '', 0,  '',true,0,0,0);
  // assessItem: Assessment = this.assessItem = new Assessment(0, '', '', 0,0,'',true, true, true, true, true, true,true, true, true,'',true, '' );
  calendarList: any[] = [[]];
  //calendarItem: Calendar = this.calendarItem = new Calendar(0, '','', 0, '', '', '', 0, 0, 0);
  isLoading: boolean = false;
  errMsg: string = "";
  calenderId: string="";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  checkAll: boolean = false;
  path: string = '';
  visitorsList: any[]=[];
  mgrEmpList: any[] = [];
  EmployeeList: any[]=[];
  usrid: number;
  BellCurveManagerRatingList: any[]=[];
  tableWidget1: any;
  visitorsFilteredList1: any[]=[];
  visitorsFilteredList: any[]=[];
  from_date ='';
  to_date ='';
  empId: any;
  constructor(private appService: AppComponent, private httpService: HttpService, private http:HttpClient,
  private router: Router, private excelService:ExcelService) { }
  
  ngAfterViewInit() {
    this.initDatatable();
    this.initVisitorDatatable();

    $('#slide_button').click(function() {
      $('#slide').animate({
      height: 'toggle'
      }, 1500, function() {
      });
  });
  
  $('#userTable thead tr').clone(true).appendTo( '#userTable thead' );
    $('#userTable thead tr:eq(1) th').each( function (i) {
        var title = $(this).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" class="form-control" id="usertable_search"/>' );
 
        $('input#usertable_search', this).on( 'keyup change', function () {
          // console.log(this);
            if ( table.column(i).search() !== this.value ) {
                table.column(i).search(this.value).draw();
            }
        } );
    } );
 
    var table = $('#userTable').DataTable( {
        orderCellsTop: true,
        fixedHeader: true,
       
    } );
}


ngOnInit() {
  let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
  this.usrid = authData.uid;
  this.getDesignationMasterList();
}
private initDatatable(): void {
  let exampleId: any = jQuery('#assessment');
  this.tableWidget = exampleId.DataTable();
}

private reInitDatatable(): void {
  if (this.tableWidget) {
    this.tableWidget.clear();
      this.tableWidget.destroy();
      this.tableWidget = null;
  }
  setTimeout(() => this.initDatatable(), 0)
}
private initVisitorDatatable(): void {
  let exampleId: any = jQuery('#userTable');
  this.tableWidget1 = exampleId.DataTable();
}

private reInitVisitorDatatable(): void {
  if (this.tableWidget1) {
    this.tableWidget1.clear();

      this.tableWidget1.destroy();
      this.tableWidget1 = null
  }
  setTimeout(() => this.initVisitorDatatable(), 0)
}
getDesignationMasterList(){
  this.errMsg = "";
  this.isLoading = true;
  this.httpService.getById(APIURLS.BR_MASTER_BELLCURVE_API,this.usrid).then((data: any) => {
      this.isLoading = false;
      this.BellCurveManagerRatingList = data['dataForManager'];
      if (data['dataForManager'].length > 0) {
          this.EmployeeList = data['gridDatas'];
          console.log(this.EmployeeList);
          // for(let des of this.designationList) {
          //   this.httpService.getById(APIURLS.BR_MASTER_BELLCURVE_API,this.usrid).then((datam:any) => {
          //   this.desgList = datam;
          //   this.designationList.find(s => s.fkParentId === this.desgList.id)['fkParentId'] = this.desgList.name;
          //  });
          // }
          this.reInitDatatable();
      }
  }).catch(error => {
      this.isLoading = false;
      this.EmployeeList = [];
  });
}

dashboardRefresh(){
  this.visitorsList.splice(0);
  this.visitorsFilteredList1.splice(0);
  this.visitorsFilteredList.splice(0);
  // console.log('visitor array length:'+this.visitorsFilteredList.length);
  this.httpService.getById(APIURLS.BR_MASTER_VISITOR_API,this.empId ).then((data: any) => {
    // console.log(data);
    if (data.length > 0) {
      this.visitorsFilteredList1 = data;
  let td = new Date();
    if(this.from_date=='' || this.from_date==null)
      this.from_date = td.getFullYear() + "-" +("00" + (td.getMonth() + 1)).slice(-2) + "-" + " 01";
     
    if(this.to_date=='' || this.to_date==null)
      this.to_date = td.getFullYear() + "-" +("00" + (td.getMonth() + 1)).slice(-2) + "-" + 
      ("00" + td.getDate()).slice(-2) ;

  for(let e of this.visitorsFilteredList1){
  var d = new Date(e.date);

  let formateddate:string = d.getFullYear() + "-" +("00" + (d.getMonth() + 1)).slice(-2) + "-" + 
  ("00" + d.getDate()).slice(-2) ;
  if(formateddate >= this.from_date && formateddate <= this.to_date){
   this.visitorsList.push(e);
  }
 
  }
  // this.visitorsList = this.visitorsFilteredList;
  this.reInitVisitorDatatable();
}
}).catch(error => {
// this.isLoading = false;
this.visitorsFilteredList = [];
this.visitorsFilteredList1 = [];
this.visitorsList = [];
});

}

review(id){
  console.log('review:'+id);
  this.isLoading=true;
  this.empId = id;
  this.visitorsList.splice(0);
  this.httpService.getById(APIURLS.BR_MASTER_VISITOR_API,id).then((data: any) => {
console.log(data);
    if (data.length > 0) {
        this.visitorsList = data;
        console.log(this.visitorsList);
        this.reInitVisitorDatatable();
        jQuery("#myModal").modal('show');
        this.isLoading = false;
    }
    else{
      this.errMsgPop = "No records";
      this.visitorsList=[];
      swal({ title: "Message", 
                text: "No records!",
                icon: "warning",
                dangerMode: false,
                buttons: [false,true]
              }).then((willDelete) => {
                  if (willDelete) {
                    this.isLoading = false;
                  }});
    }
}).catch(error => {
    this.isLoading = false;
    this.visitorsList = [];
});
  
}

exportAsXLSX():void {
  this.exportList=[];
  //var templist=this.assessList.length;
  debugger;
  for(var i=0; i<=this.visitorsList.length-1;i++)
  {
    
    var expListItem={Sl:(i+1),EmpName: this.visitorsList[i].fkEmployeeName, EmpId: this.visitorsList[i].fkEmployeeId,
      Email:this.visitorsList[i].email,  
      VisitorName: this.visitorsList[i].name,
      CompanyName: this.visitorsList[i].companyName,
      OtherInformtion: this.visitorsList[i].OtherInformtion,
      Purpose: this.visitorsList[i].purpose,
      InTime: this.visitorsList[i].fromTime,
      OutTime: this.visitorsList[i].toTime
     };
    
    this.exportList.push(expListItem);
    //console.log('export list'+this.exportList);
  }

  //this.exportList = {  }
  
  
  this.excelService.exportAsExcelFile(this.exportList, 'GeneralReport');
}
}
