import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
import { Util } from '../../Services/util.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-email-requests-list',
  templateUrl: './email-requests-list.component.html',
  styleUrls: ['./email-requests-list.component.css'],
  providers: [Util]
})
export class EmailRequestsListComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private util: Util,
    private dataStore: DataStorageService, private excelService: ExcelService, private masterDataService: MasterDataService) { }

  currentUser!: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  emailMessagesList: any[] = [];
  statusList = [
    { type: "Sending", color: "info" },
    { type: "Sent", color: "success" }
  ]

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.smsTemplateId = "";
    this.filterModel.status = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.getData();
  }

  getListData(){
    this.filterModel.pageNo = 1;
    this.getData();
  }
  
  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.ADMIN_GET_EMAIL_REQUESTS_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  showEmailsList(id){
    this.isLoading = true;
    var emailStatusList = [
      { type: "Queued", color: "info" },
      { type: "Sent", color: "success" },
      { type: "Error", color: "danger" }
    ]
    this.httpService.HRget(APIURLS.ADMIN_GET_EMAIL_MESSAGES_BY_REQUEST_ID+"/"+id).then((data: any) => {
      this.emailMessagesList = data;
      for (var item of this.emailMessagesList) {
        item.statusColor = emailStatusList.find((x:any)  => x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
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


}
