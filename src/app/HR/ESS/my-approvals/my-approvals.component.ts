import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-my-approvals',
  templateUrl: './my-approvals.component.html',
  styleUrls: ['./my-approvals.component.css']
})
export class MyApprovalsComponent implements OnInit {

  constructor(private masterDataService: MasterDataService, private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) { }

  currentUser!: AuthData;
  statuses: any[] = [{type:"Pending", color:"warning"},{type:"Completed", color:"success"},{type:"Queued", color:"info"}];
  results: any[] = [{type:"Approved", color:"success"},{type:"Rejected", color:"danger"},{type:"Cancelled", color:"warning"},];
  flowTypes: any[] = [{type:"Offer Approval"},{type:"Offer Exception Approval"},{type:"Appointment Verification"},{type:"Appointment Approval"},{type:"Confirmation Recommendation"},
  {type:"Confirmation Approval"},{type:"Confirmation Extension Approval"},{type:"Appraisal Recommendation"},{type:"Appraisal Approval"},{type:"Resignation Approval"},{type:"Recall Approval"},
  {type:"Service Withdrawn Approval"},{type:"Retirement Approval"},{type:"Recall Approval"},{type:"Transfer Approval"},{type:"FNF Approval"},{type:"Employee Profile"},];
  
  filterData: any = {};
  filterModel:any = {};
  isLoading: boolean = false;
  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;

    // initialize the filter model
    this.filterModel.flowType = "";
    this.filterModel.status = "";
    this.filterModel.result = "";
    this.filterModel.objectId = "";
    this.filterModel.completedOnBehalf = "";
    this.filterModel.text = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.name = "";

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("MyApprovalsList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }
    this.filterModel.employeeId = this.currentUser.uid;
    this.getData();
  }

  
  getFilterData() {    
    this.filterModel.pageNo = 1;
    this.getData();    
  }

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.WORKFLOW_GET_FLOW_TASKS_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statuses.find(x=>x.type == item.status).color;
        var result = this.results.find(x=>x.type == item.result);
        if(result)
          item.resultColor =  result.color;
      }
      // store the filter model
      this.dataStore.SetData("MyApprovalsList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }
}
